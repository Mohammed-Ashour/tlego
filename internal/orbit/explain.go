package orbit

import (
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/elements"
)

// Statement bases. Derived statements follow directly from the mean elements
// by arithmetic. Heuristic statements match a named pattern within a project
// tolerance documented in docs/orbit-estimates.md.
const (
	BasisDerived   = "derived"
	BasisHeuristic = "heuristic"
)

// Named orbit patterns reported in Explanation.Patterns.
const (
	PatternSunSynchronous = "sun_synchronous"
	PatternDawnDusk       = "dawn_dusk"
	PatternMolniya        = "molniya"
	PatternTundra         = "tundra"
	PatternPolar          = "polar"
	PatternNearEquatorial = "near_equatorial"
	PatternRetrograde     = "retrograde"
)

const (
	earthJ2 = 1.08262998905e-3 // WGS-84 value used by SGP4
	// Earth's rotation relative to the mean equinox, degrees per mean solar day.
	earthRotationDegDay = 360.98564736629
	// Rate at which the mean Sun moves along the equator, degrees per day.
	sunSynchronousDegDay = 360 / 365.2422
	criticalInclination  = 63.4349

	sunSyncToleranceDegDay  = 0.03
	molniyaPeriodTolerance  = 0.03
	criticalIncTolerance    = 3.0
	repeatMaxDays           = 30
	repeatToleranceRevDay   = 1e-4
	polarMinInclination     = 80.0
	nearEquatorialMaxInc    = 5.0
	noticeableEccentricity  = 0.1
	ellipticalEccentricity  = 0.25
	dawnDuskToleranceHours  = 1.0
	molniyaMinEccentricity  = 0.5
	tundraMinEccentricity   = 0.15
	tundraMaxEccentricity   = 0.5
	synchronousPeriodWindow = 0.01
)

// Statement is one plain-language sentence about an orbit.
type Statement struct {
	ID    string `json:"id"`
	Text  string `json:"text"`
	Basis string `json:"basis"`
}

// RepeatTrack describes a ground track that nearly repeats.
type RepeatTrack struct {
	Days        float64 `json:"days"`
	NodalDays   int     `json:"nodal_days"`
	Revolutions int     `json:"revolutions"`
}

// Explanation says why an orbit is shaped the way it is. It is additive to the
// schema 1.0 orbit record and never changes OrbitClass.
type Explanation struct {
	Regime                string       `json:"regime"`
	RegimeName            string       `json:"regime_name"`
	Patterns              []string     `json:"patterns"`
	Statements            []Statement  `json:"statements"`
	NodalPrecessionDegDay float64      `json:"nodal_precession_deg_day"`
	EquatorCrossingHours  *float64     `json:"descending_node_local_time_hours,omitempty"`
	RepeatGroundTrack     *RepeatTrack `json:"repeat_ground_track,omitempty"`
}

// Explain derives a plain-language explanation from mean elements.
func Explain(r elements.Record) (Explanation, error) {
	if err := r.Validate(); err != nil {
		return Explanation{}, err
	}
	info, err := orbitInfo(r.InclinationDeg, r.Eccentricity, r.MeanMotionRevDay)
	if err != nil {
		return Explanation{}, err
	}
	return explain(info, r.RAANDeg, r.ArgumentOfPerigeeDeg, r.Epoch), nil
}

// secularRates returns J2 nodal and apsidal precession in degrees per day.
func secularRates(o OrbitInfo) (node, perigee float64) {
	a := (o.PerigeeKm+o.ApogeeKm)/2 + earthRadiusKm
	p := a * (1 - o.Eccentricity*o.Eccentricity)
	k := 1.5 * earthJ2 * (earthRadiusKm / p) * (earthRadiusKm / p) * o.MeanMotion * 360
	inc := o.InclinationDeg * math.Pi / 180
	sin2 := math.Sin(inc) * math.Sin(inc)
	return -k * math.Cos(inc), k * (2 - 2.5*sin2)
}

