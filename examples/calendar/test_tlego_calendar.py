import io
import json
import unittest
from contextlib import redirect_stderr, redirect_stdout

import tlego_calendar as calendar


def fixture(passes=None):
    return {
        "schema_version": "1.0", "kind": "passes", "data": {
            "catalog_id": "25544", "observer": {"latitude_deg": 49.6, "longitude_deg": 6.1, "altitude_km": 0.25},
            "window_start": "2026-10-25T10:00:00Z", "window_end": "2026-10-25T12:00:00Z",
            "minimum_elevation_deg": 10, "sample_step_seconds": 60,
            "passes": passes if passes is not None else [{
                "start": "2026-10-25T10:15:00Z", "end": "2026-10-25T10:25:00Z",
                "rise_at": "2026-10-25T10:15:00Z", "set_at": "2026-10-25T10:25:00Z",
                "maximum_at": "2026-10-25T10:20:00Z", "maximum_elevation_deg": 32.5,
                "start_clipped": False, "end_clipped": False,
            }],
        }, "provenance": {}, "warnings": [],
    }


class CalendarTests(unittest.TestCase):
    def test_complete_event_has_utc_rise_set_and_deterministic_uid(self):
        plan = calendar.validate(fixture())
        first = calendar.to_ical(plan)
        self.assertEqual(first, calendar.to_ical(calendar.validate(fixture())))
        self.assertIn("DTSTART:20261025T101500Z\r\n", first)
        self.assertIn("X-TLEGO-RISE:20261025T101500Z\r\n", first)
        self.assertIn("X-TLEGO-SET:20261025T102500Z\r\n", first)
        self.assertIn("no optical visibility claim", first.replace("\r\n ", ""))
        self.assertTrue(first.endswith("END:VCALENDAR\r\n"))

    def test_clipped_pass_uses_window_bounds_without_rise_or_set(self):
        item = fixture()["data"]["passes"][0]
        item.update(start="2026-10-25T10:00:00Z", rise_at=None, start_clipped=True)
        ical = calendar.to_ical(calendar.validate(fixture([item])))
        self.assertIn("DTSTART:20261025T100000Z\r\n", ical)
        self.assertIn("SUMMARY:Satellite 25544 pass (clipped)\r\n", ical)
        self.assertNotIn("X-TLEGO-RISE:", ical)

    def test_zero_passes_is_empty_calendar(self):
        ical = calendar.to_ical(calendar.validate(fixture([])))
        self.assertIn("BEGIN:VCALENDAR\r\n", ical)
        self.assertNotIn("BEGIN:VEVENT", ical)
        self.assertIn("END:VCALENDAR\r\n", ical)

    def test_rejects_unsupported_version_nonfinite_and_negative_window(self):
        doc = fixture(); doc["schema_version"] = "2.0"
        with self.assertRaises(calendar.InputError): calendar.validate(doc)
        doc = fixture(); doc["data"]["sample_step_seconds"] = float("nan")
        with self.assertRaises(calendar.InputError): calendar.validate(doc)
        doc = fixture(); doc["data"]["window_end"] = "2026-10-25T09:00:00Z"
        with self.assertRaises(calendar.InputError): calendar.validate(doc)

    def test_folding_never_exceeds_75_utf8_octets(self):
        folded = calendar._fold("SUMMARY:" + "é" * 80)
        for line in folded.split("\r\n"):
            self.assertLessEqual(len(line.encode("utf-8")), 75)

    def test_cli_reports_invalid_input_only_to_stderr(self):
        old_stdin = calendar.sys.stdin
        stdout, stderr = io.StringIO(), io.StringIO()
        try:
            calendar.sys.stdin = io.StringIO(json.dumps({"schema_version": "2.0"}))
            with redirect_stdout(stdout), redirect_stderr(stderr):
                code = calendar.main([])
        finally:
            calendar.sys.stdin = old_stdin
        self.assertNotEqual(code, 0)
        self.assertEqual(stdout.getvalue(), "")
        self.assertIn("supported", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()
