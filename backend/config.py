"""
Configuration management for Symposium.ai
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Keys
    openai_api_key: str
    anthropic_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    
    # Vector Database
    vector_db_type: str = "chromadb"
    chroma_persist_dir: str = "./vector_db_data"
    qdrant_url: Optional[str] = None
    qdrant_api_key: Optional[str] = None
    
    # LLM Configuration
    default_llm_provider: str = "openai"
    default_model: str = "gpt-4-turbo-preview"
    embedding_model: str = "text-embedding-3-small"
    embedding_provider: str = "openai"
    
    # RAG Settings
    chunk_size: int = 800
    chunk_overlap: int = 200
    retrieval_k: int = 5
    temperature: float = 0.7
    max_tokens: int = 2000
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    log_level: str = "info"
    
    # CORS
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    
    # Feature Flags
    enable_multi_agent: bool = True
    enable_conversation_history: bool = True
    enable_citations: bool = True
    
    class Config:
        # Check if we're running from backend/, ingestion/, or project root
        current_dir = os.path.basename(os.getcwd())
        if current_dir == "backend":
            env_file = ".env"
        elif current_dir == "ingestion":
            env_file = "../backend/.env"
        else:
            env_file = "backend/.env"
        case_sensitive = False
    
    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Global settings instance
settings = Settings()
