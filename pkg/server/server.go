package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
	"github.com/Mohammed-Ashour/khonsu/internal/catalog"
	"github.com/Mohammed-Ashour/khonsu/internal/elements"
	"github.com/Mohammed-Ashour/khonsu/internal/orbit"
	"github.com/Mohammed-Ashour/khonsu/internal/output"
	"github.com/Mohammed-Ashour/khonsu/pkg/logger"
)

type Satellite struct {
	Name    string `json:"name"`
	NORADID string `json:"norad_id"`
}

// elementSource is the catalog behaviour the API needs. *catalog.Store provides it
// for live data, and fileSource for local element files.
type elementSource interface {
	FetchGroups() ([]catalog.Group, error)
	FetchGroupElements(ctx context.Context, name string) ([]elements.Record, catalog.FetchMeta, error)
	FetchElementByNorad(ctx context.Context, id string) (elements.Record, catalog.FetchMeta, error)
	SearchElements(ctx context.Context, query string) (catalog.ElementSearchResult, error)
}

type api struct{ store elementSource }

// NewHandler uses the shared catalog/cache and retains the legacy API routes.
func NewHandler() http.Handler { return newHandler(catalog.NewStore("", 12*time.Hour)) }
func newHandler(store elementSource) http.Handler {
	a := api{store}
	mux := http.NewServeMux()
	mux.HandleFunc("/api/satellite-groups", a.listGroups)
	mux.HandleFunc("/api/satellites", a.listSatellites)
	mux.HandleFunc("/api/location", a.location)
	mux.HandleFunc("/api/v1/position", a.positionV1)
	a.registerAppRoutes(mux)
	return mux
}
func (a api) listGroups(w http.ResponseWriter, r *http.Request) {
	groups, err := a.store.FetchGroups()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	names := make([]string, 0, len(groups))
	for _, g := range groups {
		names = append(names, g.Name)
	}
	sort.Strings(names)
	writeJSON(w, names)
}
func (a api) listSatellites(w http.ResponseWriter, r *http.Request) {
	group := r.URL.Query().Get("group")
	if group == "" {
		http.Error(w, "Missing group parameter", http.StatusBadRequest)
		return
	}
	records, meta, err := a.store.FetchGroupElements(r.Context(), group)
	if err != nil {
		http.Error(w, err.Error(), upstreamStatus(err))
		return
	}
	if meta.Stale {
		w.Header().Set("Warning", `110 khonsu "Response is stale"`)
	}
	satellites := make([]Satellite, 0, len(records))
	for _, record := range records {
		satellites = append(satellites, Satellite{record.Name, record.CatalogID})
	}
	sort.Slice(satellites, func(i, j int) bool { return satellites[i].Name < satellites[j].Name })
	writeJSON(w, satellites)
}
func (a api) location(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("norad_id")
	if err := catalog.ValidateNoradID(id); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	record, meta, err := a.store.FetchElementByNorad(r.Context(), id)
	if err != nil {
		http.Error(w, "Unable to fetch TLE data", upstreamStatus(err))
		return
	}
	prop, err := orbit.New(record)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}
	state, err := prop.At(time.Now())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}
	if err := orbit.ValidateState(state); err != nil {
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}
	if meta.Stale {
		w.Header().Set("Warning", `110 khonsu "Response is stale"`)
	}
	writeJSON(w, elementLocation(record, state))
}
func locationResponse(record tle.TLE, now time.Time) map[string]interface{} {
	return legacyLocation(record, orbit.At(satellite.NewSatelliteFromTLE(record, satellite.GravityWGS84), now))
}
func legacyLocation(record tle.TLE, state orbit.State) map[string]interface{} {
	pos := state.PositionTEMEKm
	return map[string]interface{}{"name": record.Name, "eci": map[string]float64{"x": pos.X, "y": pos.Y, "z": pos.Z}, "info": map[string]float64{"latitude": state.LatDeg, "longitude": state.LonDeg, "altitude": state.AltKm}, "tle": map[string]string{"line1": record.Line1.LineString, "line2": record.Line2.LineString}}
}
func elementLocation(record elements.Record, state orbit.State) map[string]interface{} {
	var legacy tle.TLE
	legacy.Name = record.Name
	if record.LegacyTLE != nil {
		legacy = *record.LegacyTLE
	}
	response := legacyLocation(legacy, state)
	if record.SourceFormat == "gp-json" {
		response["source_format"] = record.SourceFormat
		response["element_data"] = json.RawMessage(record.Raw)
	}
	return response
}
func (a api) positionV1(w http.ResponseWriter, r *http.Request) {
	fail := func(status int, err error) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		fmt.Fprintln(w, string(output.MarshalError("request_failed", err)))
	}
	id := r.URL.Query().Get("norad_id")
	if err := catalog.ValidateNoradID(id); err != nil {
		fail(http.StatusBadRequest, err)
		return
	}
	instant := time.Now()
	if value := r.URL.Query().Get("time"); value != "" {
		var err error
		instant, err = time.Parse(time.RFC3339, value)
		if err != nil {
			fail(http.StatusBadRequest, err)
			return
		}
	}
	record, meta, err := a.store.FetchElementByNorad(r.Context(), id)
	if err != nil {
		fail(upstreamStatus(err), err)
		return
	}
	prop, err := orbit.New(record)
	if err != nil {
		fail(http.StatusUnprocessableEntity, err)
		return
	}
	state, err := prop.At(instant)
	if err != nil {
		fail(http.StatusUnprocessableEntity, err)
		return
	}
	if err := orbit.ValidateState(state); err != nil {
		fail(http.StatusUnprocessableEntity, err)
		return
	}
	epoch, err := record.Time()
	if err != nil {
		fail(http.StatusUnprocessableEntity, err)
		return
	}
	p := provenanceFor(record, meta, epoch)
	var warnings []output.Warning
	if meta.Warning != "" {
		warnings = append(warnings, output.Warning{Code: "stale_elements", Message: meta.Warning})
	}
	body, err := output.MarshalResult("position", output.PositionV1(record.CatalogID, state), p, warnings)
	if err != nil {
		fail(http.StatusUnprocessableEntity, err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintln(w, string(body))
}

// upstreamStatus keeps a source's own status, such as not found for a local file.
func upstreamStatus(err error) int {
	var failure requestError
	if errors.As(err, &failure) {
		return failure.status
	}
	return http.StatusBadGateway
}

func containsFold(value, query string) bool {
	return strings.Contains(strings.ToLower(value), strings.ToLower(query))
}

func writeJSON(w http.ResponseWriter, value any) {
	bytes, err := json.Marshal(value)
	if err != nil {
		http.Error(w, "Invalid response data", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintln(w, string(bytes))
}

// Serve owns its mux and stops when ctx is canceled. It serves the JSON API, and
// files from staticDir only when one is given. It applies the same read-only,
// same-site and loopback-host checks as the web app.
func Serve(ctx context.Context, addr, staticDir string) error {
	if addr == "" {
		addr = ":http" // Matches http.Server's meaning of an empty address.
	}
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	return serveListener(ctx, listener, guardLoopback(listener, apiHandler(staticDir)))
}

func apiHandler(staticDir string) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/api/", NewHandler())
	if staticDir != "" {
		mux.Handle("/", http.FileServer(http.Dir(staticDir)))
	}
	return readOnlySameSite(mux)
}

func serveListener(ctx context.Context, listener net.Listener, handler http.Handler) error {
	srv := &http.Server{Handler: handler, ReadHeaderTimeout: 10 * time.Second}
	done := make(chan struct{})
	defer close(done)
	drained := make(chan struct{})
	go func() {
		defer close(drained)
		select {
		case <-ctx.Done():
			shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_ = srv.Shutdown(shutdownCtx)
		case <-done:
		}
	}()
	err := srv.Serve(listener)
	if errors.Is(err, http.ErrServerClosed) {
		// Serve returns as soon as shutdown starts, so let requests in progress finish.
		<-drained
		return nil
	}
	return err
}

// StartServer retains the historical entry point. CLI callers use Serve to
// receive bind errors and control shutdown.
func StartServer() {
	if err := Serve(context.Background(), ":8080", "public"); err != nil {
		logger.Error("HTTP server failed", "error", err)
	}
}
