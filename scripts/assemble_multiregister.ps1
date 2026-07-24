# Assemble multi-register corpora: guest attribution -> clean rebuild -> written merge -> persona
# Run from repo root. Sequential by design (single-writer chroma discipline).
$ErrorActionPreference = "Continue"
Set-Location D:\Claude\Symposium
$py = "backend\venv\Scripts\python.exe"

# --- split mrbeast jsonl into solo (own channel) vs interviews ---
@'
import json
from pathlib import Path
src = Path("ingestion/sources_data/creators/mrbeast/transcripts.jsonl")
interview_ids = {"Z3_PwvvfxIU", "xf0Mli0LVgI", "WGrk7Mzm4uo"}
solo, inter = [], []
for line in src.read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    (inter if json.loads(line)["video_id"] in interview_ids else solo).append(line)
Path("ingestion/sources_data/creators/mrbeast/solo.jsonl").write_text("\n".join(solo) + "\n", encoding="utf-8")
Path("ingestion/sources_data/creators/mrbeast/interviews.jsonl").write_text("\n".join(inter) + "\n", encoding="utf-8")
print(f"split: {len(solo)} solo, {len(inter)} interviews")
'@ | & $py -

# --- guest attribution (target speaker out of interviews) ---
& $py scripts\attribute_host.py --figure elon --role guest --host-name "Elon Musk" --hints "Elon is the GUEST. Hosts are Lex Fridman (calm, philosophical questions) and Joe Rogan (Jamie, pull that up; comedy tangents). Elon talks about Tesla, SpaceX, AI, xAI, engineering, memes."
& $py scripts\attribute_host.py --figure trump --role guest --host-name "Donald Trump" --hints "Trump is the GUEST. Hosts are Joe Rogan, Lex Fridman, and Theo Von. Trump speaks in long superlative-heavy riffs about the economy, elections, opponents, and deals."
& $py scripts\attribute_host.py --figure obama --role guest --host-name "Barack Obama" --hints "Obama is the GUEST. Hosts are Speedy Morman and Trevor Noah. Obama speaks in measured, reflective paragraphs with frequent pauses, about democracy, his presidency, and his book."

# mrbeast: attribute interviews file specifically (script reads transcripts.jsonl by default -> point it via copy)
Copy-Item ingestion\sources_data\creators\mrbeast\transcripts.jsonl ingestion\sources_data\creators\mrbeast\transcripts.full.bak.jsonl -Force
Copy-Item ingestion\sources_data\creators\mrbeast\interviews.jsonl ingestion\sources_data\creators\mrbeast\transcripts.jsonl -Force
& $py scripts\attribute_host.py --figure mrbeast --role guest --host-name "MrBeast (Jimmy Donaldson)" --hints "Jimmy/MrBeast is the GUEST. Hosts are Lex Fridman, Colin and Samir (two hosts), and the Flagrant crew (multiple hosts). Jimmy talks about YouTube strategy, retention, thumbnails, reinvesting money, Feastables, Beast Games."
Move-Item ingestion\sources_data\creators\mrbeast\transcripts.host.jsonl ingestion\sources_data\creators\mrbeast\interviews.host.jsonl -Force
Copy-Item ingestion\sources_data\creators\mrbeast\transcripts.full.bak.jsonl ingestion\sources_data\creators\mrbeast\transcripts.jsonl -Force

# --- clean rebuilds: replace collections with attributed speech, then add written registers ---
& $py ingestion\cli.py jsonl --figure elon --path ingestion\sources_data\creators\elon\transcripts.host.jsonl --replace
& $py ingestion\cli.py files --figure elon --source-dir ingestion\sources_data\creators\elon\written

& $py ingestion\cli.py jsonl --figure trump --path ingestion\sources_data\creators\trump\transcripts.host.jsonl --replace
& $py ingestion\cli.py files --figure trump --source-dir ingestion\sources_data\creators\trump\written

& $py ingestion\cli.py jsonl --figure obama --path ingestion\sources_data\creators\obama\transcripts.host.jsonl --replace
& $py ingestion\cli.py files --figure obama --source-dir ingestion\sources_data\creators\obama\written

# mrbeast: rebuild = solo videos + attributed interviews + written
& $py ingestion\cli.py jsonl --figure mrbeast --path ingestion\sources_data\creators\mrbeast\solo.jsonl --replace
& $py ingestion\cli.py jsonl --figure mrbeast --path ingestion\sources_data\creators\mrbeast\interviews.host.jsonl
& $py ingestion\cli.py files --figure mrbeast --source-dir ingestion\sources_data\creators\mrbeast\written

# --- personas (interviews + written registers together) ---
& $py scripts\generate_persona.py generate --figure elon --jsonl ingestion\sources_data\creators\elon\transcripts.host.jsonl --files-dir ingestion\sources_data\creators\elon\written
& $py scripts\generate_persona.py generate --figure trump --jsonl ingestion\sources_data\creators\trump\transcripts.host.jsonl --files-dir ingestion\sources_data\creators\trump\written
& $py scripts\generate_persona.py generate --figure obama --jsonl ingestion\sources_data\creators\obama\transcripts.host.jsonl --files-dir ingestion\sources_data\creators\obama\written
& $py scripts\generate_persona.py generate --figure mrbeast --jsonl ingestion\sources_data\creators\mrbeast\interviews.host.jsonl --files-dir ingestion\sources_data\creators\mrbeast\written

Write-Output "ASSEMBLY COMPLETE"
