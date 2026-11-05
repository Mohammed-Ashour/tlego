package catalog

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/elements"
)

type observingContext struct {
	context.Context
	entered chan struct{}
	once    sync.Once
}

func newObservingContext() *observingContext {
	return &observingContext{Context: context.Background(), entered: make(chan struct{})}
}
func (c *observingContext) Done() <-chan struct{} {
	c.once.Do(func() { close(c.entered) })
	return c.Context.Done()
}
func waitForWaiter(t *testing.T, c *observingContext) {
	t.Helper()
	select {
	case <-c.entered:
	case <-time.After(10 * time.Second):
		t.Fatal("caller did not enter refresh wait")
	}
}

type triggeredDeadline struct {
	context.Context
	done    chan struct{}
	expired atomic.Bool
}

func (c *triggeredDeadline) Done() <-chan struct{} { return c.done }
func (c *triggeredDeadline) Err() error {
	if c.expired.Load() {
		return context.DeadlineExceeded
	}
	return nil
}
func (c *triggeredDeadline) expire() { c.expired.Store(true); close(c.done) }

func TestConcurrentRefreshAndCancellation(t *testing.T) {
	for _, format := range []string{"tle", "gp-json"} {
		t.Run(format, func(t *testing.T) {
			started := make(chan struct{}, 4)
			release := make(chan struct{})
			var requests atomic.Int32
			client := &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
				requests.Add(1)
				started <- struct{}{}
				select {
				case <-release:
				case <-r.Context().Done():
					return nil, r.Context().Err()
				}
				body := validTLE
				if format == "gp-json" {
					body = gpJSON("25544", "ISS")
				}
				return response(http.StatusOK, body), nil
			})}
			store := NewStoreWithClient(t.TempDir(), -1, client)
			fetch := func(ctx context.Context, key string) error {
				path := filepath.Join(store.cacheDir, key)
				if format == "tle" {
					_, _, err := store.fetchURL(ctx, "https://fixture.invalid/"+key, path, "25544")
					return err
				}
				_, _, err := store.fetchElements(ctx, "https://fixture.invalid/"+key, path, "25544")
				return err
			}
			leader := make(chan error, 1)
			go func() { leader <- fetch(context.Background(), "one") }()
			<-started
			waiterCtx, cancel := context.WithCancel(context.Background())
			observed := &observingContext{Context: waiterCtx, entered: make(chan struct{})}
			waiter := make(chan error, 1)
			go func() { waiter <- fetch(observed, "one") }()
			waitForWaiter(t, observed)
			cancel()
			if err := <-waiter; !errors.Is(err, context.Canceled) {
				t.Fatalf("waiter: %v", err)
			}
			independent := make(chan error, 1)
			go func() { independent <- fetch(context.Background(), "two") }()
			select {
			case <-started:
			case <-time.After(10 * time.Second):
				t.Fatal("different key blocked")
			}
			close(release)
			if err := <-leader; err != nil {
				t.Fatal(err)
			}
			if err := <-independent; err != nil {
				t.Fatal(err)
			}
			if requests.Load() != 2 {
				t.Fatalf("requests = %d", requests.Load())
			}
		})
	}
}

func TestConcurrentMissSharesRefresh(t *testing.T) {
	for _, format := range []string{"tle", "gp-json"} {
		t.Run(format, func(t *testing.T) {
			started, release := make(chan struct{}), make(chan struct{})
			var requests atomic.Int32
			store := NewStoreWithClient(t.TempDir(), time.Hour, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
				if requests.Add(1) == 1 {
					close(started)
				}
				<-release
				body := validTLE
				if format == "gp-json" {
					body = gpJSON("25544", "ISS")
				}
				return response(http.StatusOK, body), nil
			})})
			fetch := func(ctx context.Context) error {
				path := filepath.Join(store.cacheDir, "one")
				if format == "tle" {
					_, _, e := store.fetchURL(ctx, "https://fixture.invalid", path, "25544")
					return e
				}
				_, _, e := store.fetchElements(ctx, "https://fixture.invalid", path, "25544")
				return e
			}
			done := make(chan error, 2)
			go func() { done <- fetch(context.Background()) }()
			<-started
			waiter := newObservingContext()
			go func() { done <- fetch(waiter) }()
			waitForWaiter(t, waiter)
			close(release)
			for i := 0; i < 2; i++ {
				if err := <-done; err != nil {
					t.Fatal(err)
				}
			}
			if requests.Load() != 1 {
				t.Fatalf("requests = %d", requests.Load())
			}
		})
	}
}

