package catalog

import (
	"bufio"
	"context"
	_ "embed"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
	"gopkg.in/yaml.v3"
)

type Store struct {
	cacheDir string
	cacheTTL time.Duration
	client   *http.Client
	cacheErr error
}

const maxTLEPayloadSize = 32 << 20

var CelestrakURL = "https://celestrak.org/NORAD/elements/gp.php?CATNR=NORADID&FORMAT=TLE"

// CelestrakGPURL is the CelesTrak GP endpoint template used by the
// format-neutral API. The FORMAT=JSON parameter is explicit by design.
var CelestrakGPURL = "https://celestrak.org/NORAD/elements/gp.php?CATNR=NORADID&FORMAT=JSON"

//go:embed satellite_groups.yaml
var defaultGroupConfig []byte

type SatelliteGroup struct {
	Name string `yaml:"name"`
	URL  string `yaml:"url"`
}
type CelestrakConfig struct {
	SatelliteGroups []SatelliteGroup `yaml:"satellite_groups"`
	Metadata        struct {
		Source      string `yaml:"source"`
		URL         string `yaml:"url"`
		Format      string `yaml:"format"`
		Provider    string `yaml:"provider"`
		DataSource  string `yaml:"data_source"`
		LastUpdated string `yaml:"last_updated"`
	} `yaml:"metadata"`
}

func ReadCelestrakConfig() (CelestrakConfig, error) {
	var c CelestrakConfig
	err := yaml.Unmarshal(defaultGroupConfig, &c)
	return c, err
}

func DefaultCacheDir() (string, error) {
	dir, err := os.UserCacheDir()
	if err != nil {
		home, herr := os.UserHomeDir()
		if herr != nil {
			return "", err
		}
		dir = filepath.Join(home, ".cache")
	}
	return filepath.Join(dir, "tlego"), nil
}

func NewStore(cacheDir string, cacheTTL time.Duration) *Store {
	var cacheErr error
	if cacheDir == "" {
		cacheDir, cacheErr = DefaultCacheDir()
	}
	return &Store{
		cacheDir: cacheDir,
		cacheErr: cacheErr,
		cacheTTL: cacheTTL,
		client:   &http.Client{Timeout: 30 * time.Second},
	}
}

func NewStoreWithClient(cacheDir string, cacheTTL time.Duration, client *http.Client) *Store {
	s := NewStore(cacheDir, cacheTTL)
	if client != nil {
		s.client = client
	}
	return s
}

func (s *Store) FetchGroups() ([]Group, error) {
	config, err := ReadCelestrakConfig()
	if err != nil {
		return nil, err
	}
	groups := make([]Group, 0, len(config.SatelliteGroups))
	for _, group := range config.SatelliteGroups {
		groups = append(groups, Group{
			Name: group.Name,
			URL:  group.URL,
		})
	}
	return groups, nil
}

type SearchResult struct {
	TLEs          []tle.TLE
	GroupsCovered int
	GroupsTotal   int
	Warnings      []string
}

// Search scans the configured groups, retaining partial results when a group
// cannot be fetched. Matching is case-insensitive across satellite names/IDs.
func (s *Store) Search(ctx context.Context, query string) (SearchResult, error) {
	groups, err := s.FetchGroups()
	if err != nil {
		return SearchResult{}, err
	}
	result := SearchResult{GroupsTotal: len(groups)}
	query = strings.ToLower(strings.TrimSpace(query))
	seen := map[string]bool{}
	for _, group := range groups {
		if err := ctx.Err(); err != nil {
			return result, err
		}
		tles, meta, err := s.FetchGroupTLEs(ctx, group.Name)
		if err != nil {
			result.Warnings = append(result.Warnings, fmt.Sprintf("%s: %v", group.Name, err))
			continue
		}
		result.GroupsCovered++
		if meta.Warning != "" {
			result.Warnings = append(result.Warnings, fmt.Sprintf("%s: %s", group.Name, meta.Warning))
		}
		for _, tle := range tles {
			if query != "" && !strings.Contains(strings.ToLower(tle.Name), query) && !strings.Contains(strings.ToLower(tle.NoradID), query) {
				continue
			}
			key := canonicalNoradID(tle.NoradID)
			if key == "" {
				key = tle.NoradID
			}
			if seen[key] {
				continue
			}
			seen[key] = true
			result.TLEs = append(result.TLEs, tle)
		}
	}
	if err := ctx.Err(); err != nil {
		return result, err
	}
	if result.GroupsCovered == 0 && result.GroupsTotal > 0 {
		return result, fmt.Errorf("search could not fetch any satellite groups")
	}
	return result, nil
}

