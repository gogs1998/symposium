"""Wave-2 attribution: for each interview figure, keep only the figure's own
speech (role=guest), then re-ingest the attributed transcript. Solo-lecture
figures (watts, kaku, feynman, sapolsky, neiltyson) are skipped — single speaker,
no attribution needed. Resumable: skips figures whose .host.jsonl already exists.
"""
import asyncio
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PYTHON = BASE / "backend" / "venv" / "Scripts" / "python.exe"
sys.path.insert(0, str(BASE / "backend"))
sys.path.insert(0, str(BASE))

from config import settings
from providers.openrouter import OpenRouterChat

# figure -> (host/interviewer name, hints for the attributor)
JOBS = {
    "naval": ("Joe Rogan", "Guest on the Joe Rogan Experience. Naval speaks in calm, aphoristic, philosophical statements about wealth, leverage, happiness, specific knowledge; Rogan asks questions and riffs."),
    "buffett": ("Becky Quick", "Guest on CNBC with interviewer Becky Quick. Buffett speaks in folksy Midwestern metaphors about investing, Berkshire, business; Quick asks the questions."),
    "bezos": ("Lex Fridman", "Guest on the Lex Fridman podcast. Bezos speaks about Amazon, Blue Origin, decision frameworks ('Day One', 'two-way doors'), long-term thinking; Lex asks measured questions."),
    "jensen": ("Lex Fridman", "Guest on the Lex Fridman podcast. Jensen Huang speaks theatrically and technically about NVIDIA, GPUs, AI, the company's near-death and rise; Lex asks questions."),
    "altman": ("Andrew Mayne", "Guest on the OpenAI podcast; interviewer Andrew Mayne. Altman speaks calmly and precisely about AI, AGI, OpenAI; the host asks questions."),
    "mcconaughey": ("Lex Fridman", "Guest on Lex Fridman and Tim Ferriss. McConaughey speaks in a Southern-poet cadence about 'greenlights', family, freedom, acting; hosts ask questions."),
    "rubin": ("Lex Fridman", "Guest on Lex Fridman and Huberman Lab. Rick Rubin speaks slowly and meditatively about creativity, art, non-attachment; hosts ask questions."),
    "ramsay": ("Steven Bartlett", "Guest on Diary of a CEO; interviewer Steven Bartlett. Ramsay speaks bluntly but reflectively about cooking, his hard early years, ambition, family; Bartlett asks the questions."),
    "hitchens": ("William Lane Craig", "This is a formal debate with William Lane Craig plus a moderator. Keep Christopher Hitchens' speech — his polished rhetorical arguments about religion, God, morality; drop Craig and the moderator."),
    "theovon": ("Joe Rogan", "Guest on the Joe Rogan Experience. Theo Von speaks in surreal Southern storytelling, bizarre folk metaphors, vulnerable asides about addiction and childhood; Rogan asks questions and laughs."),
    "lex": ("Joe Rogan", "Guest on the Joe Rogan Experience and Huberman Lab. Lex Fridman speaks softly and sincerely, aphoristically, about AI, love, meaning, consciousness; the hosts ask questions."),
    "hormozi": ("Steven Bartlett", "Guest on Diary of a CEO, My First Million, Jay Shetty. Hormozi speaks in blunt, systematized business frameworks, often near-verbatim across shows; hosts ask questions."),
}


async def main():
    chat = OpenRouterChat(api_key=settings.openrouter_api_key,
                          base_url=settings.openrouter_base_url)
    from attribute_host import run as attribute_run

    for fid, (host, hints) in JOBS.items():
        raw = BASE / "ingestion" / "sources_data" / "creators" / fid / "transcripts.jsonl"
        host_out = raw.with_name("transcripts.host.jsonl")
        if not raw.exists():
            print(f"== {fid}: no transcripts.jsonl, skip", flush=True)
            continue
        if host_out.exists():
            print(f"== {fid}: already attributed, skip", flush=True)
        else:
            print(f"== {fid}: attributing (drop {host} + others)", flush=True)
            await attribute_run(chat, model=settings.ingest_model, jsonl_path=raw,
                                host_name=host, hints=hints, role="guest")
        # re-ingest attributed corpus (replace so we don't double up with the raw ingest)
        print(f"== {fid}: re-ingesting attributed corpus", flush=True)
        subprocess.run(
            [str(PYTHON), str(BASE / "ingestion" / "cli.py"), "jsonl",
             "--figure", fid, "--path", str(host_out), "--replace"],
            cwd=str(BASE),
        )
    print("\nAttribution batch done.", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
