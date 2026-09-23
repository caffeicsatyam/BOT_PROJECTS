import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Users, 
  Film, 
  BookOpen, 
  Sparkles, 
  Award, 
  FileEdit, 
  Image as ImageIcon, 
  FileText,
  Play,
  Pause,
  Headphones,
  RotateCw,
  Volume2
} from 'lucide-react';
import VisualComicStrip from './VisualComicStrip';
import { comicSound } from '../utils/soundEffects';
import { synthesizeSpeechBlob } from '../services/api';

export default function StoryMiddlePane({
  product,
  onCopy,
  onDownload,
  onUpdateRawText,
  onBackToDashboard,
  // Image generation & visual state
  panelImages,
  onGeneratePanelImage,
  generatingPanels,
  selectedStyle,
  selectedModel
}) {
  const [copied, setCopied] = useState(false);
  const isComic = product.slug === 'comic';
  const [viewMode, setViewMode] = useState('visual');

  // Neural TTS Audiobook Narration State
  const audioRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('en-US-ChristopherNeural');
  const [speechRate, setSpeechRate] = useState('+0%');
  const [audioUrl, setAudioUrl] = useState(null);
  const [cachedKey, setCachedKey] = useState('');

  // Stop audio on unmount or raw text change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTogglePlay = async () => {
    if (!product.rawText) return;

    const currentKey = `${product.rawText.length}_${selectedVoice}_${speechRate}`;

    // If already playing, pause it
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    // If cached audio matches current text & settings, resume
    if (audioUrl && cachedKey === currentKey && audioRef.current) {
      audioRef.current.play();
      setIsPlayingAudio(true);
      return;
    }

    // Synthesize new audio via backend edge-tts
    try {
      setIsSynthesizing(true);
      const url = await synthesizeSpeechBlob({
        text: product.rawText,
        voice: selectedVoice,
        rate: speechRate
      });

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setIsSynthesizing(false);
      };

      audioRef.current = audio;
      setAudioUrl(url);
      setCachedKey(currentKey);
      await audio.play();
      setIsPlayingAudio(true);
    } catch (err) {
      console.error('Audio synthesis failed:', err);
      alert('Could not synthesize speech: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopyClick = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = product.rawText ? product.rawText.trim().split(/\s+/).filter(Boolean).length : 0;
  const ProductIcon = isComic ? Film : BookOpen;
  const hasContent = Boolean(product.rawText || (product.scenes && product.scenes.length > 0));

  // Format sound effects and dialogue in script view with interactive audio playback
  const renderPanelText = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      const isDialogue = trimmed.includes('"') || trimmed.includes('“');
      const parts = trimmed.split(/(\*\*[A-Z0-9!?-]+\*\*)/gi);

      return (
        <div
          key={idx}
          className={`text-xs sm:text-[13px] leading-relaxed ${
            isDialogue
              ? 'text-amber-900 dark:text-amber-100 font-medium pl-3 border-l-2 border-[#ff7b2e]/60 my-1.5 bg-[#ff7b2e]/10 dark:bg-[#ff7b2e]/5 py-1.5 rounded-r-lg'
              : 'text-slate-700 dark:text-slate-300 my-0.5'
          }`}
        >
          {parts.map((p, pIdx) => {
            if (/^\*\*[A-Z0-9!?-]+\*\*$/i.test(p)) {
              const cleanSfx = p.replace(/\*/g, '');
              const theme = comicSound.getVisualTheme(cleanSfx);
              return (
                <button
                  type="button"
                  key={pIdx}
                  onClick={() => comicSound.play(cleanSfx)}
                  title="Click to play comic sound effect! 🔊"
                  className={`inline-flex items-center gap-1 px-2 py-0.5 mx-1 font-black text-[11px] uppercase tracking-wider rounded-md bg-gradient-to-r ${theme.gradient} ${theme.textColor} border ${theme.border} shadow-sm transform -rotate-1 hover:rotate-0 hover:scale-110 active:scale-95 transition cursor-pointer select-none`}
                >
                  <span>{theme.emoji}</span>
                  <span>{cleanSfx}</span>
                </button>
              );
            }
            return p;
          })}
        </div>
      );
    });
  };

  return (
    <main className="flex-1 min-w-0 min-h-0 h-full overflow-y-auto bg-white dark:bg-[#0e0e16]/60 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-colors">
      
      {/* ── PANE HEADER ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 mb-1 font-medium">
            <button onClick={onBackToDashboard} className="hover:text-[#ff7b2e] cursor-pointer">Dashboard</button>
            {' / '}
            <span className="text-slate-400">Products</span>
            {' / '}
            <span className="text-slate-800 dark:text-slate-300 font-semibold">{product.name}</span>
          </div>

          <div className="flex items-center gap-3 my-1">
            <div className="w-9 h-9 rounded-xl bg-[#ff7b2e]/10 dark:bg-[#ff7b2e]/20 flex items-center justify-center text-[#ff7b2e] border border-[#ff7b2e]/30 shrink-0">
              <ProductIcon className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {product.title || product.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ff7b2e]/15 text-[#ff7b2e] border border-[#ff7b2e]/30 shrink-0">
              {product.badge?.split('•')[0]?.trim() || product.productType}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            {product.desc}
          </p>
        </div>

        {/* Action Buttons & Comic View Switcher */}
        {hasContent && (
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 shrink-0">
            {isComic && (
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08]">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'visual'
                      ? 'bg-white dark:bg-[#151522] text-orange-500 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Visual Strip</span>
                </button>
                <button
                  onClick={() => setViewMode('script')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'script'
                      ? 'bg-white dark:bg-[#151522] text-orange-500 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Script View</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.08] transition cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={onDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.08] transition cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── NEURAL AUDIOBOOK NARRATION BAR (TTS) ── */}
      {hasContent && !isComic && (
        <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500/[0.08] via-amber-500/[0.05] to-transparent border border-orange-500/25 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isSynthesizing || !product.rawText}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {isSynthesizing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause Story</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Listen to Story</span>
                </>
              )}
            </button>

            {/* Speaking Status / Equalizer */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Headphones className="w-4 h-4 text-orange-500" />
              <span>{isPlayingAudio ? 'Narrating Audiobook' : 'Studio Neural Narration'}</span>
              {isPlayingAudio && (
                <span className="flex items-end gap-0.5 h-3.5 ml-1">
                  <span className="w-1 bg-orange-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 bg-orange-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 bg-orange-500 rounded-full animate-bounce h-2.5" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          </div>

          {/* Voice Selector, Speed, and Download */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Voice Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Voice:</span>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                disabled={isPlayingAudio || isSynthesizing}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#161622] border border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <option value="en-US-ChristopherNeural">Christopher (Epic Male)</option>
                <option value="en-GB-SoniaNeural">Sonia (Classic British)</option>
                <option value="en-US-GuyNeural">Guy (Energetic Male)</option>
                <option value="en-US-JennyNeural">Jenny (Vibrant Female)</option>
              </select>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Speed:</span>
              {[
                { label: '0.8x', val: '-15%' },
                { label: '1.0x', val: '+0%' },
                { label: '1.2x', val: '+20%' }
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSpeechRate(s.val)}
                  disabled={isPlayingAudio || isSynthesizing}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer border ${
                    speechRate === s.val
                      ? 'bg-orange-500 text-white border-orange-600'
                      : 'bg-white dark:bg-[#161622] text-slate-600 dark:text-slate-300 border-black/10 dark:border-white/10 hover:border-orange-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Download MP3 */}
            {audioUrl && (
              <a
                href={audioUrl}
                download={`${product.title || 'ai_story'}_audiobook.mp3`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 hover:border-orange-500 hover:text-orange-500 transition shadow-sm"
                title="Download Narrated MP3 Audiobook"
              >
                <Download className="w-3 h-3" />
                <span>Save MP3</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── CONTENT AREA OR EMPTY STATE ── */}
      {!hasContent ? (
        <div className="flex flex-col items-center justify-center min-h-[380px] p-8 text-center rounded-2xl bg-slate-50/40 dark:bg-white/[0.015] border border-dashed border-black/10 dark:border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-[#ff7b2e]/10 text-[#ff7b2e] flex items-center justify-center mb-3">
            <ProductIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Studio Ready for Production
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-4">
            Enter your prompt or choose an idea in the panel on the right, then click <strong className="text-[#ff7b2e]">{product.btnText || 'GENERATE'}</strong> to create your content!
          </p>
          <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-white/[0.03] px-3 py-1 rounded-full border border-black/5 dark:border-white/5">
            ⚡ Powered by Google Gemini AI &amp; Cloudflare Free Models
          </span>
        </div>
      ) : isComic && viewMode === 'visual' ? (
        <VisualComicStrip
          product={product}
          selectedStyle={selectedStyle}
          panelImages={panelImages}
          onGeneratePanelImage={onGeneratePanelImage}
          generatingPanels={generatingPanels}
          selectedModel={selectedModel}
        />
      ) : (
        <div className="bg-slate-50/80 dark:bg-[#12121c]/80 rounded-xl border border-black/[0.08] dark:border-white/[0.08] p-5 space-y-6">
          {/* Title Bar */}
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff7b2e]" />
              <span>{isComic ? 'Comic Script Breakdown' : 'Story Narrative & Chapters'}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {wordCount} words
            </span>
          </div>

          {/* Character Cast */}
          {product.characters && product.characters.length > 0 && (
            <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] shadow-sm dark:shadow-none">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#ff7b2e]" />
                <span>Character Cast</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.characters.map((char, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#ff7b2e]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{char.name}:</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{char.trait || char.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapters / Comic Panels Grid */}
          <div className="space-y-3.5">
            {product.scenes && product.scenes.map((scene, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] p-4 hover:border-black/[0.12] dark:hover:border-white/[0.12] shadow-sm dark:shadow-none transition"
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#ff7b2e]/20 text-[#ff7b2e] text-[11px] font-bold font-mono flex items-center justify-center">
                      {scene.num || idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 tracking-wide uppercase">
                      {scene.heading || `Scene ${idx + 1}`}
                    </h4>
                  </div>
                </div>
                <div>
                  {renderPanelText(scene.content)}
                </div>
              </div>
            ))}
          </div>

          {/* Moral Lesson Banner */}
          {product.moral && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#ff7b2e]/10 border border-[#ff7b2e]/30">
              <div className="p-1.5 rounded-lg bg-[#ff7b2e]/20 text-[#ff7b2e] shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[11px] uppercase tracking-wider text-[#ff7b2e] block mb-0.5">
                  Moral Lesson
                </strong>
                <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                  "{product.moral}"
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── COMPLETE SCRIPT & RAW TEXT EDITOR (When content exists) ── */}
      {hasContent && (
        <div className="pt-6 border-t border-black/[0.08] dark:border-white/[0.08] mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
              <FileEdit className="w-3.5 h-3.5 text-[#ff7b2e]" />
              <span>Complete Script &amp; Editor</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Edit text directly anytime
            </span>
          </div>
          <textarea
            rows={6}
            value={product.rawText || ''}
            onChange={(e) => onUpdateRawText(e.target.value)}
            placeholder="Generated story content will appear here..."
            className="w-full bg-white dark:bg-[#07070b] border border-black/[0.1] dark:border-white/[0.08] focus:border-[#ff7b2e] rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-mono outline-none resize-none transition focus:ring-1 focus:ring-[#ff7b2e]"
          />
        </div>
      )}

    </main>
  );
}
