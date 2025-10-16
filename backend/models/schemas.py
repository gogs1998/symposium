"""
Pydantic models for API requests and responses
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Message(BaseModel):
    """A single message in a conversation"""
    role: str = Field(..., description="Role: 'user', 'assistant', or figure name")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    citations: Optional[List[str]] = Field(default=None, description="Source citations")


class ChatRequest(BaseModel):
    """Request to chat with a historical figure"""
    figure: str = Field(..., description="Historical figure ID (e.g., 'einstein')")
    message: str = Field(..., description="User's message")
    conversation_id: Optional[str] = Field(default=None, description="Conversation ID for context")
    include_citations: bool = Field(default=True, description="Include source citations")


class Citation(BaseModel):
    """A citation to a source document"""
    source: str = Field(..., description="Source document name")
    excerpt: str = Field(..., description="Relevant excerpt")
    relevance_score: float = Field(..., description="Similarity score")


class ChatResponse(BaseModel):
    """Response from a historical figure"""
    figure: str = Field(..., description="Historical figure ID")
    message: str = Field(..., description="Figure's response")
    citations: Optional[List[Citation]] = Field(default=None, description="Source citations")
    conversation_id: str = Field(..., description="Conversation ID")
    retrieved_chunks: Optional[List[str]] = Field(default=None, description="Retrieved context chunks")


class MultiAgentChatRequest(BaseModel):
    """Request for multi-agent conversation"""
    figures: List[str] = Field(..., description="List of figure IDs")
    message: str = Field(..., description="User's message or topic")
    conversation_id: Optional[str] = Field(default=None)
    orchestration_mode: str = Field(default="round_robin", description="'round_robin', 'all_respond', 'natural'")


class MultiAgentChatResponse(BaseModel):
    """Response from multiple historical figures"""
    responses: List[ChatResponse] = Field(..., description="Responses from each figure")
    conversation_id: str = Field(..., description="Conversation ID")


class FigureInfo(BaseModel):
    """Information about a historical figure"""
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Full name")
    description: str = Field(..., description="Brief description")
    era: str = Field(..., description="Time period (e.g., '1879-1955')")
    fields: List[str] = Field(..., description="Areas of expertise")
    categories: List[str] = Field(default=[], description="Categories (e.g., 'Scientists', 'Philosophers')")
    source_count: int = Field(..., description="Number of source documents")
    available: bool = Field(..., description="Whether the figure is available for chat")


class IngestionRequest(BaseModel):
    """Request to ingest new source material"""
    figure_id: str = Field(..., description="Figure to associate sources with")
    source_files: List[str] = Field(..., description="List of file paths")
    metadata: Optional[dict] = Field(default=None, description="Additional metadata")


class IngestionResponse(BaseModel):
    """Response from ingestion process"""
    figure_id: str
    chunks_created: int
    sources_processed: int
    status: str
    errors: Optional[List[str]] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="'healthy' or 'unhealthy'")
    version: str = Field(..., description="API version")
    vector_db: str = Field(..., description="Vector DB status")
    figures_available: int = Field(..., description="Number of available figures")
