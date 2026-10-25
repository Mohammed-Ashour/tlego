package data

import (
	"context"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/tlego/pkg/celestrak"
)

type Store struct {
	cacheDir string
	cacheTTL time.Duration
	client   *http.Client
}

const maxTLEPayloadSize = 32 << 20

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
	if cacheDir == "" {
		cacheDir, _ = DefaultCacheDir()
	}
	return &Store{
		cacheDir: cacheDir,
		cacheTTL: cacheTTL,
		client:   &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *Store) FetchGroups() ([]Group, error) {
	config, err := celestrak.ReadCelestrakConfig()
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

func (s *Store) FetchGroupTLEs(ctx context.Context, groupName string) ([]tle.TLE, FetchMeta, error) {
	config, err := celestrak.ReadCelestrakConfig()
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
	if err := validateNoradID(noradID); err != nil {
		return tle.TLE{}, FetchMeta{}, err
	}
	url := strings.Replace(celestrak.CELESTRAK_URL, "NORADID", noradID, 1)
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

func (s *Store) fetchURL(ctx context.Context, url, path, expectedNoradID string) ([]tle.TLE, FetchMeta, error) {
	meta := FetchMeta{Path: path}
	info, err := os.Stat(path)
	var cached []tle.TLE
	if err == nil {
		cached, err = readValidatedTLE(path, expectedNoradID)
		if err == nil {
			meta.Age = time.Since(info.ModTime())
			if s.cacheTTL <= 0 || meta.Age <= s.cacheTTL {
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
	}
	return fetched, meta, nil
}

func (s *Store) download(ctx context.Context, url, path, expectedNoradID string) ([]tle.TLE, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
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
	tmpFile, err := os.CreateTemp(filepath.Dir(path), "tlego-*.tmp")
	if err != nil {
		return nil, err
	}
	tmpName := tmpFile.Name()
	defer func() {
		tmpFile.Close()
		os.Remove(tmpName)
	}()

	n, err := io.Copy(tmpFile, io.LimitReader(resp.Body, maxTLEPayloadSize+1))
	if err != nil {
		return nil, err
	}
	if n > maxTLEPayloadSize {
		return nil, fmt.Errorf("TLE response exceeds %d bytes", maxTLEPayloadSize)
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
func validateNoradID(id string) error {
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

// readValidatedTLE validates parser-sensitive structure before handing a file
// to the pinned parser, which assumes well-formed line pairs in a few places.
func readValidatedTLE(path, expectedNoradID string) (result []tle.TLE, err error) {
	defer func() {
		if recovered := recover(); recovered != nil {
			result = nil
			err = fmt.Errorf("invalid TLE data: parser rejected malformed input")
		}
	}()
	contents, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	if err := validateTLEPayload(contents, expectedNoradID); err != nil {
		return nil, err
	}
	return tle.ReadTLEFile(path)
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
	id := strings.TrimSpace(field)
	if id == "" {
		return false
	}
	for _, r := range id {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
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
