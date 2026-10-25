# Write a TLEGO extension

An extension is a command-line program named `tlego-<name>` on PATH. TLEGO runs it as `tlego <name>`. Choose any language that produces an executable or an installed console script. No SDK, manifest or host imports are required.

## 1. Generate a starter

```bash
tlego plugin init summary
```

This creates `./tlego-summary` with a standalone Go module, a position-summary command, tests and a README. Go is the default because it builds a single executable with no runtime dependencies.

For Python:

```bash
tlego plugin init summary --language python
```

The Python starter includes `pyproject.toml`, a module, tests and a console-script entry point named `tlego-summary`. Its runtime uses only the standard library.

Use `--dir /path/to/new-project` to choose the destination. Its parent directory must already exist. The initializer refuses an existing destination, even an empty directory, and runs no build, install or network commands. Names start with an ASCII letter and contain only ASCII letters, digits and hyphens. Pass `summary`, without the `tlego-` executable prefix. Native names and aliases such as `predict`, `serve` and `plugin` are reserved.

## 2. Test the generated behavior

Both starters read a position JSON document from stdin and print a short summary. They validate the schema major, record kind and required position values before writing output. Unknown fields are ignored. Invalid input produces stderr and a nonzero exit status.

For Go:

```bash
cd tlego-summary
go test ./...
go run . --help
```

For Python:

```bash
cd tlego-summary
python3 -m unittest -v
python3 -m tlego_summary --help
```

From a TLEGO checkout, save a deterministic input file:

```bash
tlego predict --file examples/tui-demo/iss.tle \
  --time 2026-10-24T05:01:11Z --format json > /tmp/position.json
```

Then, from the generated project, run `go run . < /tmp/position.json` or `python3 -m tlego_summary < /tmp/position.json`. The repository also provides [position and other transport fixtures](fixtures/) for development. On Windows, save the file to a local path and pipe its contents in PowerShell, for example `Get-Content -Raw .\position.json | python -m tlego_summary`.

## 3. Install the executable on PATH

For Go:

```bash
go install .
```

Go installs into `GOBIN` when set; otherwise it uses the `bin` directory under `go env GOPATH`. Add that absolute directory to PATH. For example, on macOS or Linux with an unset GOBIN:

```bash
export PATH="$(go env GOPATH)/bin:$PATH"
```

On Windows, the installed program is `tlego-summary.exe`. Add Go's binary directory to the user PATH.

For Python on macOS or Linux:

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install .
```

Activation puts the virtual environment's `bin` directory on PATH. Reinstall after source changes, or use `python -m pip install -e .` while developing. `pipx install .` is another option for an isolated tool installation.

For Python in Windows PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install .
```

Installation creates a native `tlego-summary.exe` console wrapper in `Scripts`. The host supports these wrappers; it does not execute Windows batch files through a shell.

Check discovery and run the command:

```bash
tlego plugin list
tlego summary --help
tlego predict --time 2026-10-24T05:01:11Z --format json 25544 | tlego summary
```

Replace `25544` with `--file /absolute/path/to/satellite.tle` for an offline pipeline. An installed `tlego-summary` works directly with the same arguments and streams. The host does not install the extension or add the project directory to PATH.

## 4. Replace the summary with your behavior

Edit `summarize` in `main.go` or `tlego_summary.py`, then extend its tests. Keep data acquisition separate from processing so fixtures can test your behavior without network requests.

A consumer of built-in output should:

- Request `--format json --schema-version 1.0` and check the command's exit status before parsing stdout.
- Validate `schema_version` and `kind` before accessing the data. A compatible major can add fields or warning codes; ignore unknown additions.
- Respect the named units and UTC times. A catalog ID is a string. Cache freshness and element epoch describe different ages.
- Preserve warnings when they affect the result. A stale fallback is usable data with a warning, while a failed command has no successful stdout document.
- Treat an empty pass list as success. Clipped pass boundaries are not measured rise/set events. Passes describe geometric visibility above the horizon, not optical visibility.

[The JSON schema](schema-v1.json) defines position, report, pass-plan and error records. The starter processes position records. For pass-plan processing, [the calendar extension](../examples/calendar/) shows validation, clipped-pass handling and a complete independent consumer.

An extension can also invoke the host instead of reading piped input. For example, inside the generated Python module:

```python
import subprocess


def summarize_satellite(catalog_id, timestamp):
    result = subprocess.run(
        ["tlego", "predict", "--time", timestamp, "--format", "json",
         "--schema-version", "1.0", catalog_id],
        capture_output=True,
        text=True,
        check=True,
    )
    return summarize(json.loads(result.stdout))
```

Handle `subprocess.CalledProcessError` in your CLI, report its stderr and return a failure status. Pass arguments as a list and invoke the built-in command by name. Built-ins take precedence, so `tlego predict` does not dispatch back to your extension. Use the same approach with Go's `exec.CommandContext` when the extension owns retrieval.

## 5. Keep the command contract

Arguments after the extension name are passed unchanged, including `--help`. Implement your own help and flags. Write results to stdout, diagnostics to stderr, and return nonzero on failure. The host preserves child exit codes and coordinates Ctrl+C. It supplies `TLEGO_HOST_VERSION` and `TLEGO_EXTENSION_VERSION=1`; these describe the host and execution contract, not the JSON schema.

Before distributing an extension, test it directly and through TLEGO. Include malformed JSON, unsupported majors, missing fields, empty results, warnings and redirected streams. Test an installed console-script wrapper on Windows if that platform is supported. Distribute through your language's ordinary tooling and keep the executable name `tlego-<name>`.

See [the full execution contract](extensions.md#dispatch-and-discovery) for lookup, collisions, cancellation limits and exit status rules. Extensions run with the user's permissions; they cannot register in-process providers or TUI panels.