func (s *Store) FetchGroupTLEs(ctx context.Context, groupName string) ([]tle.TLE, FetchMeta, error) {
	config, err := ReadCelestrakConfig()
	if err != nil {
		return nil, FetchMeta{}, err
	}
	var url string
	for _, group := range config.SatelliteGroups {
		if strings.EqualFold(group.Name, groupName) {
			url = group.URL
			groupName = group.Name
			break
		}
	}
	if url == "" {
		return nil, FetchMeta{}, fmt.Errorf("unknown satellite group: %s", groupName)
	}
	path := s.groupPath(groupName)
	tles, meta, err := s.fetchURL(ctx, url, path, "")
	if err != nil {
		return nil, meta, err
	}
	return tles, meta, nil
}

func (s *Store) FetchTLEByNorad(ctx context.Context, noradID string) (tle.TLE, FetchMeta, error) {
	return s.FetchTLEByNoradURL(ctx, noradID, CelestrakURL)
}

func (s *Store) FetchTLEByNoradURL(ctx context.Context, noradID, template string) (tle.TLE, FetchMeta, error) {
	if err := validateNoradID(noradID); err != nil {
		return tle.TLE{}, FetchMeta{}, err
	}
	url := strings.Replace(template, "NORADID", noradID, 1)
	path := s.noradPath(noradID)
	tles, meta, err := s.fetchURL(ctx, url, path, noradID)
	if err != nil {
		return tle.TLE{}, meta, err
	}
	if len(tles) == 0 {
		return tle.TLE{}, meta, fmt.Errorf("no TLEs found for NORAD ID %s", noradID)
	}
	return tles[0], meta, nil
}

// FetchElementByNorad retrieves one format-neutral GP element record.
func (s *Store) FetchElementByNorad(ctx context.Context, id string) (elements.Record, FetchMeta, error) {
	if err := ValidateNoradID(id); err != nil {
		return elements.Record{}, FetchMeta{}, err
	}
	u := strings.Replace(CelestrakGPURL, "NORADID", url.QueryEscape(id), 1)
	path := filepath.Join(s.cacheDir, "elements", "norad", id+".json")
	records, meta, err := s.fetchElements(ctx, u, path, id)
	if err != nil {
		return elements.Record{}, meta, err
	}
	if len(records) != 1 {
		return elements.Record{}, meta, fmt.Errorf("expected one GP record for NORAD ID %s, got %d", id, len(records))
	}
	return records[0], meta, nil
}

// FetchGroupElements retrieves and validates the GP records for a configured group.
func (s *Store) FetchGroupElements(ctx context.Context, name string) ([]elements.Record, FetchMeta, error) {
	config, err := ReadCelestrakConfig()
	if err != nil {
		return nil, FetchMeta{}, err
	}
	for _, group := range config.SatelliteGroups {
		if !strings.EqualFold(group.Name, name) {
			continue
		}
		u, err := gpJSONURL(group.URL)
		if err != nil {
			return nil, FetchMeta{}, err
		}
		path := filepath.Join(s.cacheDir, "elements", "groups", safeFileName(group.Name)+".json")
		return s.fetchElements(ctx, u, path, "")
	}
	return nil, FetchMeta{}, fmt.Errorf("unknown satellite group: %s", name)
}

// ElementSearchResult contains partial group-search results and fetch warnings.
type ElementSearchResult struct {
	Records       []elements.Record
	GroupsCovered int
	GroupsTotal   int
	Warnings      []string
}

