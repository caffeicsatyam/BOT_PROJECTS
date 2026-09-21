/* ─────────────────────────────────────
   AI Products Studio – Landing Page JS
   ───────────────────────────────────── */
(function () {
  "use strict";

  // ── DOM refs ──
  const $ = (s) => document.querySelector(s);
  const navToggle     = $("#navToggle");
  const navLinks      = $(".nav-links");
  const toastContainer = $("#toastContainer");

  // ── NAVBAR toggle (mobile) ──
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
    document.querySelectorAll(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => navLinks.classList.remove("open"))
    );
  }

  // ── TOAST ──
  function showToast(msg, type = "info") {
    if (!toastContainer) return;
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3500);
  }

  // ── SCROLL ANIMATIONS ──
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => entry.target.classList.add("visible"), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document
      .querySelectorAll(".feature-card, .step-card, .about-card, .about-text, .product-card")
      .forEach((el) => observer.observe(el));

    // ── COUNTER ANIMATION ──
    function animateCounters() {
      document.querySelectorAll(".stat-number").forEach((el) => {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current;
        }, 30);
      });
    }

    const heroEl = document.querySelector(".hero");
    if (heroEl) {
      const heroObserver = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { animateCounters(); heroObserver.disconnect(); } },
        { threshold: 0.5 }
      );
      heroObserver.observe(heroEl);
    }
  }
})();
