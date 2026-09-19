# AI Comic Story Generator

A Streamlit-based AI application that creates short, school-friendly comic stories from a topic and then lets a student refine the story by editing it or requesting specific changes.

The project uses Google ADK (Agent Development Kit) with a Gemini model to generate and revise story content while maintaining a lightweight memory of the current session.

## Overview

This project is designed for classroom or learning scenarios where a student can:

- type a topic such as "A robot joins a school"
- generate a complete comic story with characters, scenes, and a moral
- edit the story manually inside the app
- ask the AI to apply a new change while keeping the rest of the story intact
- start a fresh story at any time

The app is intentionally simple and interactive, making it a good starter project for AI-powered creative writing tools.

## Features

- Topic-based story generation
- AI-assisted revision of the current story
- Manual editing of the generated story in a text area
- Session memory so the AI remembers the story while the browser session remains open
- Short, positive, school-safe story content
- Clean interface built with Streamlit

## Tech Stack

- Python
- Streamlit
- Google Agent Development Kit (ADK)
- Google GenAI / Gemini model
- dotenv for environment variable loading

## Project Structure

```text
BOT_RAG/
├── README.md
├── requirements.txt
├── ai_story_generator/
│   ├── agent.py
│   └── app.py
└── .env
```

### Files

- `README.md`: project documentation
- `requirements.txt`: Python dependencies
- `ai_story_generator/agent.py`: defines the root AI agent and the story-writing prompt
- `ai_story_generator/app.py`: Streamlit UI and session logic
- `.env`: local environment variables such as API keys (not committed to version control)

## Prerequisites

Before running the app, make sure you have:

- Python 3.10 or newer
- A Google API key or valid Gemini access configured in your environment
- A local terminal with access to the project folder

## Installation

1. Open a terminal in the project root.
2. Create and activate a virtual environment:

```bash
python -m venv .venv
```

On Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

3. Install the dependencies:

```bash
pip install -r requirements.txt
```

## Environment Setup

Create a `.env` file in the project root with your Google API configuration, for example:

```env
GOOGLE_API_KEY=your_api_key_here
```

If your environment uses a different variable name for the Google API client, adjust the file accordingly. The app loads environment variables using Python-dotenv in the agent configuration.

## Running the App

From the project root, switch into the app folder and start Streamlit:

```bash
cd ai_story_generator
streamlit run app.py
```

Then open the local URL shown in the terminal, typically:

```text
http://localhost:8501
```

## How It Works

### 1. Story generation

The user enters a topic in the Streamlit interface. The app sends the request to the configured Gemini agent.

### 2. Agent behavior

The agent in `ai_story_generator/agent.py` is instructed to:

- write a complete comic story from a topic
- return the story in exactly four sections: Title, Characters, Comic Scenes, and Moral
- keep the tone positive, school-appropriate, and easy for students to understand
- limit the story to a clear, readable comic format

### 3. Revision flow

When the student saves edits or asks for a change, the app sends the current story plus the requested modification to the model. The prompt tells the model to treat the current story as the latest valid version and make only the requested changes while preserving everything else.

### 4. Session memory

The app keeps a runner and session in `st.session_state`, allowing the AI to remember the current story while the user stays on the page. This gives a natural editing and revision experience.

## Usage Guide

### Generate a new story

1. Enter a comic topic.
2. Click "✨ Generate Comic".
3. Review the generated story.

### Edit the story manually

1. Update the text in the story editor box.
2. Click "💾 Save my edits".
3. The app keeps your updated version for the next AI revision.

### Ask for a story change

1. Type a change request such as "make the ending funnier" or "add a new character".
2. Click "🪄 Apply change".
3. The model rewrites the full story with the requested update applied.

### Start over

- Click "🆕 Start a new story" to reset the session and create a brand-new comic.

## Example Prompt

```text
A robot joins a school
```

Example revision request:

```text
make the ending more exciting and add a friendly helper character
```

## Troubleshooting

### Streamlit does not start

Make sure dependencies are installed:

```bash
pip install -r requirements.txt
```

Also confirm that you are in the correct folder and that your virtual environment is activated.

### AI requests fail

Check that your Google API key is set correctly in `.env` and that the environment is loaded before launching the app.

### Import errors

If Python cannot find modules, verify that the package installation succeeded and that you are running the app from the correct directory.

## Notes

This project is intentionally lightweight and educational. It works well as a starter app for AI-assisted writing, classroom demos, or experimentation with agent-driven storytelling.

## License

No explicit license file is included in the repository. If you plan to share or publish this project, add an appropriate license before distribution.
