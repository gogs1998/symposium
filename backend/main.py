"""
Symposium.ai FastAPI Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import uuid

from config import settings
from models.schemas import (
    ChatRequest, ChatResponse, MultiAgentChatRequest, MultiAgentChatResponse,
    FigureInfo, HealthResponse, Citation
)
from rag.engine import rag_engine
from agents.figures import get_figure, list_figures, FIGURE_REGISTRY

# Configure logging
logging.basicConfig(
    level=settings.log_level.upper(),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# In-memory conversation storage (use Redis/DB in production)
conversations = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management"""
    logger.info("Starting Symposium.ai API")
    logger.info(f"Vector DB: {settings.vector_db_type}")
    logger.info(f"LLM Provider: {settings.default_llm_provider}")
    yield
    logger.info("Shutting down Symposium.ai API")


# Initialize FastAPI app
app = FastAPI(
    title="Symposium.ai API",
    description="Chat with history's greatest minds, grounded in their actual writings",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Symposium.ai API",
        "docs": "/docs",
        "figures": "/figures"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    try:
        # Check vector DB
        vector_db_status = "healthy"
        figures_count = len(FIGURE_REGISTRY)
        
        return HealthResponse(
            status="healthy",
            version="0.1.0",
            vector_db=vector_db_status,
            figures_available=figures_count
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            version="0.1.0",
            vector_db="error",
            figures_available=0
        )


@app.get("/figures", response_model=list[FigureInfo], tags=["Figures"])
async def get_figures(category: str = None):
    """List all available historical figures, optionally filtered by category"""
    figures_list = list_figures()

    # Get stats for each figure
    figures_info = []
    for figure_dict in figures_list:
        # Filter by category if specified
        if category and category not in figure_dict.get("categories", []):
            continue

        stats = rag_engine.get_figure_stats(figure_dict["id"])

        figures_info.append(FigureInfo(
            id=figure_dict["id"],
            name=figure_dict["name"],
            description=figure_dict["description"],
            era=figure_dict["era"],
            fields=figure_dict["fields"],
            categories=figure_dict.get("categories", []),
            source_count=stats["chunk_count"],
            available=stats["available"]
        ))

    return figures_info


@app.get("/figures/{figure_id}", response_model=FigureInfo, tags=["Figures"])
async def get_figure_info(figure_id: str):
    """Get information about a specific historical figure"""
    try:
        figure = get_figure(figure_id)
        stats = rag_engine.get_figure_stats(figure_id)

        return FigureInfo(
            id=figure.id,
            name=figure.name,
            description=figure.description,
            era=figure.era,
            fields=figure.fields,
            categories=figure.categories,
            source_count=stats["chunk_count"],
            available=stats["available"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_with_figure(request: ChatRequest):
    """Chat with a historical figure"""
    try:
        # Get figure configuration
        figure = get_figure(request.figure)
        
        # Get or create conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Get conversation history
        conversation_history = conversations.get(conversation_id, [])
        
        # Retrieve relevant context
        context_chunks = rag_engine.retrieve_context(
            figure_id=request.figure,
            query=request.message
        )
        
        if not context_chunks:
            logger.warning(f"No context found for figure {request.figure}")
            raise HTTPException(
                status_code=404,
                detail=f"No knowledge base found for {figure.name}. Please ingest source materials first."
            )
        
        # Generate response
        result = rag_engine.generate_response(
            figure_id=request.figure,
            query=request.message,
            context_chunks=context_chunks,
            system_prompt=figure.system_prompt,
            conversation_history=conversation_history
        )
        
        # Update conversation history
        conversation_history.append({"role": "user", "content": request.message})
        conversation_history.append({"role": "assistant", "content": result["response"]})
        conversations[conversation_id] = conversation_history
        
        # Format citations
        citations = None
        if request.include_citations and result.get("citations"):
            citations = [
                Citation(
                    source=c["source"],
                    excerpt=c["excerpt"],
                    relevance_score=c["relevance_score"]
                )
                for c in result["citations"]
            ]
        
        return ChatResponse(
            figure=request.figure,
            message=result["response"],
            citations=citations,
            conversation_id=conversation_id,
            retrieved_chunks=result["context_chunks"] if settings.log_level == "debug" else None
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/multi", response_model=MultiAgentChatResponse, tags=["Chat"])
async def multi_agent_chat(request: MultiAgentChatRequest):
    """Chat with multiple historical figures"""
    if not settings.enable_multi_agent:
        raise HTTPException(status_code=403, detail="Multi-agent chat is disabled")
    
    try:
        # Get or create conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        responses = []
        
        for figure_id in request.figures:
            # Get figure
            figure = get_figure(figure_id)
            
            # Retrieve context
            context_chunks = rag_engine.retrieve_context(
                figure_id=figure_id,
                query=request.message
            )
            
            if not context_chunks:
                logger.warning(f"No context for {figure_id}, skipping")
                continue
            
            # Generate response
            result = rag_engine.generate_response(
                figure_id=figure_id,
                query=request.message,
                context_chunks=context_chunks,
                system_prompt=figure.system_prompt
            )
            
            # Format citations
            citations = [
                Citation(
                    source=c["source"],
                    excerpt=c["excerpt"],
                    relevance_score=c["relevance_score"]
                )
                for c in result.get("citations", [])
            ]
            
            responses.append(ChatResponse(
                figure=figure_id,
                message=result["response"],
                citations=citations,
                conversation_id=conversation_id,
                retrieved_chunks=None
            ))
        
        return MultiAgentChatResponse(
            responses=responses,
            conversation_id=conversation_id
        )
        
    except Exception as e:
        logger.error(f"Multi-agent chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/conversations/{conversation_id}", tags=["Chat"])
async def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    if conversation_id in conversations:
        del conversations[conversation_id]
        return {"message": "Conversation deleted"}
    raise HTTPException(status_code=404, detail="Conversation not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level
    )
