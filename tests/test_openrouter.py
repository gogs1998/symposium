# tests/test_openrouter.py
from types import SimpleNamespace
from providers.openrouter import OpenRouterChat


class StubCompletions:
    def __init__(self):
        self.kwargs = None

    async def create(self, **kwargs):
        self.kwargs = kwargs
        if kwargs.get("stream"):
            async def gen():
                for text in ["Hel", "lo"]:
                    yield SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=text))])
            return gen()
        msg = SimpleNamespace(content="Hello")
        return SimpleNamespace(choices=[SimpleNamespace(message=msg)])


def make_provider():
    stub = StubCompletions()
    client = SimpleNamespace(chat=SimpleNamespace(completions=stub))
    return OpenRouterChat(client=client), stub


async def test_complete_passes_params_and_returns_text():
    provider, stub = make_provider()
    out = await provider.complete([{"role": "user", "content": "hi"}], model="m1", temperature=0.2, max_tokens=50)
    assert out == "Hello"
    assert stub.kwargs["model"] == "m1"
    assert stub.kwargs["temperature"] == 0.2
    assert stub.kwargs["max_tokens"] == 50


async def test_stream_yields_deltas():
    provider, _ = make_provider()
    chunks = [c async for c in provider.stream([{"role": "user", "content": "hi"}], model="m1", temperature=0.2, max_tokens=50)]
    assert "".join(chunks) == "Hello"
