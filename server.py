import os
import uuid
import json
import asyncio
from typing import Optional, Dict
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
parent_env = Path(__file__).parent.parent / ".env"
if parent_env.exists():
    load_dotenv(dotenv_path=parent_env)

# Google ADK & GenAI imports
from google.adk.agents.run_config import GetSessionConfig, RunConfig
from google.adk.runners import InMemoryRunner
from google.genai import types

# Studio Agents
from agent import root_agent, comic_agent, story_agent

# Cloudflare & Free Image Generation Engine
from image_generator import generate_comic_image, STYLE_PRESETS, CLOUDFLARE_MODELS

# ── APP INITIALIZATION ──
app = FastAPI(
    title="Black Orange Talent - AI Creative Studio API",
    version="1.2.0",
    description="Backend service powering AI Story Generator and AI Comic Book Generator with Cloudflare Free Models."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

APP_NAME = "Black Orange Talent"
USER_ID = "student"
MEMORY_EVENTS = 8

REVISION_MESSAGE = """CURRENT STORY
{story}

STUDENT CHANGE REQUEST: {change}

Rewrite the complete version with this change applied."""

# In-memory session credentials cache for Cloudflare
GLOBAL_CF_CONFIG = {
    "account_id": os.getenv("CLOUDFLARE_ACCOUNT_ID", ""),
    "api_token": os.getenv("CLOUDFLARE_API_KEY", "") or os.getenv("CLOUDFLARE_API_TOKEN", "")
}


# ── REQUEST & RESPONSE MODELS ──

class GenerateRequest(BaseModel):
    topic: str
    product_type: Optional[str] = "comic"
    session_id: Optional[str] = None

class ReviseRequest(BaseModel):
    story: str
    change: str
    product_type: Optional[str] = "comic"
    session_id: Optional[str] = None

class SaveEditsRequest(BaseModel):
    story: str
    product_type: Optional[str] = "comic"
    session_id: Optional[str] = None

class ImageGenerateRequest(BaseModel):
    prompt: str
    style: Optional[str] = "comic-modern"
    model: Optional[str] = "flux-schnell"
    account_id: Optional[str] = None
    api_token: Optional[str] = None
    width: Optional[int] = 768
    height: Optional[int] = 768

class CloudflareConfigRequest(BaseModel):
    account_id: Optional[str] = None
    api_token: Optional[str] = None


# ── MULTI-TENANT SESSION STORE ──

class ProductState:
    def __init__(self, agent, prefix: str):
        self.agent = agent
        self.prefix = prefix
        self.runner: Optional[InMemoryRunner] = None
        self.session_id: Optional[str] = None
        self.story: str = ""
        self.topic: str = ""

    def get_runner(self) -> InMemoryRunner:
        if self.runner is None or self.session_id is None:
            self.runner = InMemoryRunner(agent=self.agent, app_name=APP_NAME)
            self.session_id = f"{self.prefix}-" + uuid.uuid4().hex[:8]
            self.runner.session_service.create_session_sync(
                app_name=APP_NAME,
                user_id=USER_ID,
                session_id=self.session_id
            )
        return self.runner

    def ask_ai(self, prompt: str) -> str:
        runner = self.get_runner()
        message = types.Content(
            role="user",
            parts=[types.Part(text=prompt)]
        )
        run_config = RunConfig(
            get_session_config=GetSessionConfig(num_recent_events=MEMORY_EVENTS)
        )

        reply = ""
        for event in runner.run(
            user_id=USER_ID,
            session_id=self.session_id,
            new_message=message,
            run_config=run_config
        ):
            if event.is_final_response() and event.content and event.content.parts:
                reply = event.content.parts[0].text
        return reply

    def reset(self):
        self.runner = None
        self.session_id = None
        self.story = ""
        self.topic = ""


class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, Dict[str, ProductState]] = {}

    def get_state(self, session_id: Optional[str], product_type: Optional[str] = "comic") -> tuple[ProductState, str]:
        clean_sid = (session_id or "").strip()
        if not clean_sid:
            clean_sid = "default"

        if clean_sid not in self._sessions:
            self._sessions[clean_sid] = {
                "comic": ProductState(comic_agent, f"comic-{clean_sid[:6]}"),
                "story": ProductState(story_agent, f"story-{clean_sid[:6]}")
            }

        prod_key = "story" if (product_type and "story" in product_type.lower()) else "comic"
        return self._sessions[clean_sid][prod_key], clean_sid

    def reset_session(self, session_id: Optional[str], product_type: Optional[str] = None):
        clean_sid = (session_id or "").strip()
        if clean_sid in self._sessions:
            if product_type:
                prod_key = "story" if "story" in product_type.lower() else "comic"
                self._sessions[clean_sid][prod_key].reset()
            else:
                self._sessions[clean_sid]["comic"].reset()
                self._sessions[clean_sid]["story"].reset()


