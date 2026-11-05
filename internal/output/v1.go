package output

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Mohammed-Ashour/tlego/internal/orbit"
)

const SchemaVersion = "1.0"

type Warning struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Provenance struct {
	Source       string     `json:"source"`
	SourceFormat string     `json:"source_format"`
	ElementEpoch time.Time  `json:"element_epoch"`
	FetchedAt    *time.Time `json:"fetched_at"`
	CacheStatus  string     `json:"cache_status"`
}

type Envelope struct {
	SchemaVersion string     `json:"schema_version"`
	Kind          string     `json:"kind"`
	Data          any        `json:"data"`
	Provenance    Provenance `json:"provenance"`
	Warnings      []Warning  `json:"warnings"`
}

// MarshalResult builds the entire document before the caller writes stdout.
// encoding/json rejects all non-finite numeric fields, including nested data.
func MarshalResult(kind string, data any, provenance Provenance, warnings []Warning) ([]byte, error) {
	if warnings == nil {
		warnings = []Warning{}
	}
	provenance.ElementEpoch = provenance.ElementEpoch.UTC()
	if provenance.FetchedAt != nil {
		t := provenance.FetchedAt.UTC()
		provenance.FetchedAt = &t
	}
	return json.MarshalIndent(Envelope{SchemaVersion, kind, data, provenance, warnings}, "", "  ")
}

type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type ErrorRecord struct {
	SchemaVersion string      `json:"schema_version"`
	Kind          string      `json:"kind"`
	Error         ErrorDetail `json:"error"`
}

func MarshalError(code string, err error) []byte {
	b, _ := json.Marshal(ErrorRecord{SchemaVersion, "error", ErrorDetail{code, err.Error()}})
	return b
}

type PositionRecord struct {
	CatalogID    string    `json:"catalog_id"`
	EvaluatedAt  time.Time `json:"evaluated_at"`
	LatitudeDeg  float64   `json:"latitude_deg"`
	LongitudeDeg float64   `json:"longitude_deg"`
	AltitudeKm   float64   `json:"altitude_km"`
	SpeedKmS     float64   `json:"speed_km_s"`
}

func PositionV1(id string, s orbit.State) PositionRecord {
	return PositionRecord{id, s.Time.UTC(), s.LatDeg, s.LonDeg, s.AltKm, s.SpeedKmS}
}

type ObserverRecord struct {
	LatitudeDeg  float64 `json:"latitude_deg"`
	LongitudeDeg float64 `json:"longitude_deg"`
	AltitudeKm   float64 `json:"altitude_km"`
}

type PassRecord struct {
	Start               time.Time  `json:"start"`
	End                 time.Time  `json:"end"`
	RiseAt              *time.Time `json:"rise_at"`
	SetAt               *time.Time `json:"set_at"`
	MaximumAt           time.Time  `json:"maximum_at"`
	MaximumElevationDeg float64    `json:"maximum_elevation_deg"`
	StartClipped        bool       `json:"start_clipped"`
	EndClipped          bool       `json:"end_clipped"`
	StartAzimuthDeg     float64    `json:"start_azimuth_deg"`
	MaximumAzimuthDeg   float64    `json:"maximum_azimuth_deg"`
	EndAzimuthDeg       float64    `json:"end_azimuth_deg"`
}

type PassPlanRecord struct {
	CatalogID           string         `json:"catalog_id"`
	Observer            ObserverRecord `json:"observer"`
	WindowStart         time.Time      `json:"window_start"`
	WindowEnd           time.Time      `json:"window_end"`
	MinimumElevationDeg float64        `json:"minimum_elevation_deg"`
	SampleStepSeconds   float64        `json:"sample_step_seconds"`
	Passes              []PassRecord   `json:"passes"`
}

func PassPlanV1(id string, obs orbit.Observer, start time.Time, duration, step time.Duration, passes []orbit.Pass) PassPlanRecord {
	result := PassPlanRecord{CatalogID: id, Observer: ObserverRecord{obs.Lat, obs.Lon, obs.Alt}, WindowStart: start.UTC(), WindowEnd: start.Add(duration).UTC(), SampleStepSeconds: step.Seconds(), Passes: []PassRecord{}}
	for _, p := range passes {
		record := PassRecord{Start: p.Start.UTC(), End: p.End.UTC(), MaximumAt: p.MaxTime.UTC(), MaximumElevationDeg: p.MaxElevationDeg, StartClipped: p.StartClipped, EndClipped: p.EndClipped, StartAzimuthDeg: p.StartAzimuthDeg, MaximumAzimuthDeg: p.MaxAzimuthDeg, EndAzimuthDeg: p.EndAzimuthDeg}
		if !p.StartClipped {
			t := record.Start
			record.RiseAt = &t
		}
		if !p.EndClipped {
			t := record.End
			record.SetAt = &t
		}
		result.Passes = append(result.Passes, record)
	}
	return result
}

