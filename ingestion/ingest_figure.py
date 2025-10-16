"""
Document Ingestion Script
Processes source materials and adds them to the vector database
"""
import argparse
import os
import sys
from pathlib import Path
from typing import List, Dict, Any
import logging

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from backend.rag.engine import rag_engine
from backend.agents.figures import FIGURE_REGISTRY
from ingestion.chunkers.text_processor import process_text_file, process_pdf, process_markdown

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_documents_from_directory(directory: str) -> List[Dict[str, Any]]:
    """Load all documents from a directory"""
    documents = []
    directory_path = Path(directory)
    
    if not directory_path.exists():
        logger.error(f"Directory {directory} does not exist")
        return documents
    
    # Supported file extensions
    supported_extensions = {'.txt', '.md', '.pdf'}
    
    for file_path in directory_path.rglob('*'):
        if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
            try:
                logger.info(f"Processing {file_path}")
                
                if file_path.suffix == '.pdf':
                    text = process_pdf(str(file_path))
                elif file_path.suffix == '.md':
                    text = process_markdown(str(file_path))
                else:  # .txt
                    text = process_text_file(str(file_path))
                
                if text and text.strip():
                    documents.append({
                        'text': text,
                        'metadata': {
                            'source': file_path.name,
                            'file_path': str(file_path),
                            'file_type': file_path.suffix
                        }
                    })
                    logger.info(f"✓ Loaded {file_path.name} ({len(text)} chars)")
                else:
                    logger.warning(f"✗ Empty or invalid content in {file_path}")
                    
            except Exception as e:
                logger.error(f"✗ Error processing {file_path}: {e}")
    
    return documents


def ingest_figure(figure_id: str, source_directory: str):
    """Ingest documents for a historical figure"""
    
    # Validate figure
    if figure_id not in FIGURE_REGISTRY:
        logger.error(f"Unknown figure: {figure_id}")
        logger.info(f"Available figures: {', '.join(FIGURE_REGISTRY.keys())}")
        return False
    
    figure = FIGURE_REGISTRY[figure_id]
    logger.info(f"\n{'='*60}")
    logger.info(f"Ingesting sources for: {figure.name}")
    logger.info(f"{'='*60}\n")
    
    # Load documents
    logger.info(f"Loading documents from: {source_directory}")
    documents = load_documents_from_directory(source_directory)
    
    if not documents:
        logger.error("No valid documents found!")
        return False
    
    logger.info(f"\nFound {len(documents)} documents")
    
    # Prepare for ingestion
    texts = [doc['text'] for doc in documents]
    metadatas = [doc['metadata'] for doc in documents]
    
    # Ingest into vector database
    logger.info("\nIngesting into vector database...")
    try:
        chunk_count = rag_engine.ingest_documents(
            figure_id=figure_id,
            documents=texts,
            metadatas=metadatas
        )
        
        logger.info(f"\n{'='*60}")
        logger.info(f"✓ SUCCESS!")
        logger.info(f"  Figure: {figure.name}")
        logger.info(f"  Documents: {len(documents)}")
        logger.info(f"  Chunks: {chunk_count}")
        logger.info(f"{'='*60}\n")
        
        return True
        
    except Exception as e:
        logger.error(f"\n✗ Ingestion failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Ingest source materials for historical figures"
    )
    parser.add_argument(
        "--figure",
        required=True,
        help="Figure ID (e.g., 'einstein', 'curie', 'caesar')"
    )
    parser.add_argument(
        "--source-dir",
        required=True,
        help="Directory containing source materials"
    )
    
    args = parser.parse_args()
    
    success = ingest_figure(args.figure, args.source_dir)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
