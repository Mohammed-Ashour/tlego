package server

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/catalog"
	"github.com/Mohammed-Ashour/tlego/internal/elements"
	"github.com/Mohammed-Ashour/tlego/internal/orbit"
	"github.com/Mohammed-Ashour/tlego/internal/output"
	"github.com/Mohammed-Ashour/tlego/pkg/locate"
)

const (
	maxHTTPPassWindow = 7 * 24 * time.Hour
	maxTrackWindow    = 7 * 24 * time.Hour
	maxTrackSamples   = 20000
	maxLookSamples    = 512
	searchTimeout     = 60 * time.Second
)

func (a api) registerAppRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/v1/report", a.reportV1)
	mux.HandleFunc("/api/v1/passes", a.passesV1)
	mux.HandleFunc("/api/v1/tonight", a.tonightV1)
	mux.HandleFunc("/api/v1/track", a.trackV1)
	mux.HandleFunc("/api/v1/look", a.lookV1)
	mux.HandleFunc("/api/v1/search", a.searchV1)
}

type requestError struct {
	status int
	err    error
}

func (e requestError) Error() string { return e.err.Error() }

func badRequest(format string, args ...any) error {
	return requestError{http.StatusBadRequest, fmt.Errorf(format, args...)}
}

func writeFailure(w http.ResponseWriter, err error) {
	status := http.StatusUnprocessableEntity
	var failure requestError
	if errors.As(err, &failure) {
		status = failure.status
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	fmt.Fprintln(w, string(output.MarshalError("request_failed", err)))
}

func writeResult(w http.ResponseWriter, kind string, data any, provenance output.Provenance, warnings []output.Warning) {
	body, err := output.MarshalResult(kind, data, provenance, warnings)
	if err != nil {
		writeFailure(w, err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintln(w, string(body))
}

// element is the validated satellite a versioned request names.
type element struct {
	record     elements.Record
	prop       *orbit.Propagator
	provenance output.Provenance
	warnings   []output.Warning
}

func (a api) loadElement(r *http.Request) (element, error) {
	id := r.URL.Query().Get("norad_id")
	if err := catalog.ValidateNoradID(id); err != nil {
		return element{}, requestError{http.StatusBadRequest, err}
	}
	record, meta, err := a.store.FetchElementByNorad(r.Context(), id)
	if err != nil {
		var failure requestError
		if errors.As(err, &failure) {
			return element{}, err
		}
		return element{}, requestError{http.StatusBadGateway, err}
	}
	prop, err := orbit.New(record)
	if err != nil {
		return element{}, err
	}
	epoch, err := record.Time()
	if err != nil {
		return element{}, err
	}
	loaded := element{record: record, prop: prop, provenance: provenanceFor(record, meta, epoch)}
	if meta.Warning != "" {
		loaded.warnings = append(loaded.warnings, output.Warning{Code: "stale_elements", Message: meta.Warning})
	}
	return loaded, nil
}

func provenanceFor(record elements.Record, meta catalog.FetchMeta, epoch time.Time) output.Provenance {
	if meta.Format == localFileFormat {
		return output.Provenance{Source: "file", SourceFormat: record.SourceFormat, ElementEpoch: epoch.UTC(), CacheStatus: "none"}
	}
	fetched := meta.FetchedAt.UTC()
	provenance := output.Provenance{Source: "celestrak", SourceFormat: record.SourceFormat, ElementEpoch: epoch.UTC(), FetchedAt: &fetched, CacheStatus: "fetched"}
	if meta.FromCache {
		provenance.CacheStatus = "fresh"
	}
	if meta.Stale {
		provenance.CacheStatus = "stale"
	}
	return provenance
}

func queryFloat(r *http.Request, name string, fallback float64) (float64, error) {
	value := r.URL.Query().Get(name)
	if value == "" {
		return fallback, nil
	}
	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0, badRequest("invalid %s %q", name, value)
	}
	return parsed, nil
}

func queryTime(r *http.Request, name string) (time.Time, error) {
	value := r.URL.Query().Get(name)
	if value == "" {
		return time.Now().UTC().Truncate(time.Second), nil
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return time.Time{}, badRequest("invalid %s %q: use RFC3339", name, value)
	}
	return parsed.UTC().Truncate(time.Second), nil
}

func queryDuration(r *http.Request, name string, fallback, minimum, maximum time.Duration) (time.Duration, error) {
	value := r.URL.Query().Get(name)
	if value == "" {
		return fallback, nil
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return 0, badRequest("invalid %s %q", name, value)
	}
	if parsed < minimum || parsed > maximum {
		return 0, badRequest("%s must be between %s and %s", name, minimum, maximum)
	}
	return parsed, nil
}

func queryObserver(r *http.Request) (orbit.Observer, error) {
	query := r.URL.Query()
	if query.Get("lat") == "" || query.Get("lon") == "" {
		return orbit.Observer{}, badRequest("provide lat and lon")
	}
	lat, err := queryFloat(r, "lat", 0)
	if err != nil {
		return orbit.Observer{}, err
	}
	lon, err := queryFloat(r, "lon", 0)
	if err != nil {
		return orbit.Observer{}, err
	}
	alt, err := queryFloat(r, "alt", 0)
	if err != nil {
		return orbit.Observer{}, err
	}
	obs := orbit.Observer{Lat: lat, Lon: lon, Alt: alt}
	if err := obs.Validate(); err != nil {
		return orbit.Observer{}, requestError{http.StatusBadRequest, err}
	}
	return obs, nil
}

func (a api) reportV1(w http.ResponseWriter, r *http.Request) {
	instant, err := queryTime(r, "time")
	if err != nil {
		writeFailure(w, err)
		return
	}
	loaded, err := a.loadElement(r)
	if err != nil {
		writeFailure(w, err)
		return
	}
	state, err := loaded.prop.At(instant)
	if err != nil {
		writeFailure(w, err)
		return
	}
	info, err := orbit.OrbitInfoFromElements(loaded.record)
	if err != nil {
		writeFailure(w, err)
		return
	}
	position := orbit.Position{Time: state.Time, LatDeg: state.LatDeg, LonDeg: state.LonDeg, AltKm: state.AltKm, VelocityKm: state.SpeedKmS}
	report, err := output.BuildElementReportAt(loaded.record, position, info, locate.GetGoogleMapsURL(state.LatDeg, state.LonDeg), time.Now())
	if err != nil {
		writeFailure(w, err)
		return
	}
	writeResult(w, "report", output.ReportV1(report), loaded.provenance, loaded.warnings)
}

func (a api) passesV1(w http.ResponseWriter, r *http.Request) {
	start, err := queryTime(r, "start")
	if err != nil {
		writeFailure(w, err)
		return
	}
	obs, err := queryObserver(r)
	if err != nil {
		writeFailure(w, err)
		return
	}
	duration, err := queryDuration(r, "duration", 24*time.Hour, time.Minute, maxHTTPPassWindow)
	if err != nil {
		writeFailure(w, err)
		return
	}
	step, err := queryDuration(r, "step", time.Minute, time.Second, time.Hour)
	if err != nil {
		writeFailure(w, err)
		return
	}
	loaded, err := a.loadElement(r)
	if err != nil {
		writeFailure(w, err)
		return
	}
	passes, err := orbit.PlanPassesElementsContext(r.Context(), loaded.prop, obs, start, duration, step)
	if err != nil {
		writeFailure(w, planningError(err))
		return
	}
	warnings := append(loaded.warnings, output.Warning{Code: "sampled_passes", Message: "Pass events are estimates, and a pass shorter than the sampling step can be missed."})
	writeResult(w, "passes", output.PassPlanV1(loaded.record.CatalogID, obs, start, duration, step, passes), loaded.provenance, warnings)
}

// planningError reports budget and input failures, which planners return as
// plain errors before propagating, as client errors.
func planningError(err error) error {
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return err
	}
	return requestError{http.StatusBadRequest, err}
}

func (a api) tonightV1(w http.ResponseWriter, r *http.Request) {
	from, err := queryTime(r, "time")
	if err != nil {
		writeFailure(w, err)
		return
	}
	obs, err := queryObserver(r)
	if err != nil {
		writeFailure(w, err)
		return
	}
	defaults := orbit.DefaultVisibility()
	minimum, err := queryFloat(r, "min_elevation", defaults.MinElevationDeg)
	if err != nil {
		writeFailure(w, err)
		return
	}
	maximum, err := queryFloat(r, "max_sun_elevation", defaults.MaxSunElevationDeg)
	if err != nil {
		writeFailure(w, err)
		return
	}
	criteria := orbit.Visibility{MinElevationDeg: minimum, MaxSunElevationDeg: maximum}
	if err := criteria.Validate(); err != nil {
		writeFailure(w, requestError{http.StatusBadRequest, err})
		return
	}
	loaded, err := a.loadElement(r)
	if err != nil {
		writeFailure(w, err)
		return
	}
	plan, err := orbit.PlanTonight(r.Context(), loaded.prop, obs, from, criteria)
	if err != nil {
		writeFailure(w, err)
		return
	}
	warnings := append(loaded.warnings, output.Warning{Code: "estimated_visibility", Message: "Visibility is a geometric estimate. It does not consider weather, brightness or local obstructions."})
	writeResult(w, "tonight", output.TonightV1(loaded.record.Name, loaded.record.CatalogID, obs, plan.Window, criteria, plan.Passes), loaded.provenance, warnings)
}

func (a api) trackV1(w http.ResponseWriter, r *http.Request) {
	start, err := queryTime(r, "start")
	if err != nil {
		writeFailure(w, err)
		return
	}
	duration, err := queryDuration(r, "duration", 24*time.Hour, time.Minute, maxTrackWindow)
	if err != nil {
		writeFailure(w, err)
		return
	}
	step, err := queryDuration(r, "step", time.Minute, time.Second, time.Hour)
	if err != nil {
		writeFailure(w, err)
		return
	}
	if int64(duration/step)+1 > maxTrackSamples {
		writeFailure(w, badRequest("track would exceed %d samples", maxTrackSamples))
		return
	}
	var observer *orbit.Observer
	if r.URL.Query().Get("lat") != "" || r.URL.Query().Get("lon") != "" {
		obs, err := queryObserver(r)
		if err != nil {
			writeFailure(w, err)
			return
		}
		observer = &obs
	}
	loaded, err := a.loadElement(r)
	if err != nil {
		writeFailure(w, err)
		return
	}
	info, err := orbit.OrbitInfoFromElements(loaded.record)
	if err != nil {
		writeFailure(w, err)
		return
	}
	samples, err := orbit.Track(r.Context(), loaded.prop, start, duration, step, maxTrackSamples, observer)
	warnings := loaded.warnings
	if err != nil {
		// Decaying objects can stop propagating partway through a window.
		if len(samples) < 2 || r.Context().Err() != nil {
			writeFailure(w, err)
			return
		}
		warnings = append(warnings, output.Warning{Code: "propagation_stopped", Message: err.Error()})
	}
	writeResult(w, "track", output.TrackV1(loaded.record.Name, loaded.record.CatalogID, step, info.PeriodMinutes, samples), loaded.provenance, warnings)
}

func (a api) lookV1(w http.ResponseWriter, r *http.Request) {
	start, err := queryTime(r, "start")
	if err != nil {
		writeFailure(w, err)
		return
	}
	end, err := queryTime(r, "end")
	if err != nil {
		writeFailure(w, err)
		return
	}
	if !end.After(start) || end.Sub(start) > maxTrackWindow {
		writeFailure(w, badRequest("end must be after start and within %s of it", maxTrackWindow))
		return
	}
	obs, err := queryObserver(r)
	if err != nil {
		writeFailure(w, err)
		return
	}
	samples, err := queryFloat(r, "samples", 60)
	if err != nil {
		writeFailure(w, err)
		return
	}
	if samples < 2 || samples > maxLookSamples || samples != float64(int(samples)) {
		writeFailure(w, badRequest("samples must be a whole number from 2 to %d", maxLookSamples))
		return
	}
	loaded, err := a.loadElement(r)
	if err != nil {
		writeFailure(w, err)
		return
	}
	points, err := orbit.PassTrack(loaded.prop, obs, orbit.Pass{Start: start, End: end}, int(samples))
	if err != nil {
		writeFailure(w, err)
		return
	}
	writeResult(w, "look", output.LookV1(loaded.record.CatalogID, obs, points), loaded.provenance, loaded.warnings)
}

// searchV1 reports coverage alongside matches. A cold search can make many
// provider requests, so the web app only runs it when asked.
func (a api) searchV1(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		writeFailure(w, badRequest("provide q"))
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), searchTimeout)
	defer cancel()
	result, err := a.store.SearchElements(ctx, query)
	if err != nil {
		writeFailure(w, requestError{http.StatusBadGateway, err})
		return
	}
	satellites := make([]Satellite, 0, len(result.Records))
	for _, record := range result.Records {
		satellites = append(satellites, Satellite{record.Name, record.CatalogID})
	}
	warnings := result.Warnings
	if warnings == nil {
		warnings = []string{}
	}
	writeJSON(w, map[string]any{"satellites": satellites, "groups_covered": result.GroupsCovered, "groups_total": result.GroupsTotal, "warnings": warnings})
}

