package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/catalog"
	"github.com/Mohammed-Ashour/khonsu/internal/sources"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/celestraksw"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/donki"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/earthsearch"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/feed"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/gcat"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/launchlibrary"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/openmeteo"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/satnogs"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/spacetrack"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/swpc"
	"github.com/Mohammed-Ashour/khonsu/internal/sources/wikidata"
)

const (
	dataTimeout = 40 * time.Second
	slowTimeout = 150 * time.Second // First GCAT download, or a large image on a slow link.
)

// errLiveDataOff keeps the promise that serving a local file makes no provider requests.
var errLiveDataOff = requestError{http.StatusServiceUnavailable, errors.New("live data is off while serving a local file")}

type dataAPI struct{ client *sources.Hub }

type feedLoader[T any] func(context.Context, *http.Request) (T, feed.Meta, error)

// registerDataRoutes adds the categorized source list and the feeds. A nil client
// lists the sources but makes no provider requests.
func registerDataRoutes(mux *http.ServeMux, client *sources.Hub) {
	d := dataAPI{client}
	c := client
	mux.HandleFunc("/api/v1/sources", d.catalog)
	mux.HandleFunc("/api/v1/imagery", d.imagery)
	mux.Handle("/api/v1/space-weather", feedRoute(d, swpc.ID, dataTimeout, func(ctx context.Context, _ *http.Request) (swpc.Conditions, feed.Meta, error) {
		return c.SWPC.Conditions(ctx)
	}))
	mux.Handle("/api/v1/space-weather-history", feedRoute(d, celestraksw.ID, dataTimeout, func(ctx context.Context, _ *http.Request) ([]celestraksw.Day, feed.Meta, error) {
		return c.SpaceHistory.Recent(ctx)
	}))
	mux.Handle("/api/v1/space-events", feedRoute(d, donki.ID, dataTimeout*2, func(ctx context.Context, _ *http.Request) ([]donki.Event, feed.Meta, error) {
		return c.DONKI.Recent(ctx)
	}))
	mux.Handle("/api/v1/launches", feedRoute(d, launchlibrary.ID, dataTimeout, func(ctx context.Context, _ *http.Request) ([]launchlibrary.Launch, feed.Meta, error) {
		return c.LaunchLibrary.Upcoming(ctx)
	}))
	mux.Handle("/api/v1/cloud-cover", feedRoute(d, openmeteo.ID, dataTimeout, func(ctx context.Context, r *http.Request) ([]openmeteo.Hour, feed.Meta, error) {
		lat, lon, err := coordinates(r)
		if err != nil {
			return nil, feed.Meta{}, err
		}
		return c.OpenMeteo.Clouds(ctx, lat, lon)
	}))
	mux.Handle("/api/v1/satellite-details", perSatellite(d, wikidata.ID, dataTimeout, func(ctx context.Context, id string) ([]wikidata.Entry, feed.Meta, error) {
		return c.Wikidata.Lookup(ctx, id)
	}))
	mux.Handle("/api/v1/catalog-record", perSatellite(d, gcat.ID, slowTimeout, func(ctx context.Context, id string) (*gcat.Record, feed.Meta, error) {
		return c.GCAT.Lookup(ctx, id)
	}))
	mux.Handle("/api/v1/transmitters", perSatellite(d, satnogs.ID, dataTimeout, func(ctx context.Context, id string) ([]satnogs.Transmitter, feed.Meta, error) {
		return c.SatNOGS.Transmitters(ctx, id)
	}))
	mux.Handle("/api/v1/recent-scenes", perSatellite(d, earthsearch.ID, dataTimeout, func(ctx context.Context, id string) ([]earthsearch.Scene, feed.Meta, error) {
		return c.EarthSearch.Recent(ctx, id)
	}))
	mux.Handle("/api/v1/space-track", perSatellite(d, spacetrack.ID, dataTimeout, func(ctx context.Context, id string) ([]spacetrack.Record, feed.Meta, error) {
		return c.SpaceTrack.Records(ctx, id)
	}))
}

func (d dataAPI) catalog(w http.ResponseWriter, _ *http.Request) {
	groups := sources.Catalog()
	if d.client != nil {
		groups = d.client.Catalog()
	}
	writeJSON(w, map[string]any{"live_data": d.client != nil, "categories": groups, "imagery_layers": sources.Layers()})
}

func coordinates(r *http.Request) (float64, float64, error) {
	lat, latErr := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	lon, lonErr := strconv.ParseFloat(r.URL.Query().Get("lon"), 64)
	if latErr != nil || lonErr != nil || !(lat >= -90 && lat <= 90) || !(lon >= -180 && lon <= 180) {
		return 0, 0, badRequest("provide lat from -90 to 90 and lon from -180 to 180")
	}
	return lat, lon, nil
}

func feedRoute[T any](d dataAPI, sourceID string, timeout time.Duration, load feedLoader[T]) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if d.client == nil {
			writeFailure(w, errLiveDataOff)
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), timeout)
		defer cancel()
		data, meta, err := load(ctx, r)
		if err != nil {
			writeFailure(w, feedError(err))
			return
		}
		source, _ := sources.Lookup(sourceID)
		writeJSON(w, map[string]any{"source": source, "fetched_at": meta.FetchedAt, "stale": meta.Stale, "warning": meta.Warning, "data": data})
	})
}

func perSatellite[T any](d dataAPI, sourceID string, timeout time.Duration, load func(context.Context, string) (T, feed.Meta, error)) http.Handler {
	return feedRoute(d, sourceID, timeout, func(ctx context.Context, r *http.Request) (T, feed.Meta, error) {
		id := r.URL.Query().Get("norad_id")
		if err := catalog.ValidateNoradID(id); err != nil {
			var zero T
			return zero, feed.Meta{}, badRequest("%s", err.Error())
		}
		return load(ctx, id)
	})
}

func feedError(err error) error {
	var known requestError
	switch {
	case errors.As(err, &known), errors.Is(err, context.DeadlineExceeded), errors.Is(err, context.Canceled):
		return err
	case errors.Is(err, spacetrack.ErrNoAccount):
		return requestError{http.StatusServiceUnavailable, err}
	}
	return requestError{http.StatusBadGateway, fmt.Errorf("could not get data from this source: %w", err)}
}

func (d dataAPI) imagery(w http.ResponseWriter, r *http.Request) {
	layer, found := sources.FindLayer(r.URL.Query().Get("layer"))
	if !found {
		writeFailure(w, badRequest("unknown imagery layer"))
		return
	}
	if d.client == nil {
		writeFailure(w, errLiveDataOff)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), slowTimeout)
	defer cancel()
	image, meta, err := d.client.GIBS.Image(ctx, layer)
	if err != nil {
		writeFailure(w, feedError(err))
		return
	}
	headers := w.Header()
	headers.Set("Content-Type", layer.ContentType())
	headers.Set("Cache-Control", "no-store")
	headers.Set("X-Khonsu-Fetched-At", meta.FetchedAt.Format(time.RFC3339))
	headers.Set("X-Khonsu-Stale", strings.ToLower(strconv.FormatBool(meta.Stale)))
	if r.Method != http.MethodHead {
		_, _ = w.Write(image)
	}
}
