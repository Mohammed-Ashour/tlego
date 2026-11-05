# Web app

`tlego web` starts a local server and opens the app in your browser. The app is embedded in the binary, so installs need no Node and no checkout.

```bash
tlego web                                  # Live data
tlego web --no-open --addr 127.0.0.1:9000  # Choose the address yourself
tlego web --file satellites.tle            # Local elements, no provider requests
```

| Flag | Default | Meaning |
|---|---|---|
| `--addr` | `127.0.0.1:8080` | Bind address. Port 0 picks a free port. |
| `--no-open` | off | Print the URL without opening a browser. |
| `--file` | none | Serve satellites from a TLE or GP JSON file as one group. |
| `--cache-dir`, `--cache-ttl` | Shared cache, 12h | The same catalog cache as the CLI and TUI. |

## Using it

- **Track:** add up to eight satellites from a group, by filtering, or by typing a NORAD ID. Filtering is local. *Search all groups* can make up to 44 provider requests on a cold cache, so it only runs when you press it.
- **Locate:** set your location by typing it, using the browser's location, or clicking the globe. *Now* then shows the direction and elevation, and a line joins you to the satellite while it is above your horizon.
- **Passes:** see the next 48 hours, with a countdown to the next visible pass and a badge on each visible one. Select a pass for its sky plot, where the white stretch is the visible part, then use *Show on globe* to jump to its peak.
- **Time:** *Live* follows the clock. The slider and playback speeds cover about 25 hours, starting an hour ago. Times can be local or UTC.
- **Share:** the URL holds the tracked satellites and the selection, so you can bookmark or send it.

## Privacy and security

- Your location stays in this browser's storage. It goes only to your TLEGO server, to calculate passes, and is never placed in the URL.
- The app loads nothing from other sites, and a Content Security Policy enforces this. *Current position on a map* is a link you choose to follow.
- The server only accepts GET and HEAD, refuses API calls from other websites, and on loopback answers only to loopback host names, which blocks DNS rebinding.
- The server listens on loopback by default and has no authentication. Binding it elsewhere prints a warning: anyone who can reach it can use it and trigger provider requests. Use a reverse proxy with rate limits if you need that.

## Limits

- Positions between one-minute samples are interpolated. The app does not run SGP4 in the browser.
- The globe is a sphere. Day and night use the Sun's direction, without twilight or atmosphere modelling.
- Visibility has the [same criteria and limits](visibility.md) as `tlego tonight`, including no weather or brightness.
- The browser needs WebGL for the globe. Without it, the details and passes still work.
- CelesTrak [limits repeat downloads](https://celestrak.org/usage-policy.php), and its responses can take a few seconds. Only the first request for data waits for it. A loaded group also provides all of its satellites, expired data is shown at once while newer data loads in the background, and failed requests back off. Searching uses the same saved data. Large groups such as Starlink take longer the first time.

## API

The server also exposes these JSON routes. The `/api/v1` routes other than search take `norad_id`. `lat`, `lon` and `alt` (km) describe an observer, and times are RFC3339. Versioned routes use the [v1 envelope](extensions.md), and failures return an `error` record with a 4xx or 5xx status. Times more than five years from the element epoch are rejected, and calculations stop after 30 seconds. Observer altitude can be at most 100 km. Search returns up to 500 results, and sets `truncated` when there are more.

| Route | Parameters | Returns |
|---|---|---|
| `/api/v1/position` | `time` | Position |
| `/api/v1/report` | `time` | Position and orbit estimates |
| `/api/v1/passes` | observer (required), `start`, `duration` (default 24h, 1m to 168h), `step` (default 1m, 1s to 1h, up to 250,000 samples per request) | Passes |
| `/api/v1/tonight` | observer (required), `time`, `min_elevation` (default 10), `max_sun_elevation` (default -6) | Visible passes in the next dark period |
| `/api/v1/track` | `start`, `duration` (default 24h, 1m to 168h), `step` (default 1m, 1s to 1h), optional observer | Sampled path, up to 20,000 samples |
| `/api/v1/look` | observer (required), `start` and `end` (both required in practice), `samples` (default 60, 2 to 512) | Sky path |
| `/api/v1/search` | `q` | Plain JSON: `satellites`, `groups_covered`, `groups_total`, `truncated`, `warnings` |
| `/api/satellite-groups`, `/api/satellites?group=` | | Plain JSON lists |

## Changing the app

The source is in `internal/webui/src`, using plain JavaScript modules and Three.js. [Its README](../internal/webui/README.md) covers building it.
