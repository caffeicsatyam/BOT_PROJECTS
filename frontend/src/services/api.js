// API service with session persistence and streaming support

const API_BASE = '/api';

// Retrieve or initialize session ID from localStorage
export function getSessionId() {
  let sid = localStorage.getItem('bot_rag_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('bot_rag_session_id', sid);
  }
  return sid;
}

export function resetLocalSession() {
  const newSid = 'sess_' + Math.random().toString(36).substring(2, 11);
  localStorage.setItem('bot_rag_session_id', newSid);
  return newSid;
}

export async function fetchState(productType = 'comic') {
  const sid = getSessionId();
  try {
    const res = await fetch(`${API_BASE}/state?product_type=${productType}&session_id=${sid}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch state:', err);
    return null;
  }
}

export async function resetServerSession(productType = 'comic') {
  const sid = getSessionId();
  try {
    await fetch(`${API_BASE}/reset?product_type=${productType}&session_id=${sid}`, {
      method: 'POST'
    });
  } catch (err) {
    console.warn('Could not reset server session:', err);
  }
  return resetLocalSession();
}

export async function saveEdits(story, productType = 'comic') {
  const sid = getSessionId();
  const res = await fetch(`${API_BASE}/save-edits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story, product_type: productType, session_id: sid })
  });
  if (!res.ok) throw new Error(`Save failed: ${res.statusText}`);
  return await res.json();
}

// Streaming generator for new story or revision
export async function streamStory({
  endpoint = 'generate-stream',
  payload,
  onStatus,
  onChunk,
  onDone,
  onError
}) {
  const sid = getSessionId();
  const body = { ...payload, session_id: sid };

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Server responded with ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'status') {
              onStatus?.(data.text);
            } else if (data.type === 'chunk') {
              onChunk?.(data.text);
            } else if (data.type === 'done') {
              onDone?.(data);
            } else if (data.type === 'error') {
              onError?.(new Error(data.detail || 'Streaming error'));
            }
          } catch (e) {
            console.warn('Error parsing SSE event:', e, trimmed);
          }
        }
      }
    }
  } catch (err) {
    onError?.(err);
  }
}

// ── NEURAL AUDIO SERVICES (STT & TTS) ──

/**
 * Sends recorded microphone audio to the backend Whisper STT endpoint
 */
export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  const res = await fetch(`${API_BASE}/stt/transcribe`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error(`STT request failed: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Retrieves the available curated neural voices from edge-tts
 */
export async function fetchTtsVoices() {
  try {
    const res = await fetch(`${API_BASE}/tts/voices`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch TTS voices:', err);
    return { voices: [] };
  }
}

/**
 * Synthesizes speech using edge-tts and returns an Audio object URL
 */
export async function synthesizeSpeechBlob({ text, voice = 'en-US-ChristopherNeural', rate = '+0%', pitch = '+0Hz' }) {
  const res = await fetch(`${API_BASE}/tts/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, rate, pitch })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `TTS failed with status ${res.status}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
