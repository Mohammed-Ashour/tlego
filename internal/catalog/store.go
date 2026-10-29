package catalog

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"io"
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

// Default stores share a client so equivalent refreshes share its identity.
// Store-specific clients remain separate and are never modified here.
var defaultHTTPClient = &http.Client{Timeout: 30 * time.Second}

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
		client:   defaultHTTPClient,
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
			return finishSearch(result, err)
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
		return finishSearch(result, err)
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

type ElementEntry struct {
	Record elements.Record
	Meta   FetchMeta
}

// ElementSearchResult contains partial group-search results and fetch warnings.
type ElementSearchResult struct {
	Records       []elements.Record
	Entries       []ElementEntry
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
			return finishElementSearch(result, err)
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
			result.Entries = append(result.Entries, ElementEntry{Record: record, Meta: meta})
		}
	}
	if err := ctx.Err(); err != nil {
		return finishElementSearch(result, err)
	}
	if result.GroupsCovered == 0 && result.GroupsTotal > 0 {
		return result, fmt.Errorf("search could not fetch any satellite groups")
	}
	return result, nil
}

// A deadline returns partial coverage if at least one group was loaded. Explicit
// cancellation always returns an error, even when earlier groups succeeded.
func finishSearch(result SearchResult, err error) (SearchResult, error) {
	if errors.Is(err, context.DeadlineExceeded) && result.GroupsCovered > 0 {
		result.Warnings = append(result.Warnings, "search deadline exceeded; results are partial")
		return result, nil
	}
	return result, err
}
func finishElementSearch(result ElementSearchResult, err error) (ElementSearchResult, error) {
	if errors.Is(err, context.DeadlineExceeded) && result.GroupsCovered > 0 {
		result.Warnings = append(result.Warnings, "search deadline exceeded; results are partial")
		return result, nil
	}
	return result, err
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
	parse := func(b []byte) ([]elements.Record, error) {
		rs, err := elements.ParseGPJSON(b)
		if err != nil {
			return nil, err
		}
		if expectedID != "" {
			if len(rs) != 1 {
				return nil, fmt.Errorf("expected one GP record for NORAD ID %s, got %d", expectedID, len(rs))
			}
			if canonicalNoradID(rs[0].CatalogID) != canonicalNoradID(expectedID) {
				return nil, fmt.Errorf("response NORAD ID %s does not match requested ID %s", rs[0].CatalogID, expectedID)
			}
		}
		return rs, nil
	}
	legacy := func() ([]elements.Record, FetchMeta, bool) {
		return s.readLegacyElements(legacyCachePath(path), expectedID)
	}
	return fetchCached(ctx, s, source, path, expectedID, "gp-json", parse, legacy, cloneElementRecords)
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

func (s *Store) fetchURL(ctx context.Context, source, path, expectedID string) ([]tle.TLE, FetchMeta, error) {
	return fetchCached(ctx, s, source, path, expectedID, "tle", func(b []byte) ([]tle.TLE, error) { return parseTLE(b, expectedID) }, nil, func(v []tle.TLE) []tle.TLE { return append([]tle.TLE(nil), v...) })
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

func readValidatedTLE(path, expectedID string) ([]tle.TLE, error) {
	b, err := readBounded(path)
	if err != nil {
		return nil, err
	}
	return parseTLE(b, expectedID)
}
func validateTLEPayload(contents []byte, expectedID string) error {
	return elements.ValidateTLEPayload(contents, expectedID)
}
func canonicalNoradID(id string) string { return strings.TrimLeft(id, "0") }

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

func parseTLE(contents []byte, expectedID string) ([]tle.TLE, error) {
	return elements.ParseTLE(contents, expectedID)
}
