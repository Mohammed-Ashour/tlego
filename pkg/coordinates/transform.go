package coordinates

import "math"

const (
	earthRadius   = 6378.137      // kilometer
	f             = 1.0 / 298.257 // earth flattening
	e2            = f * (2 - f)   // square of eccentricity
	eps           = 1e-12         // convergence criteria for iteration
	maxIterations = 10
	omega_E       = 7.2921151467e-5 // Earth rotation rate in rad/sec
)

// TEMEToECEF converts from TEME frame to ECEF frame
func TEMEToECEF(pos [3]float64, jd float64) [3]float64 {
	theta := omega_E * ((jd - 2451545.0) * 86400.0)
	cosTheta := math.Cos(theta)
	sinTheta := math.Sin(theta)

	return [3]float64{
		pos[0]*cosTheta + pos[1]*sinTheta,
		-pos[0]*sinTheta + pos[1]*cosTheta,
		pos[2],
	}
}

// ECIToLLA converts Earth Centered Inertial coordinates to Latitude, Longitude, Altitude
func ECIToLLA(pos [3]float64, jd float64) (alt, lat, lon float64) {
	// First convert from TEME to ECEF
	ecef := TEMEToECEF(pos, jd)

	// Then calculate LLA from ECEF
	r := math.Sqrt(ecef[0]*ecef[0] + ecef[1]*ecef[1])
	f := 1.0 / 298.26
	e2 := f * (2 - f)

	lon = math.Atan2(ecef[1], ecef[0])
	lat = math.Atan2(ecef[2], r)

	delta := 1.0
	phi := lat
	c := 0

	// Iterate to find latitude and altitude
	for (math.Abs(delta) > eps) && (c < maxIterations) {
		c++
		sinPhi := math.Sin(phi)
		N := earthRadius / math.Sqrt(1-e2*sinPhi*sinPhi)
		alt = r/math.Cos(phi) - N
		delta = lat - phi
		phi = math.Atan2(ecef[2]+N*e2*math.Sin(phi), r)
	}

	// Convert to degrees
	lat = phi * 180.0 / math.Pi
	lon = lon * 180.0 / math.Pi

	// Normalize longitude to [-180,180]
	if lon > 180.0 {
		lon = lon - 360.0
	}

	return alt, lat, lon
}