func TestSearchDeadlineRetainsRecordsAndMetadata(t *testing.T) {
	for _, format := range []string{"tle", "gp-json"} {
		t.Run(format, func(t *testing.T) {
			ctx := &triggeredDeadline{Context: context.Background(), done: make(chan struct{})}
			var calls atomic.Int32
			store := NewStoreWithClient(t.TempDir(), time.Hour, &http.Client{Transport: roundTripFunc(func(_ *http.Request) (*http.Response, error) {
				if calls.Add(1) > 1 {
					ctx.expire()
					return nil, context.DeadlineExceeded
				}
				body := validTLE
				if format == "gp-json" {
					body = gpJSON("25544", "ISS")
				}
				return response(http.StatusOK, body), nil
			})})
			if format == "tle" {
				result, err := store.Search(ctx, "ISS")
				if err != nil || result.GroupsCovered != 1 || len(result.TLEs) != 1 || len(result.Warnings) == 0 {
					t.Fatalf("result=%+v err=%v", result, err)
				}
				return
			}
			result, err := store.SearchElements(ctx, "ISS")
			if err != nil || result.GroupsCovered != 1 || len(result.Records) != 1 || len(result.Entries) != 1 || len(result.Warnings) == 0 || result.Entries[0].Meta.Format != "gp-json" {
				t.Fatalf("result=%+v err=%v", result, err)
			}
		})
	}
}

func TestCanceledLeaderAllowsWaiterToRetry(t *testing.T) {
	started := make(chan struct{})
	var calls atomic.Int32
	store := NewStoreWithClient(t.TempDir(), time.Hour, &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
		if calls.Add(1) == 1 {
			close(started)
			<-r.Context().Done()
			return nil, r.Context().Err()
		}
		return response(http.StatusOK, validTLE), nil
	})})
	ctx, cancel := context.WithCancel(context.Background())
	path := filepath.Join(store.cacheDir, "one")
	done := make(chan error, 2)
	go func() { _, _, e := store.fetchURL(ctx, "https://fixture.invalid", path, "25544"); done <- e }()
	<-started
	waiter := newObservingContext()
	go func() {
		_, _, e := store.fetchURL(waiter, "https://fixture.invalid", path, "25544")
		done <- e
	}()
	waitForWaiter(t, waiter)
	cancel()
	e1, e2 := <-done, <-done
	if !((errors.Is(e1, context.Canceled) && e2 == nil) || (errors.Is(e2, context.Canceled) && e1 == nil)) {
		t.Fatal(fmt.Sprint(e1, ", ", e2))
	}
	if calls.Load() != 2 {
		t.Fatalf("calls=%d", calls.Load())
	}
}

func TestSearchEntriesKeepMetadataOfDeduplicatedRecord(t *testing.T) {
	var calls atomic.Int32
	store := NewStoreWithClient(t.TempDir(), time.Second, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		if calls.Add(1) == 1 {
			return nil, errors.New("offline")
		}
		return response(http.StatusOK, gpJSON("25544", "later")), nil
	})})
	groups, err := store.FetchGroups()
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(store.cacheDir, "elements", "groups", safeFileName(groups[0].Name)+".json")
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(gpJSON("25544", "first")), 0600); err != nil {
		t.Fatal(err)
	}
	old := time.Now().Add(-time.Hour)
	if err := os.Chtimes(path, old, old); err != nil {
		t.Fatal(err)
	}
	result, err := store.SearchElements(context.Background(), "")
	if err != nil || len(result.Entries) != 1 || len(result.Records) != 1 || result.Entries[0].Record.Name != "first" || !result.Entries[0].Meta.Stale || result.Entries[0].Meta.Path != path {
		t.Fatalf("result=%+v err=%v", result, err)
	}
}

func TestCachePersistenceFailureReturnsError(t *testing.T) {
	for _, format := range []string{"tle", "gp-json"} {
		t.Run(format, func(t *testing.T) {
			store := NewStoreWithClient(t.TempDir(), time.Hour, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
				body := validTLE
				if format == "gp-json" {
					body = gpJSON("25544", "ISS")
				}
				return response(http.StatusOK, body), nil
			})})
			path := filepath.Join(store.cacheDir, "occupied")
			if err := os.Mkdir(path, 0755); err != nil {
				t.Fatal(err)
			}
			var err error
			if format == "tle" {
				_, _, err = store.fetchURL(context.Background(), "https://fixture.invalid", path, "25544")
			} else {
				_, _, err = store.fetchElements(context.Background(), "https://fixture.invalid", path, "25544")
			}
			if err == nil {
				t.Fatal("expected rename failure")
			}
			info, err := os.Stat(path)
			if err != nil || !info.IsDir() {
				t.Fatalf("destination changed: %v", err)
			}
			files, err := filepath.Glob(filepath.Join(store.cacheDir, "tlego-*.tmp"))
			if err != nil || len(files) != 0 {
				t.Fatalf("temporary files: %v, %v", files, err)
			}
		})
	}
}

