# Orbit estimates

Reports and the TUI derive the same orbit estimates from TLE or GP mean elements. These describe an approximate two-body ellipse, not the minimum and maximum geodetic altitude of a propagated SGP4 trajectory.

## Metrics and units

For mean motion `m` in revolutions per day and eccentricity `e`:

```text
period_minutes = 1440 / m
n = m * 2*pi / 86400                  # radians/second
a = (mu / n^2)^(1/3)                  # semi-major axis, km
perigee_km = a * (1-e) - R
apogee_km  = a * (1+e) - R
```

The estimates use `mu = 398600.4418 km^3/s^2` and equatorial radius `R = 6378.137 km`, the WGS-84 values documented by [ESA GODOT](https://godot.io.esa.int/docs/api_reference/generated/generated/godot.core.constants.html). The period relation follows [Kepler's third law](https://www.nasa.gov/wp-content/uploads/2023/09/navigation-space-scan-workbook-answer-sheet.pdf). SGP4 mean elements include perturbation conventions, so these two-body values do not establish osculating extrema or physical orbit viability. Numerically unrepresentable estimates return an error.

Position output remains TEME-based, with geographic angles in degrees, altitude in km, and actual propagated velocity magnitude in km/s. Evaluation is at whole-second UTC instants; the full element epoch is retained. Element epoch and retrieval time are separate provenance fields. An old element set may produce inaccurate predictions even when it was fetched recently.

## Classification criteria

`orbit_class_estimate` in schema 1.0 and the legacy `OrbitClass` string use these rules in order. These are Khonsu browsing heuristics, with explicit tolerances, rather than an operational classification standard.

| Label | Criterion |
|---|---|
| GEO | Period within 1% of a sidereal day, inclination at most 1 degree, eccentricity at most 0.01 |
| GSO | Period within 1% of a sidereal day, without meeting both GEO shape/plane criteria |
| LEO | Estimated apogee below 2,000 km |
| MEO | Estimated perigee at least 2,000 km and apogee below 35,786 km |
| HEO | Estimated perigee at least 35,786 km |
| Other | Remaining orbits, including ellipses crossing the altitude bands |

A sidereal day is taken as 1,436.068 minutes. [ESA's orbit guide](https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits) describes the geostationary period and equatorial geometry; [CelesTrak](https://www.celestrak.org/columns/v04n07/) explains why eccentricity and inclination distinguish geosynchronous and geostationary orbits. Khonsu's tolerances are project choices, not thresholds specified by those sources. GEO denotes a candidate near that geometry; it does not prove station keeping or a fixed ground longitude. HEO here means high Earth orbit, not highly elliptical orbit.

Earlier versions classified by average altitude alone. A circular orbit at 38,621.863 km, for example, was labeled GEO despite having a period of about 1,583.36 minutes. It is now HEO. Inclined synchronous orbits now receive GSO; cross-band transfer and Molniya-like ellipses receive Other. Output field names and types are unchanged. Consumers should accept class strings beyond the original four values.

## Why it's up there

Reports, the v1 `report` output and the web app's Orbit tab add an `explanation` object under `orbit`. It's additive in schema 1.0: `orbit_class_estimate` keeps the rules above. Each sentence in `statements` has a `basis`. `derived` sentences are arithmetic on the mean elements. `heuristic` sentences match a named pattern within the tolerances below, and the web app marks them as estimates.

`regime` repeats the class above, except that an `Other` orbit with eccentricity of at least 0.25 is reported as `Elliptical`. Its sentence is `heuristic` for GEO and GSO, which depend on tolerances, and `derived` for the altitude bands.

Two-body motion doesn't explain sun-synchronous, Molniya or repeat-track orbits, because they depend on Earth's equatorial bulge. Khonsu estimates the secular drift of the orbital plane and of perigee from the J2 term, with `J2 = 1.08262998905e-3`, the WGS-84 value SGP4 uses:

```text
p = a * (1 - e^2)
k = 1.5 * J2 * (R / p)^2 * n                # n in degrees per day
node_rate    = -k * cos(i)                   # nodal_precession_deg_day
perigee_rate =  k * (2 - 2.5 * sin(i)^2)
```

| Pattern | Rule |
|---|---|
| `sun_synchronous` | Eccentricity below 0.1 and a nodal rate within 0.03°/day of the mean Sun's 360/365.2422°/day. Local time then drifts by less than about 45 minutes a year. |
| `dawn_dusk` | Sun-synchronous, with an equator crossing within one hour of 06:00 or 18:00 local mean solar time |
| `molniya` | Eccentricity at least 0.5, period within 3% of half a sidereal day, inclination within 3° of 63.43° or 116.57° |
| `tundra` | Period within 1% of a sidereal day, eccentricity from 0.15 to 0.5, inclination within 3° of 63.43° or 116.57° |
| `polar` | Inclination from 80° to 100°, when not sun-synchronous |
| `near_equatorial` | Within 5° of the equator, when not GEO |
| `retrograde` | Inclination above 90° |

For a sun-synchronous orbit, `descending_node_local_time_hours` is the local mean solar time of the descending node, `(RAAN - α_mean_sun) / 15` hours modulo 24, using the mean Sun's right ascension at the element epoch. The web app and text report round it to five minutes. With the elements in `internal/orbit/testdata`, Sentinel-2A gives 10:30 and Sentinel-1C gives 06:00, matching the published values.

`repeat_ground_track` looks for the smallest whole number of nodal days, from 1 to 30, after which the ground track nearly repeats. A nodal day is one turn of Earth relative to the drifting orbital plane, `360 / (360.98564736629 - node_rate)` solar days. Orbits are counted node to node, using `n + perigee_rate`. A match needs the leftover to be under 0.0001 orbits per day of the cycle. Against CelesTrak's active catalog on 2026-11-13, this finds the published repeats of Sentinel-1 (12 days, 175 orbits), Sentinel-2 (10, 143), Sentinel-3 (27, 385), Sentinel-6 (about 10, 127), Landsat 8 and 9 (16, 233) and SWOT (about 21, 292), and none for the ISS. About 8% of other low orbits also match by coincidence, and real repeats are kept by station-keeping burns. That's why the statement is a `heuristic` and says it's a best guess. GEO orbits never report one.

`internal/orbit/explain_test.go` checks these rules at their boundaries with synthetic elements, and checks real CelesTrak elements for the ISS, a GPS satellite, GOES-18, Sentinel-1C, Sentinel-2A, Sentinel-6A, Landsat 9, SWOT, Jason-3 and two Molniya objects.

## Checks and limits

`internal/orbit/derive_test.go` checks both input paths against synthetic ellipses chosen by semi-major axis and eccentricity. The expected mean motions and periods were calculated independently using Python's standard-library `decimal` module at 50-digit precision, using `T = 2*pi*sqrt(a^3/mu)` and `m = 86400/T`. Expected apsides come directly from the chosen ellipse geometry. These check the two-body estimates, not SGP4 trajectory extrema. Tolerances are `1e-6 km` for apsides and `1e-6 minutes` for period.

| Semi-major axis, km | Eccentricity | Period, minutes | Perigee, km | Apogee, km |
|---|---|---|---|---|
| 7,000 | 0.01 | 97.141943961434 | 551.863 | 691.863 |
| 26,560 | 0.74 | 717.962624014399 | 527.463 | 39,836.263 |
| 42,164 | 0 | 1436.059509176305 | 35,785.863 | 35,785.863 |
| 50,000 | 0.1 | 1854.448327494277 | 38,621.863 | 48,621.863 |
| 45,000 | 0 | 1583.355739852377 | 38,621.863 | 38,621.863 |

Boundary tests protect the declared classification rules. Existing independent python-sgp4 reference vectors cover near-Earth, deep-space and 2057 epochs. The eccentric deep-space speed check is 2.884150184753 km/s at its epoch, compared with a circular approximation of about 3.0812 km/s, with a `1e-6 km/s` tolerance. CLI tests check the corrected class in exported report JSON. These fixtures do not validate every orbit or coordinate transformation. Pass-event refinement remains separate work under issue #23.
