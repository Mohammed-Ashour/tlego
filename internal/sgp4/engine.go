package sgp4

import (
	"fmt"
	"math"
	"strconv"
	"time"
)

// New initializes SGP4 directly from mean elements. Epoch is passed to Vallado's
// initialization as a full Julian date, retaining sub-second epoch precision.
func New(catalogID string, epoch time.Time, meanMotionRevDay, eccentricity, inclinationDeg, raanDeg, argPerigeeDeg, meanAnomalyDeg, bstar, meanMotionDot, meanMotionDDot float64, gravity Gravity) (Satellite, error) {
	var s Satellite
	if epoch.IsZero() {
		return s, fmt.Errorf("epoch is required")
	}
	vals := []float64{meanMotionRevDay, eccentricity, inclinationDeg, raanDeg, argPerigeeDeg, meanAnomalyDeg, bstar, meanMotionDot, meanMotionDDot}
	for _, v := range vals {
		if math.IsNaN(v) || math.IsInf(v, 0) {
			return s, fmt.Errorf("mean elements must be finite")
		}
	}
	if meanMotionRevDay <= 0 || eccentricity < 0 || eccentricity >= 1 || inclinationDeg < 0 || inclinationDeg > 180 {
		return s, fmt.Errorf("mean elements are outside valid ranges")
	}
	id, err := strconv.ParseInt(catalogID, 10, 64)
	if err != nil || id <= 0 {
		return s, fmt.Errorf("invalid catalog ID %q", catalogID)
	}
	s.satnum = id
	s.whichconst = getGravConst(gravity)
	s.no = meanMotionRevDay * TWOPI / 1440
	s.ecco = eccentricity
	s.inclo = inclinationDeg * DEG2RAD
	s.nodeo = raanDeg * DEG2RAD
	s.argpo = argPerigeeDeg * DEG2RAD
	s.mo = meanAnomalyDeg * DEG2RAD
	s.bstar = bstar
	s.ndot = meanMotionDot * TWOPI / (1440 * 1440)
	s.nddot = meanMotionDDot * TWOPI / (1440 * 1440 * 1440)
	jd := julianDate(epoch.UTC())
	s.Jdsatepoch = jd
	mode := "i"
	sgp4init(&mode, jd-2433281.5, &s)
	if s.Error != 0 {
		return Satellite{}, fmt.Errorf("SGP4 initialization error %d", s.Error)
	}
	return s, nil
}

// At propagates the initialized record by minutes from epoch.
func At(s Satellite, t time.Time) (Vector3, Vector3, error) {
	tsince := (julianDate(t.UTC()) - s.Jdsatepoch) * 1440
	p, v := sgp4(&s, tsince)
	if s.Error != 0 {
		return p, v, fmt.Errorf("SGP4 propagation error %d", s.Error)
	}
	for _, x := range []float64{p.X, p.Y, p.Z, v.X, v.Y, v.Z} {
		if math.IsNaN(x) || math.IsInf(x, 0) {
			return p, v, fmt.Errorf("SGP4 produced a non-finite state")
		}
	}
	return p, v, nil
}

func julianDate(t time.Time) float64 {
	y, m, d := t.Date()
	if m <= time.February {
		y--
		m += 12
	}
	a := int(math.Floor(float64(y) / 100))
	b := 2 - a + int(math.Floor(float64(a)/4))
	day := float64(d) + (float64(t.Hour())+(float64(t.Minute())+(float64(t.Second())+float64(t.Nanosecond())/1e9)/60)/60)/24
	return math.Floor(365.25*float64(y+4716)) + math.Floor(30.6001*float64(m+1)) + day + float64(b) - 1524.5
}

func JDay(year, mon, day, hr, min, sec int) float64 {
	return 367*float64(year) - math.Floor(7*(float64(year)+math.Floor((float64(mon)+9)/12))*0.25) + math.Floor(275*float64(mon)/9) + float64(day) + 1721013.5 + ((float64(sec)/60+float64(min))/60+float64(hr))/24
}
func gstime(jd float64) float64 {
	t := (jd - 2451545) / 36525
	v := -6.2e-6*t*t*t + 0.093104*t*t + (876600*3600+8640184.812866)*t + 67310.54841
	v = math.Mod(v*DEG2RAD/240, TWOPI)
	if v < 0 {
		v += TWOPI
	}
	return v
}
