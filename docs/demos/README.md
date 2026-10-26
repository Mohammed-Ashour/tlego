# Recording the TUI walkthrough

The recording runs the real TUI with the standalone example in `examples/tui-demo`. It browses the ISS, opens its details and ground track, starts live tracking, predicts `+2h`, and generates a JSON report. The example embeds one ISS element set retrieved from [CelesTrak](https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE) on 2026-10-25, with an element epoch of 2026-10-24.

The saved snapshot makes the example usable offline. Position and tracking timestamps use the recording machine's clock. Results from this archived element set are for demonstrating the interface, not current observation planning. Live data is available through the normal `tlego tui` command.

## Run the example

```bash
go run ./examples/tui-demo
```

The example creates temporary cache/settings directories and removes them when it exits. It does not load or overwrite your settings, blocks HTTP requests even when you navigate to an uncached object or group, and uses Greenwich as its sample observer. Only the embedded ISS records are available. The first `go run` may download build dependencies; provider access is blocked inside the running example.

## Re-record

Install [VHS](https://github.com/charmbracelet/vhs) and its `ttyd` and `ffmpeg` requirements. The tape uses Menlo; change the font to an installed monospace font on other platforms. From the repository root:

```bash
mkdir -p .local-artifacts
vhs docs/demos/tui.tape
```

This produces:

- `assets/tui-demo.mp4`, the full H.264 video download.
- `assets/tui-demo.gif`, the animated README preview.

The tape builds the example before showing it and records the TUI's real terminal output. It does not mock screenshots or alter application time. Keep both outputs together when updating the walkthrough, and inspect key screens before committing them.

## Orbit classification comparison

The before/after recordings run the same five synthetic GP records through the real `report --format json` command at a fixed epoch. `orbit-classification.py` displays selected output fields; it does not supply expected labels or substitute report results. All records reuse catalog ID 25544 for offline parsing and are not observations of the ISS.

The baseline is merged PR #36 at `fc471afd9b7c76747c7fc13b88247c300984b549`. Build both binaries, then record from the repository root:

```bash
mkdir -p .local-artifacts/orbit-before .local-artifacts/orbit-after
git archive fc471afd9b7c76747c7fc13b88247c300984b549 | tar -x -C .local-artifacts/orbit-before
go build -C .local-artifacts/orbit-before -o "$PWD/.local-artifacts/orbit-before/tlego" .
go build -o .local-artifacts/orbit-after/tlego .

TLEGO_DEMO_BIN_DIR="$PWD/.local-artifacts/orbit-before" vhs \
  -o assets/orbit-classification-before.mp4 -o assets/orbit-classification-before.gif \
  docs/demos/orbit-classification.tape
TLEGO_DEMO_BIN_DIR="$PWD/.local-artifacts/orbit-after" vhs \
  -o assets/orbit-classification-after.mp4 -o assets/orbit-classification-after.gif \
  docs/demos/orbit-classification.tape
```

Run `python3 docs/demos/orbit-classification.py /absolute/path/to/tlego` for the same comparison without recording. The changed labels and their limits are described in [orbit estimates](../orbit-estimates.md).
