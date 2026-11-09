package server

import (
	"context"
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/catalog"
	"github.com/Mohammed-Ashour/khonsu/internal/elements"
)

// fakeLive counts provider requests. Saved data models what is on disk.
type fakeLive struct {
	mu            sync.Mutex
	groupCalls    int
	elementCalls  int
	searchCalls   int
	fail          error
	block         chan struct{}
	group         []elements.Record
	savedGroup    []elements.Record
	savedElement  *elements.Record
	savedAge      time.Duration
	providerEpoch time.Time
}

func (f *fakeLive) FetchGroups() ([]catalog.Group, error) {
	return []catalog.Group{{Name: "Stations"}, {Name: "Other"}}, nil
}

func (f *fakeLive) wait(ctx context.Context) error {
	if f.block != nil {
		select {
		case <-f.block:
		case <-ctx.Done():
			return ctx.Err()
		}
	}
	return f.fail
}

func (f *fakeLive) FetchGroupElements(ctx context.Context, _ string) ([]elements.Record, catalog.FetchMeta, error) {
	f.mu.Lock()
	f.groupCalls++
	f.mu.Unlock()
	if err := f.wait(ctx); err != nil {
		return nil, catalog.FetchMeta{}, err
	}
	return f.group, catalog.FetchMeta{FetchedAt: time.Now()}, nil
}

func (f *fakeLive) FetchElementByNorad(ctx context.Context, id string) (elements.Record, catalog.FetchMeta, error) {
	f.mu.Lock()
	f.elementCalls++
	f.mu.Unlock()
	if err := f.wait(ctx); err != nil {
		return elements.Record{}, catalog.FetchMeta{}, err
	}
	return elements.Record{CatalogID: id, Name: "from provider", Epoch: f.providerEpoch}, catalog.FetchMeta{FetchedAt: time.Now()}, nil
}

func (f *fakeLive) SearchElements(context.Context, string) (catalog.ElementSearchResult, error) {
	f.searchCalls++
	return catalog.ElementSearchResult{}, nil
}

func (f *fakeLive) CachedElementByNorad(string) (elements.Record, catalog.FetchMeta, bool) {
	if f.savedElement == nil {
		return elements.Record{}, catalog.FetchMeta{}, false
	}
	return *f.savedElement, catalog.FetchMeta{FetchedAt: time.Now().Add(-f.savedAge), FromCache: true}, true
}

func (f *fakeLive) CachedGroupElements(string) ([]elements.Record, catalog.FetchMeta, bool) {
	if f.savedGroup == nil {
		return nil, catalog.FetchMeta{}, false
	}
	return f.savedGroup, catalog.FetchMeta{FetchedAt: time.Now().Add(-f.savedAge), FromCache: true}, true
}

func (f *fakeLive) counts() (int, int) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.groupCalls, f.elementCalls
}

func TestGroupLoadServesItsSatellitesWithoutProviderRequests(t *testing.T) {
	live := &fakeLive{group: []elements.Record{{CatalogID: "25544", Name: "ISS"}, {CatalogID: "48274", Name: "CSS"}}}
	memo := newMemoSource(context.Background(), live, time.Hour)
	for i := 0; i < 2; i++ {
		if _, _, err := memo.FetchGroupElements(context.Background(), "Stations"); err != nil {
			t.Fatal(err)
		}
	}
	record, meta, err := memo.FetchElementByNorad(context.Background(), "025544")
	if err != nil || record.Name != "ISS" || meta.Stale {
		t.Fatalf("record=%+v meta=%+v err=%v", record, meta, err)
	}
	if groups, individual := live.counts(); groups != 1 || individual != 0 {
		t.Fatalf("group calls=%d element calls=%d", groups, individual)
	}
}

func TestExpiredSavedElementIsServedAtOnceAndRefreshed(t *testing.T) {
	saved := elements.Record{CatalogID: "25544", Name: "saved"}
	release := make(chan struct{})
	live := &fakeLive{savedElement: &saved, savedAge: 24 * time.Hour, block: release}
	memo := newMemoSource(context.Background(), live, time.Hour)
	record, meta, err := memo.FetchElementByNorad(context.Background(), "25544")
	if err != nil || record.Name != "saved" || !meta.Stale || meta.Warning == "" {
		t.Fatalf("record=%+v meta=%+v err=%v", record, meta, err)
	}
	close(release)
	deadline := time.Now().Add(5 * time.Second)
	for {
		record, meta, err = memo.FetchElementByNorad(context.Background(), "25544")
		if err == nil && record.Name == "from provider" && !meta.Stale {
			break
		}
		if time.Now().After(deadline) {
			t.Fatalf("refresh did not arrive: %+v %+v %v", record, meta, err)
		}
		time.Sleep(5 * time.Millisecond)
	}
}

