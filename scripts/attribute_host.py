"""Operator script: keep only the HOST's speech in a creator's transcripts.

Reads   ingestion/sources_data/creators/<figure>/transcripts.jsonl
Writes  ingestion/sources_data/creators/<figure>/transcripts.host.jsonl

Each output record has the same shape as the input, with `segments` narrowed
to the host's lines and an added `attribution` field {"kept": n, "total": m}.

Usage:
  venv python scripts/attribute_host.py --figure rogan --host-name "Joe Rogan" \
      --hints 'Addresses "Jamie", says "pull that up".'
"""
import argparse
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.attribution import attribute_host_segments


async def run(chat, *, model: str, jsonl_path, host_name: str, hints: str = "",
              window_size: int = 60, overlap: int = 5, role: str = "host") -> Path:
    """Attribute every video in `jsonl_path`; write <name>.host.jsonl beside it.

    Returns the output path. Prints per-video kept/total.
    """
    jsonl_path = Path(jsonl_path)
    out_path = jsonl_path.with_name(jsonl_path.stem + ".host" + jsonl_path.suffix)

    lines = jsonl_path.read_text(encoding="utf-8").splitlines()
    with out_path.open("w", encoding="utf-8") as out:
        for line in lines:
            if not line.strip():
                continue
            record = json.loads(line)
            segments = record["segments"]
            kept = await attribute_host_segments(
                chat, model=model, host_name=host_name, title=record.get("title", ""),
                segments=segments, window_size=window_size, overlap=overlap, hints=hints,
                role=role,
            )
            record["segments"] = kept
            record["attribution"] = {"kept": len(kept), "total": len(segments)}
            out.write(json.dumps(record, ensure_ascii=False) + "\n")
            print(f"  {record.get('video_id', '?')}: kept {len(kept)}/{len(segments)}")
    print(f"Wrote {out_path}")
    return out_path


def main():
    parser = argparse.ArgumentParser(description="Keep only the host's speech in transcripts")
    parser.add_argument("--figure", required=True)
    parser.add_argument("--host-name", required=True, dest="host_name")
    parser.add_argument("--hints", default="")
    parser.add_argument("--window-size", type=int, default=60, dest="window_size")
    parser.add_argument("--overlap", type=int, default=5)
    parser.add_argument("--role", choices=["host", "guest"], default="host",
                        help="Extract the show's host (default) or a named guest")
    args = parser.parse_args()

    from config import settings
    from providers.openrouter import OpenRouterChat

    jsonl_path = Path("ingestion/sources_data/creators") / args.figure / "transcripts.jsonl"
    chat = OpenRouterChat(api_key=settings.openrouter_api_key,
                          base_url=settings.openrouter_base_url)
    asyncio.run(run(chat, model=settings.ingest_model, jsonl_path=jsonl_path,
                    host_name=args.host_name, hints=args.hints,
                    window_size=args.window_size, overlap=args.overlap, role=args.role))


if __name__ == "__main__":
    main()
