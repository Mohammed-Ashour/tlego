# Recording the TUI walkthrough

The recording runs the real TUI with the standalone example in `examples/tui-demo`. It browses the ISS, opens its details and ground track, starts live tracking, predicts `+2h`, and generates a JSON report. The example embeds one ISS element set retrieved from [CelesTrak](https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE) on 2026-10-25, with an element epoch of 2026-10-24.

The saved snapshot makes the example usable offline. Position and tracking timestamps use the recording machine's clock. Results from this archived element set are for demonstrating the interface, not current observation planning. Live data is available through the normal `tlego tui` command.

## Run the example

```bash
go run ./examples/tui-demo
```

The example creates temporary cache/settings directories and removes them when it exits. It does not load or overwrite your settings, contacts no provider during this walkthrough, and uses Greenwich as its sample observer.

## Re-record

Install [VHS](https://github.com/charmbracelet/vhs) and its `ttyd` and `ffmpeg` requirements. The tape uses Menlo; change the font to an installed monospace font on other platforms. From the repository root:

```bash
mkdir -p .local-artifacts
vhs docs/demos/tui.tape
```

This produces:

- `assets/tui-demo.mp4`, the full H.264 video.
- `assets/tui-demo.gif`, the animated README preview.

The tape builds the example before showing it and records the TUI's real terminal output. It does not mock screenshots or alter application time. Keep both outputs together when updating the walkthrough, and inspect key screens before committing them.
