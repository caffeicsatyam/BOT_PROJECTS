import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Rocket,
  ArrowRight,
  Zap,
  PenTool,
  RefreshCw,
  ShieldCheck,
  BookOpen,
  Target,
  Film,
  GraduationCap,
  Lightbulb,
  Check,
  Menu,
  MapPin
} from 'lucide-react';

export default function Dashboard({ onOpenStudio }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07070b] text-slate-900 dark:text-[#f3f4f6] transition-colors duration-200">
      
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0d0d14]/90 border-b border-black/[0.08] dark:border-white/[0.08] h-16 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Black Orange Talent Logo" 
              className="w-9 h-9 object-contain drop-shadow-sm shrink-0" 
            />
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              BLACK ORANGE TALENT PVT. LTD
            </span>
          </div>

          <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <li><a href="#hero" className="hover:text-[#ff7b2e] transition">Home</a></li>
            <li><a href="#features" className="hover:text-[#ff7b2e] transition">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-[#ff7b2e] transition">How It Works</a></li>
            <li><a href="#products" className="hover:text-[#ff7b2e] transition">Products</a></li>
            <li><a href="#about" className="hover:text-[#ff7b2e] transition">About</a></li>
            <li>
              <button
                onClick={() => onOpenStudio()}
                className="ml-2 px-4 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#ff7b2e] to-[#ff9500] hover:from-[#ff883d] hover:to-[#ffa21a] text-white shadow-[0_4px_16px_rgba(255,123,46,0.3)] transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Product Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </li>
          </ul>

          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 dark:text-slate-300 p-2 text-xl"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0d0d14] border-b border-black/[0.08] dark:border-white/[0.08] px-6 py-4 space-y-3">
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-slate-300 hover:text-[#ff7b2e]">Home</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-slate-300 hover:text-[#ff7b2e]">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-slate-300 hover:text-[#ff7b2e]">How It Works</a>
            <a href="#products" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-slate-300 hover:text-[#ff7b2e]">Products</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-700 dark:text-slate-300 hover:text-[#ff7b2e]">About</a>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenStudio(); }}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#ff7b2e] text-white mt-2 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Product Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section id="hero" className="relative py-20 px-6 overflow-hidden text-center max-w-5xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#ff7b2e]/15 via-rose-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ff7b2e]/15 text-[#ff7b2e] border border-[#ff7b2e]/30 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Black Orange Talent • AI Creative Suite</span>
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-5 leading-tight">
          Empowering Student Creativity with{' '}
          <span className="bg-gradient-to-r from-[#ff7b2e] via-amber-500 to-rose-500 bg-clip-text text-transparent">
            Generative AI
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Two specialized AI tools engineered for students and schools — create rich narrative stories or full comic book scripts in seconds.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <a
            href="#products"
            className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#ff7b2e] to-[#ff9500] hover:from-[#ff883d] hover:to-[#ffa21a] text-white shadow-[0_8px_24px_rgba(255,123,46,0.35)] transition cursor-pointer flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            <span>Explore Products</span>
          </a>
          <button
            onClick={() => onOpenStudio()}
            className="px-6 py-3 rounded-2xl font-bold text-sm bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.1] text-slate-800 dark:text-white transition cursor-pointer flex items-center gap-2"
          >
            <span>Open Product Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="max-w-4xl mx-auto p-6 sm:p-7 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.06] shadow-sm dark:shadow-none">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col justify-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">100+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1">Partner Schools</div>
            </div>
            <div className="flex flex-col justify-center border-y sm:border-y-0 sm:border-x border-black/[0.06] dark:border-white/[0.06] py-4 sm:py-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">50,000+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1">Active Students</div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">6</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-1">Major Hubs</div>
            </div>
          </div>

          {/* Major Hubs City List */}
          <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-[#ff7b2e] shrink-0" />
            <span className="tracking-wide">
              Pune • Delhi • Mumbai • Lucknow • Kolkata • Varanasi
            </span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff7b2e]">Why Students Love It</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Features Built for <span className="text-[#ff7b2e]">Learning</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Everything a student needs to create, edit, and share amazing comic stories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: "Instant Stories", desc: "Type a topic and get a complete comic story in seconds — title, characters, scenes & moral included." },
            { icon: PenTool, title: "Easy Editing", desc: "Edit any part of the story right in the browser. The AI remembers your changes when you revise." },
            { icon: RefreshCw, title: "Smart Revisions", desc: "Ask the AI to change characters, add scenes, or twist the plot — it keeps the rest intact." },
            { icon: ShieldCheck, title: "Safe & Friendly", desc: "Content is always school-appropriate, positive, and designed for young minds." },
            { icon: BookOpen, title: "Story Structure", desc: "Every story follows a clear format: Title, Characters, Comic Scenes, and a Moral to remember." },
            { icon: Target, title: "Learning Focused", desc: "Each story ends with a positive moral, encouraging critical thinking and good values." }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.06] hover:border-[#ff7b2e]/40 shadow-sm dark:shadow-none transition">
                <div className="w-10 h-10 rounded-xl bg-[#ff7b2e]/10 flex items-center justify-center text-[#ff7b2e] mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff7b2e]">Simple as 1-2-3</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Choose a Topic", desc: "Type any fun topic — 'A robot goes to school', 'A cat becomes a superhero', or anything you imagine!" },
            { step: "02", title: "AI Creates Your Story", desc: "Our AI writes a complete comic story with catchy titles, fun characters, action-packed scenes, and sound effects!" },
            { step: "03", title: "Edit & Revise", desc: "Not happy with something? Edit directly or ask the AI to change specific parts. Make it your own!" }
          ].map((s, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-[#0e0e16] border border-black/[0.08] dark:border-white/[0.06] shadow-sm dark:shadow-none relative">
              <span className="text-3xl font-black text-[#ff7b2e]/50 font-mono block mb-2">{s.step}</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRODUCTS SUITE ─── */}
      <section id="products" className="py-20 px-6 max-w-6xl mx-auto border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff7b2e]">Product Suite</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Explore Our Products</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Specialized AI creative tools designed to empower students and educators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Product 1: AI Story Generator */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0e0e16] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#ff7b2e]/50 shadow-sm dark:shadow-none transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">PRODUCT 01</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  Storytelling
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">AI Story Generator</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Transform ideas into rich, imaginative narrative stories with chapter breakdowns, thoughtful character personalities, vivid descriptions, and valuable moral lessons.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#ff7b2e]" /> Chapter-based narrative storytelling</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#ff7b2e]" /> Dynamic character traits &amp; personality</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#ff7b2e]" /> School-friendly vocabulary &amp; positive morals</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#ff7b2e]" /> Interactive AI revision &amp; script editor</li>
              </ul>
            </div>

            <button
              onClick={() => onOpenStudio('ai-story-generator')}
              className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#ff7b2e] to-[#ff9500] hover:from-[#ff883d] hover:to-[#ffa21a] text-white shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              <span>Launch Story Generator</span>
            </button>
          </div>

          {/* Product 2: AI Comic Book Generator */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0e0e16] border-2 border-[#ff7b2e]/50 shadow-[0_8px_30px_rgba(255,123,46,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">PRODUCT 02</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ff7b2e]/15 text-[#ff7b2e] border border-[#ff7b2e]/30">
                  Popular • Comic Studio
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ff7b2e]/10 flex items-center justify-center text-[#ff7b2e] mb-3">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">AI Comic Book Generator</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Convert imaginative ideas into action-packed comic book scripts complete with panel descriptions, sound effects (BAM! WHOOSH!), character dialogues, and visual scenes.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#ff7b2e]" /> Panel-by-panel comic scripts &amp; scenes</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#ff7b2e]" /> Comic sound effects (SFX) &amp; speech bubbles</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#ff7b2e]" /> Visual scene cards &amp; character pills</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#ff7b2e]" /> Easy script revisions &amp; text export</li>
              </ul>
            </div>

            <button
              onClick={() => onOpenStudio('ai-comic-book-generator')}
              className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#ff7b2e] to-[#ff9500] hover:from-[#ff883d] hover:to-[#ffa21a] text-white shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Comic Book Generator</span>
            </button>
          </div>

        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-20 px-6 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff7b2e]">Our Mission</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-4">
              About Black Orange Talent
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              We believe every student has a story to tell. <strong>Black Orange Talent</strong> builds AI-powered tools that make learning creative, fun, and accessible for students of all ages.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Our Comic Story Studio uses cutting-edge AI to help students explore storytelling, build vocabulary, and develop creative thinking — all in a safe, school-friendly environment.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#ff7b2e] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs text-slate-900 dark:text-white block">Education First</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Every feature is designed with learning outcomes in mind.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs text-slate-900 dark:text-white block">Student Safety</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">All content is filtered and school-appropriate.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs text-slate-900 dark:text-white block">Innovation</strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Powered by the latest AI models for the best experience.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-100 to-orange-50/50 dark:from-[#12121c] dark:to-[#1a1525] border border-black/[0.08] dark:border-white/[0.08] text-center shadow-lg dark:shadow-xl">
            <img 
              src="/logo.png" 
              alt="Black Orange Talent Logo" 
              className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-md" 
            />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Creative AI for Students</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">Turning imagination into structured, fun comic stories.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/[0.04] dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-black/[0.08] dark:border-white/[0.08]">AI</span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/[0.04] dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-black/[0.08] dark:border-white/[0.08]">Education</span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/[0.04] dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-black/[0.08] dark:border-white/[0.08]">Comics</span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/[0.04] dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-black/[0.08] dark:border-white/[0.08]">Storytelling</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-6 border-t border-black/[0.08] dark:border-white/[0.08] text-center text-xs text-slate-500">
        <p>© 2024 Black Orange Talent. Made with ❤️ for students.</p>
      </footer>

    </div>
  );
}
