import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import ProductSidebar from './components/ProductSidebar';
import StoryMiddlePane from './components/StoryMiddlePane';
import GeneratorCapsule from './components/GeneratorCapsule';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import ComicImageSettingsModal from './components/ComicImageSettingsModal';
import { PanelLeftOpen } from 'lucide-react';

const BASE_PRODUCTS = [
  {
    id: "ai-story-generator",
    slug: "story",
    icon: "📖",
    name: "AI Story Generator",
    productType: "story",
    badge: "Narrative Storytelling",
    desc: "Transform any topic into an imaginative narrative story with chapter storytelling, rich character traits, and meaningful morals.",
    tags: ["Gemini AI", "Story Chapters", "Character Arcs", "School Safe"],
    btnText: "GENERATE STORY",
    placeholder: "Enter a story topic (e.g. 'A secret garden hidden behind an old library clock')...",
    chips: [
      { label: "🕰️ Whispering Clock", prompt: "A magical grandfather clock in the library that whispers forgotten historical mysteries" },
      { label: "🚲 Solar Bicycle", prompt: "A young inventor builds a solar-powered bicycle that can gently glide across puddles" },
      { label: "✨ Lost Constellation", prompt: "A student discovers an unregistered constellation that only glows when someone does a good deed" },
      { label: "🎈 Floating Library", prompt: "A whimsical traveling book balloon that delivers stories to mountain villages" }
    ],
    title: "",
    topic: "",
    characters: [],
    scenes: [],
    moral: "",
    rawText: ""
  },
  {
    id: "ai-comic-book-generator",
    slug: "comic",
    icon: "🎬",
    name: "AI Comic Book Generator",
    productType: "comic",
    badge: "School Comic Scriptwriter",
    desc: "Generate an action-packed, visual comic book script with character descriptions, sound effects (BAM!, WHOOSH!), and a positive moral.",
    tags: ["Gemini AI", "Comic Panels", "Sound Effects", "School Safe"],
    btnText: "GENERATE COMIC SCRIPT",
    placeholder: "Enter a comic topic (e.g. 'A rookie service robot accidentally joins a team of high school superheroes')...",
    chips: [
      { label: "🤖 Robo-Ranger", prompt: "A rookie service robot accidentally joins a team of high school superheroes" },
      { label: "⚡ Kinetic Sparks", prompt: "Two science lab partners accidentally invent roller skates that generate lightning" },
      { label: "🎨 Living Canvas", prompt: "An art student whose spray paint drawings come alive for exactly five minutes" },
      { label: "🚀 Gravity Boots", prompt: "A cafeteria lunch lady who moonlights as an interstellar asteroid guardian" }
    ],
    title: "",
    topic: "",
    characters: [],
    scenes: [],
    moral: "",
    rawText: ""
  }
];

const STORAGE_KEY = "bot_products_state_v3";

