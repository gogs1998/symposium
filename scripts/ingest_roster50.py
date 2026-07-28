"""Roster-50 ingestion driver: for each figure manifest, fetch captions for its
video IDs via the ingestion CLI (resumable — the ingestion_log skips done items).
Runs figures sequentially with polite sleeps; safe to re-run after failures.
"""
import json
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PYTHON = BASE / "backend" / "venv" / "Scripts" / "python.exe"
CREATORS = BASE / "ingestion" / "sources_data" / "creators"

# Sapolsky: first 8 Stanford lectures resolved from playlist PL848F2368C90DDC3D
SAPOLSKY_LECTURES = ["NNnIGh9g6fA", "Y0Oa4Lp5fLE", "oKNAzl-XN4I", "_dRXA1_e30o",
                     "dFILgg9_hrU", "e0WZx7lUOrY", "RG5fN6KrDJE", "P388gUPSq_I"]

ROSTER = ["feynman", "watts", "sapolsky", "goggins", "arnold", "hormozi", "naval",
          "buffett", "bezos", "jensen", "altman", "mcconaughey", "rubin", "ramsay",
          "hitchens", "neiltyson", "kaku", "theovon", "lex", "jobs"]


def main():
    failures = []
    for fid in ROSTER:
        manifest_path = CREATORS / fid / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        ids = [v["video_id"] for v in manifest["videos"]]
        if fid == "sapolsky":
            ids = SAPOLSKY_LECTURES
        if not ids:
            print(f"== {fid}: no verified videos yet, skipping", flush=True)
            continue
        print(f"== {fid}: {len(ids)} videos", flush=True)
        result = subprocess.run(
            [str(PYTHON), str(BASE / "ingestion" / "cli.py"), "youtube",
             "--figure", fid, "--channel", "ignored",
             "--video-ids", ",".join(ids), "--sleep", "6"],
            cwd=str(BASE),
        )
        if result.returncode != 0:
            failures.append(fid)
            print(f"== {fid}: FAILED (rc={result.returncode})", flush=True)
    print(f"\nDriver done. Failures: {failures or 'none'}", flush=True)
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
