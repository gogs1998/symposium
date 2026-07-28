"""Ramsay's savage corpus: ingest the Hell's Kitchen / Kitchen Nightmares insult
compilations so his on-camera register (the whole point, per user direction) is
grounded in his own words rather than invented. Appends to whatever the attribution
batch left (the reflective Diary-of-a-CEO layer), so savage dominates by volume but
the backstory stays. Run AFTER attribute_batch finishes (it --replaces ramsay).
"""
import subprocess
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PYTHON = BASE / "backend" / "venv" / "Scripts" / "python.exe"

SAVAGE = ["H4a4qQfrnU0", "2INpDCWOy0Q", "z5E3xXA_4A0", "u0i3Ts6uhsU"]

subprocess.run(
    [str(PYTHON), str(BASE / "ingestion" / "cli.py"), "youtube",
     "--figure", "ramsay", "--channel", "ignored",
     "--video-ids", ",".join(SAVAGE), "--sleep", "5"],
    cwd=str(BASE),
)