// SearchElements scans the configured groups and retains results from groups
// that were available when another group failed.
func (s *Store) SearchElements(ctx context.Context, query string) (ElementSearchResult, error) {
	groups, err := s.FetchGroups()
	if err != nil {
		return ElementSearchResult{}, err
	}
	result := ElementSearchResult{GroupsTotal: len(groups)}
	query = strings.ToLower(strings.TrimSpace(query))
	seen := map[string]bool{}
	for _, group := range groups {
		if err := ctx.Err(); err != nil {
			return result, err
		}
		records, meta, err := s.FetchGroupElements(ctx, group.Name)
		if err != nil {
			result.Warnings = append(result.Warnings, fmt.Sprintf("%s: %v", group.Name, err))
			continue
		}
		result.GroupsCovered++
		if meta.Warning != "" {
			result.Warnings = append(result.Warnings, fmt.Sprintf("%s: %s", group.Name, meta.Warning))
		}
		for _, record := range records {
			if query != "" && !strings.Contains(strings.ToLower(record.Name), query) && !strings.Contains(strings.ToLower(record.CatalogID), query) {
				continue
			}
			key := canonicalNoradID(record.CatalogID)
			if seen[key] {
				continue
			}
			seen[key] = true
			result.Records = append(result.Records, record)
		}
	}
	if err := ctx.Err(); err != nil {
		return result, err
	}
	if result.GroupsCovered == 0 && result.GroupsTotal > 0 {
		return result, fmt.Errorf("search could not fetch any satellite groups")
	}
	return result, nil
}

// ReadElements reads a bounded local TLE or GP JSON file.
func ReadElements(path string) ([]elements.Record, error) {
	b, err := readBounded(path)
	if err != nil {
		return nil, err
	}
	return ParseElements(b)
}

// ParseElements detects GP JSON and legacy TLE input without network access.
func ParseElements(data []byte) ([]elements.Record, error) {
	if len(data) > maxTLEPayloadSize {
		return nil, fmt.Errorf("element input exceeds %d bytes", maxTLEPayloadSize)
	}
	trim := strings.TrimSpace(string(data))
	if trim == "" {
		return nil, fmt.Errorf("empty element input")
	}
	if trim[0] == '[' || trim[0] == '{' {
		return elements.ParseGPJSON(data)
	}
	upper := strings.ToUpper(trim)
	if strings.HasPrefix(upper, "CCSDS_OMM_VERS") || strings.HasPrefix(upper, "META_START") || strings.HasPrefix(upper, "OBJECT_NAME,") {
		return nil, fmt.Errorf("unsupported element format: CSV or KVN")
	}
	switch trim[0] {
	case '<':
		return nil, fmt.Errorf("unsupported element format: XML")
	}
	if strings.Contains(strings.SplitN(trim, "\n", 2)[0], ",") && !strings.Contains(trim, "\n1 ") && !strings.HasPrefix(trim, "1 ") {
		return nil, fmt.Errorf("unsupported element format: CSV")
	}
	tles, err := ParseTLE(data)
	if err != nil {
		return nil, err
	}
	out := make([]elements.Record, 0, len(tles))
	for _, tle := range tles {
		r, err := elements.FromTLE(tle)
		if err != nil {
			return nil, err
		}
		r.Raw = []byte(tle.String())
		out = append(out, r)
	}
	return out, nil
}

func gpJSONURL(raw string) (string, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", err
	}
	q := u.Query()
	q.Set("FORMAT", "JSON")
	u.RawQuery = q.Encode()
	return u.String(), nil
}

