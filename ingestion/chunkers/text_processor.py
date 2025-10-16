"""
Text processing utilities for various file formats
"""
import re
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)

try:
    from pypdf import PdfReader
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    logger.warning("pypdf not available, PDF processing disabled")

try:
    import markdown
    from bs4 import BeautifulSoup
    MARKDOWN_AVAILABLE = True
except ImportError:
    MARKDOWN_AVAILABLE = False
    logger.warning("markdown/beautifulsoup not available, markdown processing limited")


def clean_text(text: str) -> str:
    """Clean and normalize text"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove page numbers and headers/footers (common patterns)
    text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
    
    return text.strip()


def process_text_file(file_path: str) -> Optional[str]:
    """Process a plain text file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        return clean_text(text)
    except Exception as e:
        logger.error(f"Error processing text file {file_path}: {e}")
        return None


def process_pdf(file_path: str) -> Optional[str]:
    """Process a PDF file"""
    if not PDF_AVAILABLE:
        logger.error("PDF processing not available (install pypdf)")
        return None
    
    try:
        reader = PdfReader(file_path)
        text_parts = []
        
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        
        full_text = "\n\n".join(text_parts)
        return clean_text(full_text)
        
    except Exception as e:
        logger.error(f"Error processing PDF {file_path}: {e}")
        return None


def process_markdown(file_path: str) -> Optional[str]:
    """Process a Markdown file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            md_text = f.read()
        
        if MARKDOWN_AVAILABLE:
            # Convert markdown to HTML then extract text
            html = markdown.markdown(md_text)
            soup = BeautifulSoup(html, 'html.parser')
            text = soup.get_text()
        else:
            # Simple markdown cleaning
            text = md_text
            # Remove markdown links
            text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
            # Remove markdown headers
            text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
            # Remove markdown emphasis
            text = re.sub(r'[*_]{1,3}([^*_]+)[*_]{1,3}', r'\1', text)
        
        return clean_text(text)
        
    except Exception as e:
        logger.error(f"Error processing markdown {file_path}: {e}")
        return None


def process_docx(file_path: str) -> Optional[str]:
    """Process a Word document"""
    try:
        from docx import Document
        doc = Document(file_path)
        text_parts = [paragraph.text for paragraph in doc.paragraphs]
        full_text = "\n\n".join(text_parts)
        return clean_text(full_text)
    except ImportError:
        logger.error("python-docx not available for DOCX processing")
        return None
    except Exception as e:
        logger.error(f"Error processing DOCX {file_path}: {e}")
        return None


def estimate_token_count(text: str) -> int:
    """Rough estimate of token count (1 token ≈ 4 characters)"""
    return len(text) // 4


def split_into_sentences(text: str) -> list[str]:
    """Simple sentence splitter"""
    # This is a simple implementation; for production, consider using NLTK or spaCy
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]
