"""Provider interfaces. Chat providers are async; embedding providers are sync
(fastembed is CPU-bound local work — callers run it off the event loop if needed)."""
from typing import AsyncIterator, Protocol


class ChatProvider(Protocol):
    async def complete(self, messages: list[dict], *, model: str, temperature: float, max_tokens: int) -> str: ...

    def stream(self, messages: list[dict], *, model: str, temperature: float, max_tokens: int) -> AsyncIterator[str]: ...


class EmbeddingProvider(Protocol):
    def embed(self, texts: list[str]) -> list[list[float]]: ...
