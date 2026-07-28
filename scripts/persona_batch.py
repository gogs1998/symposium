"""Generate persona drafts for the wave-2 figures. Source per figure:
  - interview figures: transcripts.host.jsonl (attributed — only the figure's speech)
  - ramsay: transcripts.jsonl (the savage Hell's Kitchen register is the point)
  - solo lecturers: transcripts.jsonl (single speaker, no attribution)
Idempotent: skips a figure whose persona.draft.md already exists.
Drafts are then hand-reviewed (Fable editorial pass) before apply+publish.
"""
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PYTHON = BASE / "backend" / "venv" / "Scripts" / "python.exe"
CREATORS = BASE / "ingestion" / "sources_data" / "creators"

# figure -> transcript filename to generate from
HOST = "transcripts.host.jsonl"
RAW = "transcripts.jsonl"
SOURCES = {
    "naval": HOST, "buffett": HOST, "bezos": HOST, "jensen": HOST, "altman": HOST,
    "mcconaughey": HOST, "rubin": HOST, "hitchens": HOST, "theovon": HOST,
    "lex": HOST, "hormozi": HOST,
    "ramsay": RAW,          # savage register
    "watts": RAW, "kaku": RAW, "neiltyson": RAW,  # solo
}

for fid, fname in SOURCES.items():
    draft = CREATORS / fid / "persona" / "persona.draft.md"
    if draft.exists():
        print(f"== {fid}: draft exists, skip", flush=True)
        continue
    src = CREATORS / fid / fname
    if not src.exists():
        print(f"== {fid}: no {fname}, skip", flush=True)
        continue
    print(f"== {fid}: generating from {fname}", flush=True)
    subprocess.run(
        [str(PYTHON), str(BASE / "scripts" / "generate_persona.py"), "generate",
         "--figure", fid, "--jsonl", str(src)],
        cwd=str(BASE),
    )
print("\nPersona batch done.", flush=True)