func (s *Store) fetchElements(ctx context.Context, source, path, expectedID string) ([]elements.Record, FetchMeta, error) {
	meta := FetchMeta{Path: path, Source: source, Format: "gp-json"}
	if err := ctx.Err(); err != nil {
		return nil, meta, err
	}
	if s.cacheErr != nil {
		return nil, meta, fmt.Errorf("resolve cache directory: %w", s.cacheErr)
	}
	parse := func(b []byte) ([]elements.Record, error) {
		rs, e := elements.ParseGPJSON(b)
		if e != nil {
			return nil, e
		}
		if expectedID != "" {
			if len(rs) != 1 {
				return nil, fmt.Errorf("expected one GP record for NORAD ID %s, got %d", expectedID, len(rs))
			}
			for _, r := range rs {
				if canonicalNoradID(r.CatalogID) != canonicalNoradID(expectedID) {
					return nil, fmt.Errorf("response NORAD ID %s does not match requested ID %s", r.CatalogID, expectedID)
				}
			}
		}
		return rs, nil
	}
	var cached []elements.Record
	info, statErr := os.Stat(path)
	if statErr == nil {
		cacheValid := false
		if b, e := readBounded(path); e == nil {
			cached, e = parse(b)
			if e == nil {
				cacheValid = true
				meta.Age = time.Since(info.ModTime())
				meta.FetchedAt = info.ModTime()
				if s.cacheTTL == 0 || s.cacheTTL > 0 && meta.Age <= s.cacheTTL {
					meta.FromCache = true
					return cached, meta, nil
				}
			}
		}
		if !cacheValid {
			info = nil
		}
	}
	legacyPath := legacyCachePath(path)
	legacyRecords, legacyMeta, legacyValid := s.readLegacyElements(legacyPath, expectedID)
	if legacyValid && cached == nil && (s.cacheTTL == 0 || s.cacheTTL > 0 && legacyMeta.Age <= s.cacheTTL) {
		legacyMeta.FromCache = true
		return legacyRecords, legacyMeta, nil
	}
	b, fetchErr := s.downloadBytes(ctx, source)
	if fetchErr == nil {
		var records []elements.Record
		records, fetchErr = parse(b)
		if fetchErr == nil {
			fetchErr = ctx.Err()
		}
		if fetchErr == nil {
			if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
				fetchErr = err
			} else {
				var tmp *os.File
				tmp, fetchErr = os.CreateTemp(filepath.Dir(path), "tlego-*.tmp")
				if fetchErr == nil {
					tmpName := tmp.Name()
					defer os.Remove(tmpName)
					_, fetchErr = tmp.Write(b)
					if e := tmp.Close(); fetchErr == nil {
						fetchErr = e
					}
					if fetchErr == nil {
						fetchErr = os.Rename(tmpName, path)
					}
				}
			}
		}
		if fetchErr == nil {
			info, _ = os.Stat(path)
			if info != nil {
				meta.Age = time.Since(info.ModTime())
				meta.FetchedAt = info.ModTime()
			}
			return records, meta, nil
		}
	}
	if ctx.Err() != nil {
		return nil, meta, ctx.Err()
	}
	if info != nil && cached != nil {
		meta.FromCache = true
		meta.Stale = true
		meta.Warning = fmt.Sprintf("refresh failed, using cached data (%v)", fetchErr)
		return cached, meta, nil
	}
	if legacyValid {
		legacyMeta.FromCache = true
		legacyMeta.Stale = true
		legacyMeta.Warning = fmt.Sprintf("GP JSON refresh failed, using legacy TLE cache (%v)", fetchErr)
		return legacyRecords, legacyMeta, nil
	}
	return nil, meta, fetchErr
}

func legacyCachePath(jsonPath string) string {
	file := filepath.Base(jsonPath)
	name := strings.TrimSuffix(file, filepath.Ext(file)) + ".tle"
	dir := filepath.Dir(jsonPath)
	if filepath.Base(filepath.Dir(dir)) == "elements" {
		dir = filepath.Join(filepath.Dir(filepath.Dir(dir)), filepath.Base(dir))
	}
	return filepath.Join(dir, name)
}

func (s *Store) readLegacyElements(path, expectedID string) ([]elements.Record, FetchMeta, bool) {
	meta := FetchMeta{Path: path, Format: "tle"}
	info, err := os.Stat(path)
	if err != nil {
		return nil, meta, false
	}
	meta.Age = time.Since(info.ModTime())
	meta.FetchedAt = info.ModTime()
	tles, err := readValidatedTLE(path, expectedID)
	if err != nil {
		return nil, meta, false
	}
	records := make([]elements.Record, 0, len(tles))
	for _, tle := range tles {
		record, err := elements.FromTLE(tle)
		if err != nil {
			return nil, meta, false
		}
		record.Raw = []byte(tle.String())
		records = append(records, record)
	}
	return records, meta, len(records) > 0
}

func readBounded(path string) ([]byte, error) {
	f, e := os.Open(path)
	if e != nil {
		return nil, e
	}
	defer f.Close()
	b, e := io.ReadAll(io.LimitReader(f, maxTLEPayloadSize+1))
	if e == nil && len(b) > maxTLEPayloadSize {
		e = fmt.Errorf("element payload exceeds %d bytes", maxTLEPayloadSize)
	}
	return b, e
}

func (s *Store) downloadBytes(ctx context.Context, source string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, source, nil)
	if err != nil {
		return nil, err
	}
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}
	b, err := io.ReadAll(io.LimitReader(resp.Body, maxTLEPayloadSize+1))
	if err != nil {
		return nil, err
	}
	if len(b) > maxTLEPayloadSize {
		return nil, fmt.Errorf("response exceeds %d bytes", maxTLEPayloadSize)
	}
	return b, nil
}

