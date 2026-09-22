import os
import re
import urllib.parse
import base64
import requests
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Cloudflare Workers AI Free Tier Models
CLOUDFLARE_MODELS = {
    "flux-schnell": "@cf/black-forest-labs/flux-1-schnell",
    "sdxl-base": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    "sdxl-lightning": "@cf/bytedance/stable-diffusion-xl-lightning"
}

# Comic Art Styles with prompt engineering
STYLE_PRESETS = {
    "comic-modern": {
        "name": "Modern Comic (Marvel/DC)",
        "prompt_suffix": ", modern dynamic American comic book style, crisp ink lineart, vivid saturated colors, dynamic action camera angle, dramatic cinematic lighting, masterpiece comic book illustration, cel shaded, 8k resolution"
    },
    "manga": {
        "name": "Manga / Shonen",
        "prompt_suffix": ", Japanese shonen manga art style, clean dynamic line art, screentone shading, expressive dramatic action, anime graphic novel aesthetic, detailed illustration"
    },
    "pop-art": {
        "name": "Vintage Pop-Art (Roy Lichtenstein)",
        "prompt_suffix": ", vintage 1960s pop art comic style, Roy Lichtenstein aesthetic, bold black contour lines, benday dots, primary colors, retro newsprint comic texture"
    },
    "pixar-3d": {
        "name": "3D Animated (Pixar/Disney)",
        "prompt_suffix": ", 3D animated movie style, Pixar and Disney aesthetic, vibrant playful lighting, charming character proportions, smooth clean textures, cinematic render"
    },
    "noir": {
        "name": "Graphic Novel Noir",
        "prompt_suffix": ", gritty graphic novel noir style, high-contrast chiaroscuro shadows, Frank Miller Sin City aesthetic, deep black ink tones, moody atmospheric lighting"
    },
    "watercolor": {
        "name": "Storybook Watercolor",
        "prompt_suffix": ", whimsical graphic novel watercolor and ink, soft textured washes, children's storybook illustration, gentle warm palette, magical ambiance"
    }
}

def clean_scene_prompt(raw_text: str) -> str:
    """Extracts the visual description from a comic panel or narrative chapter."""
    if not raw_text:
        return "Action comic book scene"
    
    # Remove markdown bold/italics
    cleaned = re.sub(r'\*+', '', raw_text)
    
    # Remove sound effect shouts (e.g., BAM!, WHOOSH!) from prompt to avoid text garbling in diffusion
    cleaned = re.sub(r'\b[A-Z]{3,8}!\b', '', cleaned)
    
    # Extract dialogue or panel description
    lines = [line.strip() for line in cleaned.split('\n') if line.strip()]
    
    # Prefer descriptive line without quotes if available
    desc_lines = [l for l in lines if not (l.startswith('"') or l.startswith('“'))]
    if desc_lines:
        first_desc = desc_lines[0]
        # Remove "Scene 1: " prefix if present
        first_desc = re.sub(r'^(Panel|Scene)\s*\d+:\s*', '', first_desc, flags=re.IGNORECASE)
        # Limit to reasonable prompt length
        return first_desc[:250].strip()
    
    return cleaned[:250].strip()


def build_enhanced_prompt(base_prompt: str, style_key: str = "comic-modern") -> str:
    style = STYLE_PRESETS.get(style_key, STYLE_PRESETS["comic-modern"])
    cleaned = clean_scene_prompt(base_prompt)
    return f"{cleaned}{style['prompt_suffix']}"


