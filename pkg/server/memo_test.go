package server

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
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

func (f *fakeLive) FetchGroups() ([]catalog.Group, error) { return nil, nil }

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
	for {
		if _, calls := live.counts(); calls == 1 {
			break
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
