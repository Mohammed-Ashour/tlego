# HTML orbit visualization review

Reviewed the pipeline at main commit 80462ad, including cmd/viz.go, pkg/visual, the embedded orbit template, related examples, and the pinned propagation library. Findings were independently checked by a Luna reviewer. Implementation and browser verification followed the review.

## Findings and corrections

| Priority | Observed issue | Correction and verification |
|---|---|---|
| High | Satellite names were interpolated into JavaScript with Go quoting and then inserted with innerHTML. | JSON escaping and DOM textContent. A hostile closing-script/image name remains literal text; the generated page creates no injected image. |
| High | File/template failures returned an empty filename and callers still logged success. | Added an error-returning atomic writer, migrated CLI/examples and checked failure output. The old helper remains as a deprecated source-compatible wrapper. |
| High | Invalid counts and malformed values could panic or produce unusable coordinates. | Bounded counts, finite input/output checks, defensive handling of upstream panics, and invalid/decayed vector rejection. Tests cover malformed records and failed exports preserving existing files. |
| Medium | Go and JavaScript used inconsistent position magnification relative to Earth. | Points now carry TEME km; rendering divides by the same Earth radius as the globe. Physical-scale test fixtures check radii and propagated velocity. |
| Medium | Animation started at random phases and advanced by frame count. | Inclusive UTC sample timestamps, delta-time playback, explicit speed, scrubbing and a common group interval. No interpolated endpoint-to-start jump. |
| Medium | Static paths omitted the orbit-period endpoint. | Include the last sample at one mean-motion period, at the propagator's whole-second resolution. A sampled trajectory is not forced into a closed circle. |
| Medium | Remote module imports/textures could fail and leave an unusable view. | Pinned inline renderer, embedded coastline data, no remote assets, and a visible WebGL failure state with readable metadata. |
| Medium | Group examples had leading empty entries and continued after fetch errors; missing arguments panicked. | Validated retrieval, capacity-only slices, explicit usage/errors, shared UTC start and bounded group size. |
| Medium | The CLI's catalog path could hang, trust failed responses, or index an empty slice. | viz now uses the existing validated cache store. This does not fix other legacy CLI/server fetch paths. |

The final independent review found two additional edge cases. Sparse, day-long tracks could interpolate wrapped Earth angles in the wrong direction; the viewer now calculates GMST from absolute UTC, with a J2000 reference and half-day regression test. Radius checks could admit a point below the ellipsoid; propagation and export now also reject negative altitude.

## Browser checks

- Rendering, camera reset/zoom/rotation, play/pause, speed changes and keyboard timeline scrubbing.
- 390x844 phone layout, with a visible timeline and camera fit that accounts for aspect ratio.
- Hostile satellite names remain text. No injected image elements appear.
- Forced WebGL failure retains metadata and shows an actionable error.
- The generated page contains no external asset elements; scripts, style and geography are inline.
- Browser verification and recording use a dedicated loopback preview directory. Direct file-protocol navigation could not be automated because the browser tool prohibits that protocol; it was not bypassed.

## Remaining numerical limits

The pinned propagator returns position and velocity, not an error. Its internal SGP4 error code is not observable after propagation. This implementation rejects malformed input, panics, non-finite values and invalid radii; that is not a substitute for complete numerical validation or a propagator error API.

The globe is spherical, lighting is illustrative, and coordinates between samples are interpolated. Orbit elements age; a valid fresh cache does not guarantee current scientific accuracy. GMST-based Earth orientation and geodetic readouts use the existing library, not a precision Earth-orientation service. This is an orbit viewer, not a collision, visibility or antenna-control product.

## Compatibility

Point XYZ values are now kilometres, replacing the old undocumented display scaling. Point time and derived metadata are serialized explicitly. Callers constructing points by hand must provide physical units, increasing timestamps and valid derived values. The standalone HTML payload's version is local to this viewer and is not the future extension contract.
