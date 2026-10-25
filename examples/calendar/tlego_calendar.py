#!/usr/bin/env python3
"""Convert TLEGO pass-plan JSON v1 from stdin to an RFC 5545 calendar."""

import argparse
import hashlib
import json
import math
import re
import sys
from datetime import datetime, timezone


VERSION_RE = re.compile(r"^1\.[0-9]+$")
RFC3339_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$")


class InputError(ValueError):
    pass


def _object(value, label):
    if not isinstance(value, dict):
        raise InputError(f"{label} must be an object")
    return value


def _string(value, label):
    if not isinstance(value, str) or not value.strip():
        raise InputError(f"{label} must be a non-empty string")
    return value


def _number(value, label):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise InputError(f"{label} must be a number")
    value = float(value)
    if not math.isfinite(value):
        raise InputError(f"{label} must be finite")
    return value


def _timestamp(value, label, nullable=False):
    if value is None and nullable:
        return None
    if not isinstance(value, str) or not RFC3339_RE.fullmatch(value):
        raise InputError(f"{label} must be an RFC 3339 timestamp")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise InputError(f"{label} must be an RFC 3339 timestamp") from exc
    if parsed.tzinfo is None:
        raise InputError(f"{label} must include a timezone")
    return parsed.astimezone(timezone.utc)


def validate(document):
    root = _object(document, "document")
    version = root.get("schema_version")
    if not isinstance(version, str) or not VERSION_RE.fullmatch(version):
        raise InputError("schema_version must be a supported 1.x version")
    if root.get("kind") != "passes":
        raise InputError('kind must be "passes"')
    data = _object(root.get("data"), "data")
    catalog = _string(data.get("catalog_id"), "data.catalog_id")
    observer = _object(data.get("observer"), "data.observer")
    lat = _number(observer.get("latitude_deg"), "data.observer.latitude_deg")
    lon = _number(observer.get("longitude_deg"), "data.observer.longitude_deg")
    alt = _number(observer.get("altitude_km"), "data.observer.altitude_km")
    if not -90 <= lat <= 90 or not -180 <= lon <= 180:
        raise InputError("observer coordinates are out of range")
    if alt <= -6378.137:
        raise InputError("data.observer.altitude_km must be greater than -6378.137 km")
    start = _timestamp(data.get("window_start"), "data.window_start")
    end = _timestamp(data.get("window_end"), "data.window_end")
    if end < start:
        raise InputError("data.window_end must not precede data.window_start")
    minimum = _number(data.get("minimum_elevation_deg"), "data.minimum_elevation_deg")
    if not 0 <= minimum <= 90:
        raise InputError("data.minimum_elevation_deg must be between 0 and 90 degrees")
    step = _number(data.get("sample_step_seconds"), "data.sample_step_seconds")
    if step <= 0:
        raise InputError("data.sample_step_seconds must be greater than zero")
    passes = data.get("passes")
    if not isinstance(passes, list):
        raise InputError("data.passes must be an array")
    parsed_passes = []
    for index, item in enumerate(passes):
        label = f"data.passes[{index}]"
        item = _object(item, label)
        pstart = _timestamp(item.get("start"), f"{label}.start")
        pend = _timestamp(item.get("end"), f"{label}.end")
        rise = _timestamp(item.get("rise_at"), f"{label}.rise_at", nullable=True)
        setting = _timestamp(item.get("set_at"), f"{label}.set_at", nullable=True)
        maximum = _timestamp(item.get("maximum_at"), f"{label}.maximum_at")
        elevation = _number(item.get("maximum_elevation_deg"), f"{label}.maximum_elevation_deg")
        clipped_start = item.get("start_clipped")
        clipped_end = item.get("end_clipped")
        if not isinstance(clipped_start, bool) or not isinstance(clipped_end, bool):
            raise InputError(f"{label} clipping flags must be booleans")
        if pend < pstart:
            raise InputError(f"{label}.end must not precede start")
        if maximum < pstart or maximum > pend:
            raise InputError(f"{label}.maximum_at must be within the pass")
        if rise is not None and rise != pstart:
            raise InputError(f"{label}.rise_at must match start")
        if setting is not None and setting != pend:
            raise InputError(f"{label}.set_at must match end")
        if elevation < 0:
            raise InputError(f"{label}.maximum_elevation_deg must not be negative")
        if pstart < start or pend > end:
            raise InputError(f"{label} must be within the requested window")
        if (rise is None) != clipped_start or (setting is None) != clipped_end:
            raise InputError(f"{label} rise/set timestamps must be null exactly when clipped")
        parsed_passes.append({"start": pstart, "end": pend, "rise": rise, "set": setting,
                              "maximum": maximum, "elevation": elevation,
                              "start_clipped": clipped_start, "end_clipped": clipped_end})
    return {"catalog": catalog, "lat": lat, "lon": lon, "alt": alt, "start": start,
            "end": end, "minimum": minimum, "step": step, "passes": parsed_passes}


