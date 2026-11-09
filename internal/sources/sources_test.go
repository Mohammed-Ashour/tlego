package sources

import (
	"strings"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestCatalogIsComplete(t *testing.T) {
	seen := map[string]bool{}
	total := 0
	for _, group := range Catalog() {
		if len(group.Sources) == 0 {
			t.Errorf("category %s has no sources", group.ID)
		}
		for _, source := range group.Sources {
			total++
			if seen[source.ID] {
				t.Errorf("duplicate source %s", source.ID)
			}
			seen[source.ID] = true
			if source.Name == "" || source.Credit == "" || !strings.HasPrefix(source.URL, "https://") || source.Summary == "" || source.Nature == "" || source.Refresh == "" {
				t.Errorf("source %s is missing details: %+v", source.ID, source)
			}
			if source.Status != feed.StatusLive && source.Status != feed.StatusSetup {
				t.Errorf("source %s has status %q", source.ID, source.Status)
			}
		}
	}
	if total != len(all) {
		t.Fatalf("Catalog() listed %d of %d sources; one has an unknown category", total, len(all))
	}
}

func TestEveryLayerBelongsToAListedSource(t *testing.T) {
	for _, layer := range Layers() {
		if _, found := Lookup(layer.SourceID); !found || layer.Credit == "" || layer.GIBSName == "" {
			t.Errorf("layer %+v has no listed source or credit", layer)
		}
	}
}
