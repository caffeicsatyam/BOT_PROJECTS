import React, { useState, useEffect } from 'react';
import { X, Cloud, Zap, Key, ShieldCheck, Info, Sparkles, Check } from 'lucide-react';

export default function ComicImageSettingsModal({
  isOpen,
  onClose,
  currentModel,
  onSaveModel,
  cloudflareStatus,
  onRefreshStatus
}) {
  const [accountId, setAccountId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [selectedModel, setSelectedModel] = useState(currentModel || 'flux-schnell');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedAcc = localStorage.getItem('bot_cf_account_id') || '';
      const storedTok = localStorage.getItem('bot_cf_api_token') || '';
      setAccountId(storedAcc);
      setApiToken(storedTok);
      setSelectedModel(currentModel || 'flux-schnell');
      setSavedSuccess(false);
    }
  }, [isOpen, currentModel]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('bot_cf_account_id', accountId.trim());
      if (apiToken.trim()) {
        localStorage.setItem('bot_cf_api_token', apiToken.trim());
      }
      onSaveModel(selectedModel);

      // Post to backend
      await fetch('/api/cloudflare/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId.trim() || undefined,
          api_token: apiToken.trim() || undefined
        })
      });

      if (onRefreshStatus) await onRefreshStatus();
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#11111a] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Cloudflare Workers AI & Image Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure Free Tier models (10,000 Neurons/day) & instant fallbacks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Status Callout */}
          <div className={`p-3.5 rounded-xl text-xs flex items-start gap-3 border ${
            cloudflareStatus?.ready_for_workers_ai
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
          }`}>
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="space-y-1 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5">
                {cloudflareStatus?.ready_for_workers_ai
                  ? 'Cloudflare Workers AI: Connected & Active'
                  : 'Zero-Config Instant Engine: Active (100% Free)'}
              </div>
              <p className="text-[11px] opacity-90">
                {cloudflareStatus?.ready_for_workers_ai
                  ? 'Your Cloudflare Account & API Key are active. Enjoy 10,000 free neurons daily for Flux & SDXL models!'
                  : 'No account ID? No problem! The studio automatically uses the high-speed Free Flux engine so image generation works instantly without extra setup.'}
              </p>
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Select Free Generation Model
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'flux-schnell',
                  name: 'Cloudflare FLUX.1 [schnell]',
                  desc: 'State-of-the-art fast text-to-image with incredible detail (Workers AI Free Tier)',
                  tag: 'Recommended',
                  tagColor: 'bg-orange-500/15 text-orange-500 border-orange-500/30'
                },
                {
                  id: 'sdxl-base',
                  name: 'Cloudflare SDXL Base 1.0',
                  desc: 'Stable Diffusion XL photorealistic and comic composition (Workers AI Free Tier)',
                  tag: 'Popular',
                  tagColor: 'bg-blue-500/15 text-blue-500 border-blue-500/30'
                },
                {
                  id: 'sdxl-lightning',
                  name: 'Cloudflare SDXL Lightning',
                  desc: 'Ultra-fast 2-4 step rapid generation for comic storyboarding',
                  tag: 'Fastest',
                  tagColor: 'bg-purple-500/15 text-purple-500 border-purple-500/30'
                },
                {
                  id: 'free-instant',
                  name: 'Free Instant Engine (Zero Config)',
                  desc: 'High-speed Flux 1 & Turbo serverless pipeline. Zero keys or account needed.',
                  tag: 'Instant',
                  tagColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                }
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    selectedModel === m.id
                      ? 'bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/50 ring-1 ring-orange-500/30'
                      : 'border-black/10 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <input
                    type="radio"
                    name="model-choice"
                    checked={selectedModel === m.id}
                    onChange={() => setSelectedModel(m.id)}
                    className="mt-1 accent-orange-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</span>
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded border ${m.tagColor}`}>
                        {m.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Cloudflare Account Details Accordion */}
          <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-orange-500" />
                <span>Cloudflare Account Settings (Optional)</span>
              </span>
              <span className="text-[10px] text-slate-400">10,000 neurons/day</span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                Cloudflare Account ID
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Found in your Cloudflare dashboard overview URL"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#09090e] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                Cloudflare API Token
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder={cloudflareStatus?.has_token ? "•••••••••••••••• (Active in .env)" : "Enter Cloudflare Workers AI token"}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#09090e] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/[0.03] text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>
                Don't have an Account ID yet? The system works immediately via the Free Instant Flux engine!
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
