package server

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
)

const (
	refreshTimeout = 60 * time.Second
	// A failed refresh is not retried sooner than this, to spare the provider.
	refreshRetryAfter = 5 * time.Minute
	// With nothing saved a caller is waiting, so the provider is tried again sooner.
	loadRetryAfter = 30 * time.Second
)

// savedReader reads saved elements without a provider request.
type savedReader interface {
	CachedElementByNorad(id string) (elements.Record, catalog.FetchMeta, bool)
	CachedGroupElements(name string) ([]elements.Record, catalog.FetchMeta, bool)
}

type liveSource interface {
	elementSource
	savedReader
}

type memoEntry[T any] struct {
	value T
	meta  catalog.FetchMeta
}

// memoSource keeps the web app responsive when the provider is slow:
//   - Loading a group makes each of its satellites available without another request.
//   - Elements past their TTL are served at once and refreshed in the background.
//   - Provider requests outlive the browser request that started them, so a
//     cancelled request's download still reaches the cache.
//
// Returned records are shared and must not be modified.
type memoSource struct {
	source elementSource
	saved  savedReader
	ttl    time.Duration
	base   context.Context

	mu         sync.Mutex
	groups     map[string]memoEntry[[]elements.Record]
	elements   map[string]memoEntry[elements.Record]
	inFlight   map[string]chan struct{}
	lastFailed map[string]time.Time
	lastErrors map[string]error
}

// newMemoSource stops background refreshes when base is canceled.
func newMemoSource(base context.Context, source liveSource, ttl time.Duration) *memoSource {
	return &memoSource{
		source: source, saved: source, ttl: ttl, base: base,
		groups: map[string]memoEntry[[]elements.Record]{}, elements: map[string]memoEntry[elements.Record]{},
		inFlight: map[string]chan struct{}{}, lastFailed: map[string]time.Time{}, lastErrors: map[string]error{},
	}
}

func (m *memoSource) isFresh(meta catalog.FetchMeta) bool {
	return m.ttl == 0 || m.ttl > 0 && time.Since(meta.FetchedAt) <= m.ttl
}

// expired marks a saved result so the app can say that newer data is on its way.
func expired(meta catalog.FetchMeta) catalog.FetchMeta {
	meta.FromCache, meta.Stale = true, true
	meta.Warning = fmt.Sprintf("Showing elements saved %s ago while newer ones load.", formatAge(time.Since(meta.FetchedAt)))
	return meta
}

func formatAge(age time.Duration) string {
	if age >= 2*time.Hour {
		return fmt.Sprintf("%d hours", int(age.Hours()))
	}
	return fmt.Sprintf("%d minutes", int(age.Minutes()))
}

// recentFailure returns the last error while the provider should be left alone.
func (m *memoSource) recentFailure(key string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if failed, ok := m.lastFailed[key]; ok && time.Since(failed) < loadRetryAfter {
		return m.lastError(key)
	}
	return nil
}

// load runs fetch once per key, detached from any one caller's context. A failure
// is recorded, so background refreshes back off and waiting callers can report it.
func (m *memoSource) load(key string, fetch func(context.Context) (func(), error)) <-chan struct{} {
	m.mu.Lock()
	defer m.mu.Unlock()
	if done, ok := m.inFlight[key]; ok {
		return done
	}
	done := make(chan struct{})
	m.inFlight[key] = done
	go func() {
		ctx, cancel := context.WithTimeout(m.base, refreshTimeout)
		defer cancel()
		store, err := fetch(ctx)
		m.mu.Lock()
		defer m.mu.Unlock()
		if err != nil {
			m.lastFailed[key] = time.Now()
			m.lastErrors[key] = err
		} else {
			delete(m.lastFailed, key)
			delete(m.lastErrors, key)
			store()
		}
		delete(m.inFlight, key)
		close(done)
	}()
	return done
}

func (m *memoSource) refreshInBackground(key string, fetch func(context.Context) (func(), error)) {
	m.mu.Lock()
	failed, hasFailed := m.lastFailed[key]
	m.mu.Unlock()
	if hasFailed && time.Since(failed) < refreshRetryAfter {
		return
	}
	m.load(key, fetch)
}

func (m *memoSource) lastError(key string) error {
	if err := m.lastErrors[key]; err != nil {
		return err
	}
	return fmt.Errorf("the element request did not complete")
}

