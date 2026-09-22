import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-white/[0.06] border border-black/10 dark:border-white/[0.08] text-xs shadow-inner">
      <button
        onClick={() => setTheme('light')}
        title="Light Mode"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white text-slate-900 shadow font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline text-[11px]">Light</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        title="Dark Mode"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-slate-800 text-white shadow font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden sm:inline text-[11px]">Dark</span>
      </button>

      <button
        onClick={() => setTheme('system')}
        title="Follow System Theme"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-[#ff7b2e]/20 text-[#ff7b2e] border border-[#ff7b2e]/40 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Monitor className="w-3.5 h-3.5 text-[#ff7b2e]" />
        <span className="hidden sm:inline text-[11px]">System</span>
      </button>
    </div>
  );
}
