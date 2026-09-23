import React, { useState } from 'react';
import { 
  Zap, 
  Lightbulb, 
  Compass, 
  RefreshCw, 
  Palette, 
  Settings, 
  Sparkles, 
  RotateCw,
  ChevronDown,
  Cloud,
  Mic,
  MicOff
} from 'lucide-react';
import { useAudioRecorder } from '../utils/useAudioRecorder';

const COMIC_STYLES = [
  { id: 'comic-modern', label: 'Modern Comic (Marvel/DC)' },
  { id: 'manga', label: 'Manga / Shonen Action' },
  { id: 'pop-art', label: 'Vintage Pop-Art (Lichtenstein)' },
  { id: 'pixar-3d', label: '3D Animated (Pixar Style)' },
  { id: 'noir', label: 'Graphic Novel Noir' },
  { id: 'watercolor', label: 'Storybook Watercolor' },
];

export default function GeneratorCapsule({
  product,
  topic,
  setTopic,
  onGenerate,
  onRevise,
  isGenerating,
  isRevising,
  genStatus,
  // Options moved to right side
  selectedStyle,
  onSelectStyle,
  selectedModel,
  onOpenSettings,
  cloudflareStatus,
  onGenerateAllPanels,
  generatingAll,
  allProgress
}) {
  const [revisionText, setRevisionText] = useState('');
  const isComic = product.slug === 'comic';
  const hasPanels = product.scenes && product.scenes.length > 0;

  // Voice Dictation (STT) hooks
  const promptRecorder = useAudioRecorder({
    onTranscript: (spokenText) => {
      setTopic((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
    },
    onError: (err) => console.warn('[Prompt Voice Error]:', err)
  });

  const revisionRecorder = useAudioRecorder({
    onTranscript: (spokenText) => {
      setRevisionText((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
    },
    onError: (err) => console.warn('[Revision Voice Error]:', err)
  });

  const handleReviseSubmit = (e) => {
    e.preventDefault();
    if (!revisionText.trim() || isRevising) return;
    onRevise(revisionText.trim());
    setRevisionText('');
  };

  return (
    <aside className="w-full lg:w-[380px] shrink-0 h-full min-h-0 rounded-[32px] border-2 border-[#ff7b2e]/50 bg-gradient-to-b from-white to-orange-50/30 dark:from-[#18141e]/98 dark:to-[#100e16]/98 shadow-[0_16px_40px_-8px_rgba(255,123,46,0.15),0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_40px_-8px_rgba(255,123,46,0.18),0_8px_30px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-colors">
      <div className="h-full min-h-0 flex flex-col p-4 sm:p-5 overflow-hidden">
        
        {/* Capsule Header */}
        <div className="pb-3 border-b border-black/[0.08] dark:border-white/[0.08] mb-3 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff7b2e]/15 text-[#ff7b2e] border border-[#ff7b2e]/30">
              AI Engine
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">
              {genStatus || 'Ready'}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff7b2e]" />
            <span>{product.name} Studio</span>
          </h3>
        </div>

        {/* Capsule Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
          
          {/* Topic Input Field with Voice STT */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Lightbulb className="w-3.5 h-3.5 text-[#ff7b2e]" />
                <span>Prompt &amp; Topic</span>
              </label>

              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={promptRecorder.toggleRecording}
                disabled={isGenerating || promptRecorder.isProcessing}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition cursor-pointer border ${
                  promptRecorder.isRecording
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-sm shadow-rose-500/30'
                    : promptRecorder.isProcessing
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border-black/10 dark:border-white/10 hover:border-orange-500 hover:text-orange-500'
                }`}
                title={promptRecorder.isRecording ? 'Click to stop voice recording' : 'Dictate prompt with Voice (STT)'}
              >
                {promptRecorder.isRecording ? (
                  <>
                    <Mic className="w-3 h-3 text-white animate-bounce" />
                    <span>Listening...</span>
                  </>
                ) : promptRecorder.isProcessing ? (
                  <>
                    <RotateCw className="w-3 h-3 animate-spin" />
                    <span>Transcribing...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3" />
                    <span>Voice Mic</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
                placeholder={promptRecorder.isRecording ? 'Speak now into your microphone...' : product.placeholder}
                className={`w-full bg-slate-50 dark:bg-white/[0.03] border rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none resize-none transition focus:ring-1 focus:ring-[#ff7b2e] disabled:opacity-50 ${
                  promptRecorder.isRecording 
                    ? 'border-rose-400 ring-2 ring-rose-400/20' 
                    : 'border-black/[0.08] dark:border-white/[0.1] focus:border-[#ff7b2e]'
                }`}
              />
              {promptRecorder.livePreview && (
                <div className="text-[11px] text-orange-600 dark:text-orange-400 font-medium px-2 py-1 italic animate-pulse">
                  Live: "{promptRecorder.livePreview}"
                </div>
              )}
            </div>
          </div>

          {/* Quick Topic Chips */}
          <div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              <Compass className="w-3.5 h-3.5 text-[#ff7b2e]" />
              <span>Try Ideas</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.chips && product.chips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(chip.prompt)}
                  disabled={isGenerating}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#ff7b2e]/15 border border-black/[0.06] hover:border-[#ff7b2e]/40 dark:bg-white/[0.04] dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-[#ff7b2e] dark:hover:text-[#ff7b2e] transition cursor-pointer text-left disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── ALL OPTIONS GROUPED ON THE RIGHT SIDE ── */}
          {isComic && (
            <div className="p-3.5 rounded-2xl bg-orange-500/[0.04] border border-orange-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Comic Studio Options</span>
                </span>
                <button
                  onClick={onOpenSettings}
                  className="p-1 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition"
                  title="Configure Cloudflare & Models"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Art Style Option */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Comic Art Style
                </label>
                <div className="relative">
                  <select
                    value={selectedStyle || 'comic-modern'}
                    onChange={(e) => onSelectStyle && onSelectStyle(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-[#11111a] border border-black/15 dark:border-white/15 text-slate-900 dark:text-white outline-none focus:border-orange-500 cursor-pointer shadow-sm"
                  >
                    {COMIC_STYLES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Model & Cloudflare Status */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Model Engine:</span>
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1 text-[11px] font-bold text-orange-500 hover:underline cursor-pointer"
                >
                  <Cloud className="w-3 h-3" />
                  <span>{selectedModel === 'flux-schnell' ? 'Cloudflare Flux 1' : selectedModel === 'sdxl-base' ? 'CF SDXL' : 'Instant Flux'}</span>
                  {cloudflareStatus?.ready_for_workers_ai && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Cloudflare Active" />
                  )}
                </button>
              </div>

              {/* Illustrate All Panels Button (only on right side) */}
              {hasPanels && (
                <button
                  type="button"
                  onClick={onGenerateAllPanels}
                  disabled={generatingAll}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 shadow-md shadow-orange-500/20 transition cursor-pointer"
                >
                  {generatingAll ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Illustrating Panels ({allProgress || 'Processing'})...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ Illustrate All Comic Panels</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* AI Revision Assistant with Voice Director Mode */}
          <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.08]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <RefreshCw className="w-3.5 h-3.5 text-[#ff7b2e]" />
                <span>AI Story Doctor (Revise)</span>
              </label>

              {/* Voice Revision Button */}
              <button
                type="button"
                onClick={revisionRecorder.toggleRecording}
                disabled={isRevising || isGenerating || revisionRecorder.isProcessing}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition cursor-pointer border ${
                  revisionRecorder.isRecording
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : revisionRecorder.isProcessing
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border-black/10 dark:border-white/10 hover:border-orange-500 hover:text-orange-500'
                }`}
                title={revisionRecorder.isRecording ? 'Click to stop voice revision' : 'Speak revision directions (STT)'}
              >
                {revisionRecorder.isRecording ? (
                  <>
                    <Mic className="w-3 h-3 text-white animate-bounce" />
                    <span>Listening...</span>
                  </>
                ) : revisionRecorder.isProcessing ? (
                  <>
                    <RotateCw className="w-3 h-3 animate-spin" />
                    <span>Transcribing...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3" />
                    <span>Voice</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleReviseSubmit} className="space-y-2">
              <input
                type="text"
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                disabled={isRevising || isGenerating}
                placeholder={revisionRecorder.isRecording ? 'Speak revision (e.g. "Add a talking robot pet")...' : "e.g. 'Add a curious cat sidekick'..."}
                className={`w-full bg-slate-50 dark:bg-white/[0.03] border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition disabled:opacity-50 ${
                  revisionRecorder.isRecording
                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                    : 'border-black/[0.08] dark:border-white/[0.1] focus:border-[#ff7b2e]'
                }`}
              />
              <button
                type="submit"
                disabled={isRevising || isGenerating || !revisionText.trim()}
                className="w-full py-1.5 px-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#ff7b2e] hover:border-[#ff7b2e]/40 transition disabled:opacity-50 cursor-pointer"
              >
                {isRevising ? 'Applying Revision...' : 'Apply Revision'}
              </button>
            </form>
          </div>

        </div>

        {/* Action Button at Bottom of Capsule */}
        <div className="pt-3 border-t border-black/[0.08] dark:border-white/[0.08] shrink-0">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#ff7b2e] to-amber-500 hover:from-[#ff6a14] hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#ff7b2e]/25 hover:shadow-[#ff7b2e]/40 transition transform active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Crafting...</span>
              </>
            ) : (
              <span>{product.btnText || 'GENERATE'}</span>
            )}
          </button>
        </div>

      </div>
    </aside>
  );
}
