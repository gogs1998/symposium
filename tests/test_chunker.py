# tests/test_chunker.py
from rag.chunker import chunk_text


def test_short_text_is_single_chunk():
    assert chunk_text("hello world", chunk_size=100, overlap=10) == ["hello world"]


def test_splits_on_paragraphs_first():
    text = ("A" * 80) + "\n\n" + ("B" * 80)
    chunks = chunk_text(text, chunk_size=100, overlap=0)
    assert chunks == ["A" * 80, "B" * 80]


def test_respects_max_size():
    text = ". ".join(["sentence " + str(i) for i in range(200)])
    chunks = chunk_text(text, chunk_size=300, overlap=50)
    assert all(len(c) <= 300 for c in chunks)
    assert len(chunks) > 1


def test_overlap_carries_tail_context():
    text = ". ".join(["sentence " + str(i) for i in range(200)])
    chunks = chunk_text(text, chunk_size=300, overlap=50)
    # Each chunk after the first begins with the tail of the previous chunk
    for prev, cur in zip(chunks, chunks[1:]):
        assert cur[:10] in prev[-60:]


def test_no_empty_chunks():
    chunks = chunk_text("a\n\n\n\nb", chunk_size=1, overlap=0)
    assert all(c.strip() for c in chunks)
