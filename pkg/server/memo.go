package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
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
	// Enough for a page of tracks without crowding the provider.
	maxProviderRequests   = 4
	maxRememberedFailures = 256
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
	slots      chan struct{}
}

// newMemoSource stops background refreshes when base is canceled.
func newMemoSource(base context.Context, source liveSource, ttl time.Duration) *memoSource {
	return &memoSource{
		source: source, saved: source, ttl: ttl, base: base,
		groups: map[string]memoEntry[[]elements.Record]{}, elements: map[string]memoEntry[elements.Record]{},
		inFlight: map[string]chan struct{}{}, lastFailed: map[string]time.Time{}, lastErrors: map[string]error{},
		slots: make(chan struct{}, maxProviderRequests),
	}
}

func (m *memoSource) isFresh(meta catalog.FetchMeta) bool {
	return m.ttl == 0 || m.ttl > 0 && time.Since(meta.FetchedAt) <= m.ttl
}

// served marks a remembered result as coming from the cache, with its current age.
func served(meta catalog.FetchMeta) catalog.FetchMeta {
	meta.FromCache = true
	meta.Age = time.Since(meta.FetchedAt)
	return meta
}

// expired marks a saved result, saying why newer data is not shown. A warning from
// the store already explains that a refresh failed, so it is kept.
func expired(meta catalog.FetchMeta, loading bool) catalog.FetchMeta {
	meta = served(meta)
	meta.Stale = true
	if meta.Warning != "" {
		return meta
	}
	if loading {
		meta.Warning = fmt.Sprintf("Showing elements saved %s ago while newer ones load.", formatAge(meta.Age))
	} else {
		meta.Warning = fmt.Sprintf("Showing elements saved %s ago because the latest refresh failed.", formatAge(meta.Age))
	}
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

// loadOutcome is what a provider request produced. A store result can hold saved
// data with a failed refresh, so it can carry both a value to keep and a failure.
type loadOutcome struct {
	store   func()
	failure error
}

func outcome(meta catalog.FetchMeta, store func()) loadOutcome {
	if meta.Stale {
		return loadOutcome{store, errors.New(meta.Warning)}
	}
	return loadOutcome{store: store}
}

// load runs fetch once per key, detached from any one caller's context. A failure
// is recorded, so background refreshes back off and waiting callers can report it.
func (m *memoSource) load(key string, fetch func(context.Context) loadOutcome) <-chan struct{} {
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
		result := m.runLoad(ctx, fetch)
		m.mu.Lock()
		defer m.mu.Unlock()
		if result.store != nil {
			result.store()
		}
		if result.failure != nil {
			m.recordFailure(key, result.failure)
		} else {
			delete(m.lastFailed, key)
			delete(m.lastErrors, key)
		}
		delete(m.inFlight, key)
		close(done)
	}()
	return done
}

// runLoad contains panics, because this goroutine is outside net/http's recovery.
func (m *memoSource) runLoad(ctx context.Context, fetch func(context.Context) loadOutcome) (result loadOutcome) {
	defer func() {
		if recover() != nil {
			result = loadOutcome{failure: errors.New("the element request failed unexpectedly")}
		}
	}()
	select {
	case m.slots <- struct{}{}:
		defer func() { <-m.slots }()
	case <-ctx.Done():
		return loadOutcome{failure: ctx.Err()}
	}
	return fetch(ctx)
}

func (m *memoSource) recordFailure(key string, err error) {
	if _, known := m.lastFailed[key]; !known && len(m.lastFailed) >= maxRememberedFailures {
		for old, at := range m.lastFailed {
			if time.Since(at) >= refreshRetryAfter {
				delete(m.lastFailed, old)
				delete(m.lastErrors, old)
			}
		}
		if len(m.lastFailed) >= maxRememberedFailures {
			m.lastFailed, m.lastErrors = map[string]time.Time{}, map[string]error{}
		}
	}
	m.lastFailed[key] = time.Now()
	m.lastErrors[key] = err
}

// refreshInBackground reports whether newer data is on its way.
func (m *memoSource) refreshInBackground(key string, fetch func(context.Context) loadOutcome) bool {
	m.mu.Lock()
	failed, hasFailed := m.lastFailed[key]
	m.mu.Unlock()
	if hasFailed && time.Since(failed) < refreshRetryAfter {
		return false
	}
	m.load(key, fetch)
	return true
}

