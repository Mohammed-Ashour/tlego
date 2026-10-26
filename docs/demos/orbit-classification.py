"""Show actual offline report output for synthetic orbit-classification fixtures."""

import json
import subprocess
import sys
import time


binary = sys.argv[1] if len(sys.argv) > 1 else "tlego"
epoch = "2026-10-24T05:01:11Z"
print("ORBIT CLASSIFICATION | offline reports at " + epoch, flush=True)
print("Synthetic mean elements; displayed values come from tlego report.\n", flush=True)
print(f"{'Fixture':<27} {'Period/min':>10} {'Inc/deg':>8} {'Ecc':>7} {'Class':>8}", flush=True)
print("-" * 65, flush=True)
for name, motion, eccentricity, inclination in [
    ("Stationary candidate", 1.002743960677476, 0, 0),
    ("Inclined synchronous", 1.002743960677476, 0, 20),
    ("Above synchronous altitude", 0.9094608139888118, 0, 0),
    ("Molniya-like ellipse", 2.005675437459987, 0.74, 63.4),
    ("Low Earth orbit", 14.823668760136153, 0.01, 51.6),
]:
    record = dict(
        OBJECT_NAME=name, NORAD_CAT_ID=25544, EPOCH=epoch,
        MEAN_MOTION=motion, ECCENTRICITY=eccentricity, INCLINATION=inclination,
        RA_OF_ASC_NODE=0, ARG_OF_PERICENTER=0, MEAN_ANOMALY=0,
        BSTAR=0, MEAN_MOTION_DOT=0, MEAN_MOTION_DDOT=0,
    )
    result = subprocess.run(
        [binary, "report", "--file", "-", "--time", epoch, "--format", "json"],
        input=json.dumps(record), text=True, stdout=subprocess.PIPE, check=True,
    )
    orbit = json.loads(result.stdout)["data"]["orbit"]
    print(
        f"{name:<27} {orbit['period_minutes']:>10.2f} "
        f"{orbit['inclination_deg']:>8.1f} {orbit['eccentricity']:>7.3f} "
        f"{orbit['orbit_class_estimate']:>8}", flush=True,
    )
    time.sleep(0.5)
print("\nClass is a browsing estimate; period, shape and altitude matter.", flush=True)