def generate_with_cloudflare(
    prompt: str,
    account_id: str,
    api_token: str,
    model_alias: str = "flux-schnell",
    steps: int = 4
) -> Optional[Dict[str, Any]]:
    """Calls Cloudflare Workers AI REST API for text-to-image."""
    model_name = CLOUDFLARE_MODELS.get(model_alias, CLOUDFLARE_MODELS["flux-schnell"])
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model_name}"
    
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    payload: Dict[str, Any] = {
        "prompt": prompt
    }
    if "schnell" in model_name:
        payload["num_steps"] = steps  # schnell uses 4-8 steps
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=25)
        if response.status_code == 200:
            content_type = response.headers.get("content-type", "")
            # Cloudflare might return raw image bytes (PNG/JPEG) or JSON with base64 result
            if "image" in content_type:
                b64 = base64.b64encode(response.content).decode("utf-8")
                mime = content_type or "image/png"
                return {
                    "image_url": f"data:{mime};base64,{b64}",
                    "provider": "cloudflare",
                    "model": model_name
                }
            
            # JSON response format
            data = response.json()
            if data.get("success") and data.get("result"):
                img_b64 = data["result"].get("image")
                if img_b64:
                    return {
                        "image_url": f"data:image/jpeg;base64,{img_b64}",
                        "provider": "cloudflare",
                        "model": model_name
                    }
        else:
            print(f"[Cloudflare AI Error {response.status_code}] {response.text[:200]}")
    except Exception as e:
        print(f"[Cloudflare AI Exception] {e}")
    
    return None


def generate_with_free_fallback(
    prompt: str,
    model: str = "flux",
    width: int = 768,
    height: int = 768,
    seed: Optional[int] = None
) -> Dict[str, Any]:
    """
    100% Free Instant Text-to-Image Fallback using Pollinations.ai Flux engine.
    Requires no API keys, has no account requirement, and generates fast, high-quality images.
    """
    encoded_prompt = urllib.parse.quote(prompt)
    seed_str = f"&seed={seed}" if seed is not None else ""
    # Safe, school-appropriate comic parameters
    image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model={model}&width={width}&height={height}&nologo=true&enhance=false{seed_str}"
    
    return {
        "image_url": image_url,
        "provider": "free-instant-flux",
        "model": "flux-schnell"
    }


def generate_comic_image(
    prompt: str,
    style: str = "comic-modern",
    model: str = "flux-schnell",
    account_id: Optional[str] = None,
    api_token: Optional[str] = None,
    width: int = 768,
    height: int = 768
) -> Dict[str, Any]:
    """
    Main image generation dispatcher:
    1. Enhances comic prompt with selected visual style.
    2. Checks for Cloudflare credentials (either passed or in environment).
    3. Executes Cloudflare Workers AI free model.
    4. Automatically falls back to high-quality free Flux engine if Cloudflare is not configured or unavailable.
    """
    enhanced_prompt = build_enhanced_prompt(prompt, style)
    
    # Resolve credentials
    cf_token = api_token or os.getenv("CLOUDFLARE_API_KEY") or os.getenv("CLOUDFLARE_API_TOKEN")
    cf_account = account_id or os.getenv("CLOUDFLARE_ACCOUNT_ID")
    
    # Try Cloudflare Workers AI if credentials exist
    if cf_account and cf_token and model != "free-instant":
        cf_result = generate_with_cloudflare(
            prompt=enhanced_prompt,
            account_id=cf_account,
            api_token=cf_token,
            model_alias=model
        )
        if cf_result:
            return {
                "success": True,
                "image_url": cf_result["image_url"],
                "provider": "cloudflare",
                "model": cf_result["model"],
                "style": style,
                "enhanced_prompt": enhanced_prompt
            }
    
    # Free Instant Engine (Zero-Config fallback)
    fallback_result = generate_with_free_fallback(
        prompt=enhanced_prompt,
        model="flux",
        width=width,
        height=height
    )
    
    return {
        "success": True,
        "image_url": fallback_result["image_url"],
        "provider": fallback_result["provider"],
        "model": fallback_result["model"],
        "style": style,
        "enhanced_prompt": enhanced_prompt,
        "note": "Rendered via Zero-Config Free Flux Engine. Add Cloudflare Account ID to route through Cloudflare Workers AI." if not (cf_account and cf_token) else "Cloudflare fallback triggered."
    }
