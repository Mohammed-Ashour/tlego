package main

import (
	"context"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/Mohammed-Ashour/tlego/pkg/tui/data"
)

func TestUncachedSatelliteCannotUseNetworkInDemo(t *testing.T) {
	previous := http.DefaultTransport
	http.DefaultTransport = offlineTransport{}
	t.Cleanup(func() { http.DefaultTransport = previous })
	store := data.NewStore(t.TempDir(), time.Hour)
	_, _, err := store.FetchTLEByNorad(context.Background(), "99999")
	if err == nil || !strings.Contains(err.Error(), "offline demo") {
		t.Fatalf("uncached lookup should be blocked locally with an offline explanation: %v", err)
	}
}
