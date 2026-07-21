"""Symposium v2 API."""
import json
import logging

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import conversations as convo
import deps
import registry
from config import settings
from schemas import (ChatRequest, ChatResponse, Citation, FigureCreate,
                     FigureInfo, FigureUpdate)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Symposium API", version="2.0.0")
app.add_middleware(
    CORSMiddleware, allow_origins=settings.allowed_origins_list,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)


def _figure_info(fig: dict) -> FigureInfo:
    return FigureInfo(
        id=fig["id"], name=fig["name"], type=fig["type"],
        description=fig["description"], metadata=fig["metadata"],
        chunk_count=deps.get_engine().chunk_count(fig["id"]),
    )


def _published_figure_or_404(figure_id: str) -> dict:
    try:
        fig = registry.get_figure(deps.get_conn(), figure_id)
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")
    if fig["status"] != "published":
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")
    return fig


# --- Public: figures ---

@app.get("/figures", response_model=list[FigureInfo])
async def list_figures():
    return [_figure_info(f) for f in registry.list_figures(deps.get_conn(), published_only=True)]


@app.get("/figures/{figure_id}", response_model=FigureInfo)
async def get_figure(figure_id: str):
    return _figure_info(_published_figure_or_404(figure_id))


# --- Public: chat ---

def _prepare_turn(request: ChatRequest):
    """Shared setup for /chat and /chat/stream. Returns (fig, session_id, conversation_id, history)."""
    conn = deps.get_conn()
    fig = _published_figure_or_404(request.figure)
    session_id = request.conversation_id
    if not session_id or not convo.session_exists(conn, session_id):
        session_id = convo.create_session(conn)
    conversation_id = convo.get_or_create_conversation(conn, session_id, request.figure)
    history = [
        {"role": m["role"], "content": m["content"]}
        for m in convo.get_history(conn, conversation_id, limit=10)
    ]
    return fig, session_id, conversation_id, history


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    conn = deps.get_conn()
    engine = deps.get_engine()
    fig, session_id, conversation_id, history = _prepare_turn(request)

    full, citations = "", None
    async for event in engine.stream_reply(
        figure_id=fig["id"], persona_prompt=fig["persona_prompt"],
        user_message=request.message, history=history, k=settings.retrieval_k,
    ):
        if event["type"] == "citations":
            citations = event["citations"]
        elif event["type"] == "content":
            full += event["content"]
        elif event["type"] == "error":
            raise HTTPException(status_code=502, detail=event["error"])

    convo.save_message(conn, conversation_id, "user", request.message)
    convo.save_message(conn, conversation_id, "assistant", full, citations=citations)
    return ChatResponse(
        figure=fig["id"], message=full, conversation_id=session_id,
        citations=[Citation(**c) for c in citations] if request.include_citations and citations else None,
    )


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    conn = deps.get_conn()
    engine = deps.get_engine()
    fig, session_id, conversation_id, history = _prepare_turn(request)

    async def sse():
        yield f"data: {json.dumps({'type': 'start', 'conversation_id': session_id, 'figure': fig['id']})}\n\n"
        full, citations = "", None
        async for event in engine.stream_reply(
            figure_id=fig["id"], persona_prompt=fig["persona_prompt"],
            user_message=request.message, history=history, k=settings.retrieval_k,
        ):
            if event["type"] == "citations":
                citations = event["citations"]
                if request.include_citations:
                    yield f"data: {json.dumps({'type': 'citations', 'citations': citations})}\n\n"
            elif event["type"] == "content":
                full += event["content"]
                yield f"data: {json.dumps({'type': 'content', 'content': event['content']})}\n\n"
            elif event["type"] == "error":
                yield f"data: {json.dumps({'type': 'error', 'error': event['error']})}\n\n"
                return
            elif event["type"] == "end":
                convo.save_message(conn, conversation_id, "user", request.message)
                convo.save_message(conn, conversation_id, "assistant", full, citations=citations)
                yield f"data: {json.dumps({'type': 'end'})}\n\n"

    return StreamingResponse(sse(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# --- Public: sessions ---

@app.get("/sessions")
async def list_sessions(user_id: str = "default", limit: int = 50):
    return {"sessions": convo.get_user_sessions(deps.get_conn(), user_id, limit)}


@app.get("/sessions/{session_id}/history")
async def session_history(session_id: str):
    conn = deps.get_conn()
    history = {}
    for c in convo.get_session_conversations(conn, session_id):
        history[c["figure_id"]] = convo.get_history(conn, c["id"])
    return {"session_id": session_id, "history": history}


@app.put("/sessions/{session_id}/title")
async def rename_session(session_id: str, title: str):
    convo.update_session_title(deps.get_conn(), session_id, title)
    return {"session_id": session_id, "title": title}


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    convo.delete_session(deps.get_conn(), session_id)
    return {"deleted": session_id}


# --- Admin (X-Admin-Key header; disabled when no key configured) ---

def require_admin(x_admin_key: str = Header(default="")):
    expected = deps.get_admin_key()
    if not expected or x_admin_key != expected:
        raise HTTPException(status_code=401, detail="Admin key required")


@app.post("/admin/figures", dependencies=[Depends(require_admin)])
async def admin_create_figure(body: FigureCreate):
    try:
        return registry.create_figure(deps.get_conn(), **body.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@app.get("/admin/figures", dependencies=[Depends(require_admin)])
async def admin_list_figures():
    return registry.list_figures(deps.get_conn(), published_only=False)


@app.put("/admin/figures/{figure_id}", dependencies=[Depends(require_admin)])
async def admin_update_figure(figure_id: str, body: FigureUpdate):
    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    try:
        return registry.update_figure(deps.get_conn(), figure_id, **fields)
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")


@app.post("/admin/figures/{figure_id}/publish", dependencies=[Depends(require_admin)])
async def admin_publish(figure_id: str):
    try:
        return registry.publish(deps.get_conn(), figure_id,
                                chunk_count=deps.get_engine().chunk_count(figure_id))
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")
    except registry.PublishError as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@app.post("/admin/figures/{figure_id}/unpublish", dependencies=[Depends(require_admin)])
async def admin_unpublish(figure_id: str):
    try:
        return registry.unpublish(deps.get_conn(), figure_id)
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")


@app.delete("/admin/figures/{figure_id}", dependencies=[Depends(require_admin)])
async def admin_delete(figure_id: str):
    try:
        registry.delete_figure(deps.get_conn(), figure_id)
        return {"deleted": figure_id}
    except registry.FigureNotFound:
        raise HTTPException(status_code=404, detail=f"Unknown figure: {figure_id}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port)
