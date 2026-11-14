package orbit

import (
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/Mohammed-Ashour/khonsu/internal/elements"
	"github.com/Mohammed-Ashour/khonsu/internal/sgp4"
)

// Statement bases. Derived statements follow directly from the mean elements
// by arithmetic. Heuristic statements match a named pattern within a project
// tolerance documented in docs/orbit-estimates.md.
const (
	BasisDerived   = "derived"
	BasisHeuristic = "heuristic"
)

// Named orbit patterns reported in Explanation.Patterns, most specific first.
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
	// Earth's rotation relative to the mean equinox, degrees per mean solar day.
	earthRotationDegDay = 360.98564736629
	// Rate at which the mean Sun moves along the equator: one tropical year.
	sunSynchronousDegDay = 360 / 365.2422
	// Revolutions per mean solar day of an orbit that keeps pace with Earth.
	siderealRevDay      = 1440 / siderealDayMinutes
	criticalInclination = 63.4349

	sunSyncToleranceDegDay   = 0.03
	sunSyncDriftMinutesYear  = 10.0
	molniyaPeriodTolerance   = 0.03
	criticalIncTolerance     = 3.0
	repeatMaxDays            = 30
	repeatToleranceRevDay    = 3e-5
	resonantRepeatMaxDays    = 2
	resonantRepeatTolerance  = 3e-4
	polarMinInclination      = 80.0
	nearEquatorialMaxInc     = 5.0
	noticeableEccentricity   = 0.1
	ellipticalEccentricity   = 0.25
	dawnDuskToleranceHours   = 1.0
	molniyaMinEccentricity   = 0.5
	tundraMinEccentricity    = 0.15
	tundraMaxEccentricity    = 0.5
	synchronousPeriodWindow  = 0.01
	stationDriftDegDay       = 0.1
	apogeeHemisphereMinSinAP = 0.7
)

// Source is a public reference that supports a statement.
type Source struct {
	Label string `json:"label"`
	Title string `json:"title"`
	URL   string `json:"url"`
}

var (
	srcESAOrbits  = Source{"ESA", "Types of orbits", "https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits"}
	srcNASAOrbits = Source{"NASA", "Catalog of Earth Satellite Orbits", "https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/"}
	srcGPS        = Source{"GPS.gov", "Space segment", "https://www.gps.gov/space-segment"}
	srcGEO        = Source{"CelesTrak", "Basics of the Geostationary Orbit", "https://celestrak.org/columns/v04n07/"}
	srcTLE        = Source{"CelesTrak", "FAQs: Two-Line Element Set Format", "https://celestrak.org/columns/v04n03/"}
	srcKepler     = Source{"NASA", "Orbits and Kepler's Laws", "https://science.nasa.gov/solar-system/orbits-and-keplers-laws/"}
	srcRetrograde = Source{"Wikipedia", "Retrograde and prograde motion", "https://en.wikipedia.org/wiki/Retrograde_and_prograde_motion"}
	srcMolniya    = Source{"Wikipedia", "Molniya orbit", "https://en.wikipedia.org/wiki/Molniya_orbit"}
	srcTundra     = Source{"Wikipedia", "Tundra orbit", "https://en.wikipedia.org/wiki/Tundra_orbit"}
	srcRepeat     = Source{"Wikipedia", "Satellite ground track: repeat orbits", "https://en.wikipedia.org/wiki/Ground_track#Repeat_orbits"}
	srcTerraDrift = Source{"NASA Earthdata", "Terra satellite drift affects MOPITT", "https://www.earthdata.nasa.gov/data/alerts-outages/terra-satellite-drift-affects-mopitt"}
	srcReentry    = Source{"ESA", "Reentry and collision avoidance", "https://www.esa.int/Space_Safety/Space_Debris/Reentry_and_collision_avoidance"}
)

