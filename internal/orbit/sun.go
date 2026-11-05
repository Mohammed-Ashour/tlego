package orbit

import (
	"math"
	"time"

	"github.com/Mohammed-Ashour/go-satellite-v2/pkg/satellite"
)

const astronomicalUnitKm = 149597870.7

var j2000 = time.Date(2000, 1, 1, 12, 0, 0, 0, time.UTC)

// SunPositionKm returns the geocentric Sun vector in km using the Astronomical
// Almanac low-precision formula, referred to the equator and equinox of date.
// TEME differs from that frame by far less than this use needs.
func SunPositionKm(t time.Time) satellite.Vector3 {
	days := t.UTC().Sub(j2000).Hours() / 24
	meanLongitude := (280.460 + 0.9856474*days) * math.Pi / 180
	anomaly := (357.528 + 0.9856003*days) * math.Pi / 180
	longitude := meanLongitude + (1.915*math.Sin(anomaly)+0.020*math.Sin(2*anomaly))*math.Pi/180
	obliquity := (23.439 - 0.0000004*days) * math.Pi / 180
	distance := (1.00014 - 0.01671*math.Cos(anomaly) - 0.00014*math.Cos(2*anomaly)) * astronomicalUnitKm
	return satellite.Vector3{
		X: distance * math.Cos(longitude),
		Y: distance * math.Cos(obliquity) * math.Sin(longitude),
		Z: distance * math.Sin(obliquity) * math.Sin(longitude),
	}
}

// SubsolarPoint returns the latitude and longitude, in degrees, where the Sun is overhead.
func SubsolarPoint(t time.Time) (latDeg, lonDeg float64) {
	t = t.UTC()
	sun := SunPositionKm(t)
	gmst := satellite.GSTimeFromDate(t.Year(), int(t.Month()), t.Day(), t.Hour(), t.Minute(), t.Second())
	latDeg = math.Atan2(sun.Z, math.Hypot(sun.X, sun.Y)) * 180 / math.Pi
	lonDeg = normalizeLongitude((math.Atan2(sun.Y, sun.X) - gmst) * 180 / math.Pi)
	return latDeg, lonDeg
}

// SunElevationDeg returns the geometric elevation of the Sun's centre at a
// point on the ground. Refraction is not modelled.
func SunElevationDeg(latDeg, lonDeg float64, t time.Time) float64 {
	subLat, subLon := SubsolarPoint(t)
	return sunElevationFrom(latDeg, lonDeg, subLat, subLon)
}

func sunElevationFrom(latDeg, lonDeg, subLatDeg, subLonDeg float64) float64 {
	lat, subLat := latDeg*math.Pi/180, subLatDeg*math.Pi/180
	sine := math.Sin(lat)*math.Sin(subLat) + math.Cos(lat)*math.Cos(subLat)*math.Cos((lonDeg-subLonDeg)*math.Pi/180)
	return math.Asin(math.Max(-1, math.Min(1, sine))) * 180 / math.Pi
}

// NightMask returns a function reporting whether the Sun is below the horizon
// at a location, for rendering many points at one instant.
func NightMask(t time.Time) func(latDeg, lonDeg float64) bool {
	subLat, subLon := SubsolarPoint(t)
	return func(latDeg, lonDeg float64) bool {
		return sunElevationFrom(latDeg, lonDeg, subLat, subLon) < 0
	}
}

// InEarthShadow uses a cylindrical shadow model, which treats the Sun as a point
// at infinite distance and has no penumbra.
func InEarthShadow(position, sun satellite.Vector3) bool {
	norm := math.Sqrt(sun.X*sun.X + sun.Y*sun.Y + sun.Z*sun.Z)
	if norm == 0 {
		return false
	}
	along := (position.X*sun.X + position.Y*sun.Y + position.Z*sun.Z) / norm
	if along >= 0 {
		return false
	}
	square := position.X*position.X + position.Y*position.Y + position.Z*position.Z - along*along
	return square < earthRadiusKm*earthRadiusKm
}

// CompassPoint names a true-north azimuth on a 16-point compass.
func CompassPoint(azimuthDeg float64) string {
	points := [...]string{"N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"}
	index := int(math.Floor(math.Mod(math.Mod(azimuthDeg, 360)+360, 360)/22.5 + 0.5))
	return points[index%len(points)]
}