func TestRefreshCoordinatesRelativeAndAbsolutePaths(t *testing.T) {
	started, release := make(chan struct{}), make(chan struct{})
	var calls atomic.Int32
	cacheDir, err := os.MkdirTemp(".", "catalog-path-test-*")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.RemoveAll(cacheDir) })
	store := NewStoreWithClient(cacheDir, time.Hour, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		if calls.Add(1) == 1 {
			close(started)
		}
		<-release
		return response(http.StatusOK, gpJSON("25544", "ISS")), nil
	})})
	path, err := filepath.Abs(filepath.Join(store.cacheDir, "cache.json"))
	if err != nil {
		t.Fatal(err)
	}
	cwd, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	relative, err := filepath.Rel(cwd, path)
	if err != nil {
		t.Fatal(err)
	}
	type result struct {
		records []elements.Record
		err     error
	}
	done := make(chan result, 2)
	fetch := func(ctx context.Context, p string) {
		records, _, err := store.fetchElements(ctx, "https://fixture.invalid", p, "25544")
		done <- result{records, err}
	}
	go fetch(context.Background(), path)
	<-started
	waiter := newObservingContext()
	go fetch(waiter, relative)
	waitForWaiter(t, waiter)
	close(release)
	a, b := <-done, <-done
	if a.err != nil || b.err != nil || calls.Load() != 1 {
		t.Fatalf("errors %v %v, calls %d", a.err, b.err, calls.Load())
	}
	if len(a.records) != 1 || len(b.records) != 1 || len(a.records[0].Raw) == 0 || len(b.records[0].Raw) == 0 {
		t.Fatal("missing records or raw data")
	}
	before := b.records[0].Raw[0]
	a.records[0].Raw[0] ^= 1
	if b.records[0].Raw[0] != before {
		t.Fatal("raw data shared between callers")
	}
}

func TestLegacyCacheRecordsHaveIndependentNestedData(t *testing.T) {
	store := NewStore(t.TempDir(), time.Hour)
	path := filepath.Join(store.cacheDir, "elements", "norad", "25544.json")
	legacy := legacyCachePath(path)
	if err := os.MkdirAll(filepath.Dir(legacy), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(legacy, []byte(validTLE), 0600); err != nil {
		t.Fatal(err)
	}
	a, _, err := store.fetchElements(context.Background(), "https://fixture.invalid", path, "25544")
	if err != nil {
		t.Fatal(err)
	}
	b, _, err := store.fetchElements(context.Background(), "https://fixture.invalid", path, "25544")
	if err != nil {
		t.Fatal(err)
	}
	if len(a) != 1 || len(b) != 1 || a[0].LegacyTLE == nil || b[0].LegacyTLE == nil || len(a[0].Raw) == 0 || len(b[0].Raw) == 0 {
		t.Fatal("missing legacy data")
	}
	name, raw := b[0].LegacyTLE.Name, b[0].Raw[0]
	a[0].LegacyTLE.Name = "changed"
	a[0].Raw[0] ^= 1
	if b[0].LegacyTLE.Name != name || b[0].Raw[0] != raw {
		t.Fatal("legacy data shared between callers")
	}
}

func TestConcurrentRefreshFailureIsShared(t *testing.T) {
	for _, format := range []string{"tle", "gp-json"} {
		t.Run(format, func(t *testing.T) {
			started, release := make(chan struct{}), make(chan struct{})
			var calls atomic.Int32
			store := NewStoreWithClient(t.TempDir(), time.Second, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
				if calls.Add(1) == 1 {
					close(started)
				}
				<-release
				return nil, errors.New("offline")
			})})
			path := filepath.Join(store.cacheDir, "cache")
			body := validTLE
			if format == "gp-json" {
				body = gpJSON("25544", "ISS")
			}
			if err := os.WriteFile(path, []byte(body), 0600); err != nil {
				t.Fatal(err)
			}
			old := time.Now().Add(-time.Hour)
			if err := os.Chtimes(path, old, old); err != nil {
				t.Fatal(err)
			}
			done := make(chan error, 2)
			fetch := func(ctx context.Context) {
				var m FetchMeta
				var err error
				if format == "tle" {
					_, m, err = store.fetchURL(ctx, "https://fixture.invalid", path, "25544")
				} else {
					_, m, err = store.fetchElements(ctx, "https://fixture.invalid", path, "25544")
				}
				if err == nil && !m.Stale {
					err = errors.New("expected stale data")
				}
				done <- err
			}
			go fetch(context.Background())
			<-started
			waiter := newObservingContext()
			go fetch(waiter)
			waitForWaiter(t, waiter)
			close(release)
			for i := 0; i < 2; i++ {
				if err := <-done; err != nil {
					t.Fatal(err)
				}
			}
			if calls.Load() != 1 {
				t.Fatalf("calls=%d", calls.Load())
			}
		})
	}
}

