package visual

import "time"

// Point is a TEME position in kilometres and derived orbital metadata at a UTC
// sample time. Propagation is performed at whole-second resolution.
type Point struct {
	X            float64   `json:"x"`
	Y            float64   `json:"y"`
	Z            float64   `json:"z"`
	Time         time.Time `json:"time"`
	LatitudeDeg  float64   `json:"latitude_deg"`
	LongitudeDeg float64   `json:"longitude_deg"`
	AltitudeKm   float64   `json:"altitude_km"`
	SpeedKmS     float64   `json:"speed_km_s"`
	GMSTRad      float64   `json:"gmst_rad"`
}
