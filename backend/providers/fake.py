"""In-memory providers for tests. No network, deterministic."""
import hashlib


class FakeChat:
    def __init__(self, reply: str = "fake reply"):
        self.reply = reply
        self.calls: list[dict] = []

    async def complete(self, messages, *, model, temperature, max_tokens) -> str:
        self.calls.append({"messages": messages, "model": model})
        return self.reply

    async def stream(self, messages, *, model, temperature, max_tokens):
        self.calls.append({"messages": messages, "model": model})
        for i, word in enumerate(self.reply.split(" ")):
            yield word if i == 0 else " " + word


class FakeEmbed:
    def __init__(self, dim: int = 8):
        self.dim = dim

    def embed(self, texts: list[str]) -> list[list[float]]:
        out = []
        for t in texts:
            h = hashlib.sha256(t.encode()).digest()
            out.append([h[i] / 255.0 for i in range(self.dim)])
        return out