func TestForcedRefreshSharesOverlappingCalls(t *testing.T) {
	for _, format := range []string{"tle", "gp-json"} {
		t.Run(format, func(t *testing.T) {
			started, release := make(chan struct{}), make(chan struct{})
			var calls atomic.Int32
			store := NewStoreWithClient(t.TempDir(), -1, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
				if calls.Add(1) == 1 {
					close(started)
				}
				<-release
				body := validTLE
				if format == "gp-json" {
					body = gpJSON("25544", "ISS")
				}
				return response(http.StatusOK, body), nil
			})})
			path := filepath.Join(store.cacheDir, "cache")
			done := make(chan error, 2)
			fetch := func(ctx context.Context) {
				var err error
				if format == "tle" {
					_, _, err = store.fetchURL(ctx, "https://fixture.invalid", path, "25544")
				} else {
					_, _, err = store.fetchElements(ctx, "https://fixture.invalid", path, "25544")
				}
				done <- err
			}
			go fetch(context.Background())
			<-started
			waiter := newObservingContext()
			go fetch(waiter)
			waitForWaiter(t, waiter)
			close(release)
			for i := 0; i < 2; i++ {
				if err := <-done; err != nil {
					t.Fatal(err)
				}
			}
			if calls.Load() != 1 {
				t.Fatalf("overlapping calls=%d", calls.Load())
			}
			fetch(context.Background())
			if err := <-done; err != nil {
				t.Fatal(err)
			}
			if calls.Load() != 2 {
				t.Fatalf("sequential calls=%d", calls.Load())
			}
		})
	}
}

func TestFreshCacheBypassesForcedRefresh(t *testing.T) {
	for _, format := range []string{"tle", "gp-json"} {
		t.Run(format, func(t *testing.T) {
			started, release := make(chan struct{}), make(chan struct{})
			client := &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
				close(started)
				<-release
				body := validTLE
				if format == "gp-json" {
					body = gpJSON("25544", "ISS")
				}
				return response(http.StatusOK, body), nil
			})}
			dir := t.TempDir()
			forced := NewStoreWithClient(dir, -1, client)
			freshStore := NewStoreWithClient(dir, time.Hour, client)
			path := filepath.Join(dir, "cache")
			body := validTLE
			if format == "gp-json" {
				body = gpJSON("25544", "ISS")
			}
			if err := os.WriteFile(path, []byte(body), 0600); err != nil {
				t.Fatal(err)
			}
			fetch := func(s *Store) error {
				if format == "tle" {
					_, _, err := s.fetchURL(context.Background(), "https://fixture.invalid", path, "25544")
					return err
				}
				_, _, err := s.fetchElements(context.Background(), "https://fixture.invalid", path, "25544")
				return err
			}
			done := make(chan error, 2)
			go func() { done <- fetch(forced) }()
			<-started
			go func() { done <- fetch(freshStore) }()
			select {
			case err := <-done:
				if err != nil {
					t.Fatal(err)
				}
			case <-time.After(10 * time.Second):
				close(release)
				t.Fatal("fresh hit blocked behind refresh")
			}
			close(release)
			if err := <-done; err != nil {
				t.Fatal(err)
			}
		})
	}
}

