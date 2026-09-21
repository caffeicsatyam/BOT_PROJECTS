import uuid
import streamlit as st
from google.adk.agents.run_config import GetSessionConfig, RunConfig
from google.adk.runners import InMemoryRunner
from google.genai import types

from agent import root_agent

# Page configuration
st.set_page_config(
    page_title="AI Comic Story Studio",
    page_icon="🎨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (Modern Black & Orange Studio Theme)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }

    h1, h2, h3, h4, h5, h6 {
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        letter-spacing: -0.02em;
    }

    /* Hero Banner Styling */
    .hero-container {
        background: linear-gradient(135deg, rgba(20, 20, 24, 0.95) 0%, rgba(35, 20, 15, 0.9) 50%, rgba(25, 15, 10, 0.95) 100%);
        border: 1px solid rgba(255, 107, 0, 0.4);
        border-radius: 18px;
        padding: 24px 28px;
        margin-bottom: 24px;
        box-shadow: 0 10px 30px -5px rgba(255, 107, 0, 0.15);
        backdrop-filter: blur(12px);
    }
    .hero-title {
        font-size: 2.3rem;
        font-weight: 800;
        background: linear-gradient(90deg, #FF4500, #FF7A00, #FFA500, #FFC837);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 6px;
    }
    .hero-subtitle {
        color: #CBD5E1;
        font-size: 1.05rem;
        margin-bottom: 14px;
    }
    .badge-pill {
        display: inline-block;
        padding: 5px 14px;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-right: 8px;
        margin-bottom: 4px;
        background: rgba(255, 107, 0, 0.15);
        color: #FF9436;
        border: 1px solid rgba(255, 107, 0, 0.35);
    }

    /* Text Area & Input Styling */
    .stTextArea textarea {
        font-family: 'Plus Jakarta Sans', sans-serif !important;
        font-size: 0.96rem !important;
        line-height: 1.65 !important;
        border-radius: 14px !important;
        border: 1.5px solid rgba(255, 107, 0, 0.3) !important;
        padding: 16px !important;
        transition: all 0.25s ease-in-out !important;
        background-color: rgba(18, 18, 22, 0.7) !important;
        color: #F8FAFC !important;
    }
    .stTextArea textarea:focus {
        border-color: #FF7700 !important;
        box-shadow: 0 0 0 3.5px rgba(255, 119, 0, 0.3) !important;
        background-color: rgba(10, 10, 14, 0.95) !important;
    }

    .stTextInput input {
        border-radius: 12px !important;
        padding: 10px 14px !important;
        border: 1.5px solid rgba(255, 107, 0, 0.3) !important;
        transition: all 0.2s ease-in-out !important;
        background-color: rgba(18, 18, 22, 0.7) !important;
        color: #F8FAFC !important;
    }
    .stTextInput input:focus {
        border-color: #FF7700 !important;
        box-shadow: 0 0 0 3.5px rgba(255, 119, 0, 0.3) !important;
        background-color: rgba(10, 10, 14, 0.95) !important;
    }

    /* Primary & Secondary Buttons */
    div[data-testid="stButton"] > button[kind="primary"] {
        background: linear-gradient(135deg, #FF4500 0%, #FF7700 50%, #FFA000 100%) !important;
        color: #FFFFFF !important;
        border: none !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 16px rgba(255, 85, 0, 0.35) !important;
        transition: all 0.2s ease !important;
        border-radius: 12px !important;
    }
    div[data-testid="stButton"] > button[kind="primary"]:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 20px rgba(255, 85, 0, 0.5) !important;
    }

    div[data-testid="stButton"] > button[kind="secondary"] {
        border: 1px solid rgba(255, 107, 0, 0.35) !important;
        background: rgba(22, 22, 28, 0.8) !important;
        color: #F8FAFC !important;
        border-radius: 12px !important;
        transition: all 0.2s ease !important;
    }
    div[data-testid="stButton"] > button[kind="secondary"]:hover {
        border-color: #FF7700 !important;
        color: #FFA500 !important;
        background: rgba(35, 25, 20, 0.9) !important;
    }

    /* Container Card borders */
    div[data-testid="stVerticalBlockBorderWrapper"] {
        border-color: rgba(255, 107, 0, 0.25) !important;
        border-radius: 16px !important;
        background: rgba(18, 18, 24, 0.4) !important;
    }

    /* Stats Box in Sidebar */
    .stat-box {
        background: rgba(20, 20, 26, 0.9);
        border: 1px solid rgba(255, 107, 0, 0.3);
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 8px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .stat-number {
        font-size: 1.35rem;
        font-weight: 800;
        color: #FF8800;
    }
    .stat-label {
        font-size: 0.75rem;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 600;
    }

    /* Tabs Styling */
    button[data-baseweb="tab"] {
        font-weight: 600 !important;
    }
    button[data-baseweb="tab"][aria-selected="true"] {
        color: #FF7700 !important;
        border-bottom-color: #FF7700 !important;
    }
</style>
""", unsafe_allow_html=True)

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
    """Forget the session so the student can start a brand new story."""
    for key in ("runner", "session_id", "story", "editor_source", "story_editor", "topic_input", "change_input"):
        st.session_state.pop(key, None)


# --- SIDEBAR ---
with st.sidebar:
    st.markdown("### 🎨 Comic Studio Controls")
    
    # Story Quick Stats if story exists
    current_story = st.session_state.get("story", "")
    if current_story:
        words = len(current_story.split())
        chars = len(current_story)
        read_time_min = max(1, round(words / 150))
        
        st.markdown("##### 📊 Story Metrics")
        col_s1, col_s2 = st.columns(2)
        with col_s1:
            st.markdown(f"""
            <div class="stat-box">
                <div class="stat-number">{words}</div>
                <div class="stat-label">Words</div>
            </div>
            """, unsafe_allow_html=True)
        with col_s2:
            st.markdown(f"""
            <div class="stat-box">
                <div class="stat-number">~{read_time_min}m</div>
                <div class="stat-label">Read Time</div>
            </div>
            """, unsafe_allow_html=True)
        
        st.divider()
        st.markdown("##### 📥 Export Story")
        st.download_button(
            label="💾 Download Markdown (.md)",
            data=current_story,
            file_name="comic_story.md",
            mime="text/markdown",
            use_container_width=True
        )
        st.download_button(
            label="📄 Download Plain Text (.txt)",
            data=current_story,
            file_name="comic_story.txt",
            mime="text/plain",
            use_container_width=True
        )

    st.divider()
    st.markdown("##### 💡 Story Spark Ideas")
    preset_topics = [
        "🤖 A friendly robot joins 5th grade",
        "🚀 Space detective cat solves mysteries",
        "🐉 A tiny dragon who forgot how to breathe fire",
        "⏳ A magical lunchbox that travels in time",
        "🌲 The secret treehouse with talking animals"
    ]
    for idea in preset_topics:
        if st.button(idea, key=f"idea_{idea}", use_container_width=True):
            st.session_state.topic_input = idea.split(" ", 1)[1] if " " in idea else idea
            st.rerun()

    st.divider()
    if st.session_state.get("story"):
        if st.button("🗑️ Start Brand New Story", type="secondary", use_container_width=True):
            reset_story()
            st.toast("Cleared canvas! Starting fresh.", icon="✨")
            st.rerun()

    model_name = getattr(root_agent, "model", "gemini-3.5-flash")
    st.caption(f"⚡ {model_name} • Multi-turn Memory Active")


# --- MAIN CONTENT ---

# Hero Header
st.markdown("""
<div class="hero-container">
    <div class="hero-title">AI Comic Story Studio 🎨</div>
    <div class="hero-subtitle">Design engaging, moral-driven comic stories for school students with interactive AI pair-writing.</div>
    <div>
        <span class="badge-pill">✨ Instant Generation</span>
        <span class="badge-pill">✏️ Live Edit & Polish</span>
        <span class="badge-pill">🪄 Interactive AI Director</span>
        <span class="badge-pill">🧠 8-Turn Memory</span>
    </div>
</div>
""", unsafe_allow_html=True)

# Flash Messages
flash = st.session_state.pop("flash", None)
if flash:
    getattr(st, flash[0])(flash[1])

# Step 1: Topic Input Area (Card Container)
with st.container(border=True):
    st.markdown("#### 💡 1. Choose your comic story theme")
    col_input, col_btn = st.columns([5, 1.5], vertical_alignment="bottom")
    
    with col_input:
        default_topic = st.session_state.get("topic_input", "")
        topic = st.text_input(
            "What should the story be about?",
            value=default_topic,
            key="topic_field",
            placeholder="e.g., A kid who discovers their pet dog can code games..."
        )
    
    with col_btn:
        generate_clicked = st.button("✨ Generate", type="primary", use_container_width=True)

    if generate_clicked:
        if not topic.strip():
            st.toast("Please enter a story topic first!", icon="⚠️")
        else:
            with st.spinner("🎨 Illustrating and writing your comic script..."):
                st.session_state.story = ask_ai(topic)
                st.session_state.editor_source = None
                st.session_state.topic_input = topic
            st.toast("Comic generated successfully!", icon="🎉")
            st.rerun()


# Step 2: Story Display & Editor if story exists
if st.session_state.get("story"):
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Sync editor source
    if st.session_state.get("editor_source") != st.session_state.story:
        st.session_state.story_editor = st.session_state.story
        st.session_state.editor_source = st.session_state.story

    tab_reader, tab_editor = st.tabs(["📖 Comic Story Reader", "✏️ Full Story Editor"])

    with tab_reader:
        with st.container(border=True):
            st.markdown(st.session_state.story)

    with tab_editor:
        with st.container(border=True):
            st.caption("📝 Edit the script directly below. Your edits are saved into the AI's context.")
            
            edited_text = st.text_area(
                "Story Script Editor",
                key="story_editor",
                height=380,
                label_visibility="collapsed"
            )
            
            col_save, col_char_count = st.columns([2, 4], vertical_alignment="center")
            with col_save:
                if st.button("💾 Save My Edits", type="primary"):
                    st.session_state.story = st.session_state.story_editor
                    st.session_state.editor_source = st.session_state.story
                    st.toast("Your edits have been saved!", icon="✅")
                    st.rerun()
            with col_char_count:
                st.caption(f"Characters: **{len(edited_text)}** | Words: **{len(edited_text.split())}**")

    # Step 3: AI Story Director / Revisions
    st.markdown("<br>", unsafe_allow_html=True)
    with st.container(border=True):
        st.markdown("#### 🪄 2. Direct the AI to refine or change the story")
        st.caption("The AI will apply your changes while keeping all your custom manual edits intact.")

        # Quick revision prompt presets
        st.markdown("**Quick Preset Tweaks:**")
        preset_cols = st.columns(4)
        quick_presets = [
            ("🤣 Make it funnier", "Make the dialogue funnier with witty banter and silly jokes"),
            ("⚡ Add a plot twist", "Add a surprising and exciting plot twist in the middle scene"),
            ("🦸 Add superpowers", "Give one of the characters an unexpected silly superpower"),
            ("🎨 Richer scene details", "Add vivid comic scene sound effects (e.g., BAM!, WHOOSH!) and descriptive panel notes")
        ]
        
        selected_quick_tweak = None
        for i, (label, tweak_prompt) in enumerate(quick_presets):
            with preset_cols[i]:
                if st.button(label, key=f"quick_tweak_{i}", use_container_width=True):
                    selected_quick_tweak = tweak_prompt

        col_rev_in, col_rev_btn = st.columns([5, 1.5], vertical_alignment="bottom")
        with col_rev_in:
            change_input = st.text_input(
                "Describe your custom modification:",
                value=selected_quick_tweak or "",
                placeholder="e.g., Make the ending more emotional and add a pet robot",
                key="change_box"
            )
        
        with col_rev_btn:
            apply_clicked = st.button("🪄 Apply Change", type="primary", use_container_width=True)

        # Trigger on apply or when a quick preset button is clicked directly
        target_change = change_input if apply_clicked else selected_quick_tweak

        if target_change and (apply_clicked or selected_quick_tweak):
            with st.spinner("✨ Refining comic script with your changes..."):
                current_story_content = st.session_state.get("story_editor") or st.session_state.story
                st.session_state.story = ask_ai(
                    REVISION_MESSAGE.format(story=current_story_content, change=target_change)
                )
                st.session_state.editor_source = None
            st.toast("Story updated with new changes!", icon="🎉")
            st.rerun()