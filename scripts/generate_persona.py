"""Operator CLI: generate a persona draft from a figure's corpus, then apply it.

  generate: map-reduce over corpus -> persona.profile.json + persona.draft.md
  apply:    profile JSON (re-rendered) or draft md (verbatim) -> figure row

Usage:
  venv python scripts/generate_persona.py generate --figure aurelius \
      --files-dir ingestion/sources_data/aurelius
  venv python scripts/generate_persona.py generate --figure creator1 \
      --jsonl ingestion/sources_data/creators/creator1/transcripts.jsonl
  venv python scripts/generate_persona.py apply --figure aurelius [--from-draft]
"""
import argparse
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import registry
from persona.extract import extract_from_document
from persona.profile import PersonaProfile
from persona.render import render_prompt
from persona.synthesize import synthesize_profile


def gather_documents(*, files_dir, jsonl_path) -> list[tuple[str, str]]:
    """Returns [(source_name, text)] from a files dir or a transcripts JSONL."""
    docs: list[tuple[str, str]] = []
    if jsonl_path:
        for line in Path(jsonl_path).read_text(encoding="utf-8").splitlines():
            record = json.loads(line)
            text = " ".join(s["text"] for s in record["segments"])
            docs.append((record["title"], text))
    if files_dir:
        for path in sorted(Path(files_dir).rglob("*")):
            if path.is_file() and path.suffix.lower() in {".txt", ".md"}:
                text = path.read_text(encoding="utf-8", errors="replace")
                if text.strip():
                    docs.append((path.name, text))
    return docs


async def run_generate(chat, *, model, figure_id, display_name, figure_type,
                       files_dir, jsonl_path, out_dir) -> PersonaProfile:
    docs = gather_documents(files_dir=files_dir, jsonl_path=jsonl_path)
    if not docs:
        raise SystemExit(f"No corpus documents found for {figure_id}")
    notes = []
    for source_name, text in docs:
        print(f"  map  {source_name}")
        notes.append(await extract_from_document(chat, model=model, figure_name=display_name,
                                                 source_name=source_name, text=text))
    print(f"  reduce ({len(notes)} documents)")
    profile = await synthesize_profile(chat, model=model, figure_id=figure_id,
                                       display_name=display_name,
                                       figure_type=figure_type, notes=notes)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "persona.profile.json").write_text(profile.model_dump_json(indent=2), encoding="utf-8")
    (out / "persona.draft.md").write_text(render_prompt(profile), encoding="utf-8")
    print(f"  wrote {out / 'persona.profile.json'}\n  wrote {out / 'persona.draft.md'}")
    print("Hand-edit either file, then run: generate_persona.py apply --figure", figure_id)
    return profile


def run_apply(conn, *, figure_id: str, out_dir, from_draft: bool) -> None:
    out = Path(out_dir)
    if from_draft:
        prompt = (out / "persona.draft.md").read_text(encoding="utf-8")
    else:
        profile = PersonaProfile.model_validate_json(
            (out / "persona.profile.json").read_text(encoding="utf-8"))
        prompt = render_prompt(profile)
    registry.update_figure(conn, figure_id, persona_prompt=prompt)
    print(f"Applied persona to {figure_id} ({len(prompt)} chars). "
          f"Publish with the admin API when ready.")


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("generate")
    g.add_argument("--figure", required=True)
    g.add_argument("--files-dir")
    g.add_argument("--jsonl")
    a = sub.add_parser("apply")
    a.add_argument("--figure", required=True)
    a.add_argument("--from-draft", action="store_true")
    args = parser.parse_args()

    from config import settings
    from db import connect, init_db
    conn = connect(settings.db_path)
    init_db(conn)
    fig = registry.get_figure(conn, args.figure)
    base = Path("ingestion/sources_data")
    if fig["type"] == "creator":
        base = base / "creators"
    out_dir = base / args.figure / "persona"

    if args.cmd == "generate":
        from providers.openrouter import OpenRouterChat
        chat = OpenRouterChat(api_key=settings.openrouter_api_key,
                              base_url=settings.openrouter_base_url)
        asyncio.run(run_generate(chat, model=settings.ingest_model, figure_id=args.figure,
                                 display_name=fig["name"], figure_type=fig["type"],
                                 files_dir=args.files_dir, jsonl_path=args.jsonl,
                                 out_dir=out_dir))
    else:
        run_apply(conn, figure_id=args.figure, out_dir=out_dir, from_draft=args.from_draft)


if __name__ == "__main__":
    main()
