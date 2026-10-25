// Package elements provides a format-independent representation of GP element sets.
package elements

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/tle"
)

// Record holds the common mean elements from either a TLE or GP OMM JSON.
type Record struct {
	Name                 string
	CatalogID            string
	Epoch                time.Time
	MeanMotionRevDay     float64
	Eccentricity         float64
	InclinationDeg       float64
	RAANDeg              float64
	ArgumentOfPerigeeDeg float64
	MeanAnomalyDeg       float64
	BStar                float64
	MeanMotionDot        float64
	MeanMotionDDot       float64
	SourceFormat         string
	Raw                  []byte
	LegacyTLE            *tle.TLE
}

// FromTLE converts the existing parsed TLE representation without changing its catalog ID.
func FromTLE(t tle.TLE) (Record, error) {
	id := t.NoradID
	if id == "" {
		id = t.Line1.SataliteID
	}
	if id == "" {
		id = t.Line2.SataliteID
	}
	id = canonicalID(id)
	yy, err := strconv.Atoi(t.Line1.EpochYear)
	if err != nil || len(t.Line1.EpochYear) != 2 || yy < 0 || yy > 99 {
		return Record{}, fmt.Errorf("invalid TLE epoch year %q", t.Line1.EpochYear)
	}
	year := 1900 + yy
	if yy < 57 {
		year += 100
	}
	dayText := strings.TrimSpace(t.Line1.EpochDay)
	whole, fraction, ok := strings.Cut(dayText, ".")
	day, err := strconv.Atoi(whole)
	if err != nil || !ok || day < 1 || day > daysInYear(year) || len(fraction) == 0 || len(fraction) > 8 {
		return Record{}, fmt.Errorf("invalid TLE epoch day %q", dayText)
	}
	for _, c := range fraction {
		if c < '0' || c > '9' {
			return Record{}, fmt.Errorf("invalid TLE epoch day %q", dayText)
		}
	}
	ticks, err := strconv.ParseInt(fraction+strings.Repeat("0", 8-len(fraction)), 10, 64)
	if err != nil {
		return Record{}, err
	}
	// One unit in the TLE's eight-digit day fraction is exactly 864 microseconds.
	epoch := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC).AddDate(0, 0, day-1).Add(time.Duration(ticks) * 864 * time.Microsecond)
	parse := func(name, value string) (float64, error) {
		v, e := strconv.ParseFloat(strings.TrimSpace(value), 64)
		if e != nil || math.IsNaN(v) || math.IsInf(v, 0) {
			return 0, fmt.Errorf("invalid TLE %s %q", name, value)
		}
		return v, nil
	}
	var vals [9]float64
	fields := []struct{ name, value string }{{"mean motion", t.Line2.MeanMotion}, {"eccentricity", t.Line2.Eccentricity}, {"inclination", t.Line2.Inclination}, {"RAAN", t.Line2.RightAscension}, {"argument of perigee", t.Line2.ArgumentOfPerigee}, {"mean anomaly", t.Line2.MeanAnomaly}, {"BStar", t.Line1.Bstar}, {"mean motion derivative", t.Line1.FirstDerivative}, {"second mean motion derivative", t.Line1.SecondDerivative}}
	for i, f := range fields {
		vals[i], err = parse(f.name, f.value)
		if err != nil {
			return Record{}, err
		}
	}
	r := Record{Name: t.Name, CatalogID: id, Epoch: epoch, MeanMotionRevDay: vals[0], Eccentricity: vals[1], InclinationDeg: vals[2], RAANDeg: vals[3], ArgumentOfPerigeeDeg: vals[4], MeanAnomalyDeg: vals[5], BStar: vals[6], MeanMotionDot: vals[7], MeanMotionDDot: vals[8], SourceFormat: "tle", LegacyTLE: &t}
	if err := r.Validate(); err != nil {
		return Record{}, err
	}
	return r, nil
}

