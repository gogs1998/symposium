"""
Initialize vector database on first deployment
Runs ingestion for all figures if vector DB is empty
"""
import os
import sys
import subprocess
from pathlib import Path

def check_vector_db_exists():
    """Check if vector database has data"""
    persist_dir = Path("./vector_db_data")
    if not persist_dir.exists():
        return False

    # Check if there are any collection files
    chroma_dir = persist_dir / "chroma"
    if chroma_dir.exists():
        files = list(chroma_dir.glob("*.sqlite*"))
        if files:
            return True
    return False

def run_ingestion(figure_id, source_dir):
    """Run ingestion for a single figure"""
    print(f"Ingesting {figure_id}...")
    try:
        result = subprocess.run(
            [sys.executable, "../ingestion/ingest_figure.py",
             "--figure", figure_id,
             "--source-dir", f"../ingestion/sources/{source_dir}"],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout per figure
        )
        if result.returncode == 0:
            print(f"✓ {figure_id} ingested successfully")
            return True
        else:
            print(f"✗ {figure_id} ingestion failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ {figure_id} ingestion error: {e}")
        return False

def init_all_figures():
    """Initialize all figures"""
    figures = [
        ("einstein", "einstein"),
        ("caesar", "caesar"),
        ("plato", "plato"),
        ("aurelius", "aurelius"),
        ("suntzu", "suntzu"),
        ("machiavelli", "machiavelli"),
        ("franklin", "franklin"),
        ("napoleon", "napoleon"),
        ("douglass", "douglass"),
        ("darwin", "darwin"),
        ("tesla", "tesla"),
        ("confucius", "confucius"),
        ("churchill", "churchill"),
        ("roosevelt", "roosevelt"),
        ("stalin", "stalin"),
        ("hitler", "hitler"),
    ]

    print("=" * 60)
    print("Initializing Vector Database for Symposium.ai")
    print("This will take 10-15 minutes on first deployment")
    print("=" * 60)

    success_count = 0
    for figure_id, source_dir in figures:
        if run_ingestion(figure_id, source_dir):
            success_count += 1

    print("=" * 60)
    print(f"Ingestion complete: {success_count}/{len(figures)} figures loaded")
    print("=" * 60)

    return success_count == len(figures)

if __name__ == "__main__":
    if check_vector_db_exists():
        print("Vector database already initialized. Skipping ingestion.")
        sys.exit(0)
    else:
        print("Vector database not found. Running first-time ingestion...")
        success = init_all_figures()
        sys.exit(0 if success else 1)