def _escape(value):
    return str(value).replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\r\n", "\\n").replace("\n", "\\n").replace("\r", "\\n")


def _fold(line):
    """Fold one content line at 75 UTF-8 octets without splitting a codepoint."""
    pieces = []
    current = ""
    limit = 75
    for char in line:
        if len((current + char).encode("utf-8")) > limit:
            pieces.append(current)
            current = char
            limit = 74
        else:
            current += char
    pieces.append(current)
    return (pieces[0] + "".join("\r\n " + piece for piece in pieces[1:]))


def _ics_time(value):
    return value.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _uid(plan, event):
    key = json.dumps([plan["catalog"], plan["lat"], plan["lon"], plan["alt"],
                      _ics_time(event["start"]), _ics_time(event["end"])],
                     ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(key.encode("utf-8")).hexdigest() + "@tlego"


def to_ical(plan):
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TLEGO//Pass Plan Calendar 1.0//EN", "CALSCALE:GREGORIAN"]
    for event in plan["passes"]:
        clipped = event["start_clipped"] or event["end_clipped"]
        summary = f"Satellite {plan['catalog']} pass" + (" (clipped)" if clipped else "")
        description = (f"Pass estimate for catalog {plan['catalog']}; observer: "
                       f"{plan['lat']:.6f}, {plan['lon']:.6f}, {plan['alt']:.3f} km; "
                       f"maximum elevation {event['elevation']:.3f} degrees; minimum elevation "
                       f"{plan['minimum']:.3f} degrees; sample step {plan['step']:g} seconds. "
                       "Geometric pass estimate only; no optical visibility claim.")
        lines.extend(["BEGIN:VEVENT", f"UID:{_uid(plan, event)}", f"DTSTAMP:{_ics_time(plan['start'])}",
                      f"DTSTART:{_ics_time(event['start'])}", f"DTEND:{_ics_time(event['end'])}",
                      f"SUMMARY:{_escape(summary)}", f"DESCRIPTION:{_escape(description)}"])
        if event["rise"] is not None:
            lines.append(f"X-TLEGO-RISE:{_ics_time(event['rise'])}")
        if event["set"] is not None:
            lines.append(f"X-TLEGO-SET:{_ics_time(event['set'])}")
        lines.extend([f"X-TLEGO-MAXIMUM:{_ics_time(event['maximum'])}",
                      f"X-TLEGO-MAXIMUM-ELEVATION:{event['elevation']:.3f}", "END:VEVENT"])
    lines.append("END:VCALENDAR")
    return "".join(_fold(line) + "\r\n" for line in lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Convert TLEGO pass-plan JSON v1 from stdin to an iCalendar file on stdout.")
    parser.parse_args(argv)
    try:
        document = json.load(sys.stdin)
        calendar = to_ical(validate(document))
    except (json.JSONDecodeError, UnicodeDecodeError, InputError) as exc:
        print(f"tlego-calendar: {exc}", file=sys.stderr)
        return 2
    if hasattr(sys.stdout, "buffer"):
        sys.stdout.buffer.write(calendar.encode("utf-8"))
    else:
        sys.stdout.write(calendar)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
