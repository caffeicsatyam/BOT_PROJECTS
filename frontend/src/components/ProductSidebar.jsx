import React from 'react';
import { BookOpen, Film, ArrowUpRight, PanelLeftClose, Sparkles } from 'lucide-react';

export default function ProductSidebar({
  products,
  activeProductId,
  onSelectProduct,
  isOpen,
  onCloseSidebar,
  onBackToDashboard
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onCloseSidebar}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
      />

      <aside
        className="fixed lg:static top-16 bottom-0 left-0 w-[260px] bg-white dark:bg-[#0d0d14] border-r lg:border border-black/[0.08] dark:border-white/[0.08] lg:rounded-2xl flex flex-col z-40 overflow-hidden shadow-xl lg:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:lg:shadow-[0_8px_24px_rgba(0,0,0,0.35)] shrink-0 transition-colors animate-in fade-in duration-200"
      >
        {/* Distinct PRODUCT Box Header with Robot & Close Button */}
        <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          
          {/* Header Bar with Close Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            </div>
            <button
              onClick={onCloseSidebar}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              title="Hide Sidebar"
            >
              <PanelLeftClose className="w-4 h-4 text-[#ff7b2e]" />
            </button>
          </div>

          {/* Edu-Bot AI Assistant Banner */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] mb-3">
            <img
              src="/robot_hero.jpg"
              alt="Edu-Bot AI Assistant"
              className="w-10 h-10 rounded-lg object-cover border border-black/10 dark:border-white/10 shrink-0 shadow-sm"
              onError={(e) => {
                e.target.src = '/static/robot_hero.jpg';
              }}
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                Edu-Bot AI
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-500 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Online Assistant</span>
              </span>
            </div>
          </div>

          {/* Sketched PRODUCT Box */}
          <div className="border-2 border-slate-800 dark:border-slate-200/90 rounded-md py-2.5 px-3 text-center bg-black/[0.02] dark:bg-white/[0.04] shadow-sm">
            <span className="font-extrabold tracking-[0.14em] text-sm text-slate-900 dark:text-slate-100">
              PRODUCT
            </span>
          </div>
        </div>

        {/* Navigation List of Products */}
        <nav className="flex-1 p-3 flex flex-col gap-2.5 overflow-y-auto">
          {products.map((p) => {
            const isActive = p.id === activeProductId;
            const ProductIcon = p.slug === 'comic' ? Film : BookOpen;

            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProduct(p.id);
                  if (window.innerWidth < 1024) onCloseSidebar();
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition cursor-pointer group ${
                  isActive
                    ? 'bg-[#ff7b2e]/10 border-[#ff7b2e]/40 text-[#ff7b2e]'
                    : 'border-black/[0.05] dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                    isActive
                      ? 'bg-[#ff7b2e] text-white shadow-md shadow-[#ff7b2e]/30'
                      : 'bg-black/[0.05] dark:bg-white/[0.05] text-slate-500 group-hover:text-[#ff7b2e]'
                  }`}
                >
                  <ProductIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs leading-snug truncate">
                    {p.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <span>Product</span>
                    <span>•</span>
                    <span className="text-[#ff7b2e] font-semibold">{p.badge.split('•')[0].trim()}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <span>BLACK ORANGE TALENT</span>
          <button
            onClick={onBackToDashboard}
            className="text-[#ff7b2e] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Dashboard</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </aside>
    </>
  );
}
