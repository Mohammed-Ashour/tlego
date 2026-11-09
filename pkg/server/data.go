package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/catalog"
	"github.com/Mohammed-Ashour/khonsu/internal/sources"
)

const dataTimeout = 40 * time.Second

// errLiveDataOff keeps the promise that serving a local file makes no provider requests.
var errLiveDataOff = requestError{http.StatusServiceUnavailable, errors.New("live data is off while serving a local file")}

type dataAPI struct{ client *sources.Client }

// registerDataRoutes adds the categorized source list and the feeds. A nil client
// lists the sources but makes no provider requests.
func registerDataRoutes(mux *http.ServeMux, client *sources.Client) {
	d := dataAPI{client}
	mux.HandleFunc("/api/v1/sources", d.catalog)
	mux.HandleFunc("/api/v1/space-weather", d.spaceWeather)
	mux.HandleFunc("/api/v1/launches", d.launches)
	mux.HandleFunc("/api/v1/satellite-details", d.satelliteDetails)
	mux.HandleFunc("/api/v1/transmitters", d.transmitters)
}

func (d dataAPI) catalog(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, map[string]any{"live_data": d.client != nil, "categories": sources.Catalog()})
}

func writeFeed[T any](w http.ResponseWriter, sourceID string, data T, meta sources.Meta, err error) {
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) || errors.Is(err, context.Canceled) {
			writeFailure(w, err)
			return
		}
		writeFailure(w, requestError{http.StatusBadGateway, fmt.Errorf("could not get data from this source: %w", err)})
		return
	}
	source, _ := sources.Lookup(sourceID)
	writeJSON(w, map[string]any{"source": source, "fetched_at": meta.FetchedAt, "stale": meta.Stale, "warning": meta.Warning, "data": data})
}

func (d dataAPI) spaceWeather(w http.ResponseWriter, r *http.Request) {
	if d.client == nil {
		writeFailure(w, errLiveDataOff)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), dataTimeout)
	defer cancel()
	data, meta, err := d.client.SpaceWeather(ctx)
	writeFeed(w, sources.IDSWPC, data, meta, err)
}

func (d dataAPI) launches(w http.ResponseWriter, r *http.Request) {
	if d.client == nil {
		writeFailure(w, errLiveDataOff)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), dataTimeout)
	defer cancel()
	data, meta, err := d.client.UpcomingLaunches(ctx)
	writeFeed(w, sources.IDLaunchLibrary, data, meta, err)
}

// perSatellite validates the ID before the feed can reach a provider.
func perSatellite[T any](d dataAPI, w http.ResponseWriter, r *http.Request, sourceID string, load func(context.Context, string) ([]T, sources.Meta, error)) {
	id := r.URL.Query().Get("norad_id")
	if err := catalog.ValidateNoradID(id); err != nil {
		writeFailure(w, badRequest("%s", err.Error()))
		return
	}
	if d.client == nil {
		writeFailure(w, errLiveDataOff)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), dataTimeout)
	defer cancel()
	data, meta, err := load(ctx, id)
	writeFeed(w, sourceID, data, meta, err)
}

func (d dataAPI) satelliteDetails(w http.ResponseWriter, r *http.Request) {
	perSatellite(d, w, r, sources.IDWikidata, func(ctx context.Context, id string) ([]sources.CatalogEntry, sources.Meta, error) {
		return d.client.SatelliteDetails(ctx, id)
	})
}

func (d dataAPI) transmitters(w http.ResponseWriter, r *http.Request) {
	perSatellite(d, w, r, sources.IDSatNOGS, func(ctx context.Context, id string) ([]sources.Transmitter, sources.Meta, error) {
		return d.client.Transmitters(ctx, id)
	})
}