const localFileFormat = "local-file"

// fileSource serves a validated local element file as one group, with no provider requests.
type fileSource struct{ records []elements.Record }

const localGroupName = "Local file"

func (s fileSource) FetchGroups() ([]catalog.Group, error) {
	return []catalog.Group{{Name: localGroupName}}, nil
}

func (s fileSource) FetchGroupElements(_ context.Context, name string) ([]elements.Record, catalog.FetchMeta, error) {
	if name != localGroupName {
		return nil, catalog.FetchMeta{}, requestError{http.StatusNotFound, fmt.Errorf("unknown satellite group: %s", name)}
	}
	return s.records, catalog.FetchMeta{Format: localFileFormat}, nil
}

func (s fileSource) FetchElementByNorad(_ context.Context, id string) (elements.Record, catalog.FetchMeta, error) {
	key := canonicalElementID(id)
	for _, record := range s.records {
		if record.CatalogID == key {
			return record, catalog.FetchMeta{Format: localFileFormat}, nil
		}
	}
	return elements.Record{}, catalog.FetchMeta{}, requestError{http.StatusNotFound, fmt.Errorf("NORAD ID %s is not in the local file", id)}
}

func (s fileSource) SearchElements(_ context.Context, query string) (catalog.ElementSearchResult, error) {
	result := catalog.ElementSearchResult{GroupsCovered: 1, GroupsTotal: 1}
	for _, record := range s.records {
		if containsFold(record.Name, query) || containsFold(record.CatalogID, query) {
			result.Records = append(result.Records, record)
		}
	}
	return result, nil
}