export default function App() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 2) {
          return BASE_PRODUCTS.map((p, idx) => ({ ...p, ...parsed[idx] }));
        }
      }
    } catch (_) {}
    return BASE_PRODUCTS;
  });

  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined' && (window.location.hash === '#studio' || window.location.pathname.includes('/products'))) {
      return 'studio';
    }
    return 'dashboard';
  });

  const [activeProductId, setActiveProductId] = useState(BASE_PRODUCTS[0].id);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [genStatus, setGenStatus] = useState('Ready');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Comic Illustration Options & State
  const [selectedStyle, setSelectedStyle] = useState('comic-modern');
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
  const [panelImages, setPanelImages] = useState({});
  const [generatingPanels, setGeneratingPanels] = useState({});
  const [generatingAll, setGeneratingAll] = useState(false);
  const [allProgress, setAllProgress] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cloudflareStatus, setCloudflareStatus] = useState(null);

  useEffect(() => {
    const savedStyle = localStorage.getItem('bot_comic_style');
    if (savedStyle) setSelectedStyle(savedStyle);
    const savedModel = localStorage.getItem('bot_comic_model');
    if (savedModel) setSelectedModel(savedModel);

    fetchCloudflareStatus();
  }, []);

  const fetchCloudflareStatus = async () => {
    try {
      const res = await fetch('/api/cloudflare/status');
      if (res.ok) {
        const data = await res.json();
        setCloudflareStatus(data);
      }
    } catch (e) {
      console.warn('Failed to fetch Cloudflare status:', e);
    }
  };

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
    localStorage.setItem('bot_comic_style', style);
  };

  const handleModelSave = (model) => {
    setSelectedModel(model);
    localStorage.setItem('bot_comic_model', model);
  };

  // Sync hash change for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#studio') {
        setCurrentView('studio');
      } else {
        setCurrentView('dashboard');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Active product
  const activeProduct = products.find((p) => p.id === activeProductId) || products[0];

  // Save to localStorage whenever products change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (_) {}
  }, [products]);

  // Parse markdown helper
  const parseMarkdown = (md, fallbackTopic) => {
    const titleMatch = md.match(/# Title\s*\n+([^\n#]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : fallbackTopic;

    const charsMatch = md.match(/# Characters\s*\n+([\s\S]*?)(?=# Comic Scenes|# Moral|$)/i);
    const characters = [];
    if (charsMatch) {
      const lines = charsMatch[1].split("\n").filter((l) => l.trim());
      for (const line of lines) {
        const cleaned = line.replace(/^[-*•]\s*/, "").trim();
        if (!cleaned) continue;
        const m = cleaned.match(/^\*\*?([^*:]+)\*\*?:?\s*(.*)$/);
        if (m) {
          characters.push({ name: m[1].trim(), trait: m[2].trim() });
        } else {
          characters.push({ name: "Character", trait: cleaned });
        }
      }
    }

    const scenes = [];
    const scenesMatch = md.match(/# Comic Scenes\s*\n+([\s\S]*?)(?=# Moral|$)/i);
    if (scenesMatch) {
      const sceneBlocks = scenesMatch[1].split(/(?:^|\n)(?=Scene\s*\d+:|Panel\s*\d+:|Chapter\s*\d+:)/i);
      sceneBlocks.forEach((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return;
        const headingMatch = trimmed.match(/^(?:Scene|Panel|Chapter)\s*(\d+):?\s*([^\n]*)/i);
        let heading = `Scene ${idx + 1}`;
        let content = trimmed;
        if (headingMatch) {
          heading = headingMatch[2] ? headingMatch[2].trim() : `Scene ${headingMatch[1]}`;
          content = trimmed.replace(/^(?:Scene|Panel|Chapter)\s*\d+:?[^\n]*\n?/, '').trim();
        }
        scenes.push({
          num: idx + 1,
          heading: heading || `Scene ${idx + 1}`,
          content: content
        });
      });
    }

    const moralMatch = md.match(/# Moral\s*\n+([^\n#]+)/i);
    const moral = moralMatch ? moralMatch[1].trim() : '';

    return {
      title,
      characters,
      scenes,
      moral
    };
  };

  // Generate an individual panel image
  const handleGeneratePanelImage = async (idx, scene) => {
    setGeneratingPanels(prev => ({ ...prev, [idx]: true }));
    try {
      const prompt = scene.content || scene.heading || `Comic panel ${idx + 1} for ${activeProduct.title}`;
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          model: selectedModel,
          account_id: localStorage.getItem('bot_cf_account_id') || undefined,
          api_token: localStorage.getItem('bot_cf_api_token') || undefined,
          width: 768,
          height: 768
        })
      });

      const data = await res.json();
      if (data.image_url) {
        setPanelImages(prev => ({ ...prev, [idx]: data.image_url }));
      }
    } catch (err) {
      console.error('Failed to generate panel image:', err);
    } finally {
      setGeneratingPanels(prev => ({ ...prev, [idx]: false }));
    }
  };

  // Batch generate all panels
  const handleGenerateAllPanels = async () => {
    if (!activeProduct.scenes || activeProduct.scenes.length === 0) return;
    setGeneratingAll(true);
    
    for (let i = 0; i < activeProduct.scenes.length; i++) {
      setAllProgress(`${i + 1}/${activeProduct.scenes.length}`);
      setGeneratingPanels(prev => ({ ...prev, [i]: true }));
      try {
        const scene = activeProduct.scenes[i];
        const prompt = scene.content || scene.heading || `Comic panel ${i + 1} for ${activeProduct.title}`;
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            style: selectedStyle,
            model: selectedModel,
            account_id: localStorage.getItem('bot_cf_account_id') || undefined,
            api_token: localStorage.getItem('bot_cf_api_token') || undefined,
            width: 768,
            height: 768
          })
        });

        const data = await res.json();
        if (data.image_url) {
          setPanelImages(prev => ({ ...prev, [i]: data.image_url }));
        }
      } catch (err) {
        console.error(`Failed panel ${i}:`, err);
      } finally {
        setGeneratingPanels(prev => ({ ...prev, [i]: false }));
      }
    }

    setGeneratingAll(false);
    setAllProgress('');
  };

  // Trigger real generation
  const handleGenerate = async () => {
    const promptText = topic.trim();
    if (!promptText) {
      alert('Please enter a topic or select a prompt suggestion first!');
      return;
    }

    setIsGenerating(true);
    setGenStatus('Igniting AI Imagination...');
    setPanelImages({});

    try {
      const response = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: promptText,
          product_type: activeProduct.productType
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Generation failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            try {
              const data = JSON.parse(jsonStr);

              if (data.type === 'status') {
                setGenStatus(data.text);
              } else if (data.type === 'chunk') {
                accumulatedText += data.text;
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === activeProductId ? { ...p, rawText: accumulatedText } : p
                  )
                );
              } else if (data.type === 'done') {
                const completeStory = data.story;
                const parsed = parseMarkdown(completeStory, promptText);
                setProducts((prev) =>
                  prev.map((p) => {
                    if (p.id === activeProductId) {
                      return {
                        ...p,
                        ...parsed,
                        topic: promptText,
                        rawText: completeStory
                      };
                    }
                    return p;
                  })
                );
                setGenStatus('Production Complete!');
              } else if (data.type === 'error') {
                throw new Error(data.detail);
              }
            } catch (jsonErr) {
              console.warn('JSON parsing chunk error:', jsonErr);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setGenStatus('Error: ' + err.message);
      alert('Error generating story: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger revision
  const handleRevise = async (changeText) => {
    const currentScript = activeProduct.rawText;
    if (!currentScript) {
      alert('Please generate a story first before asking for revisions!');
      return;
    }

    setIsRevising(true);
    setGenStatus('Applying revisions with AI...');

    try {
      const res = await fetch('/api/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: currentScript,
          change: changeText,
          product_type: activeProduct.productType
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to revise');

      const parsed = parseMarkdown(data.story, activeProduct.topic || 'Revised');

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === activeProductId) {
            return {
              ...p,
              ...parsed,
              rawText: data.story
            };
          }
          return p;
        })
      );

      setGenStatus(`Applied: "${changeText}"`);
    } catch (err) {
      setGenStatus('Error: ' + err.message);
      alert('Revision failed: ' + err.message);
    } finally {
      setIsRevising(false);
    }
  };

  const handleUpdateRawText = (newText) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === activeProductId ? { ...p, rawText: newText } : p))
    );
  };

  const handleCopy = () => {
    if (activeProduct.rawText) {
      navigator.clipboard.writeText(activeProduct.rawText);
    }
  };

  const handleDownload = () => {
    if (!activeProduct.rawText) return;
    const blob = new Blob([activeProduct.rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (activeProduct.title || 'script').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `${safeTitle}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {currentView === 'dashboard' ? (
        <Dashboard
          onOpenStudio={(selectedProdId) => {
            if (selectedProdId) {
              const match = products.find(
                (p) => p.id === selectedProdId || p.productType === selectedProdId
              );
              if (match) setActiveProductId(match.id);
            }
            setCurrentView('studio');
            window.location.hash = '#studio';
          }}
        />
      ) : (
        <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#07070b] text-slate-900 dark:text-[#f3f4f6] transition-colors">
          {/* Top Navbar with Sidebar Toggle */}
          <TopNav
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            onBackToDashboard={() => {
              setCurrentView('dashboard');
              window.location.hash = '';
            }}
          />

          {/* Floating Re-Open Sidebar Tab (When collapsed) */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed left-2 top-20 z-40 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#12121c] border border-black/10 dark:border-white/10 shadow-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#ff7b2e] hover:border-[#ff7b2e]/40 transition cursor-pointer"
              title="Show products sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 text-[#ff7b2e]" />
              <span className="hidden sm:inline">Products</span>
            </button>
          )}

          {/* Responsive Layout: Collapses smoothly when sidebar is toggled */}
          <div className={`flex-1 min-h-0 h-auto lg:h-[calc(100vh-64px)] lg:max-h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden p-3 sm:p-4 lg:p-5 flex flex-col lg:grid gap-4 lg:gap-5 box-border transition-all ${
            sidebarOpen 
              ? 'lg:grid-cols-[260px_minmax(0,1fr)_380px]' 
              : 'lg:grid-cols-[minmax(0,1fr)_380px]'
          }`}>
            
            {/* Column 1: Product Sidebar */}
            <ProductSidebar
              products={products}
              activeProductId={activeProductId}
              onSelectProduct={setActiveProductId}
              isOpen={sidebarOpen}
              onCloseSidebar={() => setSidebarOpen(false)}
              onBackToDashboard={() => {
                setCurrentView('dashboard');
                window.location.hash = '';
              }}
            />

            {/* Column 2: Middle Story Display Pane */}
            <StoryMiddlePane
              product={activeProduct}
              onCopy={handleCopy}
              onDownload={handleDownload}
              onUpdateRawText={handleUpdateRawText}
              onBackToDashboard={() => {
                setCurrentView('dashboard');
                window.location.hash = '';
              }}
              panelImages={panelImages}
              onGeneratePanelImage={handleGeneratePanelImage}
              generatingPanels={generatingPanels}
              selectedStyle={selectedStyle}
              selectedModel={selectedModel}
            />

            {/* Column 3: Right Rounded Capsule Generator Panel (With all options) */}
            <GeneratorCapsule
              product={activeProduct}
              topic={topic}
              setTopic={setTopic}
              onGenerate={handleGenerate}
              onRevise={handleRevise}
              isGenerating={isGenerating}
              isRevising={isRevising}
              genStatus={genStatus}
              // Comic options moved to the right side
              selectedStyle={selectedStyle}
              onSelectStyle={handleStyleChange}
              selectedModel={selectedModel}
              onOpenSettings={() => setIsSettingsOpen(true)}
              cloudflareStatus={cloudflareStatus}
              onGenerateAllPanels={handleGenerateAllPanels}
              generatingAll={generatingAll}
              allProgress={allProgress}
            />

          </div>
        </div>
      )}

      {/* Cloudflare Settings Modal */}
      <ComicImageSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentModel={selectedModel}
        onSaveModel={handleModelSave}
        cloudflareStatus={cloudflareStatus}
        onRefreshStatus={fetchCloudflareStatus}
      />

      {/* Floating Theme Switcher at Right Bottom */}
      <div className="fixed bottom-5 right-5 z-50 shadow-2xl backdrop-blur-md rounded-2xl bg-white/95 dark:bg-[#0d0d14]/95 p-1 border border-black/10 dark:border-white/15">
        <ThemeToggle />
      </div>
    </>
  );
}