// DownloadToPath fetches validated TLEs into an atomic cache file at path.
func (s *Store) DownloadToPath(ctx context.Context, url, path, expectedNoradID string) ([]tle.TLE, FetchMeta, error) {
	if expectedNoradID != "" {
		if err := ValidateNoradID(expectedNoradID); err != nil {
			return nil, FetchMeta{}, err
		}
	}
	return s.fetchURL(ctx, url, path, expectedNoradID)
}

func (s *Store) SetHTTPClient(client *http.Client) {
	if client != nil {
		s.client = client
	}
}

func (s *Store) fetchURL(ctx context.Context, url, path, expectedNoradID string) ([]tle.TLE, FetchMeta, error) {
	meta := FetchMeta{Path: path, Source: url, Format: "tle"}
	if err := ctx.Err(); err != nil {
		return nil, meta, err
	}
	if s.cacheErr != nil {
		return nil, meta, fmt.Errorf("resolve cache directory: %w", s.cacheErr)
	}
	info, err := os.Stat(path)
	var cached []tle.TLE
	if err == nil {
		cached, err = readValidatedTLE(path, expectedNoradID)
		if err == nil {
			meta.Age = time.Since(info.ModTime())
			meta.FetchedAt = info.ModTime()
			if s.cacheTTL == 0 || s.cacheTTL > 0 && meta.Age <= s.cacheTTL {
				meta.FromCache = true
				return cached, meta, nil
			}
		} else {
			// A corrupt cache is not a usable stale fallback.
			info = nil
		}
	}

	fetched, fetchErr := s.download(ctx, url, path, expectedNoradID)
	if fetchErr != nil {
		if ctx.Err() != nil {
			return nil, meta, ctx.Err()
		}
		if info != nil && cached != nil {
			meta.FromCache = true
			meta.Stale = true
			meta.Warning = fmt.Sprintf("refresh failed, using cached data (%v)", fetchErr)
			return cached, meta, nil
		}
		return nil, meta, fetchErr
	}

	info, err = os.Stat(path)
	if err == nil {
		meta.Age = time.Since(info.ModTime())
		meta.FetchedAt = info.ModTime()
	}
	return fetched, meta, nil
}

func (s *Store) download(ctx context.Context, url, path, expectedNoradID string) ([]tle.TLE, error) {
	contents, err := s.downloadBytes(ctx, url)
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	tmpFile, err := os.CreateTemp(filepath.Dir(path), "tlego-*.tmp")
	if err != nil {
		return nil, err
	}
	tmpName := tmpFile.Name()
	defer func() {
		tmpFile.Close()
		os.Remove(tmpName)
	}()

	_, err = tmpFile.Write(contents)
	if err != nil {
		return nil, err
	}
	if err := tmpFile.Close(); err != nil {
		return nil, err
	}
	tles, err := readValidatedTLE(tmpName, expectedNoradID)
	if err != nil {
		return nil, err
	}
	if err := os.Rename(tmpName, path); err != nil {
		return nil, err
	}
	return tles, nil
}

func (s *Store) noradPath(noradID string) string {
	return filepath.Join(s.cacheDir, "norad", noradID+".tle")
}

func (s *Store) groupPath(groupName string) string {
	return filepath.Join(s.cacheDir, "groups", safeFileName(groupName)+".tle")
}

func safeFileName(name string) string {
	name = strings.ToLower(name)
	return strings.Map(func(r rune) rune {
		switch {
		case r >= 'a' && r <= 'z':
			return r
		case r >= '0' && r <= '9':
			return r
		case r == '-' || r == '_' || r == '.':
			return r
		case r == ' ':
			return '_'
		default:
			return '_'
		}
	}, name)
}

// validateNoradID keeps IDs safe to interpolate into URLs and cache paths.
func ValidateNoradID(id string) error {
	if len(id) < 1 || len(id) > 9 {
		return fmt.Errorf("invalid NORAD ID %q: expected 1 to 9 decimal digits", id)
	}
	for _, r := range id {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid NORAD ID %q: expected decimal digits", id)
		}
	}
	n, _ := strconv.Atoi(id)
	if n < 1 {
		return fmt.Errorf("invalid NORAD ID %q: must be at least 1", id)
	}
	return nil
}

func validateNoradID(id string) error { return ValidateNoradID(id) }