func (r Record) Validate() error {
	if !validID(r.CatalogID) {
		return fmt.Errorf("catalog ID must be a positive decimal string of 1 to 9 digits")
	}
	if r.SourceFormat != "tle" && r.SourceFormat != "gp-json" {
		return fmt.Errorf("unsupported source format %q", r.SourceFormat)
	}
	if _, err := r.Time(); err != nil {
		return err
	}
	vals := []struct {
		name string
		v    float64
	}{{"mean motion", r.MeanMotionRevDay}, {"eccentricity", r.Eccentricity}, {"inclination", r.InclinationDeg}, {"RAAN", r.RAANDeg}, {"argument of perigee", r.ArgumentOfPerigeeDeg}, {"mean anomaly", r.MeanAnomalyDeg}, {"BStar", r.BStar}, {"mean motion derivative", r.MeanMotionDot}, {"second mean motion derivative", r.MeanMotionDDot}}
	for _, v := range vals {
		if math.IsNaN(v.v) || math.IsInf(v.v, 0) {
			return fmt.Errorf("%s must be finite", v.name)
		}
	}
	if r.MeanMotionRevDay <= 0 || r.Eccentricity < 0 || r.Eccentricity >= 1 || r.InclinationDeg < 0 || r.InclinationDeg > 180 || r.RAANDeg < 0 || r.RAANDeg >= 360 || r.ArgumentOfPerigeeDeg < 0 || r.ArgumentOfPerigeeDeg >= 360 || r.MeanAnomalyDeg < 0 || r.MeanAnomalyDeg >= 360 {
		return fmt.Errorf("mean elements are outside valid ranges")
	}
	return nil
}
func (r Record) Time() (time.Time, error) {
	if r.Epoch.IsZero() {
		return time.Time{}, fmt.Errorf("epoch is required")
	}
	return r.Epoch.UTC(), nil
}
func (r Record) String() string {
	if len(r.Raw) > 0 {
		return string(r.Raw)
	}
	if r.LegacyTLE != nil {
		return r.LegacyTLE.String()
	}
	return fmt.Sprintf("%s %s %s", r.CatalogID, r.Name, r.Epoch.UTC().Format(time.RFC3339Nano))
}
func validID(s string) bool {
	if len(s) < 1 || len(s) > 9 || s[0] == '0' {
		return false
	}
	for _, c := range s {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}

func canonicalID(s string) string {
	for _, c := range s {
		if c < '0' || c > '9' {
			return s
		}
	}
	s = strings.TrimLeft(s, "0")
	if s == "" {
		return "0"
	}
	return s
}

func daysInYear(year int) int {
	if year%4 == 0 && (year%100 != 0 || year%400 == 0) {
		return 366
	}
	return 365
}

type gpObject map[string]json.RawMessage

// ParseGPJSON parses one GP OMM JSON object or a non-empty array of such objects.
func ParseGPJSON(data []byte) ([]Record, error) {
	trim := bytes.TrimSpace(data)
	if len(trim) == 0 {
		return nil, fmt.Errorf("empty GP JSON")
	}
	var objects []json.RawMessage
	if trim[0] == '[' {
		if err := json.Unmarshal(trim, &objects); err != nil {
			return nil, err
		}
		if len(objects) == 0 {
			return nil, fmt.Errorf("GP JSON array must not be empty")
		}
	} else {
		objects = []json.RawMessage{append([]byte(nil), trim...)}
	}
	result := make([]Record, 0, len(objects))
	for i, raw := range objects {
		var obj gpObject
		if err := json.Unmarshal(raw, &obj); err != nil {
			return nil, fmt.Errorf("record %d: %w", i, err)
		}
		r, err := parseObject(obj, raw)
		if err != nil {
			return nil, fmt.Errorf("record %d: %w", i, err)
		}
		result = append(result, r)
	}
	return result, nil
}

func parseObject(o gpObject, raw []byte) (Record, error) {
	get := func(k string) (json.RawMessage, error) {
		v, ok := o[k]
		if !ok || bytes.Equal(bytes.TrimSpace(v), []byte("null")) {
			return nil, fmt.Errorf("missing required field %s", k)
		}
		return v, nil
	}
	str := func(k string) (string, error) {
		b, e := get(k)
		if e != nil {
			return "", e
		}
		var s string
		if e = json.Unmarshal(b, &s); e != nil {
			return "", fmt.Errorf("%s must be a string", k)
		}
		return s, nil
	}
	num := func(k string) (float64, error) {
		b, e := get(k)
		if e != nil {
			return 0, e
		}
		var n json.Number
		if e = json.Unmarshal(b, &n); e != nil {
			return 0, fmt.Errorf("%s must be numeric", k)
		}
		v, e := strconv.ParseFloat(n.String(), 64)
		if e != nil || math.IsNaN(v) || math.IsInf(v, 0) {
			return 0, fmt.Errorf("%s must be finite numeric", k)
		}
		return v, nil
	}
	idraw, e := get("NORAD_CAT_ID")
	if e != nil {
		return Record{}, e
	}
	idText := string(bytes.TrimSpace(idraw))
	id := idText
	if strings.HasPrefix(idText, "\"") {
		if e = json.Unmarshal(idraw, &id); e != nil {
			return Record{}, fmt.Errorf("invalid NORAD_CAT_ID")
		}
	} else {
		if idText == "" || strings.TrimLeft(idText, "0123456789") != "" {
			return Record{}, fmt.Errorf("NORAD_CAT_ID must be a decimal integer token")
		}
	}
	id = canonicalID(id)
	if !validID(id) {
		return Record{}, fmt.Errorf("NORAD_CAT_ID must be a positive decimal string of 1 to 9 digits")
	}
	name := id
	if b, ok := o["OBJECT_NAME"]; ok && !bytes.Equal(bytes.TrimSpace(b), []byte("null")) {
		if e = json.Unmarshal(b, &name); e != nil {
			return Record{}, fmt.Errorf("OBJECT_NAME must be a string")
		}
	}
	epochText, e := str("EPOCH")
	if e != nil {
		return Record{}, e
	}
	epoch, e := parseEpoch(epochText)
	if e != nil {
		return Record{}, e
	}
	keys := []string{"MEAN_MOTION", "ECCENTRICITY", "INCLINATION", "RA_OF_ASC_NODE", "ARG_OF_PERICENTER", "MEAN_ANOMALY", "BSTAR", "MEAN_MOTION_DOT", "MEAN_MOTION_DDOT"}
	vals := make([]float64, len(keys))
	for i, k := range keys {
		vals[i], e = num(k)
		if e != nil {
			return Record{}, e
		}
	}
	for _, pair := range []struct{ k, want string }{{"CENTER_NAME", "EARTH"}, {"REF_FRAME", "TEME"}, {"TIME_SYSTEM", "UTC"}, {"MEAN_ELEMENT_THEORY", "SGP4"}} {
		if b, ok := o[pair.k]; ok {
			var s string
			if json.Unmarshal(b, &s) != nil || !strings.EqualFold(s, pair.want) {
				return Record{}, fmt.Errorf("unsupported %s (expected %s)", pair.k, pair.want)
			}
		}
	}
	for _, pair := range []struct{ k, want string }{{"MEAN_MOTION_UNITS", "revs/day"}, {"ANGLE_UNITS", "degrees"}} {
		if b, ok := o[pair.k]; ok {
			var s string
			if json.Unmarshal(b, &s) != nil || !strings.EqualFold(s, pair.want) {
				return Record{}, fmt.Errorf("unsupported %s (expected %s)", pair.k, pair.want)
			}
		}
	}
	if b, ok := o["EPHEMERIS_TYPE"]; ok {
		if string(bytes.TrimSpace(b)) != "0" {
			return Record{}, fmt.Errorf("unsupported EPHEMERIS_TYPE")
		}
	}
	r := Record{Name: name, CatalogID: id, Epoch: epoch, MeanMotionRevDay: vals[0], Eccentricity: vals[1], InclinationDeg: vals[2], RAANDeg: vals[3], ArgumentOfPerigeeDeg: vals[4], MeanAnomalyDeg: vals[5], BStar: vals[6], MeanMotionDot: vals[7], MeanMotionDDot: vals[8], SourceFormat: "gp-json", Raw: append([]byte(nil), raw...)}
	if e = r.Validate(); e != nil {
		return Record{}, e
	}
	return r, nil
}

func parseEpoch(s string) (time.Time, error) {
	if t, e := time.Parse(time.RFC3339Nano, s); e == nil {
		return t.UTC(), nil
	}
	for _, layout := range []string{"2006-01-02T15:04:05.999999999", "2006-01-02T15:04:05"} {
		if t, e := time.ParseInLocation(layout, s, time.UTC); e == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("invalid EPOCH %q", s)
}
