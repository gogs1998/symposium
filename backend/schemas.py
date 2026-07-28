"""API request/response models."""
from pydantic import BaseModel


class ChatRequest(BaseModel):
    figure: str
    message: str
    conversation_id: str | None = None
    include_citations: bool = True


class Citation(BaseModel):
    source: str
    excerpt: str
    score: float
    metadata: dict = {}


class ChatResponse(BaseModel):
    figure: str
    message: str
    citations: list[Citation] | None = None
    conversation_id: str


class RoomTurn(BaseModel):
    speaker: str
    content: str


class RoomChatRequest(BaseModel):
    figures: list[str]           # 2-4 figure ids sharing the room
    message: str
    transcript: list[RoomTurn] = []
    include_citations: bool = True


class FigureInfo(BaseModel):
    id: str
    name: str
    type: str
    description: str
    metadata: dict
    chunk_count: int


class FigureCreate(BaseModel):
    id: str
    name: str
    type: str
    description: str = ""
    metadata: dict = {}
    persona_prompt: str = ""


class FigureUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    metadata: dict | None = None
    persona_prompt: str | None = None
