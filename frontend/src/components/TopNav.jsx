import React from 'react';
import { PanelLeftClose, PanelLeftOpen, ArrowLeft, Palette, Sparkles } from 'lucide-react';

export default function TopNav({ sidebarOpen, onToggleSidebar, onBackToDashboard }) {
  return (
    <header className="sticky top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0d0d14]/90 border-b border-black/[0.08] dark:border-white/[0.08] h-16 transition-colors">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 max-w-full">
        <div className="flex items-center gap-3">
          {/* Disappear / Reappear Sidebar Button */}
          <button
            onClick={onToggleSidebar}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:text-[#ff7b2e] hover:border-[#ff7b2e] text-xs font-bold transition cursor-pointer shadow-sm"
            aria-label="Toggle products sidebar"
            title={sidebarOpen ? "Hide sidebar for more space" : "Show products sidebar"}
          >
            {sidebarOpen ? (
              <>
                <PanelLeftClose className="w-4 h-4 text-[#ff7b2e]" />
                <span className="hidden sm:inline">Hide Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-4 h-4 text-[#ff7b2e]" />
                <span className="hidden sm:inline">Show Sidebar</span>
              </>
            )}
          </button>
          
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base tracking-tight hover:opacity-90 transition cursor-pointer"
          >
            <img 
              src="/logo.png" 
              alt="Black Orange Talent Logo" 
              className="w-9 h-9 object-contain drop-shadow-sm shrink-0" 
            />
            <span className="truncate max-w-[180px] sm:max-w-none">BLACK ORANGE TALENT</span>
          </button>

          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#ff7b2e]/15 text-[#ff7b2e] border border-[#ff7b2e]/30">
            <Sparkles className="w-3 h-3 text-[#ff7b2e]" />
            <span>AI Products Studio</span>
          </span>
        </div>

        <div>
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#ff7b2e] hover:text-white bg-[#ff7b2e]/10 hover:bg-[#ff7b2e] border border-[#ff7b2e]/30 hover:border-[#ff7b2e] transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
