# Web app

`khonsu web` starts a local server and opens the app in your browser. The app is embedded in the binary, so installs need no Node and no checkout.

```bash
khonsu web                                  # Live data
khonsu web --no-open --addr 127.0.0.1:9000  # Choose the address yourself
khonsu web --file satellites.tle            # Local elements, no provider requests
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
- **Passes:** see the next 48 hours, with a countdown to the next visible pass and a badge on each visible one. Select a pass for its sky plot, where the white stretch is the visible part, then use *Show on globe* to jump to its peak. *Check clouds near me* adds the forecast cloud cover to each pass.
- **Layers:** the *Layers* button above the camera controls opens the choices for the globe's pictures. Pick one base picture, either the plain globe or yesterday's true-colour Earth from NASA GIBS. Then tick any of the near-live cloud layers to stack them over it: GOES East, GOES West and Himawari infrared. The base is drawn first and the cloud layers over it, in the order the app lists them. The bottom left of the globe shows a credit and last update for each picture on screen, one line each. *Clouds now* picks true colour with all three cloud layers, *Yesterday's Earth* keeps only the base, and *Plain* clears everything. Your choices are saved in this browser.
- **Aurora:** an optional overlay on the Layers panel. It is an estimate: a rough oval drawn from NOAA's latest Kp index, which is also the Kp chip in the top bar. It is not a forecast. The slider tries another Kp value without saving it, and *Back to now* returns to the live reading.
- **Identity:** the selected satellite's name, operator, country and launch details from Wikidata, its catalog record from GCAT, and its Space-Track record if you have an account.
- **Radio:** the active transmitters that SatNOGS DB lists, with frequency and mode.
- **Sees:** recent images of the satellite from Earth Search. The tab appears only for Sentinel-2 and Landsat satellites. Choose an image to mark where it was taken on the globe. The mark is blue, and the view turns to face it.
- **Chips:** the top bar shows the latest Kp index and the time to the next launch. Select a chip to see the space weather details or the next launches.
- **Time:** *Live* follows the clock. The slider and playback speeds cover about 25 hours, starting an hour ago. Times can be local or UTC.
- **Share:** the URL holds the tracked satellites and the selection, so you can bookmark or send it.

## Privacy and security

- Your location stays in this browser's storage. It goes only to your Khonsu server, to calculate passes, and is never placed in the URL.
- The app loads nothing from other sites, and a Content Security Policy enforces this. *Current position on a map* is a link you choose to follow.
- The *Data* dialog lists each source and credits it. Space weather and launch times are requested when the app opens, and send nothing about you or your satellites. The Identity and Radio tabs send the selected satellite's NORAD ID to Wikidata, GCAT and SatNOGS, and to Space-Track if you've connected an account. The Sees tab sends the satellite's platform name, such as `sentinel-2a`, to Earth Search, and only for Sentinel-2 and Landsat satellites. Cloud cover is the only feature that sends your location. It runs only when you ask, and sends coordinates rounded to about 10 km to Open-Meteo. Serving a local file with `--file` turns all of these requests off.
- The server only accepts GET and HEAD, refuses API calls from other websites, and on loopback answers only to loopback host names, which blocks DNS rebinding.
- The server listens on loopback by default and has no authentication. Binding it elsewhere prints a warning: anyone who can reach it can use it and trigger provider requests. Use a reverse proxy with rate limits if you need that.

## Limits

- Positions between one-minute samples are interpolated. The app does not run SGP4 in the browser.
- The globe is a sphere. Day and night use the Sun's direction, without twilight or atmosphere modelling.
- Visibility has the [same criteria and limits](visibility.md) as `khonsu tonight`, including no weather or brightness. Cloud cover is shown beside each pass, but it does not change which passes count as visible.
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
| `/api/v1/sources` | | Plain JSON: `categories` of data sources, `imagery_layers`, `imaging_satellites` (the NORAD IDs that have Sees scenes) and `live_data` |
| `/api/v1/space-weather` | | Feed: NOAA SWPC Kp, F10.7, storm scales and recent alerts |
| `/api/v1/launches` | | Feed: upcoming launches from Launch Library 2 |
| `/api/v1/satellite-details` | `norad_id` | Feed: Wikidata items for the catalog number |
| `/api/v1/catalog-record` | `norad_id` | Feed: GCAT entry, or null |
| `/api/v1/space-track` | `norad_id` | Feed: Space-Track record, with an account |
| `/api/v1/transmitters` | `norad_id` | Feed: SatNOGS DB transmitters |
| `/api/v1/recent-scenes` | `norad_id` | Feed: newest Sentinel-2 or Landsat scenes from Earth Search |
| `/api/v1/space-weather-history` | | Feed: a year of daily Kp and F10.7 from CelesTrak |
| `/api/v1/space-events` | | Feed: recent NASA DONKI events (research grade) |
| `/api/v1/cloud-cover` | `lat`, `lon` | Feed: 48 hours of Open-Meteo cloud cover |
| `/api/v1/imagery` | `layer` | Worldwide image from NASA GIBS. Layers are listed by `/api/v1/sources` |
| `/api/satellite-groups`, `/api/satellites?group=` | | Plain JSON lists |

Feed routes return `source` (with its credit), `fetched_at`, `stale`, `warning` and `data`. Khonsu caches each response under `sources/` in the cache directory, makes one request at a time to each provider and pauses a provider after a failure, showing saved data until it recovers.

## Space-Track account

Space-Track needs your own free account. Run `khonsu setup` (or `make setup` from a checkout), then restart `khonsu web`. The wizard checks the login with Space-Track and saves it to `accounts.yaml` in Khonsu's config directory. That file is not encrypted, and only your user can read it.

To avoid saving a password, set `KHONSU_SPACE_TRACK_USER` and `KHONSU_SPACE_TRACK_PASSWORD` instead. They take priority over a saved account. Khonsu uses these details only to log in to Space-Track.

## Changing the app

The source is in `internal/webui/src`, using plain JavaScript modules and Three.js. [Its README](../internal/webui/README.md) covers building it.
