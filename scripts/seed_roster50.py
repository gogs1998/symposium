"""Register the 21 roster-50 figures (draft status) and write per-figure corpus
manifests. Source: docs/research/2026-07-25-roster-50-proposal.md.

Each manifest lists verified video IDs with the figure's role in that video:
  guest = interview, needs attribution pass (extract figure's speech only)
  solo  = single-speaker lecture/monologue, ingest directly
Idempotent: existing figures are skipped, manifests are overwritten.
"""
import json
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE / "backend"))

import registry
from config import settings
from db import connect, init_db

# id, name, type, description, metadata, [(video_id, role, label)]
FIGURES = [
    ("naval", "Naval Ravikant", "creator",
     "AngelList founder and philosopher-entrepreneur",
     {"format": "podcasts+x", "handle": "@naval"},
     [("3qHkcs3kG44", "guest", "JRE #1309")]),
    ("jensen", "Jensen Huang", "creator",
     "NVIDIA co-founder and CEO, architect of the GPU/AI era",
     {"format": "interviews"},
     [("vif8NQcjVf0", "guest", "Lex Fridman #494")]),
    ("altman", "Sam Altman", "creator",
     "OpenAI CEO, face of the AI moment",
     {"format": "interviews+blog", "handle": "@sama"},
     [("DB9mjd-65gw", "guest", "OpenAI Podcast Ep. 1")]),
    ("bezos", "Jeff Bezos", "creator",
     "Amazon and Blue Origin founder",
     {"format": "interviews+letters", "note": "shareholder letters are public"},
     [("DcWqzZ3I2cY", "guest", "Lex Fridman #405")]),
    ("buffett", "Warren Buffett", "creator",
     "Chairman of Berkshire Hathaway, the Oracle of Omaha",
     {"format": "interviews+letters", "note": "shareholder letters at berkshirehathaway.com"},
     [("Q5UAyHhlFCs", "guest", "CNBC Becky Quick Mar 2026"),
      ("QQOWQcnNmr0", "guest", "CNBC Becky Quick Jul 2026"),
      ("DtSrc1lgVpk", "guest", "Squawk Pod Mar 2026")]),
    ("arnold", "Arnold Schwarzenegger", "creator",
     "Bodybuilder, actor, Governor of California",
     {"format": "podcasts+books", "handle": "@Schwarzenegger"},
     [("JOSzUUOJlgg", "guest", "Jocko Podcast #427"),
      ("jn7bOtwu4zY", "guest", "This Past Weekend #587")]),
    ("goggins", "David Goggins", "creator",
     "Retired Navy SEAL and ultra-endurance athlete",
     {"format": "podcasts+books", "handle": "@davidgoggins"},
     [("AbDT2JTSnA8", "guest", "JRE #1906"),
      ("nDLb8_wgX50", "guest", "Huberman Lab Jan 2024")]),
    ("rubin", "Rick Rubin", "creator",
     "Record producer and philosopher of creativity",
     {"format": "podcasts+book"},
     [("H_szemxPcTI", "guest", "Lex Fridman #275"),
      ("mVN9iptDhcM", "guest", "Huberman Lab 2024")]),
    ("mcconaughey", "Matthew McConaughey", "creator",
     "Oscar-winning actor and author of Greenlights",
     {"format": "podcasts+book", "handle": "@McConaughey"},
     [("8qgIFD0PaWo", "guest", "Lex Fridman #384"),
      ("VLkjaTjJXLY", "guest", "Tim Ferriss #474")]),
    ("ramsay", "Gordon Ramsay", "creator",
     "Michelin-starred chef and broadcaster",
     {"format": "podcasts+books", "handle": "@GordonRamsay"},
     [("lRMReor3hpg", "guest", "Diary of a CEO Oct 2023")]),
    ("feynman", "Richard Feynman", "historical",
     "Nobel physicist who made hard things delightful",
     {"era": "1918-1988"},
     [("nYg6jzotiAc", "solo", "The Pleasure of Finding Things Out (BBC 1981)"),
      ("P1ww1IXRfTA", "solo", "Fun to Imagine (BBC 1983)"),
      ("kEx-gRfuhhk", "solo", "Messenger Lecture 1 (Cornell 1964)")]),
    ("watts", "Alan Watts", "historical",
     "Philosopher who made Eastern thought sound obvious",
     {"era": "1915-1973"},
     [("dx2n3NKX508", "solo", "Out of Your Mind — Session 1"),
      ("bWlg0OBxMCI", "solo", "Out of Your Mind — Session 2"),
      ("C48hI9Qb2q4", "solo", "Myth of Myself")]),
    ("sapolsky", "Robert Sapolsky", "creator",
     "Stanford neuroscientist and primatologist",
     {"format": "lectures+podcasts", "note": "Stanford Human Behavioral Biology playlist PL848F2368C90DDC3D"},
     [("NNnIGh9g6fA", "solo", "Stanford HBB Lecture 1 (verify id via playlist)")]),
    ("hitchens", "Christopher Hitchens", "historical",
     "Essayist and the great debater of the television era",
     {"era": "1949-2011"},
     [("P0XRQd9YOUM", "guest", "Craig vs Hitchens debate, Biola 2009")]),
    ("neiltyson", "Neil deGrasse Tyson", "creator",
     "Astrophysicist and host of StarTalk",
     {"format": "podcasts+books", "handle": "@neiltyson"},
     [("ORvK0_7oQn0", "guest", "Deadliest Cosmic Queries (StarTalk)")]),
    ("kaku", "Michio Kaku", "creator",
     "Theoretical physicist and futurist",
     {"format": "lectures+books", "handle": "@michiokaku"},
     [("0NbBjNiw4tk", "solo", "The Universe in a Nutshell (Big Think)"),
      ("_OjRClPzU6Y", "guest", "Quantum Supremacy — Talks at Google")]),
    ("samharris", "Sam Harris", "creator",
     "Neuroscientist, philosopher, host of Making Sense",
     {"format": "podcasts+books", "note": "no X account since 2022"},
     []),  # Lex #365 id unverified — resolve before ingest
    ("theovon", "Theo Von", "creator",
     "Comedian and host of This Past Weekend",
     {"format": "podcasts", "handle": "@TheoVon"},
     [("9YbCvAFWzGs", "guest", "JRE #1847"),
      ("5WyZkNkA8CI", "guest", "Full Send Podcast 2025")]),
    ("hormozi", "Alex Hormozi", "creator",
     "Founder of Acquisition.com, business-advice voice",
     {"format": "podcasts+x", "handle": "@AlexHormozi"},
     [("x3e73Qn6NOo", "guest", "Diary of a CEO E235"),
      ("4KfuQwB5rIs", "guest", "My First Million Aug 2024"),
      ("gEF67-G9MO0", "guest", "Jay Shetty Podcast")]),
    ("ksi", "KSI", "creator",
     "YouTuber, boxer, musician, Sidemen co-founder",
     {"format": "podcasts+x", "handle": "@KSI"},
     [("DrJMZ_js1oQ", "guest", "This Past Weekend #514"),
      ("fYjdEHn2pWs", "guest", "IMPAULSIVE #283"),
      ("AJ4HvwfP4C0", "guest", "IMPAULSIVE #365")]),
    ("lex", "Lex Fridman", "creator",
     "AI researcher and podcast host",
     {"format": "podcasts", "handle": "@lexfridman"},
     [("tlOyZSAZh2k", "guest", "JRE #1600"),
      ("6I5I56uVvLw", "guest", "Huberman Lab #100")]),
]


def main():
    conn = connect(settings.db_path)
    init_db(conn)
    created = skipped = 0
    for fid, name, ftype, desc, meta, videos in FIGURES:
        try:
            registry.get_figure(conn, fid)
            skipped += 1
        except registry.FigureNotFound:
            registry.create_figure(conn, id=fid, name=name, type=ftype,
                                   description=desc, metadata=meta)
            created += 1
            print(f"  created {fid} ({ftype})")
        fig_dir = BASE / "ingestion" / "sources_data" / "creators" / fid
        fig_dir.mkdir(parents=True, exist_ok=True)
        manifest = {"figure": fid, "videos": [
            {"video_id": v, "role": role, "label": label} for v, role, label in videos
        ]}
        (fig_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\n{created} created, {skipped} already existed; manifests written")


if __name__ == "__main__":
    main()