func (m *memoSource) FetchGroups() ([]catalog.Group, error) { return m.source.FetchGroups() }

func (m *memoSource) SearchElements(ctx context.Context, query string) (catalog.ElementSearchResult, error) {
	return m.source.SearchElements(ctx, query)
}

func (m *memoSource) storeElement(key string, entry memoEntry[elements.Record]) {
	if current, ok := m.elements[key]; ok && current.meta.FetchedAt.After(entry.meta.FetchedAt) {
		return
	}
	m.elements[key] = entry
}

func (m *memoSource) storeGroup(name string, records []elements.Record, meta catalog.FetchMeta) {
	m.groups[name] = memoEntry[[]elements.Record]{records, meta}
	for _, record := range records {
		m.storeElement(canonicalElementID(record.CatalogID), memoEntry[elements.Record]{record, meta})
	}
}

func canonicalElementID(id string) string {
	trimmed := strings.TrimLeft(id, "0")
	if trimmed == "" {
		return id
	}
	return trimmed
}

func (m *memoSource) fetchElement(id, key string) func(context.Context) (func(), error) {
	return func(ctx context.Context) (func(), error) {
		record, meta, err := m.source.FetchElementByNorad(ctx, id)
		if err != nil {
			return nil, err
		}
		return func() { m.storeElement(key, memoEntry[elements.Record]{record, meta}) }, nil
	}
}

func (m *memoSource) FetchElementByNorad(ctx context.Context, id string) (elements.Record, catalog.FetchMeta, error) {
	key := canonicalElementID(id)
	loadKey := "element:" + key
	m.mu.Lock()
	entry, ok := m.elements[key]
	m.mu.Unlock()
	if !ok {
		if record, meta, found := m.saved.CachedElementByNorad(key); found {
			entry, ok = memoEntry[elements.Record]{record, meta}, true
			m.mu.Lock()
			m.storeElement(key, entry)
			m.mu.Unlock()
		}
	}
	if ok {
		if m.isFresh(entry.meta) {
			return entry.value, entry.meta, nil
		}
		m.refreshInBackground(loadKey, m.fetchElement(id, key))
		return entry.value, expired(entry.meta), nil
	}
	if err := m.recentFailure(loadKey); err != nil {
		return elements.Record{}, catalog.FetchMeta{}, err
	}
	done := m.load(loadKey, m.fetchElement(id, key))
	select {
	case <-done:
	case <-ctx.Done():
		return elements.Record{}, catalog.FetchMeta{}, ctx.Err()
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	if entry, ok := m.elements[key]; ok {
		return entry.value, entry.meta, nil
	}
	return elements.Record{}, catalog.FetchMeta{}, m.lastError(loadKey)
}

func (m *memoSource) FetchGroupElements(ctx context.Context, name string) ([]elements.Record, catalog.FetchMeta, error) {
	key := strings.ToLower(name)
	loadKey := "group:" + key
	fetch := func(loadCtx context.Context) (func(), error) {
		records, meta, err := m.source.FetchGroupElements(loadCtx, name)
		if err != nil {
			return nil, err
		}
		return func() { m.storeGroup(key, records, meta) }, nil
	}
	m.mu.Lock()
	entry, ok := m.groups[key]
	m.mu.Unlock()
	if !ok {
		if records, meta, found := m.saved.CachedGroupElements(name); found {
			entry, ok = memoEntry[[]elements.Record]{records, meta}, true
			m.mu.Lock()
			m.storeGroup(key, records, meta)
			m.mu.Unlock()
		}
	}
	if ok {
		if m.isFresh(entry.meta) {
			return entry.value, entry.meta, nil
		}
		m.refreshInBackground(loadKey, fetch)
		return entry.value, expired(entry.meta), nil
	}
	if err := m.recentFailure(loadKey); err != nil {
		return nil, catalog.FetchMeta{}, err
	}
	done := m.load(loadKey, fetch)
	select {
	case <-done:
	case <-ctx.Done():
		return nil, catalog.FetchMeta{}, ctx.Err()
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	if entry, ok := m.groups[key]; ok {
		return entry.value, entry.meta, nil
	}
	return nil, catalog.FetchMeta{}, m.lastError(loadKey)
}
