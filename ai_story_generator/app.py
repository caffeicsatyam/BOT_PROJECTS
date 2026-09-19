import uuid

import streamlit as st
from google.adk.agents.run_config import GetSessionConfig, RunConfig
from google.adk.runners import InMemoryRunner
from google.genai import types

from agent import root_agent

st.set_page_config(
    page_title="AI Comic Story Generator",
    page_icon="📖"
)

APP_NAME = "comic_generator"
USER_ID = "student"

MEMORY_EVENTS = 8
REVISION_MESSAGE = """CURRENT STORY
{story}

STUDENT CHANGE REQUEST: {change}

Rewrite the complete comic story with this change applied."""


def get_runner():
    """Keep one runner and one in-memory session for the whole browser session."""
    if "runner" not in st.session_state:
        runner = InMemoryRunner(agent=root_agent, app_name=APP_NAME)
        session_id = "story-" + uuid.uuid4().hex[:8]

       
        runner.session_service.create_session_sync(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=session_id
        )

        st.session_state.runner = runner
        st.session_state.session_id = session_id

    return st.session_state.runner


def ask_ai(text):
    """Send one message to the agent and return its reply."""
    runner = get_runner()

    message = types.Content(
        role="user",
        parts=[types.Part(text=text)]
    )

    run_config = RunConfig(
        get_session_config=GetSessionConfig(num_recent_events=MEMORY_EVENTS)
    )

    reply = ""

    for event in runner.run(
        user_id=USER_ID,
        session_id=st.session_state.session_id,
        new_message=message,
        run_config=run_config
    ):
        if event.is_final_response() and event.content and event.content.parts:
            reply = event.content.parts[0].text

    return reply


def reset_story():
    """Forget the session so the student can start a brand new story.

    The 'story_editor' widget key is left alone on purpose: Streamlit clears it
    by itself as soon as the story box is no longer shown.
    """
    for key in ("runner", "session_id", "story", "editor_source"):
        st.session_state.pop(key, None)


st.title("📖 AI Comic Story Generator")
st.write("Create a fun comic story using AI, then change it until you love it!")
st.caption(
    "🧠 Short memory: while this page is open the AI remembers your story, "
    "so you can keep asking for changes and editing it yourself."
)

flash = st.session_state.pop("flash", None)
if flash:
    getattr(st, flash[0])(flash[1])

topic = st.text_input(
    "Enter your comic topic:",
    placeholder="Example: A robot joins a school"
)

if st.button("✨ Generate Comic"):
    if not topic:
        st.session_state.flash = ("warning", "Please enter a topic.")
        st.rerun()

    with st.spinner("Creating your comic..."):
        st.session_state.story = ask_ai(topic)
        # Make the story box load this new story.
        st.session_state.editor_source = None

    st.rerun()


if st.session_state.get("story"):
    st.divider()
    st.subheader("✏️ Your story - edit it yourself")
    st.caption("Fix words, add ideas or change characters by typing in the box below.")

    # Load the newest AI story into the box, but never overwrite the student's
    # own typing while the story itself has not changed.
    if st.session_state.get("editor_source") != st.session_state.story:
        st.session_state.story_editor = st.session_state.story
        st.session_state.editor_source = st.session_state.story

    st.text_area(
        "Your comic story:",
        key="story_editor",
        height=420
    )

    if st.button("💾 Save my edits"):
        st.session_state.story = st.session_state.story_editor
        st.session_state.editor_source = st.session_state.story
        st.session_state.flash = (
            "success",
            "Your edits are saved - the AI will use them next time."
        )
        st.rerun()

    st.divider()
    st.subheader("🤖 Ask the AI to change the story")
    st.caption("The AI starts from the story above, including your saved edits.")

    change = st.text_input(
        "What should change?",
        placeholder="Example: make the ending funnier"
    )

    if st.button("🪄 Apply change"):
        if not change:
            st.session_state.flash = ("warning", "Please write what you want to change.")
            st.rerun()

        with st.spinner("Changing your story..."):
            # Use the text in the box, so even unsaved edits are respected.
            current_story = st.session_state.get("story_editor") or st.session_state.story

            st.session_state.story = ask_ai(
                REVISION_MESSAGE.format(story=current_story, change=change)
            )
            st.session_state.editor_source = None

        st.rerun()

    if st.button("🆕 Start a new story"):
        reset_story()
        st.rerun()