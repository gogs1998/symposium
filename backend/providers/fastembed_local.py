"""Local embeddings via fastembed (ONNX, no API key). Model is lazy-loaded
on first embed call so importing this module stays cheap."""
from fastembed import TextEmbedding


class FastEmbedLocal:
    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        self.model_name = model_name
        self._model = None

    def embed(self, texts: list[str]) -> list[list[float]]:
        if self._model is None:
            self._model = TextEmbedding(model_name=self.model_name)
        return [list(map(float, v)) for v in self._model.embed(texts)]
