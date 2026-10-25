# Internal SGP4 engine

This package carries a narrow local copy of the SGP4 implementation from
`github.com/Mohammed-Ashour/go-satellite-v2`, pinned at
`5e798e1d6f5b` (module version `v0.0.0-20250421083854-5e798e1d6f5b`). The
upstream BSD 2-Clause license is included in `LICENSE`.

The numerical bodies of `sgp4.go` and `dspace.go` are unchanged from that
revision. The only source edit to those files is the package declaration, from
`satellite` to `sgp4`. `satellite.go` is the upstream `Satellite` state struct.
`constants.go` carries the required vector and gravity-model definitions;
`engine.go` adds direct mean-element initialization and full-fractional-epoch
Julian date conversion. The local constructor accepts mean motion in
revolutions/day, its first and second derivatives in revolutions/day² and
revolutions/day³, angular fields in degrees, and initializes with WGS-84 by
default at the caller. Derivatives use Vallado/TLE conversion scales: radians/min²
and radians/min³ are computed by multiplying by 2π/1440² and 2π/1440³
respectively.