func TestFailedRefreshBacksOffAndKeepsServing(t *testing.T) {
	saved := elements.Record{CatalogID: "25544", Name: "saved"}
	live := &fakeLive{savedElement: &saved, savedAge: 24 * time.Hour, fail: errors.New("provider down")}
	memo := newMemoSource(context.Background(), live, time.Hour)
	for i := 0; i < 20; i++ {
		if record, _, err := memo.FetchElementByNorad(context.Background(), "25544"); err != nil || record.Name != "saved" {
			t.Fatalf("record=%+v err=%v", record, err)
		}
		time.Sleep(time.Millisecond)
	}
	if _, calls := live.counts(); calls != 1 {
		t.Fatalf("element calls = %d, want 1", calls)
	}
}

func TestCancelledRequestStillFillsTheCache(t *testing.T) {
	release := make(chan struct{})
	live := &fakeLive{block: release}
	memo := newMemoSource(context.Background(), live, time.Hour)
	ctx, cancel := context.WithCancel(context.Background())
	result := make(chan error, 1)
	go func() {
		_, _, err := memo.FetchElementByNorad(ctx, "25544")
		result <- err
	}()
	deadline := time.Now().Add(10 * time.Second)
	for {
		if _, calls := live.counts(); calls == 1 {
			break
		}
		if time.Now().After(deadline) {
			t.Fatal("the provider request never started")
		}
		time.Sleep(time.Millisecond)
	}
	cancel()
	if err := <-result; !errors.Is(err, context.Canceled) {
		t.Fatalf("error = %v", err)
	}
	close(release)
	record, _, err := memo.FetchElementByNorad(context.Background(), "25544")
	if err != nil || record.Name != "from provider" {
		t.Fatalf("record=%+v err=%v", record, err)
	}
	if _, calls := live.counts(); calls != 1 {
		t.Fatalf("element calls = %d, want 1", calls)
	}
}

func TestConcurrentRequestsShareOneProviderRequest(t *testing.T) {
	release := make(chan struct{})
	live := &fakeLive{block: release}
	memo := newMemoSource(context.Background(), live, time.Hour)
	var wg sync.WaitGroup
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if _, _, err := memo.FetchElementByNorad(context.Background(), "25544"); err != nil {
				t.Error(err)
			}
		}()
	}
	time.Sleep(20 * time.Millisecond)
	close(release)
	wg.Wait()
	if _, calls := live.counts(); calls != 1 {
		t.Fatalf("element calls = %d", calls)
	}
}

func TestFailureWithNothingSavedReachesTheCaller(t *testing.T) {
	want := errors.New("provider down")
	live := &fakeLive{fail: want}
	memo := newMemoSource(context.Background(), live, time.Hour)
	for i := 0; i < 3; i++ {
		if _, _, err := memo.FetchElementByNorad(context.Background(), "25544"); !errors.Is(err, want) {
			t.Fatalf("element error = %v", err)
		}
	}
	if _, calls := live.counts(); calls != 1 {
		t.Fatalf("repeated failures made %d provider requests", calls)
	}
	if _, _, err := memo.FetchGroupElements(context.Background(), "Stations"); !errors.Is(err, want) {
		t.Fatalf("group error = %v", err)
	}
}

func TestGroupDoesNotOverwriteNewerElement(t *testing.T) {
	live := &fakeLive{group: []elements.Record{{CatalogID: "25544", Name: "from group"}}}
	memo := newMemoSource(context.Background(), live, time.Hour)
	newer := memoEntry[elements.Record]{elements.Record{CatalogID: "25544", Name: "newer"}, catalog.FetchMeta{FetchedAt: time.Now().Add(time.Hour)}}
	memo.storeElement("25544", newer)
	if _, _, err := memo.FetchGroupElements(context.Background(), "Stations"); err != nil {
		t.Fatal(err)
	}
	record, _, err := memo.FetchElementByNorad(context.Background(), "25544")
	if err != nil || record.Name != "newer" {
		t.Fatalf("record=%+v err=%v", record, err)
	}
}

