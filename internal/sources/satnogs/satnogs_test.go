package satnogs

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
)

func TestTransmittersKeepsMissingValuesEmpty(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("satellite__norad_cat_id") != "25544" {
			t.Errorf("query = %s", r.URL.RawQuery)
		}
		w.Write([]byte(`[{"description":"APRS","type":"Transceiver","mode":"AFSK","status":"active","alive":true,"downlink_low":145825000,"uplink_low":null,"baud":1200.0},{"description":"Beacon","type":"Transmitter","mode":null,"status":"inactive","alive":false,"downlink_low":null,"uplink_low":null,"baud":null}]`))
	}))
	defer server.Close()
	items, _, err := NewAt(feed.NewClient(t.TempDir()), server.URL).Transmitters(context.Background(), "25544")
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 2 || *items[0].DownlinkHz != 145825000 || items[0].UplinkHz != nil || items[1].Mode != "" || items[1].DownlinkHz != nil {
		t.Fatalf("items = %+v", items)
	}
}
