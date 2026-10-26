# GP JSON elements

TLEGO requests `FORMAT=JSON` for live CLI, TUI, HTTP and orbit-export workflows. Catalog IDs stay decimal strings throughout parsing, propagation and output, with one to nine digits. Local input detects legacy TLE or GP JSON without relying on the filename.

```bash
tlego predict --file satellite.json --time 2026-10-24T05:01:11Z --format json
tlego report --file satellite.json --format json
cat satellite.json | tlego passes --file - --time 2026-10-24T00:00:00Z --lat 51.48 --lon 0 --duration 24h --format json
```

## Supported input

GP JSON uses the OMM keyword names documented by [CelesTrak](https://celestrak.org/NORAD/documentation/gp-data-formats.php). A file can contain one object or a nonempty array. Single-satellite commands require exactly one record. Group retrieval emits a JSON array that can be saved and parsed again.

Required fields are `NORAD_CAT_ID`, `EPOCH`, `MEAN_MOTION`, `ECCENTRICITY`, `INCLINATION`, `RA_OF_ASC_NODE`, `ARG_OF_PERICENTER`, `MEAN_ANOMALY`, `BSTAR`, `MEAN_MOTION_DOT` and `MEAN_MOTION_DDOT`. Numeric fields accept JSON numbers or numeric strings. Catalog IDs accept decimal integers or digit strings, with leading zeros normalized. `OBJECT_NAME` is optional and defaults to the catalog ID.

Mean motion is in revolutions/day, angular fields are in degrees and eccentricity is dimensionless. Derivatives use the GP/TLE conventions. Epochs retain their fractional seconds. An epoch without a timezone means UTC; explicit offsets are normalized to UTC.

Omitted `CENTER_NAME`, `REF_FRAME`, `TIME_SYSTEM` and `MEAN_ELEMENT_THEORY` mean EARTH, TEME, UTC and SGP4. Explicit incompatible values fail validation. Only ephemeris type 0 is supported. Unknown fields are ignored. XML, KVN and CSV input are rejected; this is a GP JSON reader, not a general CCSDS message reader.

## Output and cache compatibility

Versioned output remains schema 1.0. Provenance reports the actual `source_format`, either `tle` or `gp-json`. GP reports include the original object as `element_data` and an empty legacy `tle` string. Text reports show the original GP object. No conversion fabricates fixed-column TLE text. CSV report columns remain unchanged.

The legacy HTTP location endpoint retains its existing fields and adds `source_format` and `element_data` for GP records. Its `tle.line1` and `tle.line2` are empty for GP input. The versioned position endpoint carries the catalog ID and source provenance.

JSON caches live under `elements/norad/*.json` and `elements/groups/*.json` inside the configured cache directory. Old `norad/*.tle` and `groups/*.tle` files remain usable while fresh, or as stale fallback if a refresh fails. Existing valid JSON takes priority. Malformed or mismatched downloads never replace a usable cache. Freshness uses retrieval time, independently of element epoch.

`tlego tle` and exported legacy Go helpers retain the TLE workflow. The command cannot export GP-only records or IDs beyond the TLE limit. Use predict, report, passes or viz for those records.

## Propagation and checks

The pinned go-satellite-v2 API initializes only from fixed-column TLE text. `internal/sgp4` carries its near-Earth and deep-space numerical code with a direct mean-element initializer. The original BSD license and exact upstream revision are recorded beside the source. No dependency upgrade or new runtime dependency is required.

Active frontends use WGS-84 and the full element epoch, including for TLE input. This corrects the old initializer's whole-second epoch truncation, so positions can differ from earlier releases. Evaluation times remain whole-second UTC, as defined by the existing output contract. Legacy exported helpers keep their original behavior.

Offline checks compare position and velocity against independently generated python-sgp4 WGS-84 values for a near-Earth orbit, Vallado deep-space case 04632 and an epoch in 2057. Component tolerances are 0.1 m and 1 mm/s. Other tests cover equivalent TLE/GP input, propagation errors, cache preservation and larger IDs across frontends. [Orbit estimate criteria and checks](orbit-estimates.md) separately document classification, two-body metrics and eccentric-orbit speed checks.
