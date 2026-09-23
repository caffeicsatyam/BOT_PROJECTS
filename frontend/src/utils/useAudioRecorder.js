import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../services/api';

/**
 * Custom React hook for microphone audio recording and speech-to-text transcription.
 * Features:
 * - MediaRecorder for backend Cloudflare Whisper STT
 * - Live real-time speech preview using Web Speech API (when available in Chrome/Edge)
 * - Automatic fallback if backend transcription is unavailable
 */
export function useAudioRecorder({ onTranscript, onError } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [livePreview, setLivePreview] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const liveTranscriptRef = useRef('');

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setLivePreview('');
      liveTranscriptRef.current = '';
      audioChunksRef.current = [];

      // 1. Initialize Browser Web Speech API for real-time live preview
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            liveTranscriptRef.current = current;
            setLivePreview(current);
          };

          recognition.onerror = (e) => {
            console.warn('[Web Speech API Warning]:', e.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('[Web Speech Init Warning]:', recErr);
        }
      }

      // 2. Initialize MediaRecorder for backend Whisper processing
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4' 
        : '';

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mimeType || 'audio/webm' 
        });

        let finalizedText = liveTranscriptRef.current.trim();

        try {
          // Attempt backend Cloudflare Whisper transcription
          const result = await transcribeAudio(audioBlob);
          if (result && result.success && result.text) {
            finalizedText = result.text.trim();
          }
        } catch (err) {
          console.info('Backend Whisper skipped or failed, using live recognition text:', err.message);
        } finally {
          setIsProcessing(false);
          setLivePreview('');
          if (finalizedText) {
            onTranscript?.(finalizedText);
          } else if (!liveTranscriptRef.current) {
            onError?.('No speech detected. Please check microphone and try again.');
          }
        }
      };

      mediaRecorder.start(250); // Capture chunks every 250ms
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start microphone recording:', err);
      onError?.(err.name === 'NotAllowedError' 
        ? 'Microphone permission denied. Please allow microphone access in your browser settings.' 
        : 'Could not access microphone.');
      setIsRecording(false);
    }
  }, [onTranscript, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    livePreview,
    startRecording,
    stopRecording,
    toggleRecording
  };
}
