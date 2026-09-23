import os
import io
import re
import requests
from typing import Optional, Dict, Any, AsyncIterable
from dotenv import load_dotenv
import edge_tts

load_dotenv()

# Cloudflare Whisper Model IDs
CLOUDFLARE_WHISPER_MODELS = [
    "@cf/openai/whisper-large-v3-turbo",
    "@cf/openai/whisper"
]

# Curated Neural Voice Profiles for Studio Characters & Narration
VOICE_PROFILES = {
    "narrator": {
        "id": "en-US-ChristopherNeural",
        "name": "Christopher (Epic Narrator)",
        "role": "Narrator",
        "gender": "Male",
        "description": "Deep, authoritative, cinematic storytelling voice. Ideal for storybook and comic panel narration.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    },
    "hero": {
        "id": "en-US-GuyNeural",
        "name": "Guy (Action Hero)",
        "role": "Protagonist",
        "gender": "Male",
        "description": "Dynamic, courageous, expressive voice for action heroes and energetic characters.",
        "default_rate": "+4%",
        "default_pitch": "+0Hz"
    },
    "heroine": {
        "id": "en-US-JennyNeural",
        "name": "Jenny (Vibrant Heroine)",
        "role": "Female Protagonist",
        "gender": "Female",
        "description": "Warm, spirited, bright voice for female leads and adventurous characters.",
        "default_rate": "+2%",
        "default_pitch": "+0Hz"
    },
    "villain": {
        "id": "en-US-EricNeural",
        "name": "Eric (Gritty Villain)",
        "role": "Antagonist",
        "gender": "Male",
        "description": "Ominous, menacing, gritty tone for dramatic antagonists and villains.",
        "default_rate": "-3%",
        "default_pitch": "-12Hz"
    },
    "sidekick": {
        "id": "en-US-AnaNeural",
        "name": "Ana (Playful Sidekick)",
        "role": "Sidekick / Young Hero",
        "gender": "Female",
        "description": "Light, speedy, energetic companion voice for comedy, robots, and young sidekicks.",
        "default_rate": "+6%",
        "default_pitch": "+4Hz"
    },
    "british-story": {
        "id": "en-GB-SoniaNeural",
        "name": "Sonia (Classic Storyteller)",
        "role": "Classic Narrator",
        "gender": "Female",
        "description": "Refined, eloquent British narrator voice for fairy tales, mysteries, and classic lore.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    }
}


def clean_text_for_speech(raw_text: str) -> str:
    """Prepares text for natural speech synthesis by removing formatting artifacts."""
    if not raw_text:
        return ""
    
    cleaned = raw_text
    # Remove markdown headers and emphasis
    cleaned = re.sub(r'#{1,6}\s*', '', cleaned)
    cleaned = re.sub(r'\*{1,3}([^*]+)\*{1,3}', r'\1', cleaned)
    cleaned = re.sub(r'`{1,3}[^`]*`{1,3}', '', cleaned)
    
    # Clean up comic sound effect shouts so they sound natural or can be punctuated
    cleaned = re.sub(r'\b([A-Z]{3,8})!\b', r'\1...', cleaned)
    
    # Remove multiple whitespace and empty lines
    cleaned = re.sub(r'\n{2,}', '\n', cleaned)
    return cleaned.strip()


# ── SPEECH-TO-TEXT (STT) ENGINE ──

def transcribe_with_cloudflare(
    audio_bytes: bytes,
    account_id: Optional[str] = None,
    api_token: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Transcribes audio bytes using Cloudflare Workers AI Whisper models.
    Tries @cf/openai/whisper-large-v3-turbo first, then falls back to @cf/openai/whisper.
    """
    acc_id = account_id or os.getenv("CLOUDFLARE_ACCOUNT_ID")
    token = api_token or os.getenv("CLOUDFLARE_API_KEY") or os.getenv("CLOUDFLARE_API_TOKEN")

    if not acc_id or not token:
        return None

    headers = {
        "Authorization": f"Bearer {token.strip()}",
        "Content-Type": "application/octet-stream"
    }

    for model in CLOUDFLARE_WHISPER_MODELS:
        url = f"https://api.cloudflare.com/client/v4/accounts/{acc_id.strip()}/ai/run/{model}"
        try:
            resp = requests.post(url, headers=headers, data=audio_bytes, timeout=45)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("success", False) or "result" in data:
                    text = data.get("result", {}).get("text", "").strip()
                    if text:
                        return {
                            "success": True,
                            "text": text,
                            "provider": "cloudflare",
                            "model": model
                        }
            else:
                print(f"[Cloudflare Whisper {model} Error {resp.status_code}] {resp.text[:200]}")
        except Exception as e:
            print(f"[Cloudflare Whisper {model} Exception] {e}")

    return None


def transcribe_audio(
    audio_bytes: bytes,
    account_id: Optional[str] = None,
    api_token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Primary STT transcription router.
    Attempts Cloudflare Workers AI Whisper first.
    Returns structured result with transcription or informative fallback recommendation.
    """
    if not audio_bytes or len(audio_bytes) < 100:
        return {"success": False, "error": "Audio payload is too short or empty."}

    # 1. Cloudflare Workers AI Whisper
    cf_res = transcribe_with_cloudflare(audio_bytes, account_id, api_token)
    if cf_res:
        return cf_res

    # 2. Informative fallback for client-side processing
    return {
        "success": False,
        "error": "Cloudflare Whisper transcription was unavailable. Please ensure Cloudflare credentials are configured or use browser Speech Recognition.",
        "fallback_to_browser": True
    }


# ── TEXT-TO-SPEECH (TTS) ENGINE ──

def resolve_voice_id(voice_key: Optional[str]) -> str:
    """Resolves voice key or direct Azure voice ID to valid edge-tts voice."""
    if not voice_key:
        return VOICE_PROFILES["narrator"]["id"]
    
    if voice_key in VOICE_PROFILES:
        return VOICE_PROFILES[voice_key]["id"]
    
    # Check if voice_key is already a full Azure voice name (e.g. en-US-GuyNeural)
    for profile in VOICE_PROFILES.values():
        if profile["id"].lower() == voice_key.lower():
            return profile["id"]

    return voice_key


async def synthesize_speech_stream(
    text: str,
    voice: Optional[str] = "en-US-ChristopherNeural",
    rate: Optional[str] = "+0%",
    pitch: Optional[str] = "+0Hz"
) -> AsyncIterable[bytes]:
    """
    Streams synthesized MP3 audio chunks using edge-tts.
    Provides sub-second latency to first audio chunk.
    """
    voice_id = resolve_voice_id(voice)
    cleaned_text = clean_text_for_speech(text)

    if not cleaned_text:
        return

    communicate = edge_tts.Communicate(
        text=cleaned_text,
        voice=voice_id,
        rate=rate or "+0%",
        pitch=pitch or "+0Hz"
    )

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield chunk["data"]


def get_available_voices() -> Dict[str, Any]:
    """Returns curated voice profiles for client UI selection."""
    return {
        "voices": [
            {
                "key": key,
                "id": val["id"],
                "name": val["name"],
                "role": val["role"],
                "gender": val["gender"],
                "description": val["description"]
            }
            for key, val in VOICE_PROFILES.items()
        ],
        "default_narrator": "en-US-ChristopherNeural",
        "default_hero": "en-US-GuyNeural",
        "default_heroine": "en-US-JennyNeural"
    }