// readValidatedTLE validates parser-sensitive structure before handing a file
// to the pinned parser, which assumes well-formed line pairs in a few places.
func readValidatedTLE(path, expectedNoradID string) ([]tle.TLE, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	contents, err := io.ReadAll(io.LimitReader(file, maxTLEPayloadSize+1))
	if err != nil {
		return nil, err
	}
	return parseTLE(contents, expectedNoradID)
}

func validateTLEPayload(contents []byte, expectedNoradID string) error {
	if expectedNoradID != "" {
		if err := validateNoradID(expectedNoradID); err != nil {
			return err
		}
	}
	lines := strings.Split(strings.ReplaceAll(string(contents), "\r\n", "\n"), "\n")
	count := 0
	pending := false
	pendingID := ""
	pendingLine1 := ""
	for _, line := range lines {
		line = strings.TrimSuffix(line, "\r")
		if line == "" {
			continue
		}
		switch {
		case strings.HasPrefix(line, "1 "):
			if pending || len(line) < 69 {
				return fmt.Errorf("invalid TLE line 1")
			}
			if !decimalTLEID(line[2:7]) {
				return fmt.Errorf("invalid NORAD ID in TLE line 1")
			}
			pendingID = strings.TrimSpace(line[2:7])
			pendingLine1 = line
			for _, field := range [][2]int{{33, 43}, {44, 52}, {53, 61}} {
				value := strings.TrimSpace(line[field[0]:field[1]])
				if len(value) > 0 && len(value) < 3 {
					return fmt.Errorf("invalid numeric field in TLE line 1")
				}
			}
			pending = true
		case strings.HasPrefix(line, "2 "):
			if !pending || len(line) < 69 {
				return fmt.Errorf("invalid TLE line 2")
			}
			line2ID := strings.TrimSpace(line[2:7])
			if !decimalTLEID(line[2:7]) || pendingID != line2ID {
				return fmt.Errorf("TLE line identities do not match")
			}
			if expectedNoradID != "" && canonicalNoradID(line2ID) != canonicalNoradID(expectedNoradID) {
				return fmt.Errorf("response NORAD ID %s does not match requested ID %s", line2ID, expectedNoradID)
			}
			if err := validateNumericTLEFields(pendingLine1, line, pendingID); err != nil {
				return err
			}
			pending = false
			count++
		default:
			if pending {
				return fmt.Errorf("unexpected line between TLE pair")
			}
		}
	}
	if pending || count == 0 {
		return fmt.Errorf("incomplete or empty TLE payload")
	}
	return nil
}

func decimalTLEID(field string) bool {
	return ValidateNoradID(strings.TrimSpace(field)) == nil
}

func canonicalNoradID(id string) string {
	return strings.TrimLeft(id, "0")
}