func explain(o OrbitInfo, raanDeg, argPerigeeDeg float64, epoch time.Time) Explanation {
	node, perigee := secularRates(o)
	e := Explanation{Regime: o.OrbitClass, Patterns: []string{}, NodalPrecessionDegDay: round(node, 4)}
	add := func(id, basis, format string, args ...any) {
		e.Statements = append(e.Statements, Statement{id, fmt.Sprintf(format, args...), basis})
	}
	synchronous := math.Abs(o.PeriodMinutes-siderealDayMinutes) <= synchronousPeriodWindow*siderealDayMinutes
	nearCritical := math.Abs(o.InclinationDeg-criticalInclination) <= criticalIncTolerance ||
		math.Abs(o.InclinationDeg-(180-criticalInclination)) <= criticalIncTolerance
	sunSync := o.Eccentricity < noticeableEccentricity && math.Abs(node-sunSynchronousDegDay) <= sunSyncToleranceDegDay
	molniya := o.Eccentricity >= molniyaMinEccentricity && nearCritical &&
		math.Abs(o.PeriodMinutes-siderealDayMinutes/2) <= molniyaPeriodTolerance*siderealDayMinutes/2
	tundra := synchronous && nearCritical && o.Eccentricity >= tundraMinEccentricity && o.Eccentricity <= tundraMaxEccentricity

	switch {
	case o.OrbitClass == "LEO":
		e.RegimeName = "Low Earth orbit"
		add("regime", BasisDerived, "It flies in low Earth orbit, below 2,000 km. That's close enough for sharp pictures and quick radio contact, but it sees any one place for only a few minutes at a time.")
	case o.OrbitClass == "MEO":
		e.RegimeName = "Medium Earth orbit"
		add("regime", BasisDerived, "It flies in medium Earth orbit, between 2,000 km and geostationary height. Navigation systems such as GPS and Galileo use this band because a few dozen satellites can cover the whole planet.")
	case o.OrbitClass == "GEO":
		e.RegimeName = "Geostationary orbit"
		add("regime", BasisHeuristic, "It's geostationary: it circles once in the time Earth takes to turn, above the equator, so it hangs over one longitude. A fixed dish or a weather camera can watch the same side of Earth all the time.")
	case o.OrbitClass == "GSO":
		e.RegimeName = "Geosynchronous orbit"
		if tundra {
			add("regime", BasisHeuristic, "It's geosynchronous: it circles once in the time Earth takes to turn, so its path over the ground repeats every day.")
		} else {
			add("regime", BasisHeuristic, "It's geosynchronous: it circles once in the time Earth takes to turn, but its orbit is tilted or stretched, so instead of sitting still it traces a loop or figure eight around one longitude each day.")
		}
	case o.OrbitClass == "HEO":
		e.RegimeName = "High Earth orbit"
		add("regime", BasisDerived, "It flies above geostationary height, where few satellites go. Out here a single orbit takes more than a day.")
	case o.Eccentricity >= ellipticalEccentricity:
		e.Regime, e.RegimeName = "Elliptical", "Highly elliptical orbit"
		add("regime", BasisDerived, "Its orbit is a long ellipse: it swoops low and fast at the near end and climbs slowly to the far end, so it spends most of its time far from Earth.")
	default:
		e.RegimeName = "Crosses altitude bands"
		add("regime", BasisDerived, "Its orbit crosses more than one altitude band, which often means a transfer orbit or a spent rocket stage.")
	}

	if !synchronous {
		perDay := 1440 / o.PeriodMinutes
		if math.Abs(perDay-2) < 0.05 {
			add("pace", BasisDerived, "It circles Earth twice a day, once every %s.", duration(o.PeriodMinutes))
		} else if perDay >= 1.5 {
			add("pace", BasisDerived, "It circles Earth about %s times a day, once every %s.", trimFloat(perDay), duration(o.PeriodMinutes))
		} else {
			add("pace", BasisDerived, "One trip around Earth takes %s.", duration(o.PeriodMinutes))
		}
	}

	inc := o.InclinationDeg
	reach := inc
	if inc > 90 {
		reach = 180 - inc
		e.Patterns = append(e.Patterns, PatternRetrograde)
	}
	switch {
	case o.OrbitClass == "GEO":
	case reach <= nearEquatorialMaxInc:
		e.Patterns = append(e.Patterns, PatternNearEquatorial)
		add("reach", BasisDerived, "Its orbit is tilted only %.1f° to the equator, so it never strays more than %.0f° north or south of it.", inc, math.Max(reach, 1))
	default:
		add("reach", BasisDerived, "Its orbit is tilted %.1f° to the equator, so it flies over latitudes up to %.0f° north and south.", inc, reach)
	}
	if inc > 90 {
		add("retrograde", BasisDerived, "Tilted past 90°, it travels against Earth's spin, which is called a retrograde orbit.")
	}

	if o.Eccentricity >= noticeableEccentricity {
		add("shape", BasisDerived, "Its height swings from %s km to %s km each orbit, and it moves fastest at the low point.", thousands(o.PerigeeKm), thousands(o.ApogeeKm))
	}

	switch {
	case sunSync:
		e.Patterns = append(e.Patterns, PatternSunSynchronous)
		add("sun_synchronous", BasisHeuristic, "It's sun-synchronous: Earth's bulge turns its orbit about 1° a day, the same rate Earth moves around the Sun, so it passes over each place at the same local solar time every day. That keeps the lighting steady from one picture to the next.")
		if !epoch.IsZero() {
			descending := localNodeHours(raanDeg, epoch) - 12
			descending = math.Mod(descending+48, 24)
			e.EquatorCrossingHours = ptr(round(descending, 2))
			crossing, direction := descending, "south"
			if crossing < 6 || crossing >= 18 {
				crossing, direction = math.Mod(crossing+12, 24), "north"
			}
			if math.Abs(crossing-6) <= dawnDuskToleranceHours || math.Abs(crossing-18) <= dawnDuskToleranceHours {
				e.Patterns = append(e.Patterns, PatternDawnDusk)
				add("equator_time", BasisDerived, "It crosses the equator around %s and %s local solar time, riding the line between day and night. That keeps its solar panels in sunlight almost all the time.", clock(crossing), clock(math.Mod(crossing+12, 24)))
			} else {
				add("equator_time", BasisDerived, "In daylight it crosses the equator heading %s at about %s local solar time.", direction, clock(crossing))
			}
		}
	case inc >= polarMinInclination && inc <= 180-polarMinInclination:
		e.Patterns = append(e.Patterns, PatternPolar)
		add("polar", BasisDerived, "It passes close to both poles, so as Earth turns beneath it, it eventually flies over every part of the planet.")
	}

	hemisphere := "north"
	if math.Sin(inc*math.Pi/180)*math.Sin((argPerigeeDeg+180)*math.Pi/180) < 0 {
		hemisphere = "south"
	}
	switch {
	case molniya:
		e.Patterns = append(e.Patterns, PatternMolniya)
		add("molniya", BasisHeuristic, "This is a Molniya orbit: a 12-hour ellipse tilted near 63.4°, the angle at which its low point stops drifting. It spends about 8 hours of each orbit high over the far %s, which a satellite above the equator can't see well.", hemisphere)
	case tundra:
		e.Patterns = append(e.Patterns, PatternTundra)
		add("tundra", BasisHeuristic, "This is a Tundra orbit: a 24-hour ellipse tilted near 63.4°, the angle at which its low point stops drifting. Every day it hangs high over the same region in the far %s for hours.", hemisphere)
	}

	if o.OrbitClass != "GEO" {
		if repeat := repeatTrack(o, node, perigee); repeat != nil {
			e.RepeatGroundTrack = repeat
			if repeat.NodalDays == 1 {
				add("repeat", BasisHeuristic, "Its path over the ground repeats every %s, after %d orbits.", duration(repeat.Days*1440), repeat.Revolutions)
			} else {
				add("repeat", BasisHeuristic, "Its path over the ground nearly repeats every %s days, after %d orbits. Operators hold repeats like this with small engine burns, so this is a best guess from the current elements.", trimFloat(repeat.Days), repeat.Revolutions)
			}
		}
	}
	return e
}

