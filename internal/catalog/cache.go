package catalog

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/elements"
)

// Waiters may cancel independently. Equivalent overlapping requests share the
// outcome, except that cancellation of the leader lets waiters retry. Fresh
// cache hits bypass refresh coordination, including a forced refresh in flight.
type cacheRequest struct {
	source, expectedID, format string
	ttl                        time.Duration
	client                     *http.Client
}

type cacheFlight struct {
	done      chan struct{}
	signature cacheRequest
	canceled  bool
	value     any
	meta      FetchMeta
	err       error
}

var cacheRefreshes = struct {
	sync.Mutex
	active map[string]*cacheFlight
}{active: make(map[string]*cacheFlight)}

func cloneElementRecords(records []elements.Record) []elements.Record {
	result := append([]elements.Record(nil), records...)
	for i := range result {
		result[i].Raw = append([]byte(nil), records[i].Raw...)
		if records[i].LegacyTLE != nil {
			copied := *records[i].LegacyTLE
			result[i].LegacyTLE = &copied
		}
	}
	return result
}

func fetchCached[T any](ctx context.Context, s *Store, source, path, expectedID, format string, parse func([]byte) ([]T, error), legacy func() ([]T, FetchMeta, bool), clone func([]T) []T) ([]T, FetchMeta, error) {
	meta := FetchMeta{Path: path, Source: source, Format: format}
	if err := ctx.Err(); err != nil {
		return nil, meta, err
	}
	if s.cacheErr != nil {
		return nil, meta, fmt.Errorf("resolve cache directory: %w", s.cacheErr)
	}
	if records, freshMeta, ok := readFreshCache(s, path, meta, parse, legacy); ok {
		if err := ctx.Err(); err != nil {
			return nil, meta, err
		}
		return records, freshMeta, nil
	}
	key, err := filepath.Abs(path)
	if err != nil {
		return nil, meta, err
	}
	signature := cacheRequest{source: source, expectedID: expectedID, format: format, ttl: s.cacheTTL, client: s.client}
	for {
		cacheRefreshes.Lock()
		if flight := cacheRefreshes.active[key]; flight != nil {
			cacheRefreshes.Unlock()
			select {
			case <-ctx.Done():
				return nil, meta, ctx.Err()
			case <-flight.done:
			}
			if err := ctx.Err(); err != nil {
				return nil, meta, err
			}
			if flight.signature != signature || flight.canceled {
				continue
			}
			resultMeta := flight.meta
			if format == "gp-json" && resultMeta.Format == "tle" {
				resultMeta.Path = legacyCachePath(path)
			} else {
				resultMeta.Path = path
			}
			// Matching format identifies the decoder's concrete result type.
			// Keep the snapshot private; every caller receives its own copy.
			return clone(flight.value.([]T)), resultMeta, flight.err
		}
		flight := &cacheFlight{done: make(chan struct{}), signature: signature}
		cacheRefreshes.active[key] = flight
		cacheRefreshes.Unlock()
		records, resultMeta, fetchErr := fetchCachedOnce(ctx, s, source, path, meta, parse, legacy)
		snapshot := clone(records)
		cacheRefreshes.Lock()
		flight.value, flight.meta, flight.err = snapshot, resultMeta, fetchErr
		flight.canceled = fetchErr != nil && ctx.Err() != nil
		delete(cacheRefreshes.active, key)
		close(flight.done)
		cacheRefreshes.Unlock()
		return records, resultMeta, fetchErr
	}
}

// A valid stale modern entry takes precedence over a fresh legacy entry.
func readFreshCache[T any](s *Store, path string, meta FetchMeta, parse func([]byte) ([]T, error), legacy func() ([]T, FetchMeta, bool)) ([]T, FetchMeta, bool) {
	if info, err := os.Stat(path); err == nil {
		if b, err := readBounded(path); err == nil {
			if records, err := parse(b); err == nil {
				meta.Age, meta.FetchedAt = time.Since(info.ModTime()), info.ModTime()
				if fresh(s.cacheTTL, meta.Age) {
					meta.FromCache = true
					return records, meta, true
				}
				return nil, meta, false
			}
		}
	}
	if legacy != nil {
		if records, oldMeta, ok := legacy(); ok && fresh(s.cacheTTL, oldMeta.Age) {
			oldMeta.FromCache = true
			return records, oldMeta, true
		}
	}
	return nil, meta, false
}

func fetchCachedOnce[T any](ctx context.Context, s *Store, source, path string, meta FetchMeta, parse func([]byte) ([]T, error), legacy func() ([]T, FetchMeta, bool)) ([]T, FetchMeta, error) {
	var cached []T
	if info, err := os.Stat(path); err == nil {
		if b, err := readBounded(path); err == nil {
			if records, err := parse(b); err == nil {
				cached = records
				meta.Age, meta.FetchedAt = time.Since(info.ModTime()), info.ModTime()
				if fresh(s.cacheTTL, meta.Age) {
					meta.FromCache = true
					return cached, meta, nil
				}
			}
		}
	}
	var old []T
	var oldMeta FetchMeta
	var oldValid bool
	if legacy != nil {
		old, oldMeta, oldValid = legacy()
	}
	if cached == nil && oldValid && fresh(s.cacheTTL, oldMeta.Age) {
		oldMeta.FromCache = true
		return old, oldMeta, nil
	}
	b, err := s.downloadBytes(ctx, source)
	var records []T
	if err == nil {
		records, err = parse(b)
	}
	if err == nil {
		err = ctx.Err()
	}
	if err == nil {
		err = atomicCacheWrite(ctx, path, b)
	}
	if err == nil {
		if info, e := os.Stat(path); e == nil {
			meta.Age, meta.FetchedAt = time.Since(info.ModTime()), info.ModTime()
		}
		return records, meta, nil
	}
	if ctx.Err() != nil {
		return nil, meta, ctx.Err()
	}
	if cached != nil {
		meta.FromCache, meta.Stale = true, true
		meta.Warning = fmt.Sprintf("refresh failed, using cached data (%v)", err)
		return cached, meta, nil
	}
	if oldValid {
		oldMeta.FromCache, oldMeta.Stale = true, true
		oldMeta.Warning = fmt.Sprintf("GP JSON refresh failed, using legacy TLE cache (%v)", err)
		return old, oldMeta, nil
	}
	return nil, meta, err
}

func fresh(ttl, age time.Duration) bool { return ttl == 0 || ttl > 0 && age <= ttl }

func atomicCacheWrite(ctx context.Context, path string, b []byte) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	f, err := os.CreateTemp(filepath.Dir(path), "tlego-*.tmp")
	if err != nil {
		return err
	}
	defer os.Remove(f.Name())
	_, err = f.Write(b)
	if closeErr := f.Close(); err == nil {
		err = closeErr
	}
	if err == nil {
		err = ctx.Err()
	}
	if err == nil {
		err = os.Rename(f.Name(), path)
	}
	return err
}
