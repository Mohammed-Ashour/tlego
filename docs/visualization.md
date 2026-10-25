# HTML orbit viewer

Generate an HTML file, then open it in a browser with WebGL 2. The file contains its renderer, styles, geographic outlines and sampled data. It does not load scripts, fonts or textures from the network.

## Generate a view

```bash
# Live ISS lookup, using the validated catalog cache.
tlego viz 25544 --output iss.html

# Reproduce the README's ISS view from the checkout without provider access.
go run . viz --file examples/tui-demo/iss.tle --output iss.html

# Choose an explicit instant and increase the sample count.
tlego viz --file satellites.tle --time 2026-10-24T05:01:11Z --points 720 --output orbits.html
```

Use one catalog ID or --file, not both. Flags may precede the ID. Output defaults to ID.html or the local input's base name with .html. --output uses the exact path supplied; its parent directory must exist. A valid export replaces an existing output atomically. Failures return nonzero and print no success path.

A local file may contain 1 to 64 satellites. The export is limited to 250,000 total samples, with 2 to 4,096 points per satellite. Counts must also fit the propagator's one-second resolution. Lower --points for large collections. The CLI defaults to 360 samples per orbit and uses a deterministic color palette.

Without --time, a live lookup starts at the current UTC time; a local file starts at the first record's element epoch. All records share that start. File input is validated locally and never triggers a provider request. Live lookups use the existing validated TUI cache, including visible stale-fallback warnings.

## Read and interact

- The globe and trajectories share one physical kilometre scale. Markers are enlarged for visibility.
- All orbit positions use the TEME frame, with XYZ mapped into the renderer's axes. Geographic outlines rotate according to UTC-derived GMST.
- Every object has one sampled mean-motion period, including its final sample. Paths are not forced into closed circles.
- Group playback uses the interval that all records cover. Longer paths can remain visible beyond that interval, but no marker extrapolates outside the common range.
- Playback starts paused. Select a speed, press Play, or use the slider. Playback stops at the end; pressing Play again restarts at the beginning without interpolating across that jump.
- Drag/scroll controls orbit and zoom. Reset, zoom and camera rotation buttons are keyboard-accessible. In the object list, Up/Down changes the selected satellite.
- The layout fits narrow screens; the timeline remains available while scrolling metadata. Camera rotation is opt-in, and there is no automatic motion on load.

The inspector shows the selected object's latitude, longitude, altitude, vector speed, element epoch and sample spacing. Values between samples are interpolated, including wrapped longitude. Earth orientation is calculated from absolute UTC so sparse tracks retain complete Earth rotations. This is not continuous SGP4 evaluation in the browser. Change --points and regenerate when you need denser samples.

The globe is spherical. Shading supplies depth rather than a computed sunlit/night side. Element age affects scientific accuracy even when the download/cache is fresh. The upstream library does not return all propagation failure status; invalid inputs, panics, non-finite output and invalid radii are rejected, but full independent scientific calibration remains separate work.

If WebGL is unavailable, the page shows an error and retains the metadata and time scrubber. Context loss asks for a reload. Browser support and GPU availability determine whether 3D rendering is possible.

## Go API compatibility

Use visual.WriteHTMLVisual(records, path), which returns the written path and an error. Project callers now propagate those errors. The old visual.CreateHTMLVisual signature remains as a deprecated compatibility wrapper; it writes an error to stderr and returns an empty path on failure.

CreateOrbitPoints still starts at the element epoch. CreateOrbitPointsAt accepts an explicit common UTC start. Point XYZ values are now **TEME kilometres**, replacing the original undocumented display scaling. Manually constructed points must include strictly increasing timestamps and valid derived values. Update callers relying on the previous scaling.

The embedded JSON's version is scoped to this viewer. It is not the planned general extension schema.

## Development and recording

[Viewer build instructions](../pkg/templates/README.md) describe pinned dependencies, licensing and bundle verification. JavaScript changes must include an updated bundle; CI rebuilds and compares it.

The README walkthrough was captured from the actual generated viewer at 1280x720, then encoded as an H.264 MP4 and GIF preview. It demonstrates camera rotation, 300x playback, zoom and keyboard timeline scrubbing. Recreate iss.html with the bundled fixture, serve only its output directory for recording if file previews are unavailable, and capture those controls. No external provider data is needed for the recording.
