"""Run the persona eval for a figure against the live stack.

Usage: venv python scripts/run_eval.py --figure aurelius [--questions evals/aurelius.json]
Asks via the real engine + persona; judges with chat_model. Prints per-axis averages
and writes evals/results/<figure>-<n>.json.
"""
import argparse
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import chromadb

import registry
from config import settings
from db import connect, init_db
from evals.harness import run_eval
from providers.fastembed_local import FastEmbedLocal
from providers.openrouter import OpenRouterChat
from rag.engine import RAGEngine


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--figure", required=True)
    parser.add_argument("--questions")
    args = parser.parse_args()

    conn = connect(settings.db_path)
    init_db(conn)
    fig = registry.get_figure(conn, args.figure)
    questions_path = Path(args.questions or f"evals/{args.figure}.json")
    questions = json.loads(questions_path.read_text(encoding="utf-8"))

    chat = OpenRouterChat(api_key=settings.openrouter_api_key,
                          base_url=settings.openrouter_base_url)
    engine = RAGEngine(chroma=chromadb.PersistentClient(path=settings.chroma_dir),
                       embedder=FastEmbedLocal(model_name=settings.embedding_model),
                       chat=chat, chat_model=settings.chat_model,
                       temperature=settings.temperature, max_tokens=settings.max_tokens)

    async def ask(question_text: str) -> str:
        parts = []
        async for event in engine.stream_reply(figure_id=fig["id"],
                                               persona_prompt=fig["persona_prompt"],
                                               user_message=question_text,
                                               history=[], k=settings.retrieval_k):
            if event["type"] == "content":
                parts.append(event["content"])
            elif event["type"] == "error":
                raise RuntimeError(event["error"])
        return "".join(parts)

    report = await run_eval(ask, chat, judge_model=settings.chat_model,
                            figure_name=fig["name"], questions=questions)
    out_dir = Path("evals/results")
    out_dir.mkdir(parents=True, exist_ok=True)
    n = len(list(out_dir.glob(f"{args.figure}-*.json"))) + 1
    out_file = out_dir / f"{args.figure}-{n}.json"
    out_file.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n{fig['name']} — averages: {report['averages']}\nFull report: {out_file}")


if __name__ == "__main__":
    asyncio.run(main())
