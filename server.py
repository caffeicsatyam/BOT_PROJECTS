import os
import uuid
from typing import Optional
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env from this folder or root BOT_RAG folder
load_dotenv()
parent_env = Path(__file__).parent.parent / ".env"
if parent_env.exists():
    load_dotenv(dotenv_path=parent_env)

from google.adk.agents.run_config import GetSessionConfig, RunConfig
from google.adk.runners import InMemoryRunner
from google.genai import types

from agent import root_agent, comic_agent, story_agent

app = FastAPI(title="Black Orange Talent - AI Products Studio Web API", version="1.0.0")

APP_NAME = "Black Orange Talent"
USER_ID = "student"
MEMORY_EVENTS = 8

REVISION_MESSAGE = """CURRENT STORY
{story}

STUDENT CHANGE REQUEST: {change}

Rewrite the complete version with this change applied."""

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

comic_state = ProductState(comic_agent, "comic")
story_state = ProductState(story_agent, "story")

def get_product_state(product_type: Optional[str] = "comic") -> ProductState:
    if product_type and "story" in product_type.lower():
        return story_state
    return comic_state

class GenerateRequest(BaseModel):
    topic: str
    product_type: Optional[str] = "comic"

class ReviseRequest(BaseModel):
    story: str
    change: str
    product_type: Optional[str] = "comic"

class SaveEditsRequest(BaseModel):
    story: str
    product_type: Optional[str] = "comic"

@app.post("/api/generate")
def generate_story(req: GenerateRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
    state = get_product_state(req.product_type)
    try:
        story = state.ask_ai(topic)
        state.story = story
        state.topic = topic
        return {
            "success": True,
            "story": story,
            "topic": topic,
            "product_type": req.product_type,
            "session_id": state.session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/revise")
def revise_story(req: ReviseRequest):
    change = req.change.strip()
    state = get_product_state(req.product_type)
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
            "product_type": req.product_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-edits")
def save_edits(req: SaveEditsRequest):
    state = get_product_state(req.product_type)
    state.story = req.story
    return {"success": True, "story": state.story}

@app.post("/api/reset")
def reset_session(product_type: Optional[str] = "comic"):
    state = get_product_state(product_type)
    state.reset()
    return {"success": True, "message": f"{product_type} session reset successfully"}

@app.get("/api/state")
def get_state(product_type: Optional[str] = "comic"):
    state = get_product_state(product_type)
    return {
        "story": state.story,
        "topic": state.topic,
        "product_type": product_type,
        "has_session": state.session_id is not None
    }

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return PlainTextResponse("AI Products Studio Web App Ready")

@app.get("/products")
@app.get("/projects")
def read_products():
    # Support both products.html or projects.html seamlessly
    products_path = os.path.join(static_dir, "products.html")
    if os.path.exists(products_path):
        return FileResponse(products_path)
    legacy_path = os.path.join(static_dir, "projects.html")
    if os.path.exists(legacy_path):
        return FileResponse(legacy_path)
    return PlainTextResponse("Products page not found")

