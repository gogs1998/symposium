"""Application settings. All values overridable via environment or .env."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Providers
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    chat_model: str = "google/gemini-2.5-flash"          # user-facing chat
    ingest_model: str = "google/gemini-2.5-flash-lite"   # cheap tier for pipeline jobs
    embedding_model: str = "BAAI/bge-small-en-v1.5"      # fastembed local

    # Storage
    db_path: str = "data/symposium.db"
    chroma_dir: str = "data/chroma"

    # RAG
    chunk_size: int = 1200
    chunk_overlap: int = 150
    retrieval_k: int = 6
    temperature: float = 0.7
    max_tokens: int = 1024

    # API
    admin_api_key: str = ""   # empty = admin routes disabled
    allowed_origins: str = "http://localhost:3000"
    host: str = "0.0.0.0"
    port: int = 8000

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
