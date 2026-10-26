# Core and executable extensions

TLEGO keeps catalog access, orbital calculations and output records in the Go host. An extension is a separate executable named `tlego-<command>` on PATH. It can be written in any language and can run independently of the host.

Start with `tlego plugin init summary` for Go or `tlego plugin init summary --language python`. [The authoring guide](writing-extensions.md) walks through generation, testing, installation and consuming host data.

## Machine output

`predict`, `report` and `passes` accept `--format json --schema-version 1.0`. Each successful invocation writes one complete JSON document to stdout. Failure leaves stdout empty, writes a JSON error to stderr, and exits nonzero. Human diagnostics and logs also use stderr. Help remains readable text.

```bash
tlego predict --file examples/tui-demo/iss.tle \
  --time 2026-10-24T05:01:11Z --format json

tlego report --file examples/tui-demo/iss.tle \
  --time 2026-10-24T05:01:11Z --format json

tlego passes --file examples/tui-demo/iss.tle \
  --time 2026-10-24T05:01:11Z --lat 51.48 --lon 0 \
  --duration 24h --step 1m --format json
```

Use a catalog ID instead of `--file` for live retrieval. `--file -` reads a single satellite from stdin. Local inputs make no provider request. `viz --file` also supports multiple records. `--cache-dir` and `--cache-ttl` configure CLI retrieval; the default is the platform user cache with a 12-hour TTL. Retrieval time measures cache freshness, while the separate element epoch measures the age of the underlying orbital elements.

[JSON Schema](schema-v1.json) defines the transport records. [Fixtures](fixtures/) include position, report, pass and error documents plus an intentionally invalid position. The schema permits unknown fields for compatible additions. Consumers must ignore unknown fields and warning codes. Breaking changes require a different major version and explicit selection. This host currently accepts exactly `1.0`.

- Catalog IDs are decimal strings with one to nine digits. The element reader accepts legacy TLE and GP JSON. GP reports preserve the original object in `element_data`, leave `tle` empty and identify `source_format: "gp-json"`. See [GP JSON support](gp-elements.md).
- Timestamps are RFC3339 UTC with `Z`. Propagation uses whole seconds; `evaluated_at` identifies the instant actually calculated.
- Geographic positions use degrees, longitude in `[-180, 180)`, altitude in km and vector speed in km/s. Cartesian calculations use TEME. Orbit classes and apogee/perigee values in reports are estimates. [Orbit estimate criteria and checks](orbit-estimates.md) define GEO, GSO, LEO, MEO, HEO and Other; consumers should accept unfamiliar class strings.
- Provenance identifies source, input format, element epoch, retrieval time and cache status. File/stdin input has a null retrieval time and no cache. Cache paths are not exported. TUI records with unavailable retrieval metadata use `unknown` explicitly.
- Pass records separate the requested window from estimated rise/set times. A clipped boundary has a null rise/set and a clipping flag. Empty passes are a successful result with `passes: []`.
- Passes use the geometric zero-degree horizon. Times and maxima are sampled estimates with the declared step, not optical visibility predictions. Planning is limited to 30 days, at least one-second steps and 250,000 samples.
- Error records contain `kind: "error"`, `schema_version`, and an error code and message. `command_failed` covers CLI failures; `request_failed` covers HTTP failures. Both are failures, never empty successful results.

The TUI retains its original unversioned `json` report format and adds `json-v1` to the format cycle. HTTP retains `/api/location` and adds `/api/v1/position?norad_id=25544&time=2026-10-24T05:01:11Z`. The versioned endpoint uses the same position record as the CLI. The experimental web UI still uses the legacy route.

## Dispatch and discovery

```bash
tlego plugin list
tlego calendar --help
```

For an unknown top-level command `calendar`, the host resolves `tlego-calendar` using PATH. Names must start with an ASCII letter and contain only ASCII letters, digits or hyphens. The resolved program runs directly with its remaining argument vector, current directory, environment, stdin, stdout and stderr. The host does not reparse extension flags or wrap extension output.

Native commands, aliases, `help`, `version` and the `plugin` management command take precedence. Invalid flags or subcommands on a native command remain native failures. Root help and discovery never execute extensions. `plugin list` shows the chosen absolute path followed by other candidates, if any. A name colliding with a built-in can still be invoked directly by its executable name.

The host does not add the working directory to PATH. Explicit user PATH entries remain user-controlled. Go's implicit-current-directory lookup errors are rejected. On Windows, PATH and PATHEXT determine lookup; native executables and installed console-script `.exe` wrappers are supported. Batch `.bat`/`.cmd` files are rejected because dispatch does not invoke a shell.

Extensions receive `TLEGO_HOST_VERSION` and `TLEGO_EXTENSION_VERSION=1`. The execution-contract version is independent of the output schema version.

Normal child exit codes are preserved. Missing extensions return 127, lookup/launch failures return 126, and host cancellation returns 130. There is no arbitrary execution timeout. Ctrl+C cancels the invocation. Windows uses a Job Object for process cleanup. Unix commands with piped input have an isolated process group for cancellation. Interactive Unix commands share the foreground terminal group so reads and Ctrl+C work; the host reaps the child and allows two seconds after Ctrl+C before canceling it. Forced cancellation of an interactive Unix command targets the direct child, since its process group also contains the host.

Extensions run with the user's permissions and inherit the environment. Only install executables you trust. The host does not download, install, update or execute metadata probes for extensions. Extensions cannot register running TUI panels, replace data providers or inject in-process code.

## Calendar example

[The Python example](../examples/calendar/README.md) converts a pass-plan document to an iCalendar file using only the standard library at runtime. Install its console script in a virtual environment and add the environment's executable directory to PATH:

```bash
python3 -m venv /tmp/tlego-calendar
/tmp/tlego-calendar/bin/python -m pip install ./examples/calendar
export PATH="/tmp/tlego-calendar/bin:$PATH"

tlego passes --file examples/tui-demo/iss.tle \
  --time 2026-10-24T05:01:11Z --lat 51.48 --lon 0 --duration 24h \
  --format json | tlego calendar > passes.ics
```

On Windows, use the environment's `Scripts` directory. `tlego-calendar` also works directly with the same stdin contract. The host has no Python dependency.
