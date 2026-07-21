# tests/test_fastembed.py
import pytest
from providers.fastembed_local import FastEmbedLocal


@pytest.mark.integration
def test_embed_returns_vectors_batched():
    emb = FastEmbedLocal(model_name="BAAI/bge-small-en-v1.5")
    vectors = emb.embed(["the meaning of life", "stoic philosophy"])
    assert len(vectors) == 2
    assert len(vectors[0]) == 384
    assert isinstance(vectors[0][0], float)
