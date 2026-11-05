# Visibility estimates

`tlego tonight` answers whether you could see a satellite with the naked eye during the next dark period.

```bash
tlego tonight --lat 51.48 --lon 0
tlego tonight 48274 --min-elevation 20 --max-sun-elevation -12 --format json
```

Without an ID, it checks the ISS (25544). Without `--lat` and `--lon`, it uses the observer saved in the TUI's Settings. An observer at exactly 0°, 0° counts as unset, because that is the default.

## Criteria

| Requirement | Default | Flag |
|---|---|---|
| Sky is dark: the Sun's centre is at or below this elevation at the observer | -6° (civil twilight) | `--max-sun-elevation` |
| Satellite is above this elevation | 10° | `--min-elevation` |
| Satellite is sunlit | Outside Earth's shadow | |

The dark period is the first one at or after the start time, searched up to 24 hours ahead. In polar summer there may be none, which is a successful result with no passes. In polar night the period ends at the 24-hour limit and is marked as clipped.

If a pass meets the criteria in more than one stretch, only the longest is listed. `fades` means it ends by entering Earth's shadow, while `ends` means it drops below the minimum elevation or the sky brightens.

## Limits

- **Brightness:** GP data has no size or reflectivity, so a sunlit satellite may still be too faint to see. Try the ISS first.
- **Local conditions:** weather, terrain, buildings and light pollution are not considered.
- **Shadow model:** Earth's shadow is a cylinder with no penumbra, so the moment a satellite fades can differ by a few seconds.
- **Sun model:** this is the Astronomical Almanac low-precision formula with no refraction, which is accurate well beyond what the criteria need.
- **Resolution:** visible times resolve to five seconds, and a pass shorter than 30 seconds can be missed.
- **Element age:** SGP4 accuracy falls with distance from the element epoch. A `distant_epoch` warning appears beyond three days.

## Checks

Tests compare 24 hours of ISS passes at Greenwich against [Skyfield](https://rhodesmill.org/skyfield/) with the DE421 ephemeris. Rise, peak and set times agree within 2 seconds, peak elevation within 0.1°, and rise and set azimuth within 0.5°. Peak azimuth is checked within 1° for passes below 80°, because it changes quickly near the zenith. Sun elevation agrees within 0.25°. At most 2% of sunlit samples may differ, allowing for the shadow boundary.
