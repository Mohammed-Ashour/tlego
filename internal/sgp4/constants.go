package sgp4

import "math"

const (
	TWOPI   = 2 * math.Pi
	DEG2RAD = math.Pi / 180
	RAD2DEG = 180 / math.Pi
	XPDOTP  = 1440 / (2 * math.Pi)
)

type Vector3 struct{ X, Y, Z float64 }
type GravConst struct{ mu, radiusearthkm, xke, tumin, j2, j3, j4, j3oj2 float64 }
type Gravity string

const (
	GravityWGS72Old Gravity = "wgs72old"
	GravityWGS72    Gravity = "wgs72"
	GravityWGS84    Gravity = "wgs84"
)

func getGravConst(name Gravity) GravConst {
	var g GravConst
	switch name {
	case GravityWGS72Old:
		g.mu = 398600.79964
		g.radiusearthkm = 6378.135
		g.xke = 0.0743669161
		g.j2 = 0.001082616
		g.j3 = -0.00000253881
		g.j4 = -0.00000165597
	case GravityWGS72:
		g.mu = 398600.8
		g.radiusearthkm = 6378.135
		g.j2 = 0.001082616
		g.j3 = -0.00000253881
		g.j4 = -0.00000165597
		g.xke = 60 / math.Sqrt(g.radiusearthkm*g.radiusearthkm*g.radiusearthkm/g.mu)
	default:
		g.mu = 398600.5
		g.radiusearthkm = 6378.137
		g.j2 = 0.00108262998905
		g.j3 = -0.00000253215306
		g.j4 = -0.00000161098761
		g.xke = 60 / math.Sqrt(g.radiusearthkm*g.radiusearthkm*g.radiusearthkm/g.mu)
	}
	g.tumin = 1 / g.xke
	g.j3oj2 = g.j3 / g.j2
	return g
}