// A real store reports a failed refresh as stale data with no error.
func TestRefreshFailureWithSavedDataBacksOffAgainstRealStore(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "elements", "norad", "25544.json")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	payload, err := os.ReadFile("../../internal/elements/testdata/25544.json")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, payload, 0o600); err != nil {
		t.Fatal(err)
	}
	old := time.Now().Add(-24 * time.Hour)
	if err := os.Chtimes(path, old, old); err != nil {
		t.Fatal(err)
	}
	var calls atomic.Int32
	transport := roundTripFunc(func(*http.Request) (*http.Response, error) {
		calls.Add(1)
		return &http.Response{StatusCode: http.StatusForbidden, Status: "403 Forbidden", Body: http.NoBody, Header: http.Header{}}, nil
	})
	store := catalog.NewStoreWithClient(dir, time.Hour, &http.Client{Transport: transport})
	memo := newMemoSource(context.Background(), store, time.Hour)
	var meta catalog.FetchMeta
	for i := 0; i < 20; i++ {
		_, meta, err = memo.FetchElementByNorad(context.Background(), "25544")
		if err != nil {
			t.Fatal(err)
		}
		time.Sleep(2 * time.Millisecond)
	}
	if got := calls.Load(); got != 1 {
		t.Fatalf("provider calls = %d, want 1", got)
	}
	if !meta.Stale || !strings.Contains(meta.Warning, "refresh failed") {
		t.Fatalf("meta = %+v", meta)
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestRememberedResultsReportTheCache(t *testing.T) {
	memo := newMemoSource(context.Background(), &fakeLive{}, time.Hour)
	if _, _, err := memo.FetchElementByNorad(context.Background(), "25544"); err != nil {
		t.Fatal(err)
	}
	_, meta, err := memo.FetchElementByNorad(context.Background(), "25544")
	if err != nil || !meta.FromCache {
		t.Fatalf("meta = %+v, err = %v", meta, err)
	}
}

func TestLeadingZerosShareOneRequestAndKey(t *testing.T) {
	live := &fakeLive{}
	memo := newMemoSource(context.Background(), live, time.Hour)
	record, _, err := memo.FetchElementByNorad(context.Background(), "0025544")
	if err != nil || record.CatalogID != "25544" {
		t.Fatalf("record = %+v, err = %v", record, err)
	}
	if _, _, err := memo.FetchElementByNorad(context.Background(), "25544"); err != nil {
		t.Fatal(err)
	}
	if _, calls := live.counts(); calls != 1 {
		t.Fatalf("calls = %d", calls)
	}
}

func TestUnknownGroupsNeverReachTheProvider(t *testing.T) {
	live := &fakeLive{}
	memo := newMemoSource(context.Background(), live, time.Hour)
	_, _, err := memo.FetchGroupElements(context.Background(), strings.Repeat("x", 1000))
	if status := upstreamStatus(err); status != http.StatusNotFound {
		t.Fatalf("status = %d, err = %v", status, err)
	}
	if groups, _ := live.counts(); groups != 0 || len(memo.lastFailed) != 0 {
		t.Fatalf("group calls = %d, failures = %d", groups, len(memo.lastFailed))
	}
}

func TestPanicInBackgroundLoadBecomesAnError(t *testing.T) {
	live := &panicLive{}
	memo := newMemoSource(context.Background(), live, time.Hour)
	if _, _, err := memo.FetchElementByNorad(context.Background(), "25544"); err == nil {
		t.Fatal("expected an error")
	}
	if len(memo.inFlight) != 0 {
		t.Fatalf("in flight = %d", len(memo.inFlight))
	}
}

type panicLive struct{ fakeLive }

func (p *panicLive) FetchElementByNorad(context.Context, string) (elements.Record, catalog.FetchMeta, error) {
	panic("transport bug")
}

func TestFailureMemoryIsBounded(t *testing.T) {
	memo := newMemoSource(context.Background(), &fakeLive{fail: errors.New("down")}, time.Hour)
	for i := 0; i < maxRememberedFailures*3; i++ {
		memo.mu.Lock()
		memo.recordFailure(strconv.Itoa(i), errors.New("down"))
		memo.mu.Unlock()
	}
	if len(memo.lastFailed) > maxRememberedFailures || len(memo.lastErrors) > maxRememberedFailures {
		t.Fatalf("failures = %d, errors = %d", len(memo.lastFailed), len(memo.lastErrors))
	}
}

func TestSearchUsesTheMemoAndBacksOffFailingGroups(t *testing.T) {
	live := &fakeLive{group: []elements.Record{{CatalogID: "25544", Name: "ISS"}}}
	memo := newMemoSource(context.Background(), live, time.Hour)
	for i := 0; i < 3; i++ {
		result, err := memo.SearchElements(context.Background(), "iss")
		if err != nil || len(result.Records) != 1 || result.GroupsCovered != 2 {
			t.Fatalf("result = %+v, err = %v", result, err)
		}
	}
	if groups, _ := live.counts(); groups != 2 {
		t.Fatalf("group calls = %d", groups)
	}
	failing := &fakeLive{fail: errors.New("down")}
	memo = newMemoSource(context.Background(), failing, time.Hour)
	for i := 0; i < 2; i++ {
		if _, err := memo.SearchElements(context.Background(), "iss"); err == nil {
			t.Fatal("expected an error with no groups covered")
		}
	}
	if groups, _ := failing.counts(); groups != 2 {
		t.Fatalf("failing group calls = %d", groups)
	}
}