func (m *memoSource) lastError(key string) error {
	if err := m.lastErrors[key]; err != nil {
		return err
	}
	return fmt.Errorf("the element request did not complete")
}

func (m *memoSource) FetchGroups() ([]catalog.Group, error) { return m.source.FetchGroups() }

// SearchElements scans groups through the memo, so repeat searches make no provider
// requests and failing groups back off. A deadline keeps partial results.
func (m *memoSource) SearchElements(ctx context.Context, query string) (catalog.ElementSearchResult, error) {
	groups, err := m.source.FetchGroups()
	if err != nil {
		return catalog.ElementSearchResult{}, err
	}
	result := catalog.ElementSearchResult{GroupsTotal: len(groups)}
	seen := map[string]bool{}
	for _, group := range groups {
		if err := ctx.Err(); err != nil {
			break
		}
		records, meta, err := m.FetchGroupElements(ctx, group.Name)
		if err != nil {
			result.Warnings = append(result.Warnings, fmt.Sprintf("%s: %v", group.Name, err))
			continue
		}
		result.GroupsCovered++
		for _, record := range records {
			key := canonicalElementID(record.CatalogID)
			if !seen[key] && (containsFold(record.Name, query) || strings.Contains(record.CatalogID, query)) {
				seen[key] = true
				result.Records = append(result.Records, record)
				result.Entries = append(result.Entries, catalog.ElementEntry{Record: record, Meta: meta})
			}
		}
	}
	if err := ctx.Err(); err != nil && (!errors.Is(err, context.DeadlineExceeded) || result.GroupsCovered == 0) {
		return result, err
	}
	if result.GroupsCovered == 0 && result.GroupsTotal > 0 {
		return result, errors.New("search could not fetch any satellite groups")
	}
	return result, nil
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

func (m *memoSource) fetchElement(key string) func(context.Context) loadOutcome {
	return func(ctx context.Context) loadOutcome {
		record, meta, err := m.source.FetchElementByNorad(ctx, key)
		if err != nil {
			return loadOutcome{failure: err}
		}
		return outcome(meta, func() { m.storeElement(key, memoEntry[elements.Record]{record, meta}) })
	}
}

func (m *memoSource) FetchElementByNorad(ctx context.Context, id string) (elements.Record, catalog.FetchMeta, error) {
	key := canonicalElementID(id)
	loadKey := "element:" + key
	fetch := m.fetchElement(key)
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
			return entry.value, served(entry.meta), nil
		}
		loading := m.refreshInBackground(loadKey, fetch)
		return entry.value, expired(entry.meta, loading), nil
	}
	if err := m.recentFailure(loadKey); err != nil {
		return elements.Record{}, catalog.FetchMeta{}, err
	}
	done := m.load(loadKey, fetch)
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

func (m *memoSource) knownGroup(name string) (bool, error) {
	groups, err := m.source.FetchGroups()
	if err != nil {
		return false, err
	}
	for _, group := range groups {
		if strings.EqualFold(group.Name, name) {
			return true, nil
		}
	}
	return false, nil
}

func (m *memoSource) FetchGroupElements(ctx context.Context, name string) ([]elements.Record, catalog.FetchMeta, error) {
	// Unknown names go no further, so they cannot reach the provider or fill the memo.
	known, err := m.knownGroup(name)
	if err != nil {
		return nil, catalog.FetchMeta{}, err
	}
	if !known {
		return nil, catalog.FetchMeta{}, requestError{http.StatusNotFound, fmt.Errorf("unknown satellite group: %s", name)}
	}
	key := strings.ToLower(name)
	loadKey := "group:" + key
	fetch := func(loadCtx context.Context) loadOutcome {
		records, meta, err := m.source.FetchGroupElements(loadCtx, name)
		if err != nil {
			return loadOutcome{failure: err}
		}
		return outcome(meta, func() { m.storeGroup(key, records, meta) })
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
			return entry.value, served(entry.meta), nil
		}
		loading := m.refreshInBackground(loadKey, fetch)
		return entry.value, expired(entry.meta, loading), nil
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
