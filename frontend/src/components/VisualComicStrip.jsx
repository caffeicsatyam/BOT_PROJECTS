import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  RotateCw, 
  Download, 
  Maximize2, 
  Users, 
  Award,
  BookOpen,
  Volume2,
  VolumeX
} from 'lucide-react';
import { comicSound } from '../utils/soundEffects';

export default function VisualComicStrip({
  product,
  selectedStyle,
  panelImages,
  onGeneratePanelImage,
  generatingPanels,
  selectedModel
}) {
  const [activeModalImage, setActiveModalImage] = useState(null);
  const [characterAvatars, setCharacterAvatars] = useState({});
  const [generatingAvatar, setGeneratingAvatar] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(comicSound.enabled);
  const [recentlyPlayedSfx, setRecentlyPlayedSfx] = useState(null);

  useEffect(() => {
    const unsub = comicSound.onToggle(setSoundEnabled);
    return unsub;
  }, []);

  const handleToggleSound = () => {
    const newState = comicSound.toggleSound();
    setSoundEnabled(newState);
  };

  const handlePlaySfx = (sfxText, e) => {
    if (e) e.stopPropagation();
    comicSound.play(sfxText);
    setRecentlyPlayedSfx(sfxText);
    setTimeout(() => {
      setRecentlyPlayedSfx(prev => (prev === sfxText ? null : prev));
    }, 450);
  };

  // Helper to extract dialogues, clean captions, visual directions, and sound effects
  const parsePanelDetails = (content) => {
    if (!content) return { dialogues: [], soundEffects: [], description: '', visualDirection: '' };
    
    // Normalize content
    const cleanContent = content
      .replace(/[-*•]?\s*\*\*Sound\s*Effects?:?\*\*\s*:?/gi, '')
      .replace(/[-*•]?\s*Sound\s*Effects?:?\s*:?/gi, '');

    const lines = cleanContent.split('\n').map(l => l.trim()).filter(Boolean);
    const dialogues = [];
    const soundEffects = [];
    let captionText = '';
    let visualText = '';
    const otherDescriptions = [];

    // 1. Extract sound effects across the content (e.g. **BAM!**, **ZZZT! CRUNCH!**)
    const rawSfxMatches = content.match(/\*\*([A-Z0-9!?\s-]+)\*\*/gi) || [];
    rawSfxMatches.forEach(raw => {
      const inner = raw.replace(/\*/g, '').trim();
      // Exclude labels like "Sound Effect:", "Camera:", "Scene 1:"
      if (/^(?:Sound\s+Effects?|Scene|Panel|Chapter|Camera)/i.test(inner)) return;
      
      // Tokenize if multiple sound effects are inside one bold tag (e.g. "ZZZT! CRUNCH!")
      const tokens = inner.split(/\s+/).filter(Boolean);
      tokens.forEach(token => {
        const clean = token.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9!?-]+$/g, '').trim();
        if (clean && clean.length >= 2 && !soundEffects.includes(clean)) {
          soundEffects.push(clean);
        }
      });
    });

    // 2. Parse lines for Dialogues, Captions, and Visual Directions
    lines.forEach(line => {
      // Ignore stripped empty labels
      if (/^[-*•]?\s*(?:Sound\s*Effects?:?|\*\*Sound\s*Effects?:?\*\*)\s*$/i.test(line)) return;

      // Extract explicit Captions (e.g. Caption: "...", Narrator: "...")
      const capMatch = line.match(/^(?:Caption|Narrator):\s*["“]?(.*?)["”]?$/i);
      if (capMatch) {
        captionText = capMatch[1].trim();
        return;
      }

      // Extract visual / camera angles (e.g. [Camera: ...], *Camera angle: ...*)
      if (/^(?:\[Camera|Camera\s*angle|\*Camera|\[Visual|Visual:)/i.test(line)) {
        const cleanVis = line.replace(/^\[|\]$/g, '').replace(/^\*|\*$/g, '').trim();
        if (!visualText) visualText = cleanVis;
        return;
      }

      // Dialogues: character speech with quotation marks
      if (line.includes('"') || line.includes('“')) {
        const strippedDlg = line.replace(/\*\*([A-Z0-9!?\s-]+)\*\*/gi, '').trim();
        if (strippedDlg) dialogues.push(strippedDlg);
      } else {
        // Descriptive narrative line
        const strippedDesc = line
          .replace(/\*\*([A-Z0-9!?\s-]+)\*\*/gi, '')
          .replace(/^\*|\*$/g, '')
          .trim();
        if (strippedDesc && strippedDesc.length > 3) {
          otherDescriptions.push(strippedDesc);
        }
      }
    });

    // Determine clean caption: prefer explicit caption, otherwise narrative description (not camera note)
    const finalCaption = captionText || (otherDescriptions.length > 0 ? otherDescriptions[0] : '');

    return {
      dialogues,
      soundEffects,
      description: finalCaption,
      visualDirection: visualText
    };
  };

  const handleGenerateAvatar = async (charName, charTrait, idx) => {
    setGeneratingAvatar(prev => ({ ...prev, [idx]: true }));
    try {
      const prompt = `Close-up comic portrait of ${charName}, character trait: ${charTrait}`;
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle || 'comic-modern',
          model: selectedModel || 'flux-schnell',
          width: 512,
          height: 512
        })
      });
      const data = await res.json();
      if (data.image_url) {
        setCharacterAvatars(prev => ({ ...prev, [idx]: data.image_url }));
      }
    } catch (err) {
      console.error('Avatar error:', err);
    } finally {
      setGeneratingAvatar(prev => ({ ...prev, [idx]: false }));
    }
  };

  // If no scenes yet, show clean empty state
  if (!product.scenes || product.scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-black/15 dark:border-white/15 my-6">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Your Comic Book Studio is Ready
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-4">
          Enter a topic or choose an idea in the panel on the right, select your comic art style, and click <strong>GENERATE COMIC SCRIPT</strong> to begin!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ── AUDIO CONTROL & SFX STATUS BAR ── */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
            <span>💥</span>
            <span>Interactive Comic Sound Engine</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            (Click any sound effect badge to play its cartoon audio)
          </span>
        </div>

        <button
          onClick={handleToggleSound}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
            soundEnabled
              ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
              : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-black/10 dark:border-white/10'
          }`}
          title={soundEnabled ? 'Click to mute comic SFX' : 'Click to enable comic SFX'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? 'SFX Audio: ON' : 'SFX Audio: OFF'}</span>
        </button>
      </div>

      {/* ── CHARACTER AVATARS BAR ── */}
      {product.characters && product.characters.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/10 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Users className="w-4 h-4 text-orange-500" />
              <span>Comic Character Cast</span>
            </div>
            <span className="text-[11px] text-slate-400">Click portrait to generate avatar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {product.characters.map((char, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-orange-500/30 transition group"
              >
                {/* Avatar Image / Placeholder */}
                <div 
                  onClick={() => handleGenerateAvatar(char.name, char.trait || char.description, idx)}
                  className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-white/10 shrink-0 cursor-pointer border border-black/10 dark:border-white/10 flex items-center justify-center group-hover:ring-2 group-hover:ring-orange-500/40 transition"
                  title="Click to generate character avatar"
                >
                  {characterAvatars[idx] ? (
                    <img src={characterAvatars[idx]} alt={char.name} className="w-full h-full object-cover" />
                  ) : generatingAvatar[idx] ? (
                    <RotateCw className="w-4 h-4 text-orange-500 animate-spin" />
                  ) : (
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {char.name.charAt(0)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[9px] text-white font-bold">
                    {characterAvatars[idx] ? 'Redo' : 'Gen'}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                    <span>{char.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight mt-0.5">
                    {char.trait || char.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── COMIC STRIP GRID (PANELS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {product.scenes && product.scenes.map((scene, idx) => {
          const { dialogues, soundEffects, description } = parsePanelDetails(scene.content);
          const hasImage = Boolean(panelImages[idx]);
          const isGeneratingThis = generatingPanels && generatingPanels[idx];

          return (
            <div
              key={idx}
              className="relative rounded-2xl bg-white dark:bg-[#101018] border-2 border-black/15 dark:border-white/15 overflow-hidden shadow-lg hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition flex flex-col group"
            >
              {/* Panel Top Header Bar */}
              <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between border-b-2 border-black/20">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white text-[10px] font-black tracking-wider uppercase">
                    PANEL {scene.num || idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">
                    {scene.heading || `Scene ${idx + 1}`}
                  </span>
                </div>

                {/* Panel Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onGeneratePanelImage(idx, scene)}
                    disabled={isGeneratingThis}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer disabled:opacity-50"
                    title={hasImage ? "Regenerate panel illustration" : "Generate panel illustration"}
                  >
                    {isGeneratingThis ? (
                      <RotateCw className="w-3 h-3 animate-spin text-orange-400" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-orange-400" />
                    )}
                    <span>{hasImage ? 'Regen' : 'Illustrate'}</span>
                  </button>

                  {hasImage && (
                    <>
                      <a
                        href={panelImages[idx]}
                        download={`comic-panel-${idx + 1}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
                        title="Download Panel"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => setActiveModalImage(panelImages[idx])}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
                        title="Enlarge Image"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ── PANEL ARTWORK FRAME ── */}
              <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-black/40 overflow-hidden flex items-center justify-center">
                
                {hasImage ? (
                  <img
                    src={panelImages[idx]}
                    alt={`Comic Panel ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
                    loading="lazy"
                  />
                ) : isGeneratingThis ? (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="w-10 h-10 rounded-full border-3 border-orange-500/20 border-t-orange-500 animate-spin" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Generating Illustration...
                    </span>
                    <span className="text-[10px] text-slate-400 max-w-xs line-clamp-1">
                      {scene.heading || description}
                    </span>
                  </div>
                ) : (
                  <div 
                    onClick={() => onGeneratePanelImage(idx, scene)}
                    className="flex flex-col items-center gap-2 p-6 text-center cursor-pointer hover:opacity-80 transition"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center border border-orange-500/30">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Illustrate Panel {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 max-w-xs">
                      Click to generate artwork
                    </span>
                  </div>
                )}

                {/* Sound Effect Floating Badges (Interactive Starburst) */}
                {soundEffects.length > 0 && (
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                    {soundEffects.map((sfx, sfxIdx) => {
                      const theme = comicSound.getVisualTheme(sfx);
                      const isRecentlyTriggered = recentlyPlayedSfx === sfx;

                      return (
                        <button
                          key={sfxIdx}
                          onClick={(e) => handlePlaySfx(sfx, e)}
                          title="Click to play comic sound effect! 🔊"
                          className={`group/sfx relative px-3 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl bg-gradient-to-r ${theme.gradient} ${theme.textColor} border-2 ${theme.border} shadow-lg ${theme.shadow} transform transition-all duration-150 cursor-pointer select-none active:scale-90 hover:scale-110 ${
                            sfxIdx % 2 === 0 ? '-rotate-3 hover:rotate-0' : 'rotate-3 hover:rotate-0'
                          } ${isRecentlyTriggered ? 'scale-125 ring-4 ring-yellow-400 animate-pulse' : ''}`}
                        >
                          <span className="flex items-center gap-1 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            <span className="text-xs">{theme.emoji}</span>
                            <span>{sfx}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Subtitle / Caption Narration at bottom of image if description exists */}
                {description && (
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-2 rounded-xl bg-black/85 backdrop-blur-md text-[11px] text-slate-200 border border-white/15 line-clamp-2 shadow-md">
                    <span className="font-black text-amber-300 mr-1 tracking-wide">CAPTION:</span>
                    {description}
                  </div>
                )}

              </div>

              {/* ── PANEL SPEECH BUBBLE & DIALOGUE STRIP ── */}
              <div className="p-4 space-y-2.5 bg-white dark:bg-[#12121c] flex-1 flex flex-col justify-center border-t border-black/10 dark:border-white/10">
                {dialogues.length > 0 ? (
                  dialogues.map((dlg, dIdx) => (
                    <div
                      key={dIdx}
                      className="relative p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border-2 border-amber-400/40 text-xs font-medium text-amber-950 dark:text-amber-100 shadow-sm leading-relaxed"
                    >
                      <span className="text-amber-600 dark:text-amber-400 font-bold mr-1.5">💬</span>
                      {dlg}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    {description || scene.content}
                  </p>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ── MORAL LESSON CALLOUT ── */}
      {product.moral && (
        <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border-2 border-orange-500/30">
          <div className="p-2 rounded-xl bg-orange-500 text-white shrink-0 shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-1">
              Comic Moral Truth
            </strong>
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              "{product.moral}"
            </p>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX / ENLARGE MODAL ── */}
      {activeModalImage && (
        <div 
          onClick={() => setActiveModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl">
            <img src={activeModalImage} alt="Comic Panel Enlarge" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

    </div>
  );
}
