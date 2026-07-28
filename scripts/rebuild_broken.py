"""Rebuild collections whose HNSW segments went missing on disk ("Nothing found
on disk"). For each figure: drop the collection, clear its ingestion_log, and
re-ingest from source. Fresh writes land clean. Run with the server STOPPED.
"""
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE / "backend"))
sys.path.insert(0, str(BASE))

import chromadb

import registry
from config import settings
from db import connect
from ingestion.cli import ingest, ingest_jsonl
from ingestion.sources.files import Document, FilesSource
from providers.fastembed_local import FastEmbedLocal
from rag.engine import RAGEngine

SD = BASE / "ingestion" / "sources_data"

# figure -> ordered list of (kind, path). jsonl paths ingest via the transcripts
# path; files paths ingest a corpus directory (persona/* is skipped).
JOBS = {
    "watts": [("jsonl", SD / "creators/watts/transcripts.jsonl")],
    "hormozi": [("jsonl", SD / "creators/hormozi/transcripts.host.jsonl")],
    "arnold": [("jsonl", SD / "creators/arnold/transcripts.host.jsonl")],
    "goggins": [("jsonl", SD / "creators/goggins/transcripts.host.jsonl")],
    "jensen": [("jsonl", SD / "creators/jensen/transcripts.host.jsonl")],
    "ramsay": [("jsonl", SD / "creators/ramsay/transcripts.jsonl"),
               ("jsonl", SD / "creators/ramsay/transcripts.host.jsonl")],
    "franklin": [("files", SD / "franklin")],
    "jacobs": [("files", SD / "jacobs")],
}


def corpus_files(directory):
    """A FilesSource over `directory` excluding anything under a persona/ folder."""
    src = FilesSource(directory)
    orig = src.documents

    def filtered():
        for path in sorted(Path(directory).rglob("*")):
            if "persona" in path.parts:
                continue
            if not (path.is_file() and path.suffix.lower() in FilesSource.EXTENSIONS):
                continue
            text = FilesSource._read(path)
            if text.strip():
                yield Document(item_id=path.name, text=text,
                               metadata={"source": path.name, "file_type": path.suffix.lower()})
    src.documents = filtered
    return src


def main():
    conn = connect(settings.db_path)
    engine = RAGEngine(
        chroma=chromadb.PersistentClient(path=settings.chroma_dir),
        embedder=FastEmbedLocal(model_name=settings.embedding_model),
        chat=None, chat_model=settings.chat_model,
        temperature=settings.temperature, max_tokens=settings.max_tokens,
    )
    for fid, sources in JOBS.items():
        print(f"== {fid}: dropping + clearing log")
        try:
            engine.chroma.delete_collection(name=f"figure_{fid}")
        except Exception as exc:
            print(f"   (no collection to drop: {exc})")
        conn.execute("DELETE FROM ingestion_log WHERE figure_id = ?", (fid,))
        conn.commit()
        for kind, path in sources:
            if kind == "jsonl":
                ingest_jsonl(conn, engine, fid, str(path))
            else:
                ingest(conn, engine, fid, corpus_files(path))
        print(f"   {fid} rebuilt: {engine.chunk_count(fid)} chunks")
    print("\nDone.")


if __name__ == "__main__":
    main()