func TestSharedLegacyFallbackHasIndependentNestedData(t *testing.T) {
	started, release := make(chan struct{}), make(chan struct{})
	var calls atomic.Int32
	store := NewStoreWithClient(t.TempDir(), time.Second, &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		if calls.Add(1) == 1 {
			close(started)
		}
		<-release
		return nil, errors.New("offline")
	})})
	path := filepath.Join(store.cacheDir, "elements", "norad", "25544.json")
	legacy := legacyCachePath(path)
	if err := os.MkdirAll(filepath.Dir(legacy), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(legacy, []byte(validTLE), 0600); err != nil {
		t.Fatal(err)
	}
	old := time.Now().Add(-time.Hour)
	if err := os.Chtimes(legacy, old, old); err != nil {
		t.Fatal(err)
	}
	type result struct {
		records []elements.Record
		err     error
	}
	done := make(chan result, 2)
	fetch := func(ctx context.Context) {
		records, _, err := store.fetchElements(ctx, "https://fixture.invalid", path, "25544")
		done <- result{records, err}
	}
	go fetch(context.Background())
	<-started
	waiter := newObservingContext()
	go fetch(waiter)
	waitForWaiter(t, waiter)
	close(release)
	a, b := <-done, <-done
	if a.err != nil || b.err != nil || calls.Load() != 1 {
		t.Fatalf("errors %v %v, calls %d", a.err, b.err, calls.Load())
	}
	if len(a.records) != 1 || len(b.records) != 1 || a.records[0].LegacyTLE == nil || b.records[0].LegacyTLE == nil || len(a.records[0].Raw) == 0 || len(b.records[0].Raw) == 0 {
		t.Fatal("missing legacy data")
	}
	name, raw := b.records[0].LegacyTLE.Name, b.records[0].Raw[0]
	a.records[0].LegacyTLE.Name = "changed"
	a.records[0].Raw[0] ^= 1
	if b.records[0].LegacyTLE.Name != name || b.records[0].Raw[0] != raw {
		t.Fatal("shared legacy data")
	}
}

func TestDefaultStoresShareOverlappingRefreshes(t *testing.T) {
	original := http.DefaultTransport
	t.Cleanup(func() { http.DefaultTransport = original })
	for _, format := range []string{"tle", "gp-json"} {
		for _, outcome := range []string{"success", "failure"} {
			t.Run(format+"/"+outcome, func(t *testing.T) {
				started, release := make(chan struct{}), make(chan struct{})
				var calls atomic.Int32
				http.DefaultTransport = roundTripFunc(func(*http.Request) (*http.Response, error) {
					if calls.Add(1) == 1 {
						close(started)
						<-release
					}
					if outcome == "failure" {
						return nil, errors.New("provider unavailable")
					}
					body := validTLE
					if format == "gp-json" {
						body = gpJSON("25544", "ISS")
					}
					return response(http.StatusOK, body), nil
				})
				dir := t.TempDir()
				first, second := NewStore(dir, -1), NewStore(dir, -1)
				path := filepath.Join(dir, "cache")
				fetch := func(ctx context.Context, store *Store) error {
					if format == "gp-json" {
						_, _, err := store.fetchElements(ctx, "https://fixture.invalid", path, "25544")
						return err
					}
					_, _, err := store.fetchURL(ctx, "https://fixture.invalid", path, "25544")
					return err
				}
				done := make(chan error, 2)
				go func() { done <- fetch(context.Background(), first) }()
				<-started
				waiter := newObservingContext()
				go func() { done <- fetch(waiter, second) }()
				waitForWaiter(t, waiter)
				close(release)
				for i := 0; i < 2; i++ {
					err := <-done
					if (err != nil) != (outcome == "failure") {
						t.Fatalf("outcome=%s error=%v", outcome, err)
					}
				}
				if calls.Load() != 1 {
					t.Fatalf("provider calls=%d, want one shared refresh", calls.Load())
				}
				// A later forced refresh must still contact the provider.
				_ = fetch(context.Background(), second)
				if calls.Load() != 2 {
					t.Fatalf("sequential provider calls=%d, want 2", calls.Load())
				}
			})
		}
	}
}

func TestCustomStoreClientDoesNotChangeDefaultClient(t *testing.T) {
	before := NewStore(t.TempDir(), 0)
	custom := &http.Client{Timeout: time.Second}
	configured := NewStoreWithClient(t.TempDir(), 0, custom)
	after := NewStore(t.TempDir(), 0)
	if configured.client != custom || before.client != after.client || configured.client == after.client {
		t.Fatal("default and custom client identities were mixed")
	}
	configured.SetHTTPClient(&http.Client{Timeout: 2 * time.Second})
	if after.client != before.client || after.client.Timeout != 30*time.Second {
		t.Fatal("custom store changed the shared default client")
	}
}
