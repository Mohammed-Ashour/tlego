# TLEGO pass calendar

`tlego-calendar` reads a TLEGO pass-plan JSON v1 document on stdin and writes
an RFC 5545 iCalendar file to stdout. It uses only the Python standard library
and requires Python 3.10 or newer.

Install in an isolated virtual environment:

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install .
```

Or install with `pipx install ./examples/calendar` from the repository root.

Use it directly:

```sh
tlego-calendar < passes.json > passes.ics
```

For host dispatch, add the virtual environment executable directory to PATH,
then run `tlego calendar --help` and pipe pass output through the host:

```sh
tlego passes 25544 --lat 49.6 --lon 6.1 --format json | tlego calendar > passes.ics
```

The input schema accepts major version 1 (`1.x`) and `kind: "passes"`.
Invalid input is reported on stderr with a nonzero exit status. Empty pass
lists produce a valid empty calendar. Clipped passes use their requested-window
bounds and omit rise or set times that were not observed. Events describe
geometric pass estimates only; they do not claim optical visibility.