// Statement is one plain-language sentence about an orbit, with the public
// references that support it.
type Statement struct {
	ID      string   `json:"id"`
	Text    string   `json:"text"`
	Basis   string   `json:"basis"`
	Sources []Source `json:"sources"`
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

// rates are the secular drifts SGP4 applies to an element set.
type rates struct {
	nodeDegDay     float64 // right ascension of the ascending node
	draconicRevDay float64 // node-to-node revolutions per mean solar day
	resonant       bool    // SGP4 integrates 12- or 24-hour resonance terms separately
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
	model, err := sgp4.New(r.CatalogID, r.Epoch, r.MeanMotionRevDay, r.Eccentricity, r.InclinationDeg, r.RAANDeg, r.ArgumentOfPerigeeDeg, r.MeanAnomalyDeg, r.BStar, r.MeanMotionDot, r.MeanMotionDDot, sgp4.GravityWGS84)
	if err != nil {
		return Explanation{}, err
	}
	mean, perigee, node, resonant := model.SecularRates()
	rt := rates{
		nodeDegDay:     node * 1440 * 180 / math.Pi,
		draconicRevDay: (mean + perigee) * 1440 / (2 * math.Pi),
		resonant:       resonant,
	}
	if !finite(rt.nodeDegDay) || !finite(rt.draconicRevDay) || rt.draconicRevDay <= 0 {
		return Explanation{}, fmt.Errorf("SGP4 secular rates are not finite")
	}
	return explain(info, rt, r.RAANDeg, r.ArgumentOfPerigeeDeg, r.Epoch), nil
}

func explain(o OrbitInfo, rt rates, raanDeg, argPerigeeDeg float64, epoch time.Time) Explanation {
	e := Explanation{Regime: o.OrbitClass, Patterns: []string{}, NodalPrecessionDegDay: round(rt.nodeDegDay, 4)}
	add := func(id, basis string, sources []Source, format string, args ...any) {
		e.Statements = append(e.Statements, Statement{id, fmt.Sprintf(format, args...), basis, sources})
	}
	synchronous := math.Abs(o.PeriodMinutes-siderealDayMinutes) <= synchronousPeriodWindow*siderealDayMinutes
	nearCritical := math.Abs(o.InclinationDeg-criticalInclination) <= criticalIncTolerance ||
		math.Abs(o.InclinationDeg-(180-criticalInclination)) <= criticalIncTolerance
	sunSync := o.Eccentricity < noticeableEccentricity && math.Abs(rt.nodeDegDay-sunSynchronousDegDay) <= sunSyncToleranceDegDay
	molniya := o.Eccentricity >= molniyaMinEccentricity && nearCritical &&
		math.Abs(o.PeriodMinutes-siderealDayMinutes/2) <= molniyaPeriodTolerance*siderealDayMinutes/2
	tundra := synchronous && nearCritical && o.Eccentricity >= tundraMinEccentricity && o.Eccentricity <= tundraMaxEccentricity
	// Longitude drift of a synchronous orbit, positive eastward.
	driftDegDay := 360 * (o.MeanMotion - siderealRevDay)

	switch {
	case o.OrbitClass == "LEO":
		e.RegimeName = "Low Earth orbit"
		add("regime", BasisDerived, []Source{srcESAOrbits}, "It flies in low Earth orbit, below 2,000 km. Being close to Earth suits sharp imaging, but each satellite sees only a small patch at a time, so services that need constant coverage use many satellites working together.")
	case o.OrbitClass == "MEO":
		e.RegimeName = "Medium Earth orbit"
		add("regime", BasisDerived, []Source{srcESAOrbits, srcGPS}, "It flies in medium Earth orbit, between 2,000 km and geostationary height. Navigation systems such as GPS and Galileo use this band, where a few dozen satellites can cover the whole planet.")
	case o.OrbitClass == "GEO":
		e.RegimeName = "Geostationary orbit"
		if math.Abs(driftDegDay) <= stationDriftDegDay {
			add("regime", BasisHeuristic, []Source{srcESAOrbits, srcGEO}, "It's geostationary: it circles once in the time Earth takes to turn, above the equator, so it hangs over one longitude. A fixed dish or a weather camera can watch the same side of Earth all the time.")
		} else {
			add("regime", BasisHeuristic, []Source{srcESAOrbits, srcGEO}, "It's at geostationary height above the equator, but it isn't held over one longitude: it drifts about %.1f° %s a day. Retired satellites, and ones moving to a new slot, drift like this.", math.Abs(driftDegDay), eastWest(driftDegDay))
		}
	case o.OrbitClass == "GSO":
		e.RegimeName = "Geosynchronous orbit"
		if tundra {
			add("regime", BasisHeuristic, []Source{srcNASAOrbits, srcGEO}, "It's geosynchronous: it circles once in the time Earth takes to turn, so its path over the ground comes back every day.")
		} else {
			add("regime", BasisHeuristic, []Source{srcNASAOrbits, srcGEO}, "It's geosynchronous: it circles once in the time Earth takes to turn, but its orbit is tilted or stretched, so instead of sitting still it traces a loop or figure eight around one longitude each day.")
		}
		if math.Abs(driftDegDay) > stationDriftDegDay {
			add("drift", BasisHeuristic, []Source{srcGEO}, "That daily path also drifts about %.1f° %s a day, so it isn't held over one longitude.", math.Abs(driftDegDay), eastWest(driftDegDay))
		}
	case o.OrbitClass == "HEO":
		e.RegimeName = "High Earth orbit"
		add("regime", BasisDerived, []Source{srcNASAOrbits, srcGEO}, "It flies above geostationary height, where one orbit takes more than a day. Geostationary satellites are often boosted up here when they retire, to keep the busy geostationary belt clear.")
	case o.Eccentricity >= ellipticalEccentricity:
		e.Regime, e.RegimeName = "Elliptical", "Highly elliptical orbit"
		add("regime", BasisDerived, []Source{srcESAOrbits, srcKepler}, "Its orbit is a long ellipse: it swoops low and fast at the near end and climbs slowly to the far end, so it spends most of its time far from Earth.")
	default:
		e.RegimeName = "Crosses altitude bands"
		add("regime", BasisDerived, []Source{srcESAOrbits}, "Its orbit crosses more than one altitude band, which often means a transfer orbit or a spent rocket stage.")
	}

	if !synchronous {
		perDay := 1440 / o.PeriodMinutes
		switch {
		case math.Abs(perDay-2) < 0.05:
			add("pace", BasisDerived, []Source{srcTLE}, "It circles Earth twice a day, once every %s.", duration(o.PeriodMinutes))
		case perDay >= 1.5:
			add("pace", BasisDerived, []Source{srcTLE}, "It circles Earth about %s times a day, once every %s.", trimFloat(perDay), duration(o.PeriodMinutes))
		default:
			add("pace", BasisDerived, []Source{srcTLE}, "One trip around Earth takes %s.", duration(o.PeriodMinutes))
		}
	}

	inc := o.InclinationDeg
	retrograde := inc > 90
	reach := inc
	if retrograde {
		reach = 180 - inc
	}
	switch {
	case o.OrbitClass == "GEO":
	case reach <= nearEquatorialMaxInc:
		e.Patterns = append(e.Patterns, PatternNearEquatorial)
		if retrograde {
			add("reach", BasisDerived, []Source{srcNASAOrbits}, "Its orbit lies almost flat along the equator but runs backwards, tilted %.1f°, so it never strays more than %.0f° north or south of the equator.", inc, math.Max(reach, 1))
		} else {
			add("reach", BasisDerived, []Source{srcNASAOrbits}, "Its orbit is tilted only %.1f° to the equator, so it never strays more than %.0f° north or south of it.", inc, math.Max(reach, 1))
		}
	default:
		add("reach", BasisDerived, []Source{srcNASAOrbits}, "Its orbit is tilted %.1f° to the equator, so it flies over latitudes up to %.0f° north and south.", inc, reach)
	}
	if retrograde {
		add("retrograde", BasisDerived, []Source{srcRetrograde}, "Tilted past 90°, it travels against Earth's spin, which is called a retrograde orbit.")
	}

	switch {
	case o.PerigeeKm < 0:
		add("reentry", BasisDerived, []Source{srcReentry}, "These elements put its lowest point below Earth's surface, so it has most likely re-entered the atmosphere, or the elements are wrong.")
	case o.Eccentricity >= noticeableEccentricity:
		add("shape", BasisDerived, []Source{srcKepler}, "Its height swings from %s km to %s km each orbit, and it moves fastest at the low point.", thousands(o.PerigeeKm), thousands(o.ApogeeKm))
	}

	switch {
	case sunSync:
		e.Patterns = append(e.Patterns, PatternSunSynchronous)
		add("sun_synchronous", BasisHeuristic, []Source{srcNASAOrbits, srcESAOrbits}, "It's sun-synchronous: Earth's bulge turns its orbit about 1° a day, the same rate Earth moves around the Sun. So whenever it crosses the equator heading the same way, it's about the same local solar time below, which keeps the lighting steady from one picture to the next.")
		if !epoch.IsZero() {
			ascending := localNodeHours(raanDeg, epoch)
			descending := round(math.Mod(ascending+12, 24), 2)
			if descending >= 24 {
				descending = 0
			}
			e.EquatorCrossingHours = ptr(descending)
			crossing, direction := descending, "south"
			if crossing < 6 || crossing >= 18 {
				crossing, direction = math.Mod(crossing+12, 24), "north"
			}
			if math.Abs(crossing-6) <= dawnDuskToleranceHours || math.Abs(crossing-18) <= dawnDuskToleranceHours {
				e.Patterns = append(e.Patterns, PatternDawnDusk)
				add("equator_time", BasisDerived, []Source{srcESAOrbits, srcNASAOrbits}, "It crosses the equator around %s and %s mean local solar time, riding the line between day and night. That keeps its solar panels in sunlight almost all the time.", clock(crossing), clock(math.Mod(crossing+12, 24)))
			} else {
				add("equator_time", BasisDerived, []Source{srcNASAOrbits}, "In daylight it crosses the equator heading %s at about %s mean local solar time.", direction, clock(crossing))
			}
		}
		minutesYear := (rt.nodeDegDay - sunSynchronousDegDay) * 365.2422 * 4
		if math.Abs(minutesYear) >= sunSyncDriftMinutesYear {
			later := "later"
			if minutesYear < 0 {
				later = "earlier"
			}
			add("sun_sync_drift", BasisDerived, []Source{srcTerraDrift}, "Its orbit doesn't quite keep pace with the Sun, so that crossing time is drifting about %.0f minutes %s each year. Satellites drift like this once they stop correcting their orbits.", math.Abs(minutesYear), later)
		}
	case reach >= polarMinInclination:
		e.Patterns = append(e.Patterns, PatternPolar)
		add("polar", BasisDerived, []Source{srcESAOrbits}, "It's in a polar orbit, passing within %.0f° of both poles, so as Earth turns beneath it, it eventually flies over nearly all of the planet.", 90-reach)
	}

	// The apogee lies at argument of latitude ω+180°, so its latitude has the
	// sign of sin(i)·sin(ω+180°). Name a hemisphere only when it is well away
	// from the equator.
	hemisphere := ""
	if s := math.Sin((argPerigeeDeg + 180) * math.Pi / 180); math.Abs(s) >= apogeeHemisphereMinSinAP {
		hemisphere = "north"
		if s*math.Sin(inc*math.Pi/180) < 0 {
			hemisphere = "south"
		}
	}
	switch {
	case molniya:
		e.Patterns = append(e.Patterns, PatternMolniya)
		where := "high above its far point"
		if hemisphere != "" {
			where = "high over the far " + hemisphere
		}
		add("molniya", BasisHeuristic, []Source{srcNASAOrbits, srcMolniya}, "This is a Molniya orbit: a 12-hour ellipse tilted near 63.4°, the angle at which its low point stops drifting. It spends about 8 hours of each orbit %s, a region a satellite above the equator can't see well.", where)
	case tundra:
		e.Patterns = append(e.Patterns, PatternTundra)
		where := "over the same region"
		if hemisphere != "" {
			where = "over the same region in the far " + hemisphere
		}
		add("tundra", BasisHeuristic, []Source{srcTundra}, "This is a Tundra orbit: a 24-hour ellipse tilted near 63.4°, the angle at which its low point stops drifting. Every day it hangs high %s for hours.", where)
	}
	if retrograde {
		e.Patterns = append(e.Patterns, PatternRetrograde)
	}

	if o.OrbitClass != "GEO" {
		if repeat := repeatTrack(rt); repeat != nil {
			e.RepeatGroundTrack = repeat
			if repeat.NodalDays == 1 {
				add("repeat", BasisHeuristic, []Source{srcRepeat, srcNASAOrbits}, "Its path over the ground repeats every %s, after %s.", duration(repeat.Days*1440), orbits(repeat.Revolutions))
			} else {
				add("repeat", BasisHeuristic, []Source{srcRepeat}, "Its path over the ground nearly repeats every %s days, after %s. A working satellite's operators hold a repeat like this with small engine burns; without them it slowly drifts off it.", trimFloat(repeat.Days), orbits(repeat.Revolutions))
			}
		}
	}
	return e
}

// repeatTrack finds the smallest whole number of nodal days after which the
// ground track nearly repeats. A nodal day is one turn of Earth relative to
// the precessing orbital plane. Resonant orbits get a looser tolerance,
// because SGP4's resonance terms are not part of the secular rates.
func repeatTrack(rt rates) *RepeatTrack {
	relative := earthRotationDegDay - rt.nodeDegDay
	if relative <= 0 {
		return nil
	}
	nodalDay := 360 / relative // in mean solar days
	perNodalDay := rt.draconicRevDay * nodalDay
	maxDays, tolerance := repeatMaxDays, repeatToleranceRevDay
	if rt.resonant {
		maxDays, tolerance = resonantRepeatMaxDays, resonantRepeatTolerance
	}
	for days := 1; days <= maxDays; days++ {
		revs := math.Round(perNodalDay * float64(days))
		if revs < 1 {
			continue
		}
		if math.Abs(perNodalDay*float64(days)-revs) <= tolerance*float64(days) {
			return &RepeatTrack{Days: round(float64(days)*nodalDay, 3), NodalDays: days, Revolutions: int(revs)}
		}
	}
	return nil
}

// localNodeHours returns the local mean solar time of the ascending node. Mean
// solar time follows the mean Sun, whose right ascension equals the Sun's mean
// longitude, so the equation of time does not shift the result. The mean
// longitude is the Astronomical Almanac low-precision formula, also published
// by the US Naval Observatory: https://aa.usno.navy.mil/faq/sun_approx
func localNodeHours(raanDeg float64, t time.Time) float64 {
	days := t.UTC().Sub(j2000).Hours() / 24
	meanSunRA := math.Mod(280.460+0.9856474*days, 360)
	return math.Mod(12+(raanDeg-meanSunRA)/15+48, 24)
}

func eastWest(driftDegDay float64) string {
	if driftDegDay < 0 {
		return "west"
	}
	return "east"
}

func orbits(n int) string {
	if n == 1 {
		return "one orbit"
	}
	return fmt.Sprintf("%d orbits", n)
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