// repeatTrack finds the smallest whole number of nodal days after which the
// ground track nearly repeats. A nodal day is one turn of Earth relative to
// the precessing orbital plane.
func repeatTrack(o OrbitInfo, node, perigee float64) *RepeatTrack {
	relative := earthRotationDegDay - node
	if relative <= 0 {
		return nil
	}
	nodalDay := 360 / relative // in mean solar days
	draconic := o.MeanMotion + perigee/360
	perNodalDay := draconic * nodalDay
	for days := 1; days <= repeatMaxDays; days++ {
		revs := math.Round(perNodalDay * float64(days))
		if revs < 1 {
			continue
		}
		if math.Abs(perNodalDay*float64(days)-revs) <= repeatToleranceRevDay*float64(days) {
			return &RepeatTrack{Days: round(float64(days)*nodalDay, 3), NodalDays: days, Revolutions: int(revs)}
		}
	}
	return nil
}

// localNodeHours returns the local mean solar time of the ascending node. Mean
// solar time follows the mean Sun, whose right ascension equals the Sun's mean
// longitude, so the equation of time does not shift the result.
func localNodeHours(raanDeg float64, t time.Time) float64 {
	days := t.UTC().Sub(j2000).Hours() / 24
	meanSunRA := math.Mod(280.460+0.9856474*days, 360)
	return math.Mod(12+(raanDeg-meanSunRA)/15+48, 24)
}

func ptr(v float64) *float64 { return &v }

func round(v float64, places int) float64 {
	scale := math.Pow(10, float64(places))
	return math.Round(v*scale) / scale
}

func trimFloat(v float64) string {
	if math.Abs(v-math.Round(v)) < 0.05 {
		return fmt.Sprintf("%.0f", v)
	}
	return fmt.Sprintf("%.1f", v)
}

func duration(minutes float64) string {
	switch {
	case minutes < 120:
		return fmt.Sprintf("%.0f minutes", minutes)
	case minutes < 48*60:
		total := int(math.Round(minutes))
		h, m := total/60, total%60
		if m == 0 {
			return fmt.Sprintf("%d hours", h)
		}
		return fmt.Sprintf("%d h %d min", h, m)
	default:
		return fmt.Sprintf("%s days", trimFloat(minutes/1440))
	}
}

func clock(hours float64) string {
	// Round to five minutes; the estimate is not finer than that.
	total := int(math.Round(hours*12)) * 5 % (24 * 60)
	return fmt.Sprintf("%02d:%02d", total/60, total%60)
}

func thousands(km float64) string {
	s := fmt.Sprintf("%.0f", km)
	neg := strings.HasPrefix(s, "-")
	s = strings.TrimPrefix(s, "-")
	var b strings.Builder
	for i, c := range s {
		if i > 0 && (len(s)-i)%3 == 0 {
			b.WriteByte(',')
		}
		b.WriteRune(c)
	}
	if neg {
		return "-" + b.String()
	}
	return b.String()
}