func validateNumericTLEFields(line1, line2, noradID string) error {
	if line1 == "" || len(line1) < 69 || len(line2) < 69 {
		return fmt.Errorf("invalid TLE numeric fields for NORAD ID %s", noradID)
	}
	parse := func(label, value string) (float64, error) {
		parsed, err := strconv.ParseFloat(value, 64)
		if err != nil || math.IsNaN(parsed) || math.IsInf(parsed, 0) {
			return 0, fmt.Errorf("invalid %s in TLE for NORAD ID %s", label, noradID)
		}
		return parsed, nil
	}
	// Match the pinned satellite parser's exact numeric transformations so any
	// value accepted here is safe for its subsequent ParseFloat calls.
	epochYear, err := strconv.Atoi(line1[18:20])
	if err != nil {
		return fmt.Errorf("invalid epoch year for NORAD ID %s", noradID)
	}
	for _, r := range line1[18:20] {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid epoch year for NORAD ID %s", noradID)
		}
	}
	epochDay, err := parse("epoch day", line1[20:32])
	if err != nil {
		return err
	}
	if line1[23] != '.' {
		return fmt.Errorf("invalid epoch day format for NORAD ID %s", noradID)
	}
	for _, r := range line1[20:23] {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid epoch day format for NORAD ID %s", noradID)
		}
	}
	for _, r := range line1[24:32] {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid epoch day format for NORAD ID %s", noradID)
		}
	}
	fullYear := epochYear + 2000
	if epochYear >= 57 {
		fullYear = epochYear + 1900
	}
	daysInYear := 365.0
	if fullYear%400 == 0 || fullYear%4 == 0 && fullYear%100 != 0 {
		daysInYear = 366
	}
	if epochDay < 1 || epochDay >= daysInYear+1 {
		return fmt.Errorf("epoch day out of range for NORAD ID %s", noradID)
	}
	for _, field := range []struct{ label, value string }{
		{"first derivative", strings.Replace(line1[33:43], " ", "", 2)},
		{"second derivative", strings.Replace(line1[44:45]+"."+line1[45:50]+"e"+line1[50:52], " ", "", 2)},
		{"BSTAR", strings.Replace(line1[53:54]+"."+line1[54:59]+"e"+line1[59:61], " ", "", 2)},
		{"inclination", strings.Replace(line2[8:16], " ", "", 2)},
		{"right ascension", strings.Replace(line2[17:25], " ", "", 2)},
		{"argument of perigee", strings.Replace(line2[34:42], " ", "", 2)},
		{"mean anomaly", strings.Replace(line2[43:51], " ", "", 2)},
		{"mean motion", strings.Replace(line2[52:63], " ", "", 2)},
	} {
		if _, err := parse(field.label, field.value); err != nil {
			return err
		}
	}
	for i, field := range [][2]int{{8, 16}, {17, 25}, {34, 42}, {43, 51}} {
		angle, _ := parse("angle", strings.Replace(line2[field[0]:field[1]], " ", "", 2))
		maxAngle := 360.0
		if i == 0 {
			maxAngle = 180
		}
		if angle < 0 || i == 0 && angle > maxAngle || i > 0 && angle >= maxAngle {
			return fmt.Errorf("angle out of range for NORAD ID %s", noradID)
		}
	}
	eccentricityText := line2[26:33]
	for _, r := range eccentricityText {
		if r < '0' || r > '9' {
			return fmt.Errorf("invalid eccentricity for NORAD ID %s", noradID)
		}
	}
	eccentricity, err := parse("eccentricity", "."+eccentricityText)
	if err != nil || eccentricity < 0 || eccentricity >= 1 {
		return fmt.Errorf("eccentricity out of range for NORAD ID %s", noradID)
	}
	meanMotion, err := parse("mean motion", strings.Replace(line2[52:63], " ", "", 2))
	if err != nil || meanMotion <= 0 {
		return fmt.Errorf("mean motion must be positive for NORAD ID %s", noradID)
	}
	return nil
}

// ReadTLEFile reads local input through the same validation used by the cache.
// It never performs a network request.
func ReadLocalTLE(path string) ([]tle.TLE, error) {
	info, err := os.Stat(path)
	if err != nil {
		return nil, err
	}
	if info.Size() > maxTLEPayloadSize {
		return nil, fmt.Errorf("TLE file exceeds %d bytes", maxTLEPayloadSize)
	}
	return readValidatedTLE(path, "")
}

func ReadTLEFile(path string) ([]tle.TLE, error) { return ReadLocalTLE(path) }

// ParseTLE parses bounded local TLE content without creating a temporary file.
func ParseTLE(contents []byte) ([]tle.TLE, error) {
	return parseTLE(contents, "")
}

func parseTLE(contents []byte, expectedNoradID string) (result []tle.TLE, err error) {
	if len(contents) > maxTLEPayloadSize {
		return nil, fmt.Errorf("TLE input exceeds %d bytes", maxTLEPayloadSize)
	}
	if err := validateTLEPayload(contents, expectedNoradID); err != nil {
		return nil, err
	}
	defer func() {
		if recover() != nil {
			result = nil
			err = fmt.Errorf("invalid TLE data: parser rejected malformed input")
		}
	}()
	scanner := bufio.NewScanner(strings.NewReader(strings.ReplaceAll(string(contents), "\r\n", "\n")))
	var current tle.TLE
	for scanner.Scan() {
		line := scanner.Text()
		switch {
		case strings.HasPrefix(line, "1 "):
			current.Line1, err = tle.ReadTLELine1(line)
			if err != nil {
				return nil, err
			}
		case strings.HasPrefix(line, "2 "):
			current.Line2, err = tle.ReadTLELine2(line)
			if err != nil {
				return nil, err
			}
			current.NoradID = strings.TrimSpace(line[2:7])
			result = append(result, current)
			current = tle.TLE{}
		case strings.TrimSpace(line) != "":
			current.Name = strings.TrimSpace(line)
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return result, nil
}
