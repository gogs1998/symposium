"""Recursive character chunking: split on the coarsest separator that fits,
then greedily pack pieces up to chunk_size with a tail overlap."""

SEPARATORS = ["\n\n", "\n", ". ", " "]


def chunk_text(text: str, *, chunk_size: int, overlap: int) -> list[str]:
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]
    pieces = _split(text, chunk_size)
    return _pack(pieces, chunk_size, overlap)


def _split(text: str, chunk_size: int) -> list[str]:
    if len(text) <= chunk_size:
        return [text]
    for sep in SEPARATORS:
        if sep in text:
            parts = [p for p in text.split(sep) if p.strip()]
            if len(parts) > 1:
                out = []
                for i, part in enumerate(parts):
                    if i < len(parts) - 1:
                        part = part + sep.rstrip(" ") if sep == ". " else part
                    out.extend(_split(part, chunk_size))
                return out
    # No separator worked: hard cut
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]


def _pack(pieces: list[str], chunk_size: int, overlap: int) -> list[str]:
    chunks: list[str] = []
    current = ""
    for piece in pieces:
        candidate = (current + " " + piece).strip() if current else piece
        if len(candidate) <= chunk_size:
            current = candidate
        else:
            if current:
                chunks.append(current)
            tail = current[-overlap:] if overlap and current else ""
            current = (tail + " " + piece).strip()
            if len(current) > chunk_size:
                chunks.append(current[:chunk_size])
                current = current[chunk_size - overlap if overlap else chunk_size:]
    if current.strip():
        chunks.append(current.strip())
    return [c for c in chunks if c.strip()]
