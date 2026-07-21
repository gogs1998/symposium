"""OpenRouter chat via the OpenAI-compatible API."""
from openai import AsyncOpenAI


class OpenRouterChat:
    def __init__(self, api_key: str = "", base_url: str = "https://openrouter.ai/api/v1", client=None):
        self._client = client or AsyncOpenAI(api_key=api_key, base_url=base_url)

    async def complete(self, messages, *, model, temperature, max_tokens) -> str:
        resp = await self._client.chat.completions.create(
            model=model, messages=messages, temperature=temperature, max_tokens=max_tokens
        )
        return resp.choices[0].message.content or ""

    async def stream(self, messages, *, model, temperature, max_tokens):
        resp = await self._client.chat.completions.create(
            model=model, messages=messages, temperature=temperature, max_tokens=max_tokens, stream=True
        )
        async for chunk in resp:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta
