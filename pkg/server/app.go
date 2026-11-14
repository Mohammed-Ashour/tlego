package server

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/catalog"
	"github.com/Mohammed-Ashour/khonsu/internal/elements"
	"github.com/Mohammed-Ashour/khonsu/internal/orbit"
	"github.com/Mohammed-Ashour/khonsu/internal/output"
	"github.com/Mohammed-Ashour/khonsu/internal/sources"
	"github.com/Mohammed-Ashour/khonsu/pkg/locate"
)

const (
	maxHTTPPassWindow = 7 * 24 * time.Hour
	maxTrackWindow    = 7 * 24 * time.Hour
	maxTrackSamples   = 20000
	maxLookSamples    = 512
	maxSearchResults  = 500
	searchTimeout     = 60 * time.Second
	// Deep-space propagation cost grows with distance from the epoch, so requests are
	// limited in both time span and running time.
	maxEpochDistance = 5 * 365 * 24 * time.Hour
	computeTimeout   = 30 * time.Second
	maxObserverAltKm = 100
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

func (e requestError) Unwrap() error { return e.err }

func badRequest(format string, args ...any) error {
	return requestError{http.StatusBadRequest, fmt.Errorf(format, args...)}
}

func writeFailure(w http.ResponseWriter, err error) {
	status := http.StatusUnprocessableEntity
	var failure requestError
	var pathErr *fs.PathError
	var linkErr *os.LinkError
	switch {
	case errors.As(err, &failure):
		status = failure.status
	case errors.Is(err, context.DeadlineExceeded):
		status = http.StatusGatewayTimeout
	}
	// Filesystem errors name server paths, which clients have no use for.
	if errors.As(err, &pathErr) || errors.As(err, &linkErr) {
		err = errors.New("the satellite cache could not be used")
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

// withinEpochRange rejects times too far from the elements to mean anything.
func (e element) withinEpochRange(times ...time.Time) error {
	for _, at := range times {
		if at.Sub(e.provenance.ElementEpoch).Abs() > maxEpochDistance {
			return badRequest("time %s is more than five years from the element epoch", at.Format(time.RFC3339))
		}
	}
	return nil
}

// computeContext limits work done for one request.
func computeContext(r *http.Request) (context.Context, context.CancelFunc) {
	return context.WithTimeout(r.Context(), computeTimeout)
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
	if alt > maxObserverAltKm {
		return orbit.Observer{}, badRequest("alt must be at most %d km", maxObserverAltKm)
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
	if err := loaded.withinEpochRange(instant); err != nil {
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
	if int64(duration/step)+2 > orbit.MaxPlanSamples {
		writeFailure(w, badRequest("pass plan would exceed %d samples: use a longer step", orbit.MaxPlanSamples))
		return
	}
	loaded, err := a.loadElement(r)
	if err != nil {
		writeFailure(w, err)
		return
	}
	if err := loaded.withinEpochRange(start, start.Add(duration)); err != nil {
		writeFailure(w, err)
		return
	}
	ctx, cancel := computeContext(r)
	defer cancel()
	passes, err := orbit.PlanPassesElementsContext(ctx, loaded.prop, obs, start, duration, step)
	if err != nil {
		writeFailure(w, err)
		return
	}
	warnings := append(loaded.warnings, output.DistantEpochWarning(loaded.provenance.ElementEpoch, start)...)
	warnings = append(warnings, output.Warning{Code: "sampled_passes", Message: "Pass events are estimates, and a pass shorter than the sampling step can be missed."})
	writeResult(w, "passes", output.PassPlanV1(loaded.record.CatalogID, obs, start, duration, step, passes), loaded.provenance, warnings)
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
	if err := loaded.withinEpochRange(from); err != nil {
		writeFailure(w, err)
		return
	}
	ctx, cancel := computeContext(r)
	defer cancel()
	plan, err := orbit.PlanTonight(ctx, loaded.prop, obs, from, criteria)
	if err != nil {
		writeFailure(w, err)
		return
	}
	warnings := append(loaded.warnings, output.DistantEpochWarning(loaded.provenance.ElementEpoch, from)...)
	warnings = append(warnings, output.Warning{Code: "estimated_visibility", Message: "Visibility is a geometric estimate. It does not consider weather, brightness or local obstructions."})
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
	if err := loaded.withinEpochRange(start, start.Add(duration)); err != nil {
		writeFailure(w, err)
		return
	}
	ctx, cancel := computeContext(r)
	defer cancel()
	samples, err := orbit.Track(ctx, loaded.prop, start, duration, step, maxTrackSamples, observer)
	warnings := loaded.warnings
	if err != nil {
		// Decaying objects can stop propagating partway through a window.
		if len(samples) < 2 || ctx.Err() != nil {
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
	if err := loaded.withinEpochRange(start, end); err != nil {
		writeFailure(w, err)
		return
	}
	ctx, cancel := computeContext(r)
	defer cancel()
	points, err := orbit.PassTrack(ctx, loaded.prop, obs, orbit.Pass{Start: start, End: end}, int(samples))
	if err != nil {
		writeFailure(w, err)
		return
	}
	writeResult(w, "look", output.LookV1(loaded.record.CatalogID, obs, points), loaded.provenance, loaded.warnings)
}

// searchV1 reports coverage alongside matches. A cold search can make many
// provider requests, so the web app only runs it when asked.
func (a api) searchV1(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("q"))
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
	satellites := make([]Satellite, 0, min(len(result.Records), maxSearchResults))
	for _, record := range result.Records {
		if len(satellites) == maxSearchResults {
			break
		}
		satellites = append(satellites, Satellite{record.Name, record.CatalogID})
	}
	warnings := result.Warnings
	if warnings == nil {
		warnings = []string{}
	}
	writeJSON(w, map[string]any{"satellites": satellites, "groups_covered": result.GroupsCovered, "groups_total": result.GroupsTotal, "truncated": len(result.Records) > maxSearchResults, "warnings": warnings})
}

const localFileFormat = "local-file"

// fileSource serves a validated local element file as one group, with no provider requests.
type fileSource struct{ records []elements.Record }

const localGroupName = "Local file"

func (s fileSource) FetchGroups() ([]catalog.Group, error) {
	return []catalog.Group{{Name: localGroupName}}, nil
}

func (s fileSource) FetchGroupElements(_ context.Context, name string) ([]elements.Record, catalog.FetchMeta, error) {
	if !strings.EqualFold(name, localGroupName) {
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

// newAppHandler combines the JSON API with the web app's static files.
func newAppHandler(source elementSource, feeds *sources.Hub, ui fs.FS) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/api/", newHandler(source))
	registerDataRoutes(mux, feeds)
	mux.Handle("/", http.FileServerFS(ui))
	return securityHeaders(mux)
}

// The app loads nothing from other origins, so a strict policy costs nothing. The
// server is read-only, and pages on other sites have no reason to call its API:
// without this check, any website could spend the user's provider allowance.
func securityHeaders(next http.Handler) http.Handler {
	return readOnlySameSite(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		headers := w.Header()
		headers.Set("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
		headers.Set("X-Content-Type-Options", "nosniff")
		headers.Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(w, r)
	}))
}

// readOnlySameSite accepts only reads, and refuses API calls from pages on other
// sites. Both servers use it; only the web app adds its content policy.
func readOnlySameSite(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.Header().Set("Allow", "GET, HEAD")
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		if strings.HasPrefix(r.URL.Path, "/api/") && r.Header.Get("Sec-Fetch-Site") == "cross-site" {
			http.Error(w, "Cross-site requests are not allowed", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// guardLoopback adds the DNS-rebinding check when the listener is on loopback.
func guardLoopback(listener net.Listener, handler http.Handler) http.Handler {
	if tcp, ok := listener.Addr().(*net.TCPAddr); ok && tcp.IP.IsLoopback() {
		return loopbackHostsOnly(handler)
	}
	return handler
}

// loopbackHostsOnly blocks DNS rebinding: a loopback server is only ever reached by
// a loopback name, so any other Host header comes from a page pretending to be one.
func loopbackHostsOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := r.Host
		if name, _, err := net.SplitHostPort(host); err == nil {
			host = name
		}
		host = strings.Trim(host, "[]")
		ip := net.ParseIP(host)
		if !strings.EqualFold(host, "localhost") && (ip == nil || !ip.IsLoopback()) {
			http.Error(w, "This server only answers on its loopback address", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// appURL gives an address a browser can open. A wildcard bind has no address of
// its own, so it uses the loopback interface.
func appURL(addr net.Addr) string {
	tcp, ok := addr.(*net.TCPAddr)
	if ok && tcp.IP.IsUnspecified() {
		return fmt.Sprintf("http://127.0.0.1:%d", tcp.Port)
	}
	return "http://" + addr.String()
}

// ServeApp runs the web app until ctx is canceled.
func ServeApp(ctx context.Context, options AppOptions) error {
	var source elementSource = newMemoSource(ctx, catalog.NewStore(options.CacheDir, options.CacheTTL), options.CacheTTL)
	feeds := sources.NewHub(options.CacheDir)
	if options.Records != nil {
		source, feeds = fileSource{options.Records}, nil
	}
	listener, err := net.Listen("tcp", options.Addr)
	if err != nil {
		return err
	}
	if options.OnReady != nil {
		options.OnReady(appURL(listener.Addr()))
	}
	return serveListener(ctx, listener, guardLoopback(listener, newAppHandler(source, feeds, options.UI)))
}
