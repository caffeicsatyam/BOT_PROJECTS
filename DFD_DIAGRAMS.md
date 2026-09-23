# System Flowcharts & Data Flow Diagrams — AI Creative Studio

Visual workflows, Data Flow Diagrams (DFD), and execution pipelines for the creative studio:

1. [AI Story Generator Flowchart & Audiobooks](#1-ai-story-generator-flowchart)
2. [AI Comic Book Generator Flowchart & Dialogue Voicing](#2-ai-comic-book-generator-flowchart)
3. [Full-Duplex Neural Audio Pipeline (STT & TTS)](#3-neural-audio-pipeline-flowchart-stt--tts)
4. [System Architecture & Data Flow (Level 1 DFD)](#4-system-data-flow-diagram-level-1-dfd)
5. [Key Highlights & Technology Stack](#5-key-highlights--technology-stack)

---

## 1. AI Story Generator Flowchart

```mermaid
flowchart TD
    A["👤 1. User Dictates Voice (Mic) or Types Story Topic"] --> B["🎙️ 2. STT Engine (Cloudflare Whisper / Web Speech)"]
    B --> C["⚡ 3. FastAPI Backend Routes Request to Agent"]
    C --> D["🧠 4. Google Gemini Flash Generates Story Narrative"]
    D --> E["📡 5. Real-Time Token Streaming (SSE) to Studio"]
    E --> F["📖 6. Formats Title, Characters, Chapters & Moral"]
    F --> G["🎧 7. Neural Audiobook Narration (Edge-TTS Christopher / Sonia)"]
    F --> H["✏️ 8. Direct Text Edit or Voice Revision Request"]
    H -.->|Voice / Text Change Request| C
```

### Story Steps Explained
1. **Creative Input (Voice or Text):** Creator dictates their idea via the **Voice Mic 🎙️** or selects a suggestion chip (e.g., *Whispering Clock*).
2. **Speech Transcription:** Cloudflare Workers AI Whisper Large v3 Turbo transcribes speech in real time with live Web Speech preview.
3. **Backend Processing:** FastAPI initializes session isolation and formats instructions for the `story_agent`.
4. **AI Generation:** Google Gemini Flash crafts a complete story structured with title, character profiles, 5–6 narrative chapters, and an uplifting moral.
5. **Live Token Streaming:** Server-Sent Events (SSE) stream the narrative word-by-word into the studio.
6. **Audiobook Player Bar:** Readers can listen to the full story narrated aloud with high-fidelity neural voices (`Christopher`, `Sonia`, `Guy`, `Jenny`), adjust reading speed (0.8x, 1.0x, 1.2x), and download the audiobook as an `.mp3`.
7. **Interactive Editing:** Creators can live-edit text or speak revision directions to the AI Story Doctor.

---

## 2. AI Comic Book Generator Flowchart

```mermaid
flowchart TD
    A["👤 1. Creator Dictates Plot, Selects Art Style & Model"] --> B["🧠 2. Gemini AI Writes 5-6 Panel Comic Script"]
    B --> C["✂️ 3. Script Parser Extracts Angles, Dialogues & SFX"]

    C --> D["🗣️ 4. Character Dialogue Voicing (TTS) + Comic SFX (BAM! ZAP!)"]
    C --> E["🎨 5. Illustrate Panels & Character Avatars"]

    E --> F["⚡ Cloudflare Workers AI (Flux / SDXL)"]
    E --> G["🌐 Free Zero-Config Flux Engine (Auto-Fallback)"]

    F --> H["🖼️ 6. Visual Comic Strip Reader with Speech Bubbles"]
    G --> H
    H --> I["✏️ 7. Live Edit Panels, Re-voice Lines or Voice-Revise"]
    I -.->|Targeted Panel Revision| B
```

### Comic Steps Explained
1. **Creative Prompt:** Creator specifies a comic idea by typing or using the **Voice Mic 🎙️**, chooses an art style (*Modern Marvel/DC, Manga, Pop-Art, Pixar 3D, Noir, Watercolor*), and selects the image model.
2. **Script Generation:** Gemini AI writes a cinematic 5–6 panel script complete with camera setups `[Camera: ...]`, narration captions, character quotes, and sound effect badges (**BAM!**, **WHOOSH!**, **ZAP!**).
3. **Dialogue Voicing & SFX:** Each speech bubble includes a **"Speak"** button powered by `edge-tts` character voices, synchronized with interactive Web Audio synthesizer sound effects.
4. **Visual Illustration:** Clicking *Illustrate Panel* or *Generate Avatars* routes the visual prompt through Cloudflare Workers AI (or the zero-config fallback engine).
5. **Strip Reader & Director Mode:** Renders visual panels with dialogue overlays, whole-panel read-aloud narration, and voice-driven scene revisions.

---

## 3. Neural Audio Pipeline Flowchart (STT & TTS)

```mermaid
flowchart LR
    subgraph Input_Phase ["🎙️ Speech-to-Text (STT)"]
        U["Creator Speaks into Mic"] --> MR["MediaRecorder (WebM/WAV)"]
        MR --> CFW["Cloudflare Workers AI\n(@cf/openai/whisper-large-v3-turbo)"]
        MR -.->|Fallback| WS["Web Speech API\n(webkitSpeechRecognition)"]
        CFW --> TXT["Transcribed Prompt / Revision"]
        WS --> TXT
    end

    subgraph Output_Phase ["🔊 Text-to-Speech (TTS)"]
        TXT2["Story Text / Speech Bubble"] --> TTS_API["FastAPI /api/tts/synthesize"]
        TTS_API --> ETTS["Edge-TTS Neural Synthesizer\n(Zero Token Cost / Unlimited)"]
        ETTS --> STR["Streaming MP3 Audio Chunks"]
        STR --> AB["Audiobook Player Bar\n(Play, Pause, Speed, Save MP3)"]
        STR --> CB["Comic Speech Bubble Read-Aloud"]
    end
```

---

## 4. System Data Flow Diagram (Level 1 DFD)

```mermaid
flowchart TD
    User(["👤 Student / Creator"])

    subgraph Studio_Frontend ["🖥️ React + Vite + Tailwind Frontend"]
        P1["1.0 UI State & Controls\n(Theme, Navigation, Product Switcher)"]
        P2["2.0 Voice Dictation Module\n(useAudioRecorder Hook)"]
        P3["3.0 Creative Visual Strip &\nSpeech Bubble Renderer"]
        P4["4.0 Audiobook Audio Bar\n(Player & Speed Controls)"]
    end

    subgraph Backend_FastAPI ["⚡ FastAPI Service (Port 8080)"]
        P5["5.0 Session Manager\n(UUID-Keyed State Isolation)"]
        P6["6.0 Script Generator Router\n(Google ADK Agent Runner)"]
        P7["7.0 Diffusion Image Dispatcher\n(Cloudflare + Flux Fallback)"]
        P8["8.0 Neural Audio Router\n(Whisper STT & Edge-TTS)"]
    end

    subgraph External_AI_Services ["🌐 Cloud & Edge AI Engines"]
        S1[("Google Gemini 3.5 Flash")]
        S2[("Cloudflare Workers AI\nFlux / SDXL / Whisper Turbo")]
        S3[("Zero-Config Flux Engine")]
        S4[("Edge-TTS Neural Voice Service\n(Azure Neural Speech Engine)")]
    end

    %% User Interactions
    User -->|"Mic Audio Input"| P2
    User -->|"Prompts & Settings"| P1
    P4 -->|"Audiobook Playback"| User
    P3 -->|"Visual Panels & SFX"| User

    %% Frontend to Backend
    P2 -->|"POST /api/stt/transcribe"| P8
    P1 -->|"POST /api/generate-stream"| P6
    P3 -->|"POST /api/generate-image"| P7
    P4 -->|"POST /api/tts/synthesize"| P8

    %% Backend to External Services
    P6 <-->|"Prompt & SSE Tokens"| S1
    P7 <-->|"Inference Request & B64"| S2
    P7 <-->|"Fallback Image URL"| S3
    P8 <-->|"Audio Bytes & Transcription"| S2
    P8 <-->|"Async Stream MP3 Chunks"| S4

    %% State persistence
    P6 <-->|"Read / Write Session"| P5
```

---

## 5. Key Highlights & Technology Stack

| Feature | Technology | Role | Free Allowance |
| :--- | :--- | :--- | :--- |
| **AI Scriptwriting** | Google Gemini 3.5 Flash + Google ADK | Structured narrative chapters & comic panel scripts | 1,500 requests/day, 1M TPM |
| **Live Streaming** | Server-Sent Events (SSE) & FastAPI | Sub-second word-by-word streaming generation | Included in backend |
| **Speech-to-Text (STT)** | Cloudflare Workers AI Whisper Large v3 Turbo | Voice-dictated prompts and voice revision instructions | 10,000 Neurons/day free |
| **STT Fallback** | Web Speech API (`SpeechRecognition`) | Instant real-time live preview & zero-config fallback | 100% Free / Client-side |
| **Neural TTS** | `edge-tts` (Microsoft Azure Neural Engine) | Studio audiobook narration & character dialogue voicing | 100% UNLIMITED / Zero API keys |
| **Voice Profiles** | Christopher, Sonia, Guy, Jenny, Eric | Distinct personalities for Narrators, Heroes, and Villains | Unlimited free synthesis |
| **AI Illustrations** | Cloudflare Workers AI (Flux / SDXL) | Zero-cost comic panel & character avatar generation | 10,000 Neurons/day free |
| **Fallback Diffusion** | Zero-Config Free Flux Engine | 100% reliable instant image generation fallback | Zero setup required |
| **Comic SFX** | Web Audio API (Sawtooth & Bandpass Filters) | Synthesized comic sound effects (**BAM!**, **ZAP!**) | 100% Free / Client-side |
| **Frontend UI** | React 19 + Tailwind CSS v4 & Lucide Icons | Responsive studio with dark/light themes & audio bar | High-performance SPA |