// AppOptions configures the web app server.
type AppOptions struct {
	// Addr is the TCP bind address. Port 0 picks a free port.
	Addr string
	// UI holds the web app's static files.
	UI fs.FS
	// Records serves these local elements instead of live catalog data when set.
	Records []elements.Record
	// CacheDir and CacheTTL configure live catalog access.
	CacheDir string
	CacheTTL time.Duration
	// OnReady receives the base URL once the server accepts connections.
	OnReady func(url string)
}

// NewAppHandler combines the JSON API with the web app's static files.
func NewAppHandler(source elementSource, ui fs.FS) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/api/", newHandler(source))
	mux.Handle("/", http.FileServerFS(ui))
	return securityHeaders(mux)
}

// The app loads nothing from other origins, so a strict policy costs nothing.
func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		headers := w.Header()
		headers.Set("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
		headers.Set("X-Content-Type-Options", "nosniff")
		headers.Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(w, r)
	})
}

// ServeApp runs the web app until ctx is canceled.
func ServeApp(ctx context.Context, options AppOptions) error {
	var source elementSource = newMemoSource(ctx, catalog.NewStore(options.CacheDir, options.CacheTTL), options.CacheTTL)
	if options.Records != nil {
		source = fileSource{options.Records}
	}
	listener, err := net.Listen("tcp", options.Addr)
	if err != nil {
		return err
	}
	if options.OnReady != nil {
		options.OnReady("http://" + listener.Addr().String())
	}
	return serveListener(ctx, listener, NewAppHandler(source, options.UI))
}
