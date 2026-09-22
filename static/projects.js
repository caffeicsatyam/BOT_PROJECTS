/**
 * AI Products Studio Hub
 * Strictly manages the 2 official products:
 *   1. AI Story Generator
 *   2. AI Comic Book Generator
 * Under the hierarchy:
 *   product
 *   | - > AI Story generator
 *   | -> AI Comic Book generator
 */

(function () {
  "use strict";

  if (window.__products_studio_loaded__) return;
  window.__products_studio_loaded__ = true;

  // ── 1. DEFINITION OF THE 2 PRODUCTS ──
  const PRODUCTS = [
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
      icon: "🎨",
      name: "AI Comic Book Generator",
      productType: "comic",
      badge: "Comic Studio • Panels & SFX",
      desc: "Convert imaginative ideas into action-packed comic book scripts complete with panel descriptions, sound effects (BAM! WHOOSH!), dialogues, and visual scenes.",
      tags: ["Gemini AI", "Comic Panels", "Sound Effects (SFX)", "School Safe"],
      btnText: "GENERATE COMIC",
      placeholder: "Enter a comic book topic (e.g. 'A friendly robot joins the school soccer team')...",
      chips: [
        { label: "🤖 Robot at School", prompt: "A curious robot attends its first day at elementary school and helps in science class" },
        { label: "🐕 Detective Pets", prompt: "A detective dog and hamster solve the mystery of the missing homework folder" },
        { label: "🐉 Flying Dragon", prompt: "A timid baby dragon who is terrified of heights learns to glide with a hummingbird coach" },
        { label: "🎒 Time Backpack", prompt: "A magical backpack that pulls out harmless gadgets from the future" }
      ],
      title: "",
      topic: "",
      characters: [],
      scenes: [],
      moral: "",
      rawText: ""
    }
  ];

  // ── LOCAL STORAGE KEY ──
  const STORAGE_KEY = "bot_products_state_v3";

  function loadSavedProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved) && saved.length === 2) {
          // Merge saved properties into base product models
          return PRODUCTS.map((p, idx) => ({ ...p, ...saved[idx] }));
        }
      }
    } catch (_) {}
    return PRODUCTS;
  }

  let products = loadSavedProducts();
  let activeProductId = products[0].id;

  function saveProducts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (_) {}
  }

  // ── DOM ELEMENTS ──
  const $ = (s) => document.querySelector(s);
  const sidebarList = $("#sidebarList");
  const projectCountBadge = $("#projectCountBadge");
  const sidebar = $("#projectsSidebar");
  const sidebarToggle = $("#sidebarToggle");
  const sidebarBackdrop = $("#sidebarBackdrop");

  const breadCrumbTitle = $("#breadCrumbTitle");
  const storyHeaderIcon = $("#storyHeaderIcon");
  const storyHeaderTitle = $("#storyHeaderTitle");
  const storyHeaderTopic = $("#storyHeaderTopic");
  const storyHeaderDesc = $("#storyHeaderDesc");
  const headerTagsContainer = $("#headerTagsContainer");

  const generatorCardTitle = $("#generatorCardTitle");
  const capsuleSubtitle = $("#capsuleSubtitle");
  const promptChipsContainer = $("#promptChipsContainer");
  const topicInput = $("#topicInput");
  const generateBtn = $("#generateBtn");
  const generateBtnText = $("#generateBtnText");
  const genStatus = $("#genStatus");

  const previewCardTitle = $("#previewCardTitle");
  const wordCountBadge = $("#wordCountBadge");
  const characterPillsContainer = $("#characterPillsContainer");
  const comicPanelsContainer = $("#comicPanelsContainer");
  const moralText = $("#moralText");

  const editorBadgeLabel = $("#editorBadgeLabel");
  const storyScriptBox = $("#storyScriptBox");

  const revisionInput = $("#revisionInput");
  const reviseBtn = $("#reviseBtn");

  const copyStoryBtn = $("#copyStoryBtn");
  const downloadStoryBtn = $("#downloadStoryBtn");

  // ── PARSE MARKDOWN INTO DATA MODEL ──
  function parseProductMarkdown(text, fallbackTopic) {
    if (!text) return {};
    const lines = text.split("\n");
    let title = "Creative Production";
    let moral = "Every experience teaches a valuable lesson.";
    const characters = [];
    const scenes = [];

    let currentSection = "";
    let currentScene = null;

    for (let rawLine of lines) {
      const line = rawLine.trim();

      if (line.startsWith("# ")) {
        currentSection = line.replace("# ", "").trim().toLowerCase();
        continue;
      }

      if (currentSection === "title" && line && !line.startsWith("#")) {
        if (title === "Creative Production") title = line.replace(/^["']|["']$/g, "").trim();
      } else if (currentSection === "characters" && line) {
        const m = line.match(/^[-*]\s+\*\*([^*]+)\*\*:?\s*(.*)$/);
        if (m) {
          characters.push({ name: m[1].trim(), trait: m[2].trim() });
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          const parts = line.slice(2).split(":");
          characters.push({
            name: parts[0]?.trim() || "Character",
            trait: parts[1]?.trim() || "Friendly companion"
          });
        }
      } else if ((currentSection === "comic scenes" || currentSection === "scenes" || currentSection === "story") && line) {
        const sceneMatch = line.match(/^(?:Scene|Panel|Chapter)\s*(\d+):?\s*(.*)$/i);
        if (sceneMatch) {
          if (currentScene) scenes.push(currentScene);
          currentScene = {
            num: parseInt(sceneMatch[1], 10),
            heading: sceneMatch[2] ? sceneMatch[2].trim() : `Section ${sceneMatch[1]}`,
            content: ""
          };
        } else if (currentScene) {
          currentScene.content = (currentScene.content ? currentScene.content + " " : "") + line;
        }
      } else if (currentSection === "moral" && line && !line.startsWith("#")) {
        moral = line.trim();
      }
    }

    if (currentScene) scenes.push(currentScene);

    return {
      title: title || "Creative Production",
      topic: fallbackTopic,
      characters: characters.length ? characters : [{ name: "Protagonist", trait: "a courageous student" }],
      scenes: scenes.length ? scenes : [{ num: 1, heading: "The Narrative", content: text }],
      moral: moral,
      rawText: text
    };
  }

  // ── 2. RENDER SIDEBAR LIST (EXACTLY 2 PRODUCTS) ──
  function renderSidebar() {
    if (!sidebarList) return;
    sidebarList.innerHTML = "";

    products.forEach((prod, index) => {
      const item = document.createElement("button");
      item.className = `project-nav-item ${prod.id === activeProductId ? "active" : ""}`;
      item.dataset.id = prod.id;
      item.innerHTML = `
        <div class="p-icon">${prod.icon}</div>
        <div class="p-info">
          <span class="p-title">${prod.name}</span>
          <div class="p-meta">
            <span>Product 0${index + 1}</span>
            <span>•</span>
            <span style="color:var(--accent);">${prod.badge.split("•")[0].trim()}</span>
          </div>
        </div>
      `;

      item.addEventListener("click", () => {
        shiftToProduct(prod.id);
      });

      sidebarList.appendChild(item);
    });

    if (projectCountBadge) projectCountBadge.textContent = products.length;
  }

  // ── 3. SHIFT TO ACTIVE PRODUCT ──
  function shiftToProduct(prodId) {
    const prod = products.find((p) => p.id === prodId) || products[0];
    if (!prod) return;

    activeProductId = prod.id;

    // Update active nav item in sidebar
    document.querySelectorAll(".project-nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.id === prod.id);
    });

    // Populate Product Header
    if (breadCrumbTitle) breadCrumbTitle.textContent = prod.name;
    if (storyHeaderIcon) storyHeaderIcon.textContent = prod.icon;
    if (storyHeaderTitle) storyHeaderTitle.textContent = prod.name;
    if (storyHeaderTopic) {
      storyHeaderTopic.textContent = `Topic: ${prod.topic || "Creative"}`;
    }
    if (storyHeaderDesc) storyHeaderDesc.textContent = prod.desc;

    // Header Tags
    if (headerTagsContainer) {
      headerTagsContainer.innerHTML = prod.tags.map((t) => `<span class="pane-tag">${t}</span>`).join("");
    }

    // Generator Toolbar configuration
    if (generatorCardTitle) {
      generatorCardTitle.innerHTML = `<span>⚡</span> ${prod.name}`;
    }
    if (capsuleSubtitle) {
      capsuleSubtitle.textContent = prod.productType === "story"
        ? "Enter a prompt or choose a topic to craft your story."
        : "Enter a prompt or choose a topic to script your comic book.";
    }
    if (topicInput) {
      topicInput.placeholder = prod.placeholder;
      topicInput.value = "";
    }
    if (generateBtnText) {
      generateBtnText.textContent = prod.btnText;
    }
    if (genStatus) {
      genStatus.textContent = "Ready";
    }

    // Populate prompt chips
    if (promptChipsContainer) {
      promptChipsContainer.innerHTML = `<span class="chip-label">Try Topics:</span>`;
      prod.chips.forEach((ch) => {
        const chipBtn = document.createElement("button");
        chipBtn.className = "prompt-chip";
        chipBtn.textContent = ch.label;
        chipBtn.addEventListener("click", () => {
          if (topicInput) {
            topicInput.value = ch.prompt;
            topicInput.focus();
          }
        });
        promptChipsContainer.appendChild(chipBtn);
      });
    }

    // Preview Card Header
    if (previewCardTitle) {
      previewCardTitle.innerHTML = prod.productType === "story"
        ? `<span>📖</span> Story Narrative & Chapters`
        : `<span>🎭</span> Comic Book Panels & Dialogue Preview`;
    }

    // Populate Characters
    if (characterPillsContainer) {
      characterPillsContainer.innerHTML = (prod.characters || []).map((c) => `
        <div class="char-pill">
          <span>🎭</span>
          <div>
            <strong>${c.name}:</strong> <span style="color:var(--text-dim);">${c.trait}</span>
          </div>
        </div>
      `).join("") || `<span style="color:var(--text-dim);">No characters listed</span>`;
    }

    // Comic Options in right capsule
    const capsuleComicGroup = $("#capsuleComicOptionsGroup");
    if (capsuleComicGroup) {
      capsuleComicGroup.style.display = prod.productType === "comic" ? "block" : "none";
    }

    const hasContent = Boolean(prod.rawText || (prod.scenes && prod.scenes.length > 0));
    const emptyBanner = $("#emptyStoryBanner");
    const comicDisplayGrid = $("#comicDisplayGrid");
    const moralBox = $("#moralBox");
    const storyOutputWrapper = $(".story-output-wrapper");

    if (emptyBanner) emptyBanner.style.display = hasContent ? "none" : "block";
    if (comicDisplayGrid) comicDisplayGrid.style.display = hasContent ? "grid" : "none";
    if (moralBox) moralBox.style.display = hasContent ? "flex" : "none";
    if (storyOutputWrapper) storyOutputWrapper.style.display = hasContent ? "block" : "none";

    // Populate Panels / Chapters
    if (comicPanelsContainer) {
      const isComic = prod.productType === "comic";
      comicPanelsContainer.innerHTML = (prod.scenes || []).map((sc, scIdx) => {
        let content = sc.content;
        if (isComic) {
          content = content.replace(/\b([A-Z]{3,8}!+)\b/g, '<span class="comic-sfx">$1</span>');
        }
        const existingImg = window.__comic_panel_images && window.__comic_panel_images[scIdx];
        const imgHtml = isComic ? `
          <div class="comic-panel-illustration" style="margin-top:12px; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3); min-height:160px; display:flex; align-items:center; justify-content:center; position:relative;" id="panelImgWrap_${scIdx}">
            ${existingImg ? `<img src="${existingImg}" style="width:100%; height:220px; object-fit:cover; display:block;" alt="Panel ${sc.num}">` : `
              <button onclick="window.illustrateStaticPanel(${scIdx})" class="btn-illustrate-single" style="background:rgba(255,123,46,0.12); border:1px solid rgba(255,123,46,0.3); color:var(--accent); padding:8px 16px; border-radius:8px; font-weight:700; font-size:0.78rem; cursor:pointer; display:flex; align-items:center; gap:6px;">
                <span>✨</span> Illustrate Panel ${sc.num || scIdx + 1}
              </button>
            `}
          </div>
        ` : '';

        return `
          <div class="comic-panel-box">
            <span class="panel-number-tag">${isComic ? "Panel " + (sc.num || scIdx + 1) : "Chapter " + (sc.num || scIdx + 1)}</span>
            <div class="panel-header">${sc.heading}</div>
            <div class="panel-body">${content}</div>
            ${imgHtml}
          </div>
        `;
      }).join("");
    }

    // Populate Moral
    if (moralText) moralText.textContent = prod.moral || "Kindness always wins.";

    // Editor Label & Script Box
    if (editorBadgeLabel) {
      editorBadgeLabel.textContent = prod.productType === "story"
        ? "📝 Complete Story Script & Editor"
        : "📝 Complete Comic Book Script & Editor";
    }
    if (storyScriptBox) storyScriptBox.value = prod.rawText || "";

    // Word count
    if (wordCountBadge) {
      const words = prod.rawText ? prod.rawText.trim().split(/\s+/).length : 0;
      wordCountBadge.textContent = `${words} words`;
    }

    // Sync URL hash
    history.replaceState(null, "", `#${prod.id}`);

    closeSidebar();
  }

  // ── 4. SIDEBAR TOGGLE & MOBILE DRAWER ──
  function openSidebar() {
    if (sidebar) sidebar.classList.add("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      const wrapper = $(".workspace-wrapper");
      if (window.innerWidth > 860) {
        // Desktop Collapse / Disappear Toggle
        if (wrapper) {
          wrapper.classList.toggle("sidebar-collapsed");
          const isCollapsed = wrapper.classList.contains("sidebar-collapsed");
          sidebarToggle.innerHTML = isCollapsed 
            ? `<span>☰</span> Show Sidebar` 
            : `<span>☰</span> Hide Sidebar`;
        }
      } else {
        // Mobile Drawer
        if (sidebar && sidebar.classList.contains("open")) closeSidebar();
        else openSidebar();
      }
    });
  }

  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebar);

  // ── 5. GENERATE HANDLER ──
  async function handleGenerate() {
    const topic = topicInput ? topicInput.value.trim() : "";
    if (!topic) {
      alert("Please enter a topic first!");
      return;
    }

    const currentProd = products.find((p) => p.id === activeProductId);
    if (!currentProd) return;

    generateBtn.disabled = true;
    generateBtn.innerHTML = `<span class="spinner"></span> Creating...`;
    if (genStatus) genStatus.textContent = `Generating ${currentProd.name} with AI...`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          product_type: currentProd.productType
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to generate");

      const parsed = parseProductMarkdown(data.story, topic);
      Object.assign(currentProd, parsed);
      currentProd.rawText = data.story;
      saveProducts();

      shiftToProduct(activeProductId);
      if (genStatus) genStatus.textContent = `Generated successfully: "${parsed.title}"!`;
      if (topicInput) topicInput.value = "";
    } catch (err) {
      if (genStatus) genStatus.textContent = "Error: " + err.message;
      alert("Generation failed: " + err.message);
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `<span id="generateBtnText">${currentProd.btnText}</span>`;
    }
  }

  if (generateBtn) generateBtn.addEventListener("click", handleGenerate);

  // ── 6. REVISE HANDLER ──
  async function handleRevise() {
    const change = revisionInput ? revisionInput.value.trim() : "";
    const currentScript = storyScriptBox ? storyScriptBox.value.trim() : "";
    if (!change) {
      alert("Please describe what changes you want to apply!");
      return;
    }
    if (!currentScript) {
      alert("No content to revise!");
      return;
    }

    const currentProd = products.find((p) => p.id === activeProductId);
    if (!currentProd) return;

    reviseBtn.disabled = true;
    reviseBtn.innerHTML = `<span class="spinner"></span> Revising...`;
    if (genStatus) genStatus.textContent = "Revising with AI...";

    try {
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: currentScript,
          change,
          product_type: currentProd.productType
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to revise");

      const parsed = parseProductMarkdown(data.story, currentProd.topic || "Revised");
      Object.assign(currentProd, parsed);
      currentProd.rawText = data.story;
      saveProducts();

      shiftToProduct(activeProductId);
      if (genStatus) genStatus.textContent = `Applied change: "${change}"!`;
      if (revisionInput) revisionInput.value = "";
    } catch (err) {
      if (genStatus) genStatus.textContent = "Error: " + err.message;
      alert("Revision failed: " + err.message);
    } finally {
      reviseBtn.disabled = false;
      reviseBtn.innerHTML = `<span>🔄</span> Apply Revision`;
    }
  }

  if (reviseBtn) reviseBtn.addEventListener("click", handleRevise);

  // ── 7. SCRIPT BOX EDIT SYNC ──
  if (storyScriptBox) {
    storyScriptBox.addEventListener("input", () => {
      const currentProd = products.find((p) => p.id === activeProductId);
      if (currentProd) {
        currentProd.rawText = storyScriptBox.value;
        saveProducts();
        if (wordCountBadge) {
          const words = currentProd.rawText.trim().split(/\s+/).length;
          wordCountBadge.textContent = `${words} words`;
        }
      }
    });
  }

  // ── 8. COPY & DOWNLOAD ──
  if (copyStoryBtn) {
    copyStoryBtn.addEventListener("click", () => {
      const currentProd = products.find((p) => p.id === activeProductId);
      const text = currentProd ? currentProd.rawText : (storyScriptBox ? storyScriptBox.value : "");
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        copyStoryBtn.textContent = "Copied! ✓";
        setTimeout(() => (copyStoryBtn.textContent = "📋 Copy Output"), 2000);
      });
    });
  }

  if (downloadStoryBtn) {
    downloadStoryBtn.addEventListener("click", () => {
      const currentProd = products.find((p) => p.id === activeProductId);
      const text = currentProd ? currentProd.rawText : (storyScriptBox ? storyScriptBox.value : "");
      if (!text) return;
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(currentProd?.slug || "product")}-output.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // ── 9. URL PARAM / HASH RESOLUTION ──
  function resolveInitialProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab") || urlParams.get("product");

    if (tabParam) {
      const found = products.find((p) => p.slug === tabParam.toLowerCase() || p.productType === tabParam.toLowerCase());
      if (found) return found.id;
    }

    const hash = window.location.hash.replace("#", "");
    if (hash && products.some((p) => p.id === hash)) {
      return hash;
    }

  // ── 10. COMIC ILLUSTRATION HELPERS ──
  window.__comic_panel_images = {};

  window.illustrateStaticPanel = async function (idx) {
    const currentProd = products.find((p) => p.id === activeProductId);
    if (!currentProd || !currentProd.scenes || !currentProd.scenes[idx]) return;

    const wrap = document.getElementById(`panelImgWrap_${idx}`);
    if (wrap) {
      wrap.innerHTML = `<span style="font-size:0.75rem; color:var(--text-dim); display:flex; align-items:center; gap:6px;"><span class="spinner"></span> Rendering Comic Illustration...</span>`;
    }

    const scene = currentProd.scenes[idx];
    const styleSelect = document.getElementById("comicArtStyleSelect");
    const style = styleSelect ? styleSelect.value : "comic-modern";
    const prompt = scene.content || scene.heading || `Comic panel ${idx + 1} for ${currentProd.title}`;

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          style: style,
          model: "flux-schnell"
        })
      });
      const data = await res.json();
      if (data.image_url) {
        window.__comic_panel_images[idx] = data.image_url;
        if (wrap) {
          wrap.innerHTML = `
            <img src="${data.image_url}" style="width:100%; height:220px; object-fit:cover; display:block;" alt="Panel ${idx + 1}">
            <button onclick="window.illustrateStaticPanel(${idx})" style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.75); border:1px solid rgba(255,255,255,0.2); color:#fff; font-size:0.7rem; padding:4px 8px; border-radius:6px; cursor:pointer;">
              🔄 Redo
            </button>
          `;
        }
      } else {
        if (wrap) wrap.innerHTML = `<span style="color:#ef4444; font-size:0.75rem;">Failed to illustrate</span>`;
      }
    } catch (e) {
      console.error(e);
      if (wrap) wrap.innerHTML = `<span style="color:#ef4444; font-size:0.75rem;">Error generating image</span>`;
    }
  };

  const illustrateAllBtn = document.getElementById("illustrateAllPanelsBtn");
  if (illustrateAllBtn) {
    illustrateAllBtn.addEventListener("click", async () => {
      const currentProd = products.find((p) => p.id === activeProductId);
      if (!currentProd || !currentProd.scenes) return;

      illustrateAllBtn.disabled = true;
      illustrateAllBtn.textContent = "⏳ Illustrating...";

      for (let i = 0; i < currentProd.scenes.length; i++) {
        await window.illustrateStaticPanel(i);
      }

      illustrateAllBtn.disabled = false;
      illustrateAllBtn.textContent = "✨ Illustrate All Comic Panels";
    });
  }

  // ── 11. INITIALIZE ──
  renderSidebar();
  activeProductId = resolveInitialProduct();
  shiftToProduct(activeProductId);

  window.addEventListener("hashchange", () => {
    const newHash = window.location.hash.replace("#", "");
    if (newHash && products.some((p) => p.id === newHash)) {
      shiftToProduct(newHash);
    }
  });

})();
