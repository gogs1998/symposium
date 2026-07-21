"""Corpus source: local files (.txt, .md, .pdf). Yields Documents."""
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Document:
    item_id: str      # stable id for ingestion_log + chunk ids
    text: str
    metadata: dict


class FilesSource:
    EXTENSIONS = {".txt", ".md", ".pdf"}

    def __init__(self, directory):
        self.directory = Path(directory)

    def documents(self):
        for path in sorted(self.directory.rglob("*")):
            if not (path.is_file() and path.suffix.lower() in self.EXTENSIONS):
                continue
            try:
                text = self._read(path)
            except Exception as exc:
                print(f"  SKIP {path.name}: {exc}")
                continue
            if not text.strip():
                continue
            yield Document(
                item_id=path.name,
                text=text,
                metadata={"source": path.name, "file_type": path.suffix.lower()},
            )

    @staticmethod
    def _read(path: Path) -> str:
        if path.suffix.lower() == ".pdf":
            from pypdf import PdfReader
            return "\n\n".join((page.extract_text() or "") for page in PdfReader(str(path)).pages)
        return path.read_text(encoding="utf-8", errors="replace")