session_store = SessionStore()


# ── STORY & COMIC SCRIPT GENERATION ENDPOINTS ──

@app.post("/api/generate")
def generate_story(req: GenerateRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
    state, sid = session_store.get_state(req.session_id, req.product_type)
    try:
        story = state.ask_ai(topic)
        state.story = story
        state.topic = topic
        return {
            "success": True,
            "story": story,
            "topic": topic,
            "product_type": req.product_type,
            "session_id": sid
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-stream")
async def generate_story_stream(req: GenerateRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
    state, sid = session_store.get_state(req.session_id, req.product_type)

    async def stream_generator():
        try:
            yield f"data: {json.dumps({'type': 'status', 'text': 'Igniting imagination with Gemini AI...', 'session_id': sid})}\n\n"
            await asyncio.sleep(0.1)

            story = await asyncio.to_thread(state.ask_ai, topic)
            state.story = story
            state.topic = topic

            chunk_size = 18
            for i in range(0, len(story), chunk_size):
                chunk = story[i:i + chunk_size]
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"
                await asyncio.sleep(0.015)

            yield f"data: {json.dumps({'type': 'done', 'story': story, 'topic': topic, 'session_id': sid, 'product_type': req.product_type})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'detail': str(e)})}\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")


@app.post("/api/revise")
def revise_story(req: ReviseRequest):
    change = req.change.strip()
    state, sid = session_store.get_state(req.session_id, req.product_type)
    current_story = req.story.strip() or state.story
    if not change:
        raise HTTPException(status_code=400, detail="Modification request cannot be empty.")
    if not current_story:
        raise HTTPException(status_code=400, detail="No content to revise.")
    
    try:
        formatted_prompt = REVISION_MESSAGE.format(story=current_story, change=change)
        story = state.ask_ai(formatted_prompt)
        state.story = story
        return {
            "success": True,
            "story": story,
            "change": change,
            "product_type": req.product_type,
            "session_id": sid
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/revise-stream")
async def revise_story_stream(req: ReviseRequest):
    change = req.change.strip()
    state, sid = session_store.get_state(req.session_id, req.product_type)
    current_story = req.story.strip() or state.story
    if not change:
        raise HTTPException(status_code=400, detail="Modification request cannot be empty.")
    if not current_story:
        raise HTTPException(status_code=400, detail="No content to revise.")

    formatted_prompt = REVISION_MESSAGE.format(story=current_story, change=change)

    async def stream_generator():
        try:
            yield f"data: {json.dumps({'type': 'status', 'text': 'Applying revisions with Gemini AI...', 'session_id': sid})}\n\n"
            await asyncio.sleep(0.1)

            story = await asyncio.to_thread(state.ask_ai, formatted_prompt)
            state.story = story

            chunk_size = 18
            for i in range(0, len(story), chunk_size):
                chunk = story[i:i + chunk_size]
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"
                await asyncio.sleep(0.015)

            yield f"data: {json.dumps({'type': 'done', 'story': story, 'change': change, 'session_id': sid, 'product_type': req.product_type})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'detail': str(e)})}\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")


@app.post("/api/save-edits")
def save_edits(req: SaveEditsRequest):
    state, sid = session_store.get_state(req.session_id, req.product_type)
    state.story = req.story
    return {"success": True, "story": state.story, "session_id": sid}


@app.post("/api/reset")
def reset_session(product_type: Optional[str] = "comic", session_id: Optional[str] = None):
    session_store.reset_session(session_id, product_type)
    return {"success": True, "message": f"{product_type} session reset successfully", "session_id": session_id}


@app.get("/api/state")
def get_state(product_type: Optional[str] = "comic", session_id: Optional[str] = None):
    state, sid = session_store.get_state(session_id, product_type)
    return {
        "story": state.story,
        "topic": state.topic,
        "product_type": product_type,
        "session_id": sid,
        "has_session": state.session_id is not None
    }


# ── CLOUDFLARE WORKERS AI & IMAGE GENERATION ENDPOINTS ──

@app.get("/api/image-styles")
def get_image_styles():
    return {
        "styles": [
            {"id": k, "name": v["name"]} for k, v in STYLE_PRESETS.items()
        ],
        "models": [
            {"id": "flux-schnell", "name": "Cloudflare FLUX.1 [schnell] (Free Tier)", "provider": "cloudflare"},
            {"id": "sdxl-base", "name": "Cloudflare SDXL Base 1.0 (Free Tier)", "provider": "cloudflare"},
            {"id": "sdxl-lightning", "name": "Cloudflare SDXL Lightning (Fast)", "provider": "cloudflare"},
            {"id": "free-instant", "name": "Free Instant Flux Engine (Zero Config)", "provider": "instant"}
        ]
    }


@app.get("/api/cloudflare/status")
def get_cloudflare_status():
    token = GLOBAL_CF_CONFIG["api_token"] or os.getenv("CLOUDFLARE_API_KEY", "") or os.getenv("CLOUDFLARE_API_TOKEN", "")
    acc = GLOBAL_CF_CONFIG["account_id"] or os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
    return {
        "has_token": bool(token),
        "has_account_id": bool(acc),
        "account_id_masked": f"{acc[:4]}...{acc[-4:]}" if len(acc) >= 8 else (acc or "Not set"),
        "ready_for_workers_ai": bool(token and acc),
        "free_tier_neurons_daily": "10,000 neurons/day free tier",
        "fallback_available": True
    }


@app.post("/api/cloudflare/config")
def update_cloudflare_config(req: CloudflareConfigRequest):
    if req.account_id is not None:
        GLOBAL_CF_CONFIG["account_id"] = req.account_id.strip()
    if req.api_token is not None:
        GLOBAL_CF_CONFIG["api_token"] = req.api_token.strip()
    return {
        "success": True,
        "message": "Cloudflare configuration updated",
        "has_account_id": bool(GLOBAL_CF_CONFIG["account_id"]),
        "has_token": bool(GLOBAL_CF_CONFIG["api_token"])
    }


@app.post("/api/generate-image")
def generate_image(req: ImageGenerateRequest):
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Image prompt cannot be empty.")
    
    # Priority: request payload > in-memory config > .env
    acc_id = req.account_id or GLOBAL_CF_CONFIG["account_id"] or os.getenv("CLOUDFLARE_ACCOUNT_ID")
    token = req.api_token or GLOBAL_CF_CONFIG["api_token"] or os.getenv("CLOUDFLARE_API_KEY") or os.getenv("CLOUDFLARE_API_TOKEN")
    
    try:
        result = generate_comic_image(
            prompt=prompt,
            style=req.style or "comic-modern",
            model=req.model or "flux-schnell",
            account_id=acc_id,
            api_token=token,
            width=req.width or 768,
            height=req.height or 768
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── STATIC ASSETS & SINGLE PAGE APPLICATION SERVING ──

static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
frontend_assets = os.path.join(frontend_dist, "assets")
if os.path.exists(frontend_assets):
    app.mount("/assets", StaticFiles(directory=frontend_assets), name="assets")


@app.get("/")
def read_root():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return PlainTextResponse("AI Products Studio Web App Ready")


@app.get("/products")
@app.get("/projects")
def read_products():
    products_path = os.path.join(static_dir, "products.html")
    if os.path.exists(products_path):
        return FileResponse(products_path)
    legacy_path = os.path.join(static_dir, "projects.html")
    if os.path.exists(legacy_path):
        return FileResponse(legacy_path)
    return PlainTextResponse("Products page not found")


@app.get("/app")
@app.get("/studio")
@app.get("/react-app")
def read_react_app():
    react_index = os.path.join(frontend_dist, "index.html")
    if os.path.exists(react_index):
        return FileResponse(react_index)
    return PlainTextResponse("React App production bundle not built yet. Run 'npm run build' inside the frontend/ directory.")

