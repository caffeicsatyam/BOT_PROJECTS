import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  RotateCw, 
  Download, 
  Maximize2, 
  Users, 
  Award,
  BookOpen
} from 'lucide-react';

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

  // Helper to extract dialogues and sound effects from scene text
  const parsePanelDetails = (content) => {
    if (!content) return { dialogues: [], soundEffects: [], description: '' };
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const dialogues = [];
    const soundEffects = [];
    const descriptions = [];

    lines.forEach(line => {
      // Sound effects like **BAM!**, **WHOOSH!**
      const sfxMatches = line.match(/\*\*([A-Z0-9!]+)\*\*/g);
      if (sfxMatches) {
        sfxMatches.forEach(s => soundEffects.push(s.replace(/\*/g, '')));
      }

      // Dialogues: lines with quotation marks
      if (line.includes('"') || line.includes('“')) {
        dialogues.push(line.replace(/\*\*([A-Z0-9!]+)\*\*/g, '').trim());
      } else {
        descriptions.push(line.replace(/\*\*([A-Z0-9!]+)\*\*/g, '').trim());
      }
    });

    return {
      dialogues,
      soundEffects,
      description: descriptions.join(' ')
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

                {/* Sound Effect Floating Badges (BAM!, WHOOSH!, etc.) */}
                {soundEffects.length > 0 && (
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none z-10">
                    {soundEffects.map((sfx, sfxIdx) => (
                      <span
                        key={sfxIdx}
                        className="px-2.5 py-1 text-xs sm:text-sm font-black uppercase tracking-wider rounded-lg bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white shadow-xl transform rotate-3 border-2 border-white scale-105 filter drop-shadow"
                      >
                        {sfx}
                      </span>
                    ))}
                  </div>
                )}

                {/* Subtitle / Caption Narration at bottom of image if description exists */}
                {description && (
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/75 backdrop-blur-sm text-[11px] text-slate-200 border border-white/10 line-clamp-2">
                    <span className="font-bold text-amber-300 mr-1">CAPTION:</span>
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
                      className="relative p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border-2 border-amber-400/40 text-xs font-medium text-amber-950 dark:text-amber-100 shadow-sm leading-relaxed"
                    >
                      <span className="text-amber-600 dark:text-amber-400 font-bold mr-1">💬</span>
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