// LookPointRecord is a satellite direction at one instant.
type LookPointRecord struct {
	At           time.Time `json:"at"`
	AzimuthDeg   float64   `json:"azimuth_deg"`
	ElevationDeg float64   `json:"elevation_deg"`
}

// VisiblePassRecord is the visible part of one pass.
type VisiblePassRecord struct {
	Start        LookPointRecord `json:"start"`
	Peak         LookPointRecord `json:"peak"`
	End          LookPointRecord `json:"end"`
	EndsInShadow bool            `json:"ends_in_shadow"`
}

// TonightRecord lists visible passes in the next dark window. The window fields
// are null when the Sun does not reach the limit within the search period.
type TonightRecord struct {
	Name                   string              `json:"name"`
	CatalogID              string              `json:"catalog_id"`
	Observer               ObserverRecord      `json:"observer"`
	DarkStart              *time.Time          `json:"dark_start"`
	DarkEnd                *time.Time          `json:"dark_end"`
	DarkEndClipped         bool                `json:"dark_end_clipped"`
	MinimumElevationDeg    float64             `json:"minimum_elevation_deg"`
	MaximumSunElevationDeg float64             `json:"maximum_sun_elevation_deg"`
	Passes                 []VisiblePassRecord `json:"passes"`
}

// TonightV1 builds the transport record. A nil window means no dark period was found.
func TonightV1(name, id string, obs orbit.Observer, window *orbit.DarkWindow, criteria orbit.Visibility, passes []orbit.VisiblePass) TonightRecord {
	record := TonightRecord{Name: name, CatalogID: id, Observer: ObserverRecord{obs.Lat, obs.Lon, obs.Alt}, MinimumElevationDeg: criteria.MinElevationDeg, MaximumSunElevationDeg: criteria.MaxSunElevationDeg, Passes: []VisiblePassRecord{}}
	if window != nil {
		start, end := window.Start.UTC(), window.End.UTC()
		record.DarkStart, record.DarkEnd, record.DarkEndClipped = &start, &end, window.Clipped
	}
	point := func(p orbit.LookPoint) LookPointRecord {
		return LookPointRecord{p.Time.UTC(), p.AzimuthDeg, p.ElevationDeg}
	}
	for _, pass := range passes {
		record.Passes = append(record.Passes, VisiblePassRecord{point(pass.Start), point(pass.Peak), point(pass.End), pass.EndsInShadow})
	}
	return record
}

type OrbitRecord struct {
	InclinationDeg     float64 `json:"inclination_deg"`
	Eccentricity       float64 `json:"eccentricity"`
	MeanMotionRevDay   float64 `json:"mean_motion_rev_day"`
	PeriodMinutes      float64 `json:"period_minutes"`
	ApogeeKm           float64 `json:"apogee_km"`
	PerigeeKm          float64 `json:"perigee_km"`
	OrbitClassEstimate string  `json:"orbit_class_estimate"`
}

type ReportRecord struct {
	Name         string          `json:"name"`
	CatalogID    string          `json:"catalog_id"`
	Position     PositionRecord  `json:"position"`
	Orbit        OrbitRecord     `json:"orbit"`
	TLE          string          `json:"tle"`
	MapURL       string          `json:"map_url"`
	SourceFormat string          `json:"source_format,omitempty"`
	ElementData  json.RawMessage `json:"element_data,omitempty"`
}

func ReportV1(report ReportData) ReportRecord {
	p, o := report.Position, report.Orbit
	return ReportRecord{report.Name, report.NoradID, PositionRecord{report.NoradID, p.Time.UTC(), p.LatDeg, p.LonDeg, p.AltKm, p.VelocityKm}, OrbitRecord{o.InclinationDeg, o.Eccentricity, o.MeanMotion, o.PeriodMinutes, o.ApogeeKm, o.PerigeeKm, o.OrbitClass}, report.TLE, report.MapURL, report.SourceFormat, report.ElementData}
}

func ValidateVersion(version string) error {
	if version != SchemaVersion {
		return fmt.Errorf("unsupported schema version %q; supported: %s", version, SchemaVersion)
	}
	return nil
}
