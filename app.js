/* =========================================================
   PORTFOLIO V0.6.1 — MASTER APPLICATION CONTROLLER
   Coin-Op CRT Boot Loader • Side-by-Side ISIM Video & Tetris Collage
   Unboxed Vertical Education Roulette + Archival Photo Hover Sync
   Polarity-Syncing Alley Cat & Scroll-Rain Audio Coordination
   ========================================================= */

(function () {
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  let currentLang = localStorage.getItem("kai_v06_lang") || "en";
  let currentTheme = localStorage.getItem("kai_v06_theme") || "light";
  let currentFocus = "hci";
  let eduIndex = 0;
  let credIndex = 0;

  let hero3dThemeUpdater = null;
  let hero3dShaderUpdater = null;
  let openCertInspectorFn = null;
  let openProjectModalFn = null;

  function isOverlayActive() {
    return (
      document.body.classList.contains("lounge-open") ||
      document.body.classList.contains("theater-open") ||
      document.body.classList.contains("modal-open")
    );
  }

  /* ---------------------------------------------------------
     0. RESILIENT ASSET LOADER (PHOTOS & 3D CERT TEXTURES)
     --------------------------------------------------------- */
  const imageCache = new Map();

  function buildCandidateUrls(rawPath) {
    if (!rawPath) return [];
    const clean = String(rawPath).trim().replace(/^\/+/, "");
    return Array.from(new Set([clean, `./${clean}`, `/${clean}`]));
  }

  function loadImageResilient(rawPath) {
    if (!rawPath) return Promise.reject(new Error("Empty asset path"));
    if (imageCache.has(rawPath)) return imageCache.get(rawPath);

    const candidates = buildCandidateUrls(rawPath);
    const promise = new Promise((resolve, reject) => {
      let idx = 0;
      function tryNext() {
        if (idx >= candidates.length) {
          reject(new Error(`Could not load asset: ${rawPath}`));
          return;
        }
        const img = new Image();
        const url = candidates[idx++];
        img.onload = () => {
          if (img.naturalWidth > 0) resolve({ img, url });
          else tryNext();
        };
        img.onerror = () => tryNext();
        img.src = url;
      }
      tryNext();
    });

    imageCache.set(rawPath, promise);
    return promise;
  }

  /* ---------------------------------------------------------
     1. DYNAMIC KAI. SVG FAVICON
     --------------------------------------------------------- */
  function updateFavicon(theme) {
    const link = document.getElementById("dynamicFavicon");
    if (!link) return;
    const dotColor = theme === "dark" ? "%2364e3db" : "%239b1c24";
    const bgColor = theme === "dark" ? "%230f1012" : "%23121212";
    link.href = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='${bgColor}'/%3E%3Ctext x='11' y='46' font-family='Arial Black, sans-serif' font-weight='900' font-size='36' fill='%23f4f4f2'%3EK%3C/text%3E%3Ccircle cx='48' cy='42' r='7' fill='${dotColor}'/%3E%3C/svg%3E`;
  }

  /* ---------------------------------------------------------
     2. DUAL-POLARITY THEME SWITCHER (MONOLITH + CAT COAT FLIP)
     --------------------------------------------------------- */
  function applyTheme(theme, playSound = false) {
    currentTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("kai_v06_theme", currentTheme);
    updateFavicon(currentTheme);

    if (typeof hero3dThemeUpdater === "function") {
      hero3dThemeUpdater(currentTheme);
    }
    if (window.AlleyCat && typeof window.AlleyCat.syncTheme === "function") {
      window.AlleyCat.syncTheme();
    }
    if (playSound && window.CRTConsole && window.CRTConsole.playDegauss) {
      window.CRTConsole.playDegauss();
    }
  }

  /* ---------------------------------------------------------
     3. BILINGUAL LANGUAGE ENGINE (EN | ID)
     --------------------------------------------------------- */
  function applyLanguage(lang, playSound = false) {
    currentLang = lang === "id" ? "id" : "en";
    localStorage.setItem("kai_v06_lang", currentLang);
    document.documentElement.lang = currentLang;

    document.querySelectorAll(".lang-btn[data-lang]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });

    const dict = DATA.i18n[currentLang] || DATA.i18n.en;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });

    renderAboutFocus(currentFocus, false);
    renderEducationCards();
    updateEducationMap(eduIndex);
    renderInlineIsimShowcase(false);
    updateCredentialPanel(credIndex, false);
    updateHeroPillarCaption();

    if (playSound && window.CRTConsole && window.CRTConsole.playKeySwitch) {
      window.CRTConsole.playKeySwitch(currentLang === "id" ? 1 : 0);
    }
  }

  /* ---------------------------------------------------------
     4. COIN-OP ARCADE CRT BOOT LOADER (~2.4s)
     --------------------------------------------------------- */
  function runIntroCurtain() {
    const curtain = document.getElementById("introCurtain");
    const beam = document.getElementById("introCrtBeam");
    const coin = document.getElementById("introCoin");
    const coinSlot = document.getElementById("introCoinSlot");
    const mark = document.getElementById("introMark");
    const bootLines = document.querySelectorAll("#introBootLog .boot-line");
    const counter = document.getElementById("introCounter");
    const fill = document.getElementById("introBarFill");
    const status = document.getElementById("introStatus");

    if (!curtain) return;
    if (prefersReducedMotion || !window.gsap) {
      curtain.classList.add("is-done");
      return;
    }

    // Unlock audio immediately if visitor clicks during boot screen
    curtain.addEventListener(
      "pointerdown",
      () => {
        if (window.CRTConsole && window.CRTConsole.unlockAudio) {
          window.CRTConsole.unlockAudio();
        }
      },
      { once: true }
    );

    const stages = [
      "INSERTING TOKEN...",
      "VERIFYING ROM BANKS",
      "WARMING PHOSPHOR TUBE",
      "CREDIT 01 // BOOTING"
    ];
    const obj = { val: 0 };

    const tl = window.gsap.timeline({
      onComplete: () => curtain.classList.add("is-done")
    });

    // Phase 1: Token spins & drops into slot with metallic coin-clink SFX
    if (coin) {
      tl.fromTo(
        coin,
        { y: -42, rotateY: 0, opacity: 0, scale: 0.9 },
        { y: 0, rotateY: 360, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
        0.06
      ).to(
        coin,
        {
          y: 64,
          scaleX: 0.22,
          scaleY: 0.85,
          opacity: 0,
          duration: 0.3,
          ease: "power3.in",
          onStart: () => {
            if (window.CRTConsole && window.CRTConsole.playBootCoinClink) {
              window.CRTConsole.playBootCoinClink();
            }
          }
        },
        0.54
      );
    }

    if (coinSlot) {
      tl.to(
        coinSlot,
        {
          borderColor: "#64e3db",
          boxShadow: "0 0 38px rgba(100, 227, 219, 0.72), inset 0 6px 16px rgba(0, 0, 0, 0.85)",
          scale: 1.05,
          duration: 0.14,
          yoyo: true,
          repeat: 1,
          ease: "power2.out"
        },
        0.78
      );
    }

    if (mark) {
      tl.fromTo(
        mark,
        { opacity: 0.2, letterSpacing: "0.08em" },
        { opacity: 1, letterSpacing: "-0.05em", duration: 0.48, ease: "power3.out" },
        0.55
      );
    }

    if (bootLines.length) {
      tl.to(
        bootLines,
        {
          opacity: 1,
          x: 0,
          duration: 0.22,
          stagger: 0.26,
          ease: "power2.out"
        },
        0.76
      );
    }

    tl.to(
      obj,
      {
        val: 100,
        duration: 1.55,
        ease: "power2.inOut",
        onUpdate: () => {
          const n = Math.round(obj.val);
          if (counter) counter.textContent = `${String(n).padStart(2, "0")}%`;
          if (fill) fill.style.width = `${n}%`;
          if (status) {
            const idx = Math.min(stages.length - 1, Math.floor((n / 100) * stages.length));
            status.textContent = stages[idx];
          }
        }
      },
      0.42
    );

    // Phase 3: CRT TV Power-On Sound + Phosphor Beam Opening Into Portfolio
    if (beam) {
      tl.to(
        beam,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.18,
          ease: "expo.out",
          onStart: () => {
            if (window.CRTConsole && window.CRTConsole.playCrtPowerOn) {
              window.CRTConsole.playCrtPowerOn();
            }
          }
        },
        1.98
      ).to(beam, { height: "100vh", opacity: 0.85, duration: 0.28, ease: "expo.inOut" }, 2.14);
    }

    tl.to(curtain, { opacity: 0, duration: 0.28, ease: "power2.out" }, 2.24).from(
      ".hero-reveal",
      {
        y: 34,
        scale: 0.98,
        opacity: 0,
        duration: 0.78,
        stagger: 0.07,
        ease: "power4.out",
        clearProps: "transform,opacity"
      },
      2.22
    );
  }

  /* ---------------------------------------------------------
     5. INTERACTIVE HERO NAME (SMOOTH INERTIAL WAVE)
     --------------------------------------------------------- */
  function initHero3DTitle() {
    const stage = document.getElementById("heroTitle3d");
    const title = stage ? stage.querySelector(".hero-title--3d") : null;
    const heroSection = document.querySelector(".hero");
    if (!stage || !title || !heroSection || isTouchDevice || prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    heroSection.addEventListener("pointermove", (e) => {
      const r = heroSection.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width - 0.5;
      targetY = (e.clientY - r.top) / r.height - 0.5;
    });

    heroSection.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
    });

    function tick() {
      requestAnimationFrame(tick);
      if (isOverlayActive()) return;

      curX += (targetX - curX) * 0.09;
      curY += (targetY - curY) * 0.09;

      title.style.setProperty("--ry", `${(curX * 15).toFixed(2)}deg`);
      title.style.setProperty("--rx", `${(-curY * 11).toFixed(2)}deg`);
      title.style.setProperty("--shx", `${(1 - curX * 3.1).toFixed(2)}px`);
      title.style.setProperty("--shy", `${(1.4 - curY * 2.1).toFixed(2)}px`);
    }
    tick();
  }

  /* ---------------------------------------------------------
     6. DRAG-TO-ORBIT 3D MONOLITH + RIGHT-ALIGNED SHADER PAD
     --------------------------------------------------------- */
  let pillarIdx = 0;
  let activeShader = "concrete";

  function updateHeroPillarCaption() {
    const badge = document.getElementById("monolithPillarBadge");
    const caption = document.getElementById("monolithPillarCaption");
    const dots = document.querySelectorAll("#monolithDots .m-dot");
    const pillar = DATA.heroPillars[pillarIdx];
    if (!pillar) return;

    if (badge) badge.textContent = pillar.badge;
    if (caption) caption.textContent = pillar.caption[currentLang] || pillar.caption.en;
    dots.forEach((d, i) => d.classList.toggle("active", i === pillarIdx));
  }

  function initHero3DMonolith() {
    const canvas = document.getElementById("hero3dCanvas");
    const canvasBox = document.getElementById("monolithCanvasBox");
    const cycleBtn = document.getElementById("monolithCycleBtn");
    const shaderReadout = document.getElementById("monolithShaderReadout");
    const macroKeys = document.querySelectorAll("#heroMacroPad .macro-key[data-shader]");
    if (!canvas || !canvasBox || !window.THREE) return;

    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 4 / 3.2, 0.1, 100);
    camera.position.set(0, 0.25, 6.2);

    scene.add(new THREE.AmbientLight(0xffffff, 0.68));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const accentLight = new THREE.PointLight(0x9b1c24, 2.4, 16);
    accentLight.position.set(-3.2, -1.8, 3.6);
    scene.add(accentLight);

    const root = new THREE.Group();
    scene.add(root);

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xdad9d2,
      roughness: 0.74,
      metalness: 0.14,
      flatShading: true,
      transparent: false,
      opacity: 1
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x9b1c24,
      emissive: 0x9b1c24,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.28,
      flatShading: true
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x121212,
      wireframe: true,
      transparent: true,
      opacity: 0.14
    });

    const shapes = [];

    const g0 = new THREE.Group();
    g0.add(new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.55, 1.0), concreteMat));
    g0.add(new THREE.Mesh(new THREE.BoxGeometry(1.62, 2.62, 1.06), wireMat));
    const core0 = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), accentMat);
    core0.position.set(0.88, 0.72, 0.56);
    g0.add(core0);
    shapes.push(g0);

    const g1 = new THREE.Group();
    g1.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.45, 0), concreteMat));
    g1.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.56, 0), wireMat));
    g1.add(new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.08, 6, 24), accentMat));
    g1.visible = false;
    shapes.push(g1);

    const g2 = new THREE.Group();
    g2.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.95, 0.3, 48, 8), concreteMat));
    g2.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.98, 0.31, 32, 6), wireMat));
    g2.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), accentMat));
    g2.visible = false;
    shapes.push(g2);

    shapes.forEach((s) => root.add(s));

    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.06, 6, 36), concreteMat);
    outerRing.rotation.x = 1.15;
    root.add(outerRing);

    const accentOrb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), accentMat);
    root.add(accentOrb);

    function applyVisualState() {
      const isDark = currentTheme === "dark";
      const accentHex = isDark ? 0x64e3db : 0x9b1c24;
      accentLight.color.setHex(accentHex);

      if (activeShader === "concrete") {
        concreteMat.wireframe = false;
        concreteMat.transparent = false;
        concreteMat.opacity = 1;
        concreteMat.color.setHex(isDark ? 0x2c313c : 0xdad9d2);
        concreteMat.emissive.setHex(0x000000);
        concreteMat.emissiveIntensity = 0;
        wireMat.color.setHex(isDark ? 0x64e3db : 0x121212);
        wireMat.opacity = isDark ? 0.22 : 0.14;
        accentMat.color.setHex(accentHex);
        accentMat.emissive.setHex(accentHex);
        accentMat.emissiveIntensity = 0.5;
      } else if (activeShader === "blueprint") {
        concreteMat.wireframe = true;
        concreteMat.transparent = true;
        concreteMat.opacity = 0.82;
        concreteMat.color.setHex(isDark ? 0x64e3db : 0x1d4ed8);
        concreteMat.emissive.setHex(isDark ? 0x164e63 : 0x1e3a8a);
        concreteMat.emissiveIntensity = 0.45;
        wireMat.color.setHex(isDark ? 0xe0f2fe : 0x0f172a);
        wireMat.opacity = 0.35;
        accentMat.color.setHex(accentHex);
        accentMat.emissive.setHex(accentHex);
        accentMat.emissiveIntensity = 0.9;
      } else if (activeShader === "holo") {
        concreteMat.wireframe = false;
        concreteMat.transparent = true;
        concreteMat.opacity = 0.42;
        concreteMat.color.setHex(0x38bdf8);
        concreteMat.emissive.setHex(0x0284c7);
        concreteMat.emissiveIntensity = 0.65;
        wireMat.color.setHex(0x64e3db);
        wireMat.opacity = 0.55;
        accentMat.color.setHex(0x4ade80);
        accentMat.emissive.setHex(0x22c55e);
        accentMat.emissiveIntensity = 1.25;
      } else if (activeShader === "overdrive") {
        concreteMat.wireframe = false;
        concreteMat.transparent = false;
        concreteMat.opacity = 1;
        concreteMat.color.setHex(0x18181b);
        concreteMat.emissive.setHex(accentHex);
        concreteMat.emissiveIntensity = 0.32;
        wireMat.color.setHex(0xfbbf24);
        wireMat.opacity = 0.5;
        accentMat.color.setHex(0xfbbf24);
        accentMat.emissive.setHex(0xf59e0b);
        accentMat.emissiveIntensity = 1.4;
      }

      if (shaderReadout) {
        shaderReadout.textContent = `DRAG TO ORBIT • ${activeShader.toUpperCase()}`;
      }
    }

    hero3dThemeUpdater = () => applyVisualState();
    hero3dShaderUpdater = (mode) => {
      activeShader = mode;
      applyVisualState();
    };
    applyVisualState();

    function resize3D() {
      const w = Math.max(200, canvasBox.clientWidth);
      const h = Math.max(180, canvasBox.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize3D();
    window.addEventListener("resize", resize3D);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velX = 0;
    let velY = 0;
    let spinBoost = 0;

    canvasBox.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
      velY = 0;
    });

    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      velY = dx * 0.011;
      velX = dy * 0.011;
      root.rotation.y += velY;
      root.rotation.x = Math.max(-1.2, Math.min(1.2, root.rotation.x + velX));
    });

    window.addEventListener("pointerup", () => {
      dragging = false;
    });

    if (cycleBtn) {
      cycleBtn.addEventListener("click", () => {
        pillarIdx = (pillarIdx + 1) % DATA.heroPillars.length;
        spinBoost = 0.32;
        shapes.forEach((s, i) => {
          s.visible = i === pillarIdx;
        });
        updateHeroPillarCaption();
        if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
          window.CRTConsole.playKeySwitch(pillarIdx + 1);
        }
      });
    }

    macroKeys.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.shader || "concrete";
        macroKeys.forEach((k) => k.classList.toggle("active", k === btn));
        spinBoost = mode === "overdrive" ? 0.42 : 0.22;
        if (typeof hero3dShaderUpdater === "function") {
          hero3dShaderUpdater(mode);
        }
        if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
          window.CRTConsole.playKeySwitch(idx);
        }
      });
    });

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      if (isOverlayActive()) return;

      const speedMult = activeShader === "overdrive" ? 3.2 : 1;
      t += 0.014 * speedMult;
      spinBoost *= 0.91;

      if (!dragging) {
        root.rotation.y += 0.007 * speedMult + spinBoost + velY;
        root.rotation.x = Math.max(-1.2, Math.min(1.2, root.rotation.x + velX));
        velY *= 0.93;
        velX *= 0.93;
      }

      root.position.y = Math.sin(t * 1.4) * 0.14;
      outerRing.rotation.z = t * 0.6;
      accentOrb.position.set(
        Math.cos(t * 1.6) * 2.15,
        Math.sin(t * 1.6) * 0.95,
        Math.sin(t * 1.6) * 1.8
      );

      renderer.render(scene, camera);
    }

    updateHeroPillarCaption();
    animate();
  }

  /* ---------------------------------------------------------
     7. REHAULED ABOUT SECTION (CLEAN STATEMENT + CABINET PROOF)
     --------------------------------------------------------- */
  function renderAboutFocus(focusKey, animate = true) {
    currentFocus = focusKey;
    const entry = DATA.aboutFocus[focusKey];
    if (!entry) return;

    const copy = entry[currentLang] || entry.en;
    const leadEl = document.getElementById("aboutFocusLead");
    const bodyEl = document.getElementById("aboutFocusBody");

    document.querySelectorAll("#aboutFocusTabs .focus-tab").forEach((btn) => {
      const active = btn.dataset.focus === focusKey;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    const paintContent = () => {
      if (leadEl) leadEl.textContent = copy.lead;
      if (bodyEl) bodyEl.textContent = copy.body;
    };

    if (animate && window.gsap && leadEl && bodyEl && !prefersReducedMotion) {
      window.gsap.to([leadEl, bodyEl], {
        opacity: 0,
        y: 6,
        duration: 0.14,
        ease: "power2.in",
        onComplete: () => {
          paintContent();
          window.gsap.fromTo(
            [leadEl, bodyEl],
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" }
          );
        }
      });
    } else {
      paintContent();
    }

    const matchedPills = [];
    document.querySelectorAll("#skillPillsWrap .skill-pill").forEach((pill) => {
      const match = pill.dataset.group === focusKey;
      pill.style.opacity = "";
      pill.classList.toggle("is-highlighted", match);
      pill.classList.toggle("is-dimmed", !match);
      if (match) matchedPills.push(pill);
    });

    if (animate && window.gsap && matchedPills.length && !prefersReducedMotion) {
      window.gsap.fromTo(
        matchedPills,
        { y: 6, scale: 0.95 },
        { y: -2, scale: 1, duration: 0.28, stagger: 0.03, ease: "back.out(1.6)", clearProps: "transform" }
      );
    }
  }

  function hydratePortrait() {
    const box = document.getElementById("portraitBox");
    if (!box || !DATA.portraitImage) return;
    loadImageResilient(DATA.portraitImage)
      .then(({ url }) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Portrait of Fauza Kaizaku Setiawan";
        box.innerHTML = "";
        box.appendChild(img);
      })
      .catch(() => {});
  }

  function initAboutSection() {
    document.querySelectorAll("#aboutFocusTabs .focus-tab").forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        renderAboutFocus(btn.dataset.focus, true);
        if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
          window.CRTConsole.playKeySwitch(idx);
        }
      });
    });
    renderAboutFocus("hci", false);
    hydratePortrait();

    const counterEl = document.getElementById("cabinetCounter");
    if (counterEl) {
      const target = Number(counterEl.dataset.target || 4);
      if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
        const obj = { val: 0 };
        window.gsap.to(obj, {
          val: target,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: counterEl,
            start: "top 88%",
            once: true
          },
          onUpdate: () => {
            counterEl.textContent = String(Math.round(obj.val)).padStart(2, "0");
          }
        });
      } else {
        counterEl.textContent = String(target).padStart(2, "0");
      }
    }
  }

  /* ---------------------------------------------------------
     8. UNBOXED VERTICAL ROULETTE + ARCHIVAL MASKED PHOTOS & MAP
     --------------------------------------------------------- */
  function positionCircularCards(cards, activeIdx) {
    const total = cards.length;
    cards.forEach((card, i) => {
      card.classList.remove("pos-center", "pos-prev", "pos-next", "pos-hidden-left", "pos-hidden-right");
      const diff = (i - activeIdx + total) % total;
      if (diff === 0) card.classList.add("pos-center");
      else if (diff === 1) card.classList.add("pos-next");
      else if (diff === total - 1) card.classList.add("pos-prev");
      else if (diff <= total / 2) card.classList.add("pos-hidden-right");
      else card.classList.add("pos-hidden-left");
    });
  }

  function updateEducationMap(index) {
    const item = DATA.educationTrack[index];
    if (!item) return;

    const cityEl = document.getElementById("mapCity");
    const typeEl = document.getElementById("mapTypeBadge");
    const titleEl = document.getElementById("mapTitle");
    const extLink = document.getElementById("mapExternalLink");
    const photosLink = document.getElementById("eduPhotosLink");
    const mapFrame = document.getElementById("eduMapIframe");
    const satFrame = document.getElementById("eduSatIframe");
    const buildingVisual = document.getElementById("eduBuildingVisual");
    const buildingCaption = document.getElementById("eduBuildingCaption");
    const hoverTitle = document.getElementById("eduBuildingHoverTitle");
    const hoverSub = document.getElementById("eduBuildingHoverSub");

    if (cityEl) cityEl.textContent = item.city;
    if (titleEl) titleEl.textContent = item.name;
    if (typeEl) {
      typeEl.textContent = item.stage[currentLang] || item.stage.en;
      typeEl.classList.toggle("map-type-badge--accent", item.type === "industry");
    }

    if (hoverTitle) hoverTitle.textContent = item.name;
    if (hoverSub) hoverSub.textContent = item.role[currentLang] || item.role.en;

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${item.mapQuery}`;
    if (extLink) extLink.href = mapsUrl;
    if (photosLink) photosLink.href = mapsUrl;

    const z = item.zoom || 17;
    if (mapFrame) {
      mapFrame.src = `https://maps.google.com/maps?q=${item.mapQuery}&t=&z=${z}&ie=UTF8&iwloc=&output=embed`;
    }
    if (satFrame) {
      satFrame.src = `https://maps.google.com/maps?q=${item.mapQuery}&t=k&z=${z}&ie=UTF8&iwloc=&output=embed`;
    }

    if (buildingCaption) {
      buildingCaption.textContent = item.imageCaption || "ARCHIVE";
    }

    if (buildingVisual) {
      if (item.image) {
        loadImageResilient(item.image)
          .then(({ url }) => {
            if (eduIndex !== index) return;
            buildingVisual.innerHTML = "";
            const img = document.createElement("img");
            img.src = url;
            img.alt = item.name;
            buildingVisual.appendChild(img);
          })
          .catch(() => {
            if (eduIndex !== index) return;
            buildingVisual.innerHTML = "";
          });
      } else {
        buildingVisual.innerHTML = "";
      }
    }
  }

  function renderEducationCards() {
    const stage = document.getElementById("eduStage");
    const counter = document.getElementById("eduCounter");
    if (!stage) return;

    stage.innerHTML = "";
    DATA.educationTrack.forEach((item, idx) => {
      const card = document.createElement("article");
      card.className = `edu-card ${item.type === "industry" ? "edu-card--industry" : ""}`;
      card.innerHTML = `
        <div class="edu-card-top">
          <span class="edu-stage-label">${item.stage[currentLang] || item.stage.en}</span>
          <span class="edu-pill">${item.badge[currentLang] || item.badge.en}</span>
        </div>
        <h3 class="edu-name">${item.name}</h3>
        <p class="edu-role">${item.role[currentLang] || item.role.en}</p>
        <span class="edu-city">${item.city}</span>
      `;
      card.addEventListener("click", () => {
        if (eduIndex !== idx) {
          eduIndex = idx;
          syncEducationSlider();
        }
      });
      stage.appendChild(card);
    });

    const cards = Array.from(stage.querySelectorAll(".edu-card"));
    positionCircularCards(cards, eduIndex);
    if (counter) {
      counter.textContent = `${String(eduIndex + 1).padStart(2, "0")} / ${String(DATA.educationTrack.length).padStart(2, "0")}`;
    }
  }

  function syncEducationSlider() {
    const stage = document.getElementById("eduStage");
    const counter = document.getElementById("eduCounter");
    if (!stage) return;
    const cards = Array.from(stage.querySelectorAll(".edu-card"));
    positionCircularCards(cards, eduIndex);
    if (counter) {
      counter.textContent = `${String(eduIndex + 1).padStart(2, "0")} / ${String(DATA.educationTrack.length).padStart(2, "0")}`;
    }
    updateEducationMap(eduIndex);
    if (window.CRTConsole && window.CRTConsole.playSlotClick) {
      window.CRTConsole.playSlotClick();
    }
  }

  function initEducationSlider() {
    // Preload all 5 archival building photos silently for instant roulette switching
    DATA.educationTrack.forEach((item) => {
      if (item.image) loadImageResilient(item.image).catch(() => {});
    });

    renderEducationCards();
    updateEducationMap(eduIndex);

    const stage = document.getElementById("eduStage");
    const prevBtn = document.getElementById("eduPrevBtn");
    const nextBtn = document.getElementById("eduNextBtn");
    const total = DATA.educationTrack.length;

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        eduIndex = (eduIndex - 1 + total) % total;
        syncEducationSlider();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        eduIndex = (eduIndex + 1) % total;
        syncEducationSlider();
      });
    }

    let wheelLock = 0;
    if (stage) {
      stage.addEventListener(
        "wheel",
        (e) => {
          const now = performance.now();
          if (Math.abs(e.deltaY) < 12) return;
          e.preventDefault();
          if (now - wheelLock < 260) return;
          wheelLock = now;
          eduIndex = e.deltaY > 0 ? (eduIndex + 1) % total : (eduIndex - 1 + total) % total;
          syncEducationSlider();
        },
        { passive: false }
      );
    }
  }

  /* ---------------------------------------------------------
     9. PROJECTS: SIDE-BY-SIDE WALKTHROUGH + TETRIS COLLAGE
     --------------------------------------------------------- */
  function renderMediaInto(stageEl, item) {
    if (!stageEl || !item) return;
    const cap = item.caption ? item.caption[currentLang] || item.caption.en : "";

    if (item.type === "youtube" && item.videoId) {
      stageEl.innerHTML = `
        <div class="media-stage-content">
          <button type="button" class="yt-preview-card">
            <div class="yt-thumb-wrap">
              <img src="https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg" alt="${cap}" />
              <span class="yt-play-btn" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </span>
            </div>
            <div class="yt-caption-bar">
              <span class="yt-caption-title">▶ PLAY WALKTHROUGH</span>
              <span>${cap}</span>
            </div>
          </button>
        </div>
      `;
      const playBtn = stageEl.querySelector(".yt-preview-card");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          stageEl.innerHTML = `
            <div class="media-stage-content">
              <iframe
                class="yt-embed-frame"
                src="https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0"
                title="ISIM Walkthrough Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>
          `;
        });
      }
    } else {
      stageEl.innerHTML = `
        <div class="media-stage-content">
          <div class="media-photo-viewport"></div>
          <div class="media-photo-caption">${cap}</div>
        </div>
      `;
      const slot = stageEl.querySelector(".media-photo-viewport");
      loadImageResilient(item.src)
        .then(({ url }) => {
          if (!slot) return;
          const img = document.createElement("img");
          img.src = url;
          img.alt = cap;
          if (item.id === "team") img.style.objectPosition = "center 22%";
          slot.innerHTML = "";
          slot.appendChild(img);
        })
        .catch(() => {
          if (!slot) return;
          slot.innerHTML = `<div style="height:100%;display:grid;place-items:center;color:#94a3b8;font-family:var(--font-display);font-size:0.7rem;">ASSET NOT FOUND: ${item.src}</div>`;
        });
    }
  }

  function renderInlineIsimShowcase(forceVideo = true) {
    const videoSlot = document.getElementById("isimVideoSlot");
    const collageGrid = document.getElementById("isimCollageGrid");
    const proj = DATA.projects && DATA.projects.isim;
    if (!videoSlot || !collageGrid || !proj || !Array.isArray(proj.media)) return;

    const videoItem = proj.media.find((m) => m.type === "youtube");
    const photoItems = proj.media.filter((m) => m.type === "image");

    const hasIframePlaying = Boolean(videoSlot.querySelector("iframe"));
    if (videoItem && (forceVideo || (!hasIframePlaying && !videoSlot.children.length))) {
      renderMediaInto(videoSlot, videoItem);
    }

    collageGrid.innerHTML = "";
    // Arrange Team photo tall on left, Dashboard UI + Workspace stacked right (Zero dead space!)
    const orderedPhotos = [
      photoItems.find((p) => p.id === "team") || photoItems[2],
      photoItems.find((p) => p.id === "ui") || photoItems[0],
      photoItems.find((p) => p.id === "desk") || photoItems[1]
    ].filter(Boolean);

    orderedPhotos.forEach((item, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      const isTall = idx === 0;
      const isTeam = item.id === "team";
      btn.className = `tetris-tile ${isTall ? "tetris-tile--tall" : ""} ${isTeam ? "tetris-tile--team" : ""}`;
      const cap = item.caption ? item.caption[currentLang] || item.caption.en : "";
      btn.setAttribute("aria-label", `Inspect ${cap}`);
      btn.innerHTML = `<span class="tetris-tile-caption">${cap}</span>`;

      loadImageResilient(item.src)
        .then(({ url }) => {
          const img = document.createElement("img");
          img.src = url;
          img.alt = cap;
          btn.insertBefore(img, btn.firstChild);
        })
        .catch(() => {});

      btn.addEventListener("click", () => {
        const mediaIdx = proj.media.findIndex((m) => m.id === item.id);
        if (typeof openProjectModalFn === "function") {
          openProjectModalFn("isim", Math.max(0, mediaIdx));
        }
      });

      collageGrid.appendChild(btn);
    });
  }

  function initProjectModal() {
    const modal = document.getElementById("projectModal");
    const drawer = document.getElementById("modalDrawer");
    const closeBtn = document.getElementById("modalCloseBtn");
    const tagEl = document.getElementById("modalTag");
    const stampEl = document.getElementById("modalStamp");
    const titleEl = document.getElementById("modalTitle");
    const bodyEl = document.getElementById("modalBody");
    const mediaSection = document.getElementById("modalMediaSection");
    const mediaTabs = document.getElementById("modalMediaTabs");
    const mediaStage = document.getElementById("modalMediaStage");
    const archStrip = document.getElementById("modalArchStrip");
    const specGrid = document.getElementById("modalSpecGrid");

    if (DATA.projects.isim && Array.isArray(DATA.projects.isim.media)) {
      DATA.projects.isim.media.forEach((m) => {
        if (m.type === "image" && m.src) loadImageResilient(m.src).catch(() => {});
      });
    }
    renderInlineIsimShowcase(true);

    if (!modal) return;

    function openProject(key, startMediaIdx = 0) {
      const proj = DATA.projects[key];
      if (!proj) return;

      tagEl.textContent = proj.tag[currentLang] || proj.tag.en;
      if (proj.stamp) {
        stampEl.textContent = proj.stamp;
        stampEl.hidden = false;
      } else {
        stampEl.hidden = true;
      }

      titleEl.textContent = proj.title;
      bodyEl.textContent = proj.body[currentLang] || proj.body.en;

      if (proj.media && proj.media.length) {
        const safeIdx = Math.min(proj.media.length - 1, Math.max(0, startMediaIdx));
        mediaSection.hidden = false;
        mediaTabs.innerHTML = "";
        proj.media.forEach((m, idx) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = `media-tab-btn ${idx === safeIdx ? "active" : ""}`;
          b.textContent = m.label[currentLang] || m.label.en;
          b.addEventListener("click", () => {
            if (b.classList.contains("active")) return;
            mediaTabs.querySelectorAll(".media-tab-btn").forEach((x) => x.classList.remove("active"));
            b.classList.add("active");
            renderMediaInto(mediaStage, m);
            if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
              window.CRTConsole.playKeySwitch(idx);
            }
          });
          mediaTabs.appendChild(b);
        });
        renderMediaInto(mediaStage, proj.media[safeIdx]);
      } else {
        mediaSection.hidden = true;
      }

      if (proj.archSteps && proj.archSteps.length) {
        archStrip.hidden = false;
        archStrip.innerHTML = proj.archSteps
          .map(
            (a) => `
          <div class="arch-node">
            <span class="arch-step">${a.step}</span>
            <span class="arch-label">${a.label}</span>
          </div>`
          )
          .join("");
      } else {
        archStrip.hidden = true;
      }

      specGrid.innerHTML = proj.specs
        .map(
          (s) => `
        <div class="modal-spec-card">
          <span class="modal-spec-label">${s.label}</span>
          <p class="modal-spec-text">${s.text}</p>
        </div>`
        )
        .join("");

      document.body.classList.add("modal-open");
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      if (window.CRTConsole && window.CRTConsole.syncRain) window.CRTConsole.syncRain();

      if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
        window.CRTConsole.playKeySwitch(2);
      }

      if (window.gsap && drawer) {
        window.gsap.fromTo(
          drawer,
          { y: 34, scale: 0.96, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.32, ease: "power4.out" }
        );
      }
    }

    openProjectModalFn = openProject;

    function closeModal() {
      if (!modal.classList.contains("open")) return;
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      mediaStage.innerHTML = "";
      if (window.CRTConsole && window.CRTConsole.syncRain) window.CRTConsole.syncRain();
    }

    document.querySelectorAll("[data-open-project]").forEach((btn) => {
      btn.addEventListener("click", () => openProject(btn.dataset.openProject, 0));
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.code === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ---------------------------------------------------------
     10. RESIDENT EVIL STYLE 360° 3D CERTIFICATE INSPECTOR
     --------------------------------------------------------- */
  function initCertInspector() {
    const modal = document.getElementById("certInspectorModal");
    const canvas = document.getElementById("cert3dCanvas");
    const issuerEl = document.getElementById("certInspectIssuer");
    const titleEl = document.getElementById("certInspectTitle");
    const metaEl = document.getElementById("certInspectMeta");
    const descEl = document.getElementById("certInspectDesc");
    const closeBtn = document.getElementById("certInspectCloseBtn");
    const zoomInBtn = document.getElementById("certZoomInBtn");
    const zoomOutBtn = document.getElementById("certZoomOutBtn");
    const resetBtn = document.getElementById("certResetViewBtn");

    if (!modal || !canvas || !window.THREE) return;
    const THREE = window.THREE;

    let renderer = null;
    let scene = null;
    let camera = null;
    let plaqueMesh = null;
    let rafId = null;
    let isOpen = false;
    let disposedTextures = [];

    let rotX = 0;
    let rotY = 0;
    let velX = 0;
    let velY = 0;
    let hoverTiltX = 0;
    let hoverTiltY = 0;
    let targetZoom = 5.4;
    let curZoom = 5.4;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    function wrapCanvasText(g, text, x, y, maxW, lineH) {
      const words = String(text || "").split(" ");
      let line = "";
      let cy = y;
      for (let i = 0; i < words.length; i++) {
        const test = line ? `${line} ${words[i]}` : words[i];
        if (g.measureText(test).width > maxW && line) {
          g.fillText(line, x, cy);
          line = words[i];
          cy += lineH;
        } else {
          line = test;
        }
      }
      if (line) g.fillText(line, x, cy);
    }

    function createBackPlateTexture(item, isPortrait) {
      const c = document.createElement("canvas");
      c.width = isPortrait ? 600 : 840;
      c.height = isPortrait ? 840 : 600;
      const g = c.getContext("2d");

      const bg = g.createLinearGradient(0, 0, c.width, c.height);
      bg.addColorStop(0, "#17191f");
      bg.addColorStop(1, "#0c0e13");
      g.fillStyle = bg;
      g.fillRect(0, 0, c.width, c.height);

      g.strokeStyle = item.accent ? "#9b1c24" : "#64e3db";
      g.lineWidth = 6;
      g.strokeRect(24, 24, c.width - 48, c.height - 48);
      g.strokeStyle = "rgba(255,255,255,0.14)";
      g.lineWidth = 2;
      g.strokeRect(38, 38, c.width - 76, c.height - 76);

      g.fillStyle = "rgba(255,255,255,0.05)";
      g.font = "900 120px Unbounded, Arial Black, sans-serif";
      g.textAlign = "center";
      g.fillText("KAI.", c.width * 0.5, c.height * 0.54);

      g.fillStyle = item.accent ? "#f87171" : "#64e3db";
      g.font = "700 17px Unbounded, sans-serif";
      g.fillText(`VERIFIED ARCHIVE // CERT ${item.num}`, c.width * 0.5, c.height * 0.22);

      g.fillStyle = "#f4f4f2";
      g.font = "900 22px Unbounded, sans-serif";
      wrapCanvasText(g, item.issuer, c.width * 0.5, c.height * 0.38, c.width - 110, 30);

      g.fillStyle = "#cbd5e1";
      g.font = "600 18px Inter, sans-serif";
      wrapCanvasText(g, item.title, c.width * 0.5, c.height * 0.52, c.width - 110, 26);

      g.fillStyle = "#94a3b8";
      g.font = "700 14px Unbounded, sans-serif";
      wrapCanvasText(g, item.meta, c.width * 0.5, c.height * 0.66, c.width - 110, 22);

      g.fillStyle = "rgba(255,255,255,0.48)";
      g.font = "600 13px Inter, sans-serif";
      g.fillText("HOLDER: FAUZA KAIZAKU SETIAWAN", c.width * 0.5, c.height - 70);

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      disposedTextures.push(tex);
      return tex;
    }

    function createFallbackFrontTexture(item, isPortrait) {
      const c = document.createElement("canvas");
      c.width = isPortrait ? 600 : 840;
      c.height = isPortrait ? 840 : 600;
      const g = c.getContext("2d");
      g.fillStyle = "#faf9f5";
      g.fillRect(0, 0, c.width, c.height);
      g.strokeStyle = "#9b1c24";
      g.lineWidth = 10;
      g.strokeRect(20, 20, c.width - 40, c.height - 40);
      g.fillStyle = "#121212";
      g.font = "900 24px Unbounded, sans-serif";
      g.textAlign = "center";
      wrapCanvasText(g, item.title, c.width * 0.5, c.height * 0.48, c.width - 100, 34);
      const tex = new THREE.CanvasTexture(c);
      disposedTextures.push(tex);
      return tex;
    }

    function resizeInspector() {
      if (!renderer || !camera || !isOpen) return;
      const w = Math.max(320, window.innerWidth);
      const h = Math.max(240, window.innerHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function buildPlaque(item, frontTex, aspect) {
      if (plaqueMesh && scene) {
        scene.remove(plaqueMesh);
        plaqueMesh.geometry.dispose();
        plaqueMesh.material.forEach((m) => m.dispose());
      }

      const isPortrait = aspect < 0.98;
      let pw;
      let ph;

      if (isPortrait) {
        ph = 3.65;
        pw = Math.max(2.15, Math.min(3.2, ph * aspect));
      } else {
        pw = 4.35;
        ph = Math.max(2.4, Math.min(3.45, pw / aspect));
      }

      const edgeMat = new THREE.MeshStandardMaterial({
        color: item.accent ? 0x9b1c24 : 0x3f4450,
        metalness: 0.55,
        roughness: 0.35
      });

      const frontMat = new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: 0.42,
        metalness: 0.04
      });

      const backTex = createBackPlateTexture(item, isPortrait);
      const backMat = new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.38,
        metalness: 0.22
      });

      const geo = new THREE.BoxGeometry(pw, ph, 0.14);
      plaqueMesh = new THREE.Mesh(geo, [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat]);
      scene.add(plaqueMesh);
    }

    function openInspector(item) {
      if (!item) return;
      if (issuerEl) issuerEl.textContent = item.issuer;
      if (titleEl) titleEl.textContent = item.title;
      if (metaEl) metaEl.textContent = item.meta;
      if (descEl) descEl.textContent = item.desc[currentLang] || item.desc.en;

      isOpen = true;
      rotX = 0.03;
      rotY = -0.14;
      velX = 0;
      velY = 0;
      hoverTiltX = 0;
      hoverTiltY = 0;
      targetZoom = 5.4;
      curZoom = 6.6;

      document.body.classList.add("modal-open");
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      if (window.CRTConsole && window.CRTConsole.syncRain) window.CRTConsole.syncRain();

      if (!renderer) {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      }

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, curZoom);

      scene.add(new THREE.AmbientLight(0xffffff, 0.92));
      const key = new THREE.DirectionalLight(0xffffff, 0.55);
      key.position.set(4, 6, 8);
      scene.add(key);
      const rim = new THREE.PointLight(currentTheme === "dark" ? 0x64e3db : 0xfbbf24, 1.1, 24);
      rim.position.set(-5, -3, -4);
      scene.add(rim);

      resizeInspector();

      const fallbackAspect = item.orientation === "portrait" ? 0.72 : 1.42;

      loadImageResilient(item.image)
        .then(({ img }) => {
          if (!isOpen) return;
          const tex = new THREE.Texture(img);
          tex.needsUpdate = true;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          disposedTextures.push(tex);

          const aspect =
            img.naturalWidth && img.naturalHeight
              ? img.naturalWidth / img.naturalHeight
              : fallbackAspect;
          buildPlaque(item, tex, aspect);
        })
        .catch(() => {
          if (!isOpen) return;
          buildPlaque(item, createFallbackFrontTexture(item, fallbackAspect < 1), fallbackAspect);
        });

      if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
        window.CRTConsole.playKeySwitch(2);
      }

      if (window.gsap) {
        window.gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
      }

      function loop() {
        if (!isOpen) return;
        rafId = requestAnimationFrame(loop);

        if (!dragging) {
          rotY += velY;
          rotX += velX;
          velY *= 0.93;
          velX *= 0.93;
        }
        rotX = Math.max(-1.35, Math.min(1.35, rotX));
        curZoom += (targetZoom - curZoom) * 0.11;
        camera.position.z = curZoom;

        if (plaqueMesh) {
          const goalY = rotY + (dragging ? 0 : hoverTiltY);
          const goalX = rotX + (dragging ? 0 : hoverTiltX);
          plaqueMesh.rotation.y += (goalY - plaqueMesh.rotation.y) * 0.14;
          plaqueMesh.rotation.x += (goalX - plaqueMesh.rotation.x) * 0.14;
        }

        renderer.render(scene, camera);
      }
      loop();
    }

    function closeInspector() {
      if (!isOpen) return;
      isOpen = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;

      if (plaqueMesh && scene) {
        scene.remove(plaqueMesh);
        plaqueMesh.geometry.dispose();
        plaqueMesh.material.forEach((m) => m.dispose());
        plaqueMesh = null;
      }
      disposedTextures.forEach((t) => t.dispose());
      disposedTextures = [];

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (window.CRTConsole && window.CRTConsole.syncRain) window.CRTConsole.syncRain();
    }

    canvas.addEventListener("pointerdown", (e) => {
      if (!isOpen) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
      velY = 0;
    });

    window.addEventListener("pointermove", (e) => {
      if (!isOpen) return;
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        velY = dx * 0.009;
        velX = dy * 0.009;
        rotY += velY;
        rotX += velX;
      } else if (!isTouchDevice) {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        hoverTiltY = nx * 0.32;
        hoverTiltX = ny * 0.24;
      }
    });

    window.addEventListener("pointerup", () => {
      dragging = false;
    });

    canvas.addEventListener(
      "wheel",
      (e) => {
        if (!isOpen) return;
        e.preventDefault();
        targetZoom = Math.max(2.9, Math.min(8.2, targetZoom + e.deltaY * 0.0032));
      },
      { passive: false }
    );

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        targetZoom = Math.max(2.9, targetZoom - 0.8);
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        targetZoom = Math.min(8.2, targetZoom + 0.8);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        rotX = 0;
        rotY = 0;
        velX = 0;
        velY = 0;
        targetZoom = 5.4;
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", closeInspector);
    window.addEventListener("resize", resizeInspector);
    window.addEventListener("keydown", (e) => {
      if (e.code === "Escape" && isOpen) closeInspector();
    });

    openCertInspectorFn = openInspector;
  }

  /* ---------------------------------------------------------
     11. CREDENTIALS 3D PEEKING DECK
     --------------------------------------------------------- */
  function updateCredentialPanel(index, animate = true) {
    const item = DATA.credentials[index];
    if (!item) return;

    const panel = document.getElementById("credDetailPanel");
    const issuer = document.getElementById("detailIssuer");
    const title = document.getElementById("detailTitle");
    const meta = document.getElementById("detailMeta");
    const desc = document.getElementById("detailDesc");
    const counter = document.getElementById("credCounter");

    if (counter) {
      counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(DATA.credentials.length).padStart(2, "0")}`;
    }

    const write = () => {
      if (issuer) issuer.textContent = item.issuer;
      if (title) title.textContent = item.title;
      if (meta) meta.textContent = item.meta;
      if (desc) desc.textContent = item.desc[currentLang] || item.desc.en;
    };

    if (animate && panel) {
      panel.classList.add("switching");
      setTimeout(() => {
        write();
        panel.classList.remove("switching");
      }, 130);
    } else {
      write();
    }
  }

  function initCredentialsDeck() {
    const stage = document.getElementById("credDeckStage");
    const inspectBtn = document.getElementById("inspectCertBtn");
    if (!stage) return;

    stage.innerHTML = "";
    DATA.credentials.forEach((item, idx) => {
      const card = document.createElement("article");
      card.className = `cred-card ${item.accent ? "cred-card--accent" : ""}`;
      card.innerHTML = `
        <div class="cred-slab-body">
          <div class="slab-top-bar">
            <span>CERT // ${item.num}</span>
            <span>CLICK TO INSPECT 3D</span>
          </div>
          <div class="missing-file-box card-placeholder">
            <span class="missing-label">${item.fallbackLabel}</span>
          </div>
          <div>
            <p class="slab-issuer">${item.issuer}</p>
            <h3 class="slab-title">${item.title}</h3>
          </div>
        </div>
      `;

      const imgBox = card.querySelector(".card-placeholder");
      loadImageResilient(item.image)
        .then(({ url }) => {
          if (!imgBox) return;
          const img = document.createElement("img");
          img.src = url;
          img.alt = item.title;
          imgBox.innerHTML = "";
          imgBox.appendChild(img);
        })
        .catch(() => {});

      card.addEventListener("click", () => {
        if (credIndex !== idx) {
          credIndex = idx;
          syncCredDeck();
        } else if (typeof openCertInspectorFn === "function") {
          openCertInspectorFn(DATA.credentials[credIndex]);
        }
      });

      if (!isTouchDevice) {
        card.addEventListener("pointermove", (e) => {
          if (!card.classList.contains("pos-center")) return;
          const r = card.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty("--tilt-x", `${(-ny * 10).toFixed(2)}deg`);
          card.style.setProperty("--tilt-y", `${(nx * 12).toFixed(2)}deg`);
        });
        card.addEventListener("pointerleave", () => {
          card.style.setProperty("--tilt-x", "0deg");
          card.style.setProperty("--tilt-y", "0deg");
        });
      }

      stage.appendChild(card);
    });

    function syncCredDeck() {
      const cards = Array.from(stage.querySelectorAll(".cred-card"));
      positionCircularCards(cards, credIndex);
      updateCredentialPanel(credIndex, true);
      if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
        window.CRTConsole.playKeySwitch(1);
      }
    }

    syncCredDeck();

    if (inspectBtn) {
      inspectBtn.addEventListener("click", () => {
        if (typeof openCertInspectorFn === "function") {
          openCertInspectorFn(DATA.credentials[credIndex]);
        }
      });
    }

    const prevBtn = document.getElementById("prevCredBtn");
    const nextBtn = document.getElementById("nextCredBtn");
    const total = DATA.credentials.length;

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        credIndex = (credIndex - 1 + total) % total;
        syncCredDeck();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        credIndex = (credIndex + 1) % total;
        syncCredDeck();
      });
    }
  }

  /* ---------------------------------------------------------
     12. RESTORED V0.5 3-COLUMN FOOTER CONTACTS + CLICK-TO-COPY
     --------------------------------------------------------- */
  function initFooterContacts() {
    const c = DATA.contact;
    const outlookBtn = document.getElementById("copyOutlookBtn");
    const gmailBtn = document.getElementById("copyGmailBtn");
    const outlookText = document.getElementById("emailPrimaryText");
    const gmailText = document.getElementById("emailSecondaryText");
    const waLink = document.getElementById("whatsappLink");
    const ghLink = document.getElementById("githubLink");
    const liLink = document.getElementById("linkedinLink");
    const igLink = document.getElementById("instagramLink");

    if (outlookText) outlookText.textContent = c.outlook;
    if (gmailText) gmailText.textContent = c.gmail;
    if (outlookBtn) outlookBtn.dataset.copy = c.outlook;
    if (gmailBtn) gmailBtn.dataset.copy = c.gmail;
    if (waLink) waLink.href = c.whatsappUrl;
    if (ghLink) ghLink.href = c.github;
    if (liLink) liLink.href = c.linkedin;
    if (igLink) igLink.href = c.instagram;

    [outlookBtn, gmailBtn].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener("click", () => {
        const val = btn.dataset.copy;
        if (!val) return;
        navigator.clipboard?.writeText(val).catch(() => {});
        btn.classList.add("is-copied");
        if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
          window.CRTConsole.playKeySwitch(3);
        }
        setTimeout(() => btn.classList.remove("is-copied"), 1800);
      });
    });
  }

  /* ---------------------------------------------------------
     13. SEAMLESS NAVBAR, CONCRETE SLAB TILT & GSAP REVEALS
     --------------------------------------------------------- */
  function initNavigationAndMotion() {
    const navbar = document.getElementById("navbar");
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");

    const syncNavScroll = () => {
      if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 24);
    };
    syncNavScroll();
    window.addEventListener("scroll", syncNavScroll, { passive: true });

    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener("click", () => {
        const open = !mobileDrawer.classList.contains("is-open");
        mobileDrawer.classList.toggle("is-open", open);
        mobileBtn.classList.toggle("is-open", open);
        mobileBtn.setAttribute("aria-expanded", String(open));
        mobileDrawer.setAttribute("aria-hidden", String(!open));
      });
    }

    document.querySelectorAll(".js-scroll").forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();

        if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
          window.CRTConsole.playKeySwitch(0);
        }

        if (mobileDrawer && mobileDrawer.classList.contains("is-open")) {
          mobileDrawer.classList.remove("is-open");
          mobileBtn?.classList.remove("is-open");
        }

        if (window.gsap && window.ScrollToPlugin && !prefersReducedMotion) {
          window.gsap.to(window, {
            duration: 0.85,
            scrollTo: { y: target, offsetY: 74 },
            ease: "power4.inOut"
          });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        applyTheme(currentTheme === "dark" ? "light" : "dark", true);
      });
    }

    document.querySelectorAll(".lang-btn[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.dataset.lang, true));
    });

    window.addEventListener("keydown", (e) => {
      if (
        isOverlayActive() ||
        ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
      ) {
        return;
      }
      if (e.code === "KeyT") {
        applyTheme(currentTheme === "dark" ? "light" : "dark", true);
      } else if (e.code === "KeyL") {
        applyLanguage(currentLang === "en" ? "id" : "en", true);
      }
    });

    if (!isTouchDevice && !prefersReducedMotion) {
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
          el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        });
        el.addEventListener("pointerleave", () => {
          el.style.transform = "";
        });
      });

      document.querySelectorAll("[data-tilt-slab]").forEach((slab) => {
        slab.addEventListener("pointermove", (e) => {
          const r = slab.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          slab.style.transform = `perspective(950px) rotateX(${(-ny * 5.2).toFixed(2)}deg) rotateY(${(nx * 6.4).toFixed(2)}deg) translateY(-4px)`;
        });
        slab.addEventListener("pointerleave", () => {
          slab.style.transform = "";
        });
      });
    }

    if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      if (window.ScrollToPlugin) window.gsap.registerPlugin(window.ScrollToPlugin);

      const ticker = document.getElementById("heroTickerTrack");
      if (ticker) {
        window.gsap.to(ticker, {
          xPercent: -26,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.75
          }
        });
      }

      document.querySelectorAll(".reveal-up").forEach((el) => {
        window.gsap.from(el, {
          y: 40,
          scale: 0.975,
          opacity: 0,
          duration: 0.82,
          ease: "power4.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true
          }
        });
      });
    }
  }

  /* ---------------------------------------------------------
     BOOT SEQUENCE
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(currentTheme, false);
    initNavigationAndMotion();
    initHero3DTitle();
    initHero3DMonolith();
    initAboutSection();
    initEducationSlider();
    initProjectModal();
    initCertInspector();
    initCredentialsDeck();
    initFooterContacts();
    applyLanguage(currentLang, false);

    if (window.CRTConsole && typeof window.CRTConsole.init === "function") {
      window.CRTConsole.init();
    }

    if (window.AlleyCat && typeof window.AlleyCat.init === "function") {
      window.AlleyCat.init();
    }

    runIntroCurtain();
  });
})();