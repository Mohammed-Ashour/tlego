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

Reports, the v1 `report` output and the web app's Orbit tab add an `explanation` object under `orbit`. It's additive in schema 1.0: `orbit_class_estimate` keeps the rules above, and the legacy report JSON doesn't change. Each sentence in `statements` has:

- a `basis`. `derived` sentences are arithmetic on the mean elements. `heuristic` sentences match a named pattern within the tolerances below, and the web app tags them *estimate*.
- `sources`: at least one public reference that supports it. The web app links each one, and the text report lists them under each sentence.

`regime` repeats the class above, except that an `Other` orbit with eccentricity of at least 0.25 is reported as `Elliptical`. Its sentence is `heuristic` for GEO and GSO, which depend on tolerances, and `derived` for the altitude bands. The bands follow [ESA's orbit guide](https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits), which puts low Earth orbit below 2,000 km and medium Earth orbit between it and geostationary height.

### Drift from Earth's bulge

Two-body motion doesn't explain sun-synchronous, Molniya or repeat-track orbits, because they depend on Earth's equatorial bulge, the J2 term. Khonsu reads the secular drift rates SGP4 itself applies when it is set up from the elements: `mdot` for the mean anomaly, `argpdot` for perigee and `nodedot` for the ascending node. For deep-space orbits, it adds SGP4's lunisolar terms (`dmdt`, `domdt`, `dnodt`). [Vallado and others (2006)](https://celestrak.org/publications/AIAA/2006-6753/) document these rates.

- `nodal_precession_deg_day` is `nodedot`, in degrees per day.
- Orbits are counted node to node, at `(mdot + argpdot)` revolutions.

To first order they match the textbook J2 formulas for [nodal precession](https://en.wikipedia.org/wiki/Nodal_precession) and [apsidal precession](https://en.wikipedia.org/wiki/Apsidal_precession). SGP4 adds higher-order terms that matter for repeat tracks. Using only the first-order formulas puts the leftover for Landsat 9 or SWOT close to the tolerance below. SGP4's rates bring both well inside it.

### Patterns

| Pattern | Rule | Source |
|---|---|---|
| `sun_synchronous` | Eccentricity below 0.1 and a nodal rate within 0.03°/day of the mean Sun's 360/365.2422°/day. That allows up to about 45 minutes a year of drift in crossing time. | [NASA](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/), [ESA](https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits) |
| `dawn_dusk` | Sun-synchronous, with an equator crossing within one hour of 06:00 or 18:00 mean local solar time | [ESA](https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits) |
| `molniya` | Eccentricity at least 0.5, period within 3% of half a sidereal day, inclination within 3° of 63.43° or 116.57° | [NASA](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/), [Molniya orbit](https://en.wikipedia.org/wiki/Molniya_orbit) |
| `tundra` | Period within 1% of a sidereal day, eccentricity from 0.15 to 0.5, inclination within 3° of 63.43° or 116.57° | [Tundra orbit](https://en.wikipedia.org/wiki/Tundra_orbit) |
| `polar` | Within 10° of a pole-to-pole orbit, an inclination from 80° to 100°, when not sun-synchronous | [ESA](https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits) counts "a deviation of 10 degrees" as polar |
| `near_equatorial` | Within 5° of the equator, when not GEO | [NASA](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/) on inclination |
| `retrograde` | Inclination above 90°, listed after the other patterns | [Retrograde motion](https://en.wikipedia.org/wiki/Retrograde_and_prograde_motion) |

- **Critical inclination.** 63.43° is where J2 stops turning the perigee, because `4 - 5 sin²i = 0`.
- **Molniya and Tundra hemisphere.** A Molniya or Tundra sentence names the hemisphere of the apogee only when `|sin(ω + 180°)|` is at least 0.7, so the far point is well away from the equator.
- **"About 8 hours".** The Molniya sentence's "about 8 hours" is the working window around apogee that the [Molniya orbit article](https://en.wikipedia.org/wiki/Molniya_orbit) describes for a three-satellite constellation.

### Drift of synchronous orbits

A GEO or GSO orbit whose mean motion differs from one turn per sidereal day drifts in longitude by about `360 * (n - 1440/1436.068)` degrees a day, eastward when positive. Above 0.1°/day, Khonsu says the satellite drifts instead of saying it "hangs over one longitude". [CelesTrak's geostationary primer](https://celestrak.org/columns/v04n07/) explains why uncorrected satellites drift and why retired ones are boosted above the belt.

### Equator crossing times

For a sun-synchronous orbit, `descending_node_local_time_hours` is the mean local solar time of the descending node, `(RAAN - α_mean_sun) / 15` hours modulo 24, at the element epoch.

- The mean Sun's right ascension is its mean longitude, `280.460 + 0.9856474 d` degrees, d days from J2000. The [US Naval Observatory](https://aa.usno.navy.mil/faq/sun_approx) publishes this formula.
- The web app and text report round the time to five minutes.

When the nodal rate differs from the Sun's by enough to move the crossing time 10 minutes or more a year, Khonsu says so. [NASA](https://www.earthdata.nasa.gov/data/alerts-outages/terra-satellite-drift-affects-mopitt) describes Terra drifting this way since it stopped correcting its orbit. With the elements in `internal/orbit/testdata`, Khonsu matches the published values:

| Satellite | Khonsu | Published |
|---|---|---|
| Sentinel-2A | 10:30 descending | [10:30](https://sentiwiki.copernicus.eu/web/s2-mission) |
| Sentinel-3A | 10:00 descending | [10:00](https://sentiwiki.copernicus.eu/web/s3-mission) |
| Landsat 8 and 9 | 10:12, shown as 10:15 | [10:12 ±5 min](https://www.usgs.gov/landsat-missions/landsat-9) |
| Sentinel-1C | 06:00 and 18:00 | [18:00 ascending](https://sentiwiki.copernicus.eu/web/s1-mission) |
| TerraSAR-X | 06:00 and 18:00 | [18:00 ±0.25 h ascending](https://www.eoportal.org/satellite-missions/terrasar-x) |
| Terra | 08:35, drifting about 40 minutes earlier a year | [Drifting earlier, past 09:00 by late 2025](https://www.earthdata.nasa.gov/data/alerts-outages/terra-satellite-drift-affects-mopitt) |

### Repeat ground tracks

`repeat_ground_track` looks for the smallest whole number of nodal days, from 1 to 30, after which the ground track nearly repeats. A nodal day is one turn of Earth relative to the drifting orbital plane, `360 / (360.98564736629 - node_rate)` solar days. A match needs the leftover to be under 0.00003 orbits per day of the cycle.

Resonant orbits get a looser test. These are 12-hour orbits with eccentricity of at least 0.5, and 24-hour orbits, whose resonance terms SGP4 integrates separately. They are checked over one or two days only, with a tolerance of 0.0003. GEO never reports a repeat.

The ISS gets no repeat. Against CelesTrak's active catalog on 2026-11-13, the rule finds these published repeats:

| Satellite | Khonsu | Published |
|---|---|---|
| Sentinel-1 | 12 days, 175 orbits | [12 days, 175 orbits](https://sentiwiki.copernicus.eu/web/s1-mission) |
| Sentinel-2 | 10 days, 143 orbits | [10 days, 143 orbits](https://sentiwiki.copernicus.eu/web/s2-mission) |
| Sentinel-3 | 27 days, 385 orbits | [27 days, 385 orbits](https://sentiwiki.copernicus.eu/web/s3-mission) |
| Sentinel-6 | 9.916 days, 127 orbits | [9.9156 days, 127 orbits](https://www.earthdata.nasa.gov/data/platforms/space-based-platforms/sentinel-6-jason-cs) |
| Landsat 8 and 9 | 16 days, 233 orbits | [16 days](https://www.usgs.gov/landsat-missions/landsat-9) |
| SWOT | 20.865 days, 292 orbits | [20.86455 days, 292 orbits](https://www.aviso.altimetry.fr/en/missions/current-missions/swot/orbit/science-orbit.html) |
| TerraSAR-X | 11 days, 167 orbits | [11 days, 167 orbits](https://www.eoportal.org/satellite-missions/terrasar-x) |
| GPS | one sidereal day, 2 orbits | [twice a day](https://www.gps.gov/space-segment) |

About 2.3% of other low orbits also match by coincidence. Real repeats are kept by station-keeping burns ([repeat orbits](https://en.wikipedia.org/wiki/Ground_track#Repeat_orbits)), so the sentence is a `heuristic` and says a satellite drifts off a repeat without them.

### Tests

`internal/orbit/explain_test.go` checks:

- every rule at its boundaries with synthetic elements;
- that every sentence has an https source;
- real CelesTrak elements for the ISS, a GPS satellite, GOES-18, QZS-2, Sentinel-1C, Sentinel-2A, Sentinel-3A, Sentinel-6A, Landsat 8 and 9, TerraSAR-X, Terra, SWOT, Jason-3 and two Molniya objects.

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
