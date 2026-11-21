/* =========================================================
   CARTRIDGE 03: CAMPUS COMBAT (V0.4 — 16-BIT ARCADE OVERHAUL)
   Street Fighter II Pixel Aesthetic • Illustrated Portraits
   Articulated Punches, Kicks, Uppercuts & Hadouken Waves
   ========================================================= */

window.CRT_GAMES = window.CRT_GAMES || {};

window.CRT_GAMES.campus = {
  mount(container, api) {
    const ROSTER = [
      {
        id: "coder",
        name: "CAFFEINE CODER",
        shortName: "CODER",
        archetype: "ALL-ROUNDER / SHOTO",
        color: "#38bdf8",
        accent: "#facc15",
        giTop: "#e2e8f0",
        giShade: "#94a3b8",
        pants: "#1e293b",
        skin: "#f3c69f",
        skinShade: "#c89068",
        hair: "#1e1b2e",
        band: "#dc2626",
        gloves: "#dc2626",
        hp: 1000,
        speed: 155,
        spec1Name: "SYNTAX HADOUKEN",
        spec1Type: "projectile",
        spec2Name: "STACK UPPERCUT",
        spec2Type: "uppercut",
        superName: "OVERCLOCKED COMPILE BEAM",
        superType: "beam",
        aiStyle: "balanced"
      },
      {
        id: "lab",
        name: "LAB ASSISTANT",
        shortName: "LAB ASST",
        archetype: "ZONER / TRAP MASTER",
        color: "#a855f7",
        accent: "#34d399",
        giTop: "#f8fafc",
        giShade: "#cbd5e1",
        pants: "#312e81",
        skin: "#f5cba7",
        skinShade: "#cc966d",
        hair: "#4c1d95",
        band: "#34d399",
        gloves: "#7c3aed",
        hp: 940,
        speed: 145,
        spec1Name: "OSCILLOSCOPE WAVE",
        spec1Type: "fast_proj",
        spec2Name: "POP-QUIZ MINE",
        spec2Type: "trap",
        superName: "ZERO-TOLERANCE REVISION",
        superType: "beam",
        aiStyle: "zoner"
      },
      {
        id: "crammer",
        name: "DEADLINE CRAMMER",
        shortName: "CRAMMER",
        archetype: "RUSHDOWN / SPEEDSTER",
        color: "#f97316",
        accent: "#fbbf24",
        giTop: "#dc2626",
        giShade: "#991b1b",
        pants: "#7f1d1d",
        skin: "#f2c29b",
        skinShade: "#c48c64",
        hair: "#fbbf24",
        band: "#1e1b2e",
        gloves: "#1f2937",
        hp: 900,
        speed: 192,
        spec1Name: "CTRL+C BLITZ RUSH",
        spec1Type: "rush",
        spec2Name: "23:59 RISING DRAGON",
        spec2Type: "uppercut",
        superName: "ALL-NIGHTER ADRENALINE",
        superType: "barrage",
        aiStyle: "rushdown"
      },
      {
        id: "designer",
        name: "DESIGN ARCHITECT",
        shortName: "DESIGNER",
        archetype: "MIX-UP / TELEPORT",
        color: "#ec4899",
        accent: "#67e8f9",
        giTop: "#312e81",
        giShade: "#1e1b4b",
        pants: "#0f172a",
        skin: "#f6d0b1",
        skinShade: "#cb9974",
        hair: "#ec4899",
        band: "#67e8f9",
        gloves: "#ec4899",
        hp: 880,
        speed: 182,
        spec1Name: "VECTOR CRESCENT",
        spec1Type: "projectile",
        spec2Name: "BEZIER BLINK STRIKE",
        spec2Type: "teleport",
        superName: "PIXEL-PERFECT MIRAGE",
        superType: "barrage",
        aiStyle: "mixup"
      },
      {
        id: "security",
        name: "CAMPUS SECURITY",
        shortName: "SECURITY",
        archetype: "GRAPPLER / HEAVY TANK",
        color: "#eab308",
        accent: "#ef4444",
        giTop: "#1d4ed8",
        giShade: "#1e3a8a",
        pants: "#0f172a",
        skin: "#d99b6c",
        skinShade: "#a86d43",
        hair: "#111827",
        band: "#eab308",
        gloves: "#eab308",
        hp: 1220,
        speed: 122,
        spec1Name: "PERMIT CHECK QUAKE",
        spec1Type: "quake",
        spec2Name: "ARMORED LARIAT",
        spec2Type: "rush_armor",
        superName: "TOWED & IMPOUNDED",
        superType: "slam",
        aiStyle: "grappler"
      },
      {
        id: "senior",
        name: "THESIS SENIOR",
        shortName: "SENIOR",
        archetype: "COUNTER / PARRY",
        color: "#34d399",
        accent: "#f8fafc",
        giTop: "#1f2937",
        giShade: "#111827",
        pants: "#0f172a",
        skin: "#eac09a",
        skinShade: "#bd8b63",
        hair: "#334155",
        band: "#34d399",
        gloves: "#10b981",
        hp: 1040,
        speed: 150,
        spec1Name: "CITATION SLIDE KICK",
        spec1Type: "slide",
        spec2Name: "REVISION DENIED PARRY",
        spec2Type: "parry",
        superName: "FINAL DEFENSE VERDICT",
        superType: "beam",
        aiStyle: "counter"
      }
    ];

    const STAGES = [
      { id: "gate", name: "SUNSET CAMPUS ROOFTOP", sky1: "#7c2d12", sky2: "#ea580c", sky3: "#fbbf24", floor1: "#92623a", floor2: "#6b4423", accent: "#fbbf24" },
      { id: "cafe", name: "24-HOUR COFFEE SHOP", sky1: "#181326", sky2: "#451a30", sky3: "#9a3412", floor1: "#44342d", floor2: "#2c211c", accent: "#fb923c" },
      { id: "server", name: "UNIVERSITY SERVER HALL", sky1: "#07131d", sky2: "#0f2e45", sky3: "#164e63", floor1: "#263445", floor2: "#16202b", accent: "#38bdf8" }
    ];

    /* ---------------------------------------------------------
       PROCEDURAL 16-BIT PIXEL PORTRAIT GENERATOR (18x18 -> 90x90)
       --------------------------------------------------------- */
    function renderPortraitCanvas(fighter, flip = false) {
      const c = document.createElement("canvas");
      const S = 18;
      const P = 5;
      c.width = S * P;
      c.height = S * P;
      const g = c.getContext("2d");
      g.imageSmoothingEnabled = false;

      // Retro gradient portrait backdrop
      const bg = g.createLinearGradient(0, 0, 0, c.height);
      bg.addColorStop(0, "#1e3a8a");
      bg.addColorStop(1, "#090d1a");
      g.fillStyle = bg;
      g.fillRect(0, 0, c.width, c.height);

      // Speed stripes behind portrait
      g.fillStyle = "rgba(255,255,255,0.08)";
      g.fillRect(0, 12, c.width, 6);
      g.fillRect(0, 28, c.width, 4);

      const px = (x, y, w, h, col) => {
        const dx = flip ? S - x - w : x;
        g.fillStyle = col;
        g.fillRect(dx * P, y * P, w * P, h * P);
      };

      const o = "#090a0f";
      // Shoulders / Jacket / Gi
      px(2, 13, 14, 5, o);
      px(3, 14, 12, 4, fighter.giTop);
      px(3, 15, 4, 3, fighter.giShade);
      px(7, 14, 4, 4, fighter.skinShade);
      px(8, 14, 2, 3, fighter.skin);
      // Collar / Scarf / Tie accent
      px(6, 13, 2, 4, fighter.band);
      px(10, 13, 2, 4, fighter.band);

      // Neck & Jaw Outline
      px(4, 3, 10, 11, o);
      // Face Fill
      px(5, 5, 8, 8, fighter.skin);
      px(5, 5, 2, 8, fighter.skinShade);
      px(6, 12, 6, 1, fighter.skinShade);

      // Hair / Headgear by Archetype
      if (fighter.id === "coder") {
        // Spiky Ryu-style hair + crimson headband
        px(3, 2, 12, 4, fighter.hair);
        px(4, 1, 3, 2, fighter.hair);
        px(8, 1, 4, 2, fighter.hair);
        px(4, 5, 10, 2, fighter.band);
        px(2, 6, 2, 3, fighter.band); // Headband knot tail
      } else if (fighter.id === "crammer") {
        // Wild blonde Ken-style hair + dark headband
        px(3, 1, 12, 5, fighter.hair);
        px(3, 4, 2, 8, fighter.hair);
        px(12, 3, 2, 6, fighter.hair);
        px(4, 5, 10, 1, fighter.band);
      } else if (fighter.id === "lab") {
        // Slick hair + shiny glasses
        px(4, 2, 10, 4, fighter.hair);
        px(5, 7, 3, 2, "#e0f2fe");
        px(10, 7, 3, 2, "#e0f2fe");
        px(8, 7, 2, 1, o);
      } else if (fighter.id === "designer") {
        // Stylish swept pink bangs + cyan visor
        px(3, 2, 12, 4, fighter.hair);
        px(3, 5, 3, 6, fighter.hair);
        px(6, 6, 8, 2, fighter.band);
      } else if (fighter.id === "security") {
        // Security cap + gold badge + shades + mustache
        px(3, 1, 12, 4, "#0f172a");
        px(4, 4, 11, 2, "#1e293b");
        px(8, 2, 2, 2, "#fbbf24");
        px(5, 7, 8, 2, "#090a0f");
        px(6, 10, 6, 2, "#1f2937"); // Mustache
      } else {
        // Thesis Senior — tousled hair with silver streak & tired stoic eyes
        px(4, 2, 10, 4, fighter.hair);
        px(8, 2, 3, 2, "#cbd5e1");
        px(5, 9, 2, 1, "#64748b");
        px(10, 9, 2, 1, "#64748b");
      }

      // Eyes & Brows (unless wearing shades/visor)
      if (fighter.id !== "security" && fighter.id !== "designer") {
        px(6, 7, 2, 1, o);
        px(10, 7, 2, 1, o);
        px(6, 8, 1, 1, "#ffffff");
        px(10, 8, 1, 1, "#ffffff");
        px(7, 8, 1, 1, o);
        px(11, 8, 1, 1, o);
      }

      // Nose & Fierce Arcade Mouth
      px(9, 9, 1, 1, fighter.skinShade);
      if (fighter.id !== "security") {
        px(7, 11, 4, 1, fighter.id === "crammer" ? "#ffffff" : "#6b211a");
      }

      return c;
    }

    container.innerHTML = `
      <div class="arcade-root">
        <div class="arcade-hud">
          <div class="arcade-hud-group">
            <span class="arcade-stat">
              <span class="arcade-stat-label">1P</span>
              <span class="arcade-stat-val" id="ccP1Name" style="color:#38bdf8">CAFFEINE CODER</span>
            </span>
            <span class="arcade-pill" id="ccRounds">R1 • 0 - 0</span>
            <span class="arcade-stat">
              <span class="arcade-stat-label">CPU</span>
              <span class="arcade-stat-val" id="ccP2Name" style="color:#fb7185">DEADLINE CRAMMER</span>
            </span>
          </div>
          <div class="arcade-hud-group">
            <span class="arcade-stat">
              <span class="arcade-stat-label">STAGE</span>
              <span class="arcade-stat-val" id="ccStageName">SUNSET CAMPUS ROOFTOP</span>
            </span>
            <button type="button" class="touch-btn" id="ccMovesBtn">MOVES [M]</button>
          </div>
        </div>

        <div class="arcade-stage" id="ccStage">
          <canvas id="ccCanvas" class="pixel-canvas"></canvas>

          <div class="arcade-overlay" id="ccOverlay">
            <h3 class="arcade-ov-title" id="ccOvTitle" style="color:#fbbf24">PLAYER SELECT</h3>
            <p class="arcade-ov-sub" id="ccOvSub"></p>
            <div id="ccMenuBody" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:12px;"></div>
          </div>
        </div>

        <div class="arcade-controls-bar">
          <span><strong>A/D:</strong> Move &amp; Guard &nbsp;|&nbsp; <strong>W/S:</strong> Jump/Crouch &nbsp;|&nbsp; <strong>J:</strong> Punch (Fwd+J Throw) &nbsp;|&nbsp; <strong>K:</strong> Kick/Sweep &nbsp;|&nbsp; <strong>L:</strong> Special (▼/◀+L Spec 2) &nbsp;|&nbsp; <strong>U / J+K:</strong> Super</span>
          <div class="arcade-touch-btns">
            <button type="button" class="touch-btn" data-act="left">◀</button>
            <button type="button" class="touch-btn" data-act="right">▶</button>
            <button type="button" class="touch-btn" data-act="jump">▲</button>
            <button type="button" class="touch-btn" data-act="crouch">▼</button>
            <button type="button" class="touch-btn" data-act="light">J</button>
            <button type="button" class="touch-btn" data-act="heavy">K</button>
            <button type="button" class="touch-btn" data-act="special">L</button>
            <button type="button" class="touch-btn" data-act="super" style="border-color:#fbbf24;color:#fbbf24">SUPER</button>
          </div>
        </div>
      </div>
    `;

    const stageEl = container.querySelector("#ccStage");
    const canvas = container.querySelector("#ccCanvas");
    const ctx = canvas.getContext("2d");

    const p1NameEl = container.querySelector("#ccP1Name");
    const p2NameEl = container.querySelector("#ccP2Name");
    const roundsEl = container.querySelector("#ccRounds");
    const stageNameEl = container.querySelector("#ccStageName");
    const movesBtn = container.querySelector("#ccMovesBtn");

    const overlay = container.querySelector("#ccOverlay");
    const ovTitle = container.querySelector("#ccOvTitle");
    const ovSub = container.querySelector("#ccOvSub");
    const menuBody = container.querySelector("#ccMenuBody");

    const sfx = {
      tone: (f, d, t, g, ef) => api && api.tone && api.tone(f, d, t, g, ef),
      noise: (d, g) => api && api.noise && api.noise(d, g)
    };

    // Crisp 16-Bit Pixel Canvas Scaling
    const PIXEL_SCALE = 2;
    let W = 540;
    let H = 310;
    let rafId = null;
    let destroyed = false;
    let lastTime = 0;

    function resize() {
      const rect = stageEl.getBoundingClientRect();
      W = Math.max(360, Math.floor(rect.width / PIXEL_SCALE));
      H = Math.max(220, Math.floor(rect.height / PIXEL_SCALE));
      canvas.width = W;
      canvas.height = H;
      ctx.imageSmoothingEnabled = false;
    }
    resize();

    const GRAVITY = 1280;
    const keys = {};
    const touchState = { left: false, right: false, crouch: false };

    let selectedId = "coder";
    let previewCpuId = "crammer";
    let difficulty = "normal";
    let currentStage = STAGES[0];

    const state = {
      mode: "select",
      round: 1,
      p1Wins: 0,
      p2Wins: 0,
      timer: 99,
      bannerText: "",
      bannerTimer: 0,
      hitStop: 0,
      superFlash: 0,
      superName: "",
      shake: 0,
      p1: null,
      p2: null,
      projectiles: [],
      traps: [],
      beams: [],
      particles: [],
      popups: [],
      ai: { decisionTimer: 0.15, holdBack: false, crouch: false, moveDir: 0 },
      lastTapDir: 0,
      lastTapTime: 0
    };

    function floorY() {
      return H - 38;
    }

    function makeFighter(def, x, facing) {
      return {
        def,
        x,
        y: floorY(),
        vx: 0,
        vy: 0,
        facing,
        hp: def.hp,
        maxHp: def.hp,
        displayHp: def.hp,
        meter: 0,
        grounded: true,
        crouching: false,
        blocking: false,
        state: "idle",
        stateTimer: 0,
        attack: null,
        hasHit: false,
        comboCount: 0,
        comboResetTimer: 0,
        armor: false,
        invuln: 0,
        flash: 0,
        animPhase: 0,
        afterimages: []
      };
    }

    function addParticles(x, y, color, count, speed = 135) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = speed * (0.3 + Math.random() * 0.85);
        state.particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.2 + Math.random() * 0.24,
          maxLife: 0.44,
          size: Math.random() < 0.5 ? 2 : 3,
          color
        });
      }
    }

    function addPopup(x, y, text, color = "#fbbf24", size = 9) {
      state.popups.push({ x, y, text, color, size, life: 0.85, vy: -30 });
    }

    /* ---------------------------------------------------------
       STREET FIGHTER II CHARACTER SELECT SCREEN
       --------------------------------------------------------- */
    function renderSelectMenu() {
      state.mode = "select";
      const p1Def = ROSTER.find((r) => r.id === selectedId) || ROSTER[0];
      if (previewCpuId === selectedId) {
        const alt = ROSTER.find((r) => r.id !== selectedId);
        previewCpuId = alt ? alt.id : ROSTER[1].id;
      }
      const p2Def = ROSTER.find((r) => r.id === previewCpuId) || ROSTER[1];

      ovTitle.textContent = "SELECT YOUR CHARACTER";
      ovSub.textContent = "Click any fighter portrait below • Hold Back to High Guard • Down+Back to Low Guard";

      menuBody.innerHTML = `
        <div class="sf-select-wrap">
          <div class="sf-portraits-row">
            <div class="sf-portrait-panel">
              <div class="sf-portrait-frame" id="sfP1Port"></div>
              <div style="display:flex;flex-direction:column;gap:4px">
                <span class="draft-badge" style="color:${p1Def.color}">1P • ${p1Def.archetype}</span>
                <strong class="draft-name" style="font-size:0.78rem">${p1Def.name}</strong>
                <span style="font-size:0.7rem;color:#cbd5e1">HP ${p1Def.hp} • SPD ${p1Def.speed}</span>
                <span style="font-size:0.66rem;color:#94a3b8">L: ${p1Def.spec1Name}<br/>▼/◀+L: ${p1Def.spec2Name}</span>
                <span style="font-size:0.64rem;color:#fbbf24">★ ${p1Def.superName}</span>
              </div>
            </div>

            <div class="sf-vs-badge">VS</div>

            <div class="sf-portrait-panel sf-portrait-panel--p2">
              <div class="sf-portrait-frame" id="sfP2Port"></div>
              <div style="display:flex;flex-direction:column;gap:4px">
                <span class="draft-badge" style="color:${p2Def.color}">CPU • ${p2Def.archetype}</span>
                <strong class="draft-name" style="font-size:0.78rem">${p2Def.name}</strong>
                <span style="font-size:0.7rem;color:#cbd5e1">HP ${p2Def.hp} • SPD ${p2Def.speed}</span>
                <span style="font-size:0.66rem;color:#94a3b8">L: ${p2Def.spec1Name}<br/>▼/◀+L: ${p2Def.spec2Name}</span>
                <span style="font-size:0.64rem;color:#fbbf24">★ ${p2Def.superName}</span>
              </div>
            </div>
          </div>

          <div class="sf-roster-grid" id="sfRosterGrid"></div>

          <div class="arcade-btn-row">
            <button type="button" class="arcade-btn ${difficulty === "normal" ? "" : "arcade-btn--ghost"}" id="ccDiffNormal">
              AI: ARCADE (NORMAL)
            </button>
            <button type="button" class="arcade-btn ${difficulty === "nightmare" ? "" : "arcade-btn--ghost"}" id="ccDiffHard" style="${difficulty === "nightmare" ? "background:#f43f5e;border-color:#f43f5e;color:#fff" : ""}">
              AI: NIGHTMARE (HARD)
            </button>
            <button type="button" class="arcade-btn" id="ccFightBtn" style="background:#fb923c;border-color:#fb923c;color:#140904">
              FIGHT! [ENTER]
            </button>
          </div>
        </div>
      `;

      menuBody.querySelector("#sfP1Port").appendChild(renderPortraitCanvas(p1Def, false));
      menuBody.querySelector("#sfP2Port").appendChild(renderPortraitCanvas(p2Def, true));

      const grid = menuBody.querySelector("#sfRosterGrid");
      ROSTER.forEach((f) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = `sf-tile ${f.id === selectedId ? "selected" : ""}`;
        tile.appendChild(renderPortraitCanvas(f, false));
        const lbl = document.createElement("span");
        lbl.className = "sf-tile-name";
        lbl.textContent = f.shortName;
        tile.appendChild(lbl);

        tile.addEventListener("click", () => {
          selectedId = f.id;
          sfx.tone(420, 0.06, "triangle", 0.06, 660);
          renderSelectMenu();
        });
        grid.appendChild(tile);
      });

      menuBody.querySelector("#ccDiffNormal").addEventListener("click", () => {
        difficulty = "normal";
        sfx.tone(360, 0.05, "sine", 0.05);
        renderSelectMenu();
      });
      menuBody.querySelector("#ccDiffHard").addEventListener("click", () => {
        difficulty = "nightmare";
        sfx.tone(240, 0.08, "sawtooth", 0.06, 160);
        renderSelectMenu();
      });
      menuBody.querySelector("#ccFightBtn").addEventListener("click", startMatch);
      overlay.classList.remove("hidden");
    }

    function startMatch() {
      const p1Def = ROSTER.find((r) => r.id === selectedId) || ROSTER[0];
      const others = ROSTER.filter((r) => r.id !== p1Def.id);
      const p2Def = ROSTER.find((r) => r.id === previewCpuId && r.id !== p1Def.id) || others[0];
      currentStage = STAGES[Math.floor(Math.random() * STAGES.length)];

      state.round = 1;
      state.p1Wins = 0;
      state.p2Wins = 0;

      p1NameEl.textContent = p1Def.name;
      p1NameEl.style.color = p1Def.color;
      p2NameEl.textContent = `${p2Def.name} (${difficulty === "nightmare" ? "NIGHTMARE" : "CPU"})`;
      p2NameEl.style.color = p2Def.color;
      stageNameEl.textContent = currentStage.name;

      startRound(p1Def, p2Def);
    }

    function startRound(p1Def, p2Def) {
      const carryP1 = state.p1 ? state.p1.meter : 0;
      const carryP2 = state.p2 ? state.p2.meter : 0;

      state.p1 = makeFighter(p1Def, W * 0.28, 1);
      state.p2 = makeFighter(p2Def, W * 0.72, -1);
      if (state.round > 1) {
        state.p1.meter = Math.min(300, carryP1 + 40);
        state.p2.meter = Math.min(300, carryP2 + 40);
      }

      state.projectiles = [];
      state.traps = [];
      state.beams = [];
      state.particles = [];
      state.popups = [];
      state.timer = 99;
      state.hitStop = 0;
      state.superFlash = 0;
      state.superName = "";
      state.mode = "intro";
      state.bannerText = `ROUND ${state.round} — READY`;
      state.bannerTimer = 1.4;

      roundsEl.textContent = `R${state.round} • ${state.p1Wins} - ${state.p2Wins}`;
      overlay.classList.add("hidden");
      sfx.tone(300, 0.12, "square", 0.06, 450);
    }

    function openMoveList() {
      if (state.mode === "moves") {
        state.mode = "fighting";
        overlay.classList.add("hidden");
        return;
      }
      if (state.mode !== "fighting" && state.mode !== "intro") return;
      state.mode = "moves";
      const f = state.p1.def;
      ovTitle.textContent = `${f.name} — COMMAND LIST`;
      ovSub.textContent = `Hold Back to High Guard • Down+Back to Low Guard • Double-Tap Forward/Back to Dash.`;

      menuBody.innerHTML = `
        <div class="draft-grid">
          <div class="draft-card">
            <span class="draft-badge">NORMALS &amp; THROW</span>
            <strong class="draft-name">J / K / FWD+J</strong>
            <p class="draft-desc"><strong>J:</strong> Fast Jab Punch (chains into K)<br/><strong>K:</strong> Roundhouse Kick (▼+K = Low Sweep; Air K = Overhead)<br/><strong>Fwd + J (close):</strong> Guard-Break Throw</p>
          </div>
          <div class="draft-card">
            <span class="draft-badge" style="color:${f.color}">SPECIAL ARTS</span>
            <strong class="draft-name">${f.spec1Name} &amp; ${f.spec2Name}</strong>
            <p class="draft-desc"><strong>L:</strong> ${f.spec1Name}<br/><strong>Back or Down + L:</strong> ${f.spec2Name}</p>
          </div>
          <div class="draft-card draft-card--fusion">
            <span class="draft-badge">3-BAR SUPER ART</span>
            <strong class="draft-name">${f.superName}</strong>
            <p class="draft-desc">Press <strong>U</strong> or <strong>J + K</strong> at MAX Super Gauge (3 Bars) for a screen-freezing finisher.</p>
          </div>
        </div>
        <div class="arcade-btn-row">
          <button type="button" class="arcade-btn" id="ccResumeBtn">BACK TO FIGHT</button>
          <button type="button" class="arcade-btn arcade-btn--ghost" id="ccCharSelBtn">CHARACTER SELECT</button>
        </div>
      `;
      menuBody.querySelector("#ccResumeBtn").addEventListener("click", () => {
        state.mode = "fighting";
        overlay.classList.add("hidden");
      });
      menuBody.querySelector("#ccCharSelBtn").addEventListener("click", renderSelectMenu);
      overlay.classList.remove("hidden");
    }

    function startAttack(fighter, opponent, kind) {
      if (["hitstun", "blockstun", "ko", "parry"].includes(fighter.state)) return;

      const isCancel =
        fighter.state === "attack" &&
        fighter.hasHit &&
        ((fighter.attack.kind === "light" && ["heavy", "spec1", "spec2", "super"].includes(kind)) ||
          (fighter.attack.kind === "heavy" && ["spec1", "spec2", "super"].includes(kind)));

      if (fighter.state === "attack" && !isCancel) return;
      const def = fighter.def;

      if (kind === "throw") {
        if (Math.abs(opponent.x - fighter.x) < 48 && fighter.grounded && opponent.grounded && opponent.invuln <= 0) {
          fighter.state = "attack";
          fighter.stateTimer = 0.34;
          fighter.attack = { kind: "throw", pose: "punch", startup: 0.08, active: 0.06, dmg: 95, range: 48, height: "throw", hitstun: 0.44, push: 200, launch: -220 };
          fighter.hasHit = false;
          sfx.tone(240, 0.08, "sawtooth", 0.06, 130);
          return;
        }
        kind = "light";
      }

      if (kind === "light") {
        fighter.state = "attack";
        fighter.stateTimer = 0.24;
        fighter.attack = {
          kind: "light",
          pose: "punch",
          startup: 0.06,
          active: 0.08,
          dmg: 46,
          range: 48,
          height: fighter.crouching ? "low" : !fighter.grounded ? "overhead" : "mid",
          hitstun: 0.26,
          blockstun: 0.14,
          push: 72,
          launch: 0
        };
        fighter.hasHit = false;
        sfx.tone(520, 0.04, "triangle", 0.04, 340);
      } else if (kind === "heavy") {
        const isAir = !fighter.grounded;
        const isLow = fighter.crouching && fighter.grounded;
        fighter.state = "attack";
        fighter.stateTimer = 0.42;
        fighter.armor = def.id === "security" && !isAir;
        fighter.attack = {
          kind: "heavy",
          pose: isLow ? "sweep" : "kick",
          startup: 0.12,
          active: 0.11,
          dmg: isLow ? 84 : 96,
          range: isLow ? 58 : 55,
          height: isAir ? "overhead" : isLow ? "low" : "mid",
          hitstun: 0.38,
          blockstun: 0.22,
          push: isLow ? 135 : 120,
          launch: isLow ? -160 : -75
        };
        fighter.hasHit = false;
        if (isAir && def.id === "crammer") {
          fighter.vx = fighter.facing * 260;
          fighter.vy = 280;
        }
        sfx.tone(280, 0.08, "sawtooth", 0.06, 160);
      } else if (kind === "spec1") {
        const t = def.spec1Type;
        fighter.state = "attack";
        fighter.hasHit = false;
        fighter.meter = Math.min(300, fighter.meter + 12);

        if (t === "projectile" || t === "fast_proj") {
          fighter.stateTimer = 0.4;
          fighter.attack = { kind: "spec1", pose: "hadouken", startup: 0.13, active: 0.05, fired: false, projSpeed: t === "fast_proj" ? 390 : 285, dmg: 86 };
          addPopup(fighter.x, fighter.y - 70, def.spec1Name + "!", def.color, 7);
          sfx.tone(420, 0.12, "sawtooth", 0.07, 740);
        } else if (t === "rush") {
          fighter.stateTimer = 0.44;
          fighter.vx = fighter.facing * 320;
          fighter.attack = { kind: "spec1", pose: "kick", startup: 0.08, active: 0.22, dmg: 92, range: 54, height: "mid", hitstun: 0.36, blockstun: 0.2, push: 135, launch: -110, chip: 16 };
          addPopup(fighter.x, fighter.y - 70, def.spec1Name + "!", def.color, 7);
          sfx.tone(540, 0.1, "square", 0.06, 260);
        } else if (t === "quake") {
          fighter.stateTimer = 0.52;
          fighter.armor = true;
          fighter.attack = { kind: "spec1", pose: "slam", startup: 0.18, active: 0.16, dmg: 112, range: 110, height: "low", hitstun: 0.44, blockstun: 0.24, push: 150, launch: -195, chip: 20, quake: true };
          addPopup(fighter.x, fighter.y - 70, def.spec1Name + "!", def.color, 7);
          sfx.noise(0.14, 0.1);
          sfx.tone(110, 0.18, "sawtooth", 0.09, 60);
        } else if (t === "slide") {
          fighter.stateTimer = 0.44;
          fighter.crouching = true;
          fighter.vx = fighter.facing * 330;
          fighter.attack = { kind: "spec1", pose: "sweep", startup: 0.09, active: 0.22, dmg: 88, range: 58, height: "low", hitstun: 0.38, blockstun: 0.2, push: 120, launch: -155, chip: 14 };
          addPopup(fighter.x, fighter.y - 70, def.spec1Name + "!", def.color, 7);
          sfx.tone(360, 0.1, "triangle", 0.06, 180);
        }
      } else if (kind === "spec2") {
        const t = def.spec2Type;
        fighter.meter = Math.min(300, fighter.meter + 12);

        if (t === "uppercut") {
          fighter.state = "attack";
          fighter.stateTimer = 0.52;
          fighter.invuln = 0.16;
          fighter.grounded = false;
          fighter.vy = -425;
          fighter.vx = fighter.facing * 95;
          fighter.hasHit = false;
          fighter.attack = { kind: "spec2", pose: "uppercut", startup: 0.06, active: 0.22, dmg: 118, range: 52, height: "mid", hitstun: 0.48, blockstun: 0.22, push: 120, launch: -270, chip: 18 };
          addPopup(fighter.x, fighter.y - 72, def.spec2Name + "!", def.accent, 8);
          sfx.tone(260, 0.16, "sawtooth", 0.08, 780);
        } else if (t === "trap") {
          fighter.state = "attack";
          fighter.stateTimer = 0.36;
          fighter.hasHit = true;
          fighter.attack = { kind: "spec2", pose: "hadouken", startup: 0.12, active: 0.05 };
          state.traps.push({
            owner: fighter,
            x: Math.max(36, Math.min(W - 36, fighter.x + fighter.facing * 76)),
            y: floorY() - 5,
            r: 14,
            life: 6.0,
            color: def.accent
          });
          addPopup(fighter.x, fighter.y - 70, "POP-QUIZ SET!", def.accent, 7);
          sfx.tone(620, 0.08, "square", 0.05, 840);
        } else if (t === "teleport") {
          addParticles(fighter.x, fighter.y - 30, def.color, 14, 130);
          fighter.x = Math.max(32, Math.min(W - 32, opponent.x + opponent.facing * -46));
          fighter.facing = opponent.x >= fighter.x ? 1 : -1;
          fighter.state = "attack";
          fighter.stateTimer = 0.32;
          fighter.hasHit = false;
          fighter.attack = { kind: "spec2", pose: "kick", startup: 0.09, active: 0.12, dmg: 84, range: 52, height: "overhead", hitstun: 0.36, blockstun: 0.18, push: 105, launch: -95, chip: 14 };
          addParticles(fighter.x, fighter.y - 30, def.accent, 14, 130);
          addPopup(fighter.x, fighter.y - 72, "BEZIER BLINK!", def.accent, 8);
          sfx.tone(760, 0.09, "sine", 0.07, 320);
        } else if (t === "rush_armor") {
          fighter.state = "attack";
          fighter.stateTimer = 0.5;
          fighter.armor = true;
          fighter.vx = fighter.facing * 265;
          fighter.hasHit = false;
          fighter.attack = { kind: "spec2", pose: "punch", startup: 0.1, active: 0.24, dmg: 120, range: 56, height: "mid", hitstun: 0.45, blockstun: 0.24, push: 185, launch: -175, chip: 20 };
          addPopup(fighter.x, fighter.y - 72, def.spec2Name + "!", def.accent, 8);
          sfx.tone(190, 0.14, "sawtooth", 0.08, 120);
        } else if (t === "parry") {
          fighter.state = "parry";
          fighter.stateTimer = 0.44;
          fighter.vx = 0;
          addPopup(fighter.x, fighter.y - 72, "PARRY STANCE!", def.color, 7);
          sfx.tone(500, 0.08, "triangle", 0.06, 700);
        }
      } else if (kind === "super") {
        if (fighter.meter < 300) return;
        fighter.meter = 0;
        fighter.state = "attack";
        fighter.stateTimer = 0.72;
        fighter.invuln = 0.35;
        fighter.hasHit = false;
        state.superFlash = 0.52;
        state.superName = `${def.name}: ${def.superName}`;
        state.hitStop = 0.18;
        state.shake = 8;

        sfx.tone(220, 0.14, "sawtooth", 0.1, 880);
        sfx.tone(440, 0.25, "triangle", 0.09, 660);

        if (def.superType === "beam") {
          fighter.attack = { kind: "super", pose: "hadouken", startup: 0.14, active: 0.32, superBeam: true, dmg: 265, chip: 48 };
        } else if (def.superType === "barrage") {
          fighter.vx = fighter.facing * 390;
          fighter.attack = { kind: "super", pose: "kick", startup: 0.08, active: 0.36, dmg: 255, range: 70, height: "mid", hitstun: 0.62, blockstun: 0.3, push: 205, launch: -260, chip: 45 };
        } else {
          fighter.attack = { kind: "super", pose: "slam", startup: 0.12, active: 0.25, dmg: 290, range: 135, height: "throw", hitstun: 0.65, blockstun: 0.3, push: 235, launch: -290, quake: true };
        }
      }
    }

    function resolveHit(attacker, defender, atk) {
      if (defender.invuln > 0) return;

      if (defender.state === "parry" && atk.height !== "throw") {
        defender.state = "attack";
        defender.stateTimer = 0.34;
        defender.hasHit = true;
        defender.attack = { kind: "spec2", pose: "uppercut" };
        defender.meter = Math.min(300, defender.meter + 55);
        state.hitStop = 0.14;
        state.shake = 7;
        attacker.hp = Math.max(0, attacker.hp - 125);
        attacker.state = "hitstun";
        attacker.stateTimer = 0.52;
        attacker.vx = -attacker.facing * 200;
        attacker.vy = -170;
        attacker.grounded = false;
        addParticles(defender.x + defender.facing * 16, defender.y - 34, "#34d399", 22, 175);
        addPopup(defender.x, defender.y - 76, "COUNTER PARRY!", "#34d399", 9);
        sfx.tone(820, 0.12, "triangle", 0.1, 420);
        checkKO();
        return;
      }

      let blocked = false;
      if (defender.blocking && atk.height !== "throw") {
        if (atk.height === "mid") blocked = true;
        else if (atk.height === "low" && defender.crouching) blocked = true;
        else if (atk.height === "overhead" && !defender.crouching) blocked = true;
      }

      if (blocked) {
        const chip = atk.chip || 0;
        defender.hp = Math.max(1, defender.hp - chip);
        defender.state = "blockstun";
        defender.stateTimer = atk.blockstun || 0.16;
        defender.vx = attacker.facing * ((atk.push || 90) * 0.72);
        attacker.meter = Math.min(300, attacker.meter + 12);
        defender.meter = Math.min(300, defender.meter + 18);
        state.hitStop = 0.045;
        addParticles(defender.x - defender.facing * 12, defender.y - 36, "#93c5fd", 10, 110);
        addPopup(defender.x, defender.y - 68, "GUARD", "#93c5fd", 7);
        sfx.tone(240, 0.06, "square", 0.05, 190);
        return;
      }

      if (defender.armor && atk.height !== "throw" && atk.kind !== "super") {
        defender.hp = Math.max(0, defender.hp - Math.round(atk.dmg * 0.6));
        defender.flash = 0.12;
        addPopup(defender.x, defender.y - 68, "ARMOR!", "#fbbf24", 8);
        addParticles(defender.x, defender.y - 34, "#fbbf24", 10, 110);
        sfx.tone(180, 0.07, "square", 0.06, 120);
        checkKO();
        return;
      }

      const comboScale = Math.max(0.55, 1 - defender.comboCount * 0.08);
      const dmg = Math.round(atk.dmg * comboScale);
      defender.hp = Math.max(0, defender.hp - dmg);
      defender.comboCount += 1;
      defender.comboResetTimer = 1.25;
      defender.state = "hitstun";
      defender.stateTimer = atk.hitstun || 0.3;
      defender.armor = false;
      defender.flash = 0.14;
      defender.vx = attacker.facing * (atk.push || 105);
      if (atk.launch) {
        defender.vy = atk.launch;
        defender.grounded = false;
      }

      attacker.meter = Math.min(300, attacker.meter + (atk.kind === "super" ? 0 : 28));
      defender.meter = Math.min(300, defender.meter + 20);

      state.hitStop = atk.kind === "super" ? 0.14 : atk.kind === "light" ? 0.04 : 0.075;
      state.shake = Math.max(state.shake, atk.kind === "super" ? 10 : atk.kind === "light" ? 2.5 : 5.5);

      addParticles(defender.x, defender.y - 34, "#fef08a", atk.kind === "super" ? 26 : 12, 165);
      if (atk.height === "throw") addPopup(defender.x, defender.y - 74, "THROW!", "#fb923c", 9);
      else if (defender.comboCount >= 2) addPopup(defender.x, defender.y - 74, `${defender.comboCount} HIT!`, "#fbbf24", 9);
      else addPopup(defender.x, defender.y - 66, `-${dmg}`, "#fef08a", 8);

      sfx.noise(atk.kind === "light" ? 0.05 : 0.1, 0.09);
      sfx.tone(atk.kind === "light" ? 320 : 180, 0.08, "sawtooth", 0.08, 90);
      checkKO();
    }

    function checkKO() {
      if (state.mode !== "fighting") return;
      if (state.p1.hp <= 0 || state.p2.hp <= 0) {
        const p1Won = state.p2.hp <= 0 && state.p1.hp > 0;
        const p2Won = state.p1.hp <= 0 && state.p2.hp > 0;
        endRound(p1Won ? "p1" : p2Won ? "p2" : "draw");
      }
    }

    function endRound(winner) {
      state.mode = "roundOver";
      state.hitStop = 0.22;
      state.shake = 9;

      if (winner === "p1") {
        state.p1Wins += 1;
        state.p1.state = "victory";
        state.p2.state = "ko";
        state.bannerText = `${state.p1.def.shortName} WINS!`;
        sfx.tone(440, 0.15, "triangle", 0.09, 880);
      } else if (winner === "p2") {
        state.p2Wins += 1;
        state.p2.state = "victory";
        state.p1.state = "ko";
        state.bannerText = `${state.p2.def.shortName} WINS!`;
        sfx.tone(240, 0.2, "sawtooth", 0.09, 110);
      } else {
        state.bannerText = "DOUBLE K.O.!";
      }

      roundsEl.textContent = `R${state.round} • ${state.p1Wins} - ${state.p2Wins}`;
      state.bannerTimer = 2.2;
    }

    function updateAI(dt) {
      const cpu = state.p2;
      const p1 = state.p1;
      const ai = state.ai;
      const hard = difficulty === "nightmare";

      ai.decisionTimer -= dt;
      const dist = Math.abs(p1.x - cpu.x);

      const p1Attacking = p1.state === "attack" && dist < 85;
      const incomingProj = state.projectiles.some((pr) => pr.owner === p1 && Math.abs(pr.x - cpu.x) < 82);

      if (p1Attacking || incomingProj) {
        if (Math.random() < (hard ? 0.8 : 0.36)) {
          ai.holdBack = true;
          ai.crouch = p1.crouching && p1.grounded;
        }
      }

      if (hard && !p1.grounded && dist < 70 && cpu.grounded && cpu.state !== "attack" && Math.random() < 0.26) {
        startAttack(cpu, p1, cpu.def.spec2Type === "uppercut" || cpu.def.spec2Type === "parry" ? "spec2" : "heavy");
        ai.decisionTimer = 0.22;
        return;
      }

      if (ai.decisionTimer > 0) return;
      ai.decisionTimer = hard ? 0.12 + Math.random() * 0.1 : 0.26 + Math.random() * 0.22;
      ai.holdBack = false;
      ai.crouch = false;
      ai.moveDir = 0;

      if (cpu.state === "hitstun" || cpu.state === "blockstun") return;

      if (cpu.meter >= 300 && dist < (cpu.def.superType === "beam" ? 360 : 120) && Math.random() < (hard ? 0.65 : 0.35)) {
        startAttack(cpu, p1, "super");
        return;
      }
      if (dist < 48 && p1.blocking && Math.random() < (hard ? 0.6 : 0.25)) {
        startAttack(cpu, p1, "throw");
        return;
      }
      if (dist < 60) {
        const r = Math.random();
        if (r < 0.36) startAttack(cpu, p1, "light");
        else if (r < 0.64) {
          ai.crouch = Math.random() < 0.45;
          startAttack(cpu, p1, "heavy");
        } else if (r < 0.82) startAttack(cpu, p1, "spec1");
        else if (r < 0.93) startAttack(cpu, p1, "spec2");
        else ai.holdBack = true;
        return;
      }

      const dirToP1 = p1.x >= cpu.x ? 1 : -1;
      const r = Math.random();
      if (cpu.def.aiStyle === "zoner" && dist < 240) {
        if (r < 0.48) startAttack(cpu, p1, "spec1");
        else if (r < 0.72) startAttack(cpu, p1, "spec2");
        else ai.moveDir = -dirToP1;
      } else if (dist > 110 && r < (hard ? 0.34 : 0.18)) {
        startAttack(cpu, p1, Math.random() < 0.65 ? "spec1" : "spec2");
      } else if (r < 0.72) {
        ai.moveDir = dirToP1;
        if (dist > 90 && dist < 160 && Math.random() < 0.14 && cpu.grounded) {
          cpu.vy = -445;
          cpu.grounded = false;
        }
      } else {
        ai.moveDir = -dirToP1;
      }
    }

    function updateFighter(f, opp, dt, isPlayer) {
      f.animPhase += dt * 9;
      f.displayHp += (f.hp - f.displayHp) * Math.min(1, dt * 8);
      if (f.invuln > 0) f.invuln = Math.max(0, f.invuln - dt);
      if (f.flash > 0) f.flash = Math.max(0, f.flash - dt);

      if (f.comboResetTimer > 0) {
        f.comboResetTimer -= dt;
        if (f.comboResetTimer <= 0 && f.state !== "hitstun") f.comboCount = 0;
      }

      if (f.grounded && (f.state === "idle" || f.state === "walk")) {
        f.facing = opp.x >= f.x ? 1 : -1;
      }

      if (f.state === "dash" || (f.state === "attack" && f.attack && f.attack.kind === "super")) {
        f.afterimages.push({ x: f.x, y: f.y, facing: f.facing, life: 0.16, color: f.def.color });
      }
      for (let i = f.afterimages.length - 1; i >= 0; i--) {
        f.afterimages[i].life -= dt;
        if (f.afterimages[i].life <= 0) f.afterimages.splice(i, 1);
      }

      if (["hitstun", "blockstun", "dash", "parry"].includes(f.state)) {
        f.stateTimer -= dt;
        if (f.grounded) f.vx *= Math.pow(0.015, dt);
        if (f.stateTimer <= 0) {
          f.state = "idle";
          f.armor = false;
        }
      } else if (f.state === "attack") {
        f.stateTimer -= dt;
        const atk = f.attack;
        if (atk.totalDur === undefined) atk.totalDur = f.stateTimer + dt;
        const elapsed = atk.totalDur - f.stateTimer;

        if (atk.projSpeed && !atk.fired && elapsed >= atk.startup) {
          atk.fired = true;
          state.projectiles.push({
            owner: f,
            x: f.x + f.facing * 24,
            y: f.y - 35,
            vx: f.facing * atk.projSpeed,
            dir: f.facing,
            r: 11,
            dmg: atk.dmg,
            color: f.def.color,
            accent: f.def.accent,
            life: 2.2
          });
        }

        if (atk.superBeam && !atk.fired && elapsed >= atk.startup) {
          atk.fired = true;
          state.beams.push({
            owner: f,
            x: f.x + f.facing * 20,
            y: f.y - 36,
            dir: f.facing,
            len: W,
            color: f.def.color,
            accent: f.def.accent,
            life: 0.4,
            maxLife: 0.4
          });
          const inFront = (opp.x - f.x) * f.facing > -8;
          if (inFront && Math.abs((opp.y - 30) - (f.y - 36)) < 58) resolveHit(f, opp, atk);
        }

        if (!f.hasHit && !atk.projSpeed && !atk.superBeam && elapsed >= atk.startup && elapsed <= atk.startup + atk.active) {
          const dx = (opp.x - f.x) * f.facing;
          const dy = Math.abs(opp.y - f.y);
          if (dx >= -14 && dx <= atk.range && dy < (atk.quake ? 28 : 62)) {
            f.hasHit = true;
            resolveHit(f, opp, atk);
          }
        }

        if (f.grounded) f.vx *= Math.pow(0.03, dt);
        if (f.stateTimer <= 0) {
          f.state = "idle";
          f.attack = null;
          f.armor = false;
        }
      } else if (state.mode === "fighting") {
        let moveDir = 0;
        let wantCrouch = false;
        let wantJump = false;

        if (isPlayer) {
          if (keys.KeyA || keys.ArrowLeft || touchState.left) moveDir -= 1;
          if (keys.KeyD || keys.ArrowRight || touchState.right) moveDir += 1;
          wantCrouch = Boolean(keys.KeyS || keys.ArrowDown || touchState.crouch);
          wantJump = Boolean(keys.KeyW || keys.ArrowUp);
        } else {
          moveDir = state.ai.moveDir;
          if (state.ai.holdBack) moveDir = -f.facing;
          wantCrouch = state.ai.crouch;
        }

        const holdingBack = moveDir !== 0 && moveDir === -f.facing;
        f.blocking = holdingBack && f.grounded;
        f.crouching = wantCrouch && f.grounded;

        if (f.crouching) {
          f.vx = 0;
          f.state = "idle";
        } else if (moveDir !== 0) {
          f.vx = moveDir * f.def.speed * (holdingBack ? 0.78 : 1);
          if (f.grounded) f.state = "walk";
        } else if (f.grounded) {
          f.vx = 0;
          f.state = "idle";
        }

        if (wantJump && f.grounded) {
          f.vy = -465;
          f.grounded = false;
          f.state = "jump";
          sfx.tone(240, 0.06, "sine", 0.04, 380);
        }
      }

      f.vy += GRAVITY * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;

      if (f.y >= floorY()) {
        f.y = floorY();
        f.vy = 0;
        if (!f.grounded) {
          f.grounded = true;
          if (f.state === "jump") f.state = "idle";
        }
      }

      f.x = Math.max(28, Math.min(W - 28, f.x));
    }

    function update(dt) {
      if (["select", "moves", "matchOver"].includes(state.mode)) return;

      if (state.superFlash > 0) state.superFlash = Math.max(0, state.superFlash - dt);
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 24);
      if (state.hitStop > 0) {
        state.hitStop -= dt;
        return;
      }

      if (state.bannerTimer > 0) {
        state.bannerTimer -= dt;
        if (state.bannerTimer <= 0) {
          if (state.mode === "intro") {
            state.mode = "fighting";
            state.bannerText = "FIGHT!";
            state.bannerTimer = 0.65;
            sfx.tone(620, 0.14, "square", 0.08, 880);
          } else if (state.mode === "roundOver") {
            if (state.p1Wins >= 2 || state.p2Wins >= 2) {
              state.mode = "matchOver";
              const won = state.p1Wins >= 2;
              ovTitle.textContent = won ? "YOU WIN! CAMPUS CHAMPION" : "YOU LOSE — TRY AGAIN";
              ovSub.innerHTML = `${state.p1.def.name} (${state.p1Wins}) vs ${state.p2.def.name} (${state.p2Wins}) • Stage: ${currentStage.name}`;
              menuBody.innerHTML = `
                <div class="arcade-btn-row">
                  <button type="button" class="arcade-btn" id="ccRematchBtn" style="background:#fb923c;border-color:#fb923c;color:#140904">REMATCH</button>
                  <button type="button" class="arcade-btn arcade-btn--ghost" id="ccSelectAgainBtn">PLAYER SELECT</button>
                </div>
              `;
              menuBody.querySelector("#ccRematchBtn").addEventListener("click", startMatch);
              menuBody.querySelector("#ccSelectAgainBtn").addEventListener("click", renderSelectMenu);
              overlay.classList.remove("hidden");
              return;
            } else {
              state.round += 1;
              startRound(state.p1.def, state.p2.def);
              return;
            }
          }
        }
      }

      if (state.mode === "fighting") {
        state.timer = Math.max(0, state.timer - dt);
        if (state.timer <= 0) {
          const p1Pct = state.p1.hp / state.p1.maxHp;
          const p2Pct = state.p2.hp / state.p2.maxHp;
          endRound(p1Pct > p2Pct ? "p1" : p2Pct > p1Pct ? "p2" : "draw");
          return;
        }
        updateAI(dt);
      }

      updateFighter(state.p1, state.p2, dt, true);
      updateFighter(state.p2, state.p1, dt, false);

      if (state.p1.grounded && state.p2.grounded) {
        const dx = state.p2.x - state.p1.x;
        const minDist = 30;
        if (Math.abs(dx) < minDist) {
          const push = (minDist - Math.abs(dx)) * 0.5;
          const sign = dx >= 0 ? 1 : -1;
          state.p1.x = Math.max(28, state.p1.x - sign * push);
          state.p2.x = Math.min(W - 28, state.p2.x + sign * push);
        }
      }

      for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const pr = state.projectiles[i];
        pr.x += pr.vx * dt;
        pr.life -= dt;
        if (Math.random() < 0.5) addParticles(pr.x - pr.dir * 8, pr.y, pr.color, 1, 25);
        const target = pr.owner === state.p1 ? state.p2 : state.p1;
        if (Math.abs(pr.x - target.x) < 22 && pr.y > target.y - (target.crouching ? 40 : 62) && pr.y < target.y) {
          resolveHit(pr.owner, target, { kind: "spec1", dmg: pr.dmg, height: "mid", hitstun: 0.34, blockstun: 0.18, push: 105, chip: 14 });
          state.projectiles.splice(i, 1);
          continue;
        }
        if (pr.life <= 0 || pr.x < -24 || pr.x > W + 24) state.projectiles.splice(i, 1);
      }

      for (let i = state.traps.length - 1; i >= 0; i--) {
        const tr = state.traps[i];
        tr.life -= dt;
        const target = tr.owner === state.p1 ? state.p2 : state.p1;
        if (Math.abs(tr.x - target.x) < 22 && Math.abs(tr.y - target.y) < 22) {
          resolveHit(tr.owner, target, { kind: "spec2", dmg: 96, height: "low", hitstun: 0.42, blockstun: 0.2, push: 95, launch: -210, chip: 16 });
          addParticles(tr.x, tr.y - 6, tr.color, 16, 150);
          state.traps.splice(i, 1);
          continue;
        }
        if (tr.life <= 0) state.traps.splice(i, 1);
      }

      for (let i = state.beams.length - 1; i >= 0; i--) {
        state.beams[i].life -= dt;
        if (state.beams[i].life <= 0) state.beams.splice(i, 1);
      }
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) state.particles.splice(i, 1);
      }
      for (let i = state.popups.length - 1; i >= 0; i--) {
        const pp = state.popups[i];
        pp.y += pp.vy * dt;
        pp.life -= dt;
        if (pp.life <= 0) state.popups.splice(i, 1);
      }
    }

    /* ---------------------------------------------------------
       16-BIT STAGE BACKDROP & ARTICULATED MARTIAL ARTIST RENDERER
       --------------------------------------------------------- */
    function drawStageBackdrop() {
      const st = currentStage;
      const fy = floorY();

      // Banded Retro Sunset / Hall Sky
      const grad = ctx.createLinearGradient(0, 0, 0, fy);
      grad.addColorStop(0, st.sky1);
      grad.addColorStop(0.6, st.sky2);
      grad.addColorStop(1, st.sky3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, fy);

      if (st.id === "gate") {
        // SF2 Ryu Rooftop / Sunset Campus Pagoda Silhouette!
        ctx.fillStyle = "rgba(254, 240, 138, 0.28)";
        ctx.fillRect(0, fy - 76, W, 6);
        ctx.fillRect(0, fy - 62, W, 3);

        // Distant campus tower silhouette
        const cx = Math.round(W * 0.5);
        ctx.fillStyle = "#291812";
        ctx.fillRect(cx - 56, fy - 92, 112, 92);
        ctx.fillRect(cx - 72, fy - 66, 144, 10);
        ctx.fillRect(cx - 42, fy - 114, 84, 22);
        ctx.fillRect(cx - 52, fy - 110, 104, 8);

        // Rooftop tile parapet wall
        ctx.fillStyle = "#4b4a4e";
        ctx.fillRect(0, fy - 24, W, 24);
        ctx.fillStyle = "#2b2a2e";
        for (let tx = 0; tx < W; tx += 14) {
          ctx.fillRect(tx, fy - 24, 2, 24);
          ctx.fillStyle = "#706e74";
          ctx.fillRect(tx + 2, fy - 24, 10, 3);
          ctx.fillStyle = "#2b2a2e";
        }
      } else if (st.id === "cafe") {
        // Cozy 24H Coffee Shop Interior
        for (let wx = 26; wx < W - 26; wx += 98) {
          ctx.fillStyle = "#2b1926";
          ctx.fillRect(wx, 54, 72, fy - 76);
          ctx.fillStyle = "rgba(251, 146, 60, 0.22)";
          ctx.fillRect(wx + 4, 58, 64, fy - 84);
        }
        ctx.fillStyle = "#18111b";
        ctx.fillRect(W * 0.5 - 64, 46, 128, 18);
        ctx.strokeStyle = "#fb923c";
        ctx.strokeRect(W * 0.5 - 64, 46, 128, 18);
        ctx.fillStyle = "#fed7aa";
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = "center";
        ctx.fillText("24H KOPI & WIFI", W * 0.5, 58);
      } else {
        // Server Room Racks
        for (let sx = 20; sx < W - 20; sx += 58) {
          ctx.fillStyle = "#0b1724";
          ctx.fillRect(sx, 50, 42, fy - 50);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(sx + 3, 54, 36, fy - 58);
          for (let ly = 60; ly < fy - 12; ly += 12) {
            ctx.fillStyle = (Math.floor(performance.now() / 280) + sx + ly) % 3 === 0 ? "#38bdf8" : "#22c55e";
            ctx.fillRect(sx + 7, ly, 8, 3);
          }
        }
      }

      // Perspective Wooden / Tiled Arcade Floor Planks (SF2 Style)
      ctx.fillStyle = st.floor1;
      ctx.fillRect(0, fy, W, H - fy);
      ctx.fillStyle = st.floor2;
      ctx.fillRect(0, fy + 16, W, H - fy - 16);

      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1.5;
      const midX = W * 0.5;
      for (let px = -8; px <= 8; px++) {
        ctx.beginPath();
        ctx.moveTo(midX + px * 32, fy);
        ctx.lineTo(midX + px * 56, H);
        ctx.stroke();
      }
      ctx.fillStyle = "#140c08";
      ctx.fillRect(0, fy, W, 2);
    }

    function drawPixelLimb(x1, y1, x2, y2, thickness, fill, outline = "#090a0f") {
      ctx.lineCap = "square";
      ctx.strokeStyle = outline;
      ctx.lineWidth = thickness + 3;
      ctx.beginPath();
      ctx.moveTo(Math.round(x1), Math.round(y1));
      ctx.lineTo(Math.round(x2), Math.round(y2));
      ctx.stroke();

      ctx.strokeStyle = fill;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(Math.round(x1), Math.round(y1));
      ctx.lineTo(Math.round(x2), Math.round(y2));
      ctx.stroke();
    }

    function drawArticulatedFighter(f) {
      // Afterimages
      f.afterimages.forEach((a) => {
        ctx.globalAlpha = a.life * 2.2;
        ctx.fillStyle = a.color;
        ctx.fillRect(Math.round(a.x) - 12, Math.round(a.y) - 58, 24, 56);
      });
      ctx.globalAlpha = 1;

      const x = Math.round(f.x);
      const y = Math.round(f.y);
      const d = f.def;
      const pose = f.state === "attack" && f.attack ? f.attack.pose : f.state;

      // Ground Shadow
      const sh = Math.max(0.45, 1 - (floorY() - f.y) / 220);
      ctx.fillStyle = "rgba(32, 8, 8, 0.52)";
      ctx.beginPath();
      ctx.ellipse(x, floorY() + 2, 20 * sh, 5 * sh, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(f.facing, 1);

      if (f.state === "ko") {
        ctx.translate(0, -10);
        ctx.rotate(-1.48);
      }

      const breathe = Math.sin(f.animPhase * 0.9) * 1.6;
      const walkSwing = f.state === "walk" ? Math.sin(f.animPhase * 2.4) * 10 : 0;
      const crouch = f.crouching || pose === "sweep" ? 15 : 0;
      const hitLean = f.state === "hitstun" ? -6 : pose === "hadouken" ? 6 : pose === "punch" ? 4 : 0;

      const hipX = hitLean * 0.4;
      const hipY = -25 + crouch + breathe * 0.4;
      const shX = hipX + hitLean * 0.7;
      const shY = hipY - 22 + crouch * 0.2;
      const headX = shX + 1;
      const headY = shY - 11;

      const giColor = f.flash > 0 ? "#ffffff" : d.giTop;
      const giShade = f.flash > 0 ? "#ffffff" : d.giShade;
      const skinCol = f.flash > 0 ? "#ffffff" : d.skin;
      const pantsCol = f.flash > 0 ? "#ffffff" : d.pants;

      // --- 1. BACK LEG ---
      let bKneeX = hipX - 8 - walkSwing * 0.4;
      let bKneeY = hipY + 12;
      let bFootX = hipX - 13 - walkSwing;
      let bFootY = -2;
      if (pose === "uppercut") {
        bKneeX = hipX - 4;
        bKneeY = hipY + 14;
        bFootX = hipX - 8;
        bFootY = hipY + 26;
      } else if (!f.grounded && pose !== "uppercut") {
        bKneeX = hipX - 9;
        bKneeY = hipY + 9;
        bFootX = hipX - 14;
        bFootY = hipY + 18;
      }
      drawPixelLimb(hipX - 3, hipY, bKneeX, bKneeY, 6, pantsCol);
      drawPixelLimb(bKneeX, bKneeY, bFootX, bFootY, 5, pantsCol);
      ctx.fillStyle = "#090a0f";
      ctx.fillRect(Math.round(bFootX) - 4, Math.round(bFootY) - 3, 10, 5);

      // --- 2. BACK ARM ---
      let bHandX = shX - 9;
      let bHandY = shY + 10;
      if (pose === "hadouken") {
        bHandX = shX + 24;
        bHandY = shY + 4;
      } else if (pose === "punch") {
        bHandX = shX - 10;
        bHandY = shY + 8;
      } else if (f.blocking || f.state === "blockstun" || f.state === "parry") {
        bHandX = shX + 11;
        bHandY = shY - 2;
      }
      drawPixelLimb(shX - 2, shY + 3, (shX + bHandX) * 0.5, (shY + bHandY) * 0.5 + 3, 5, skinCol);
      drawPixelLimb((shX + bHandX) * 0.5, (shY + bHandY) * 0.5 + 3, bHandX, bHandY, 5, d.gloves);

      // --- 3. FRONT LEG (OR EXTENDED KICK / LOW SWEEP!) ---
      let fKneeX = hipX + 9 + walkSwing * 0.4;
      let fKneeY = hipY + 11;
      let fFootX = hipX + 11 + walkSwing;
      let fFootY = -2;

      if (pose === "kick") {
        // High Street Fighter Roundhouse Kick!
        fKneeX = hipX + 16;
        fKneeY = hipY - 4;
        fFootX = hipX + 34;
        fFootY = hipY - 12;
      } else if (pose === "sweep") {
        // Low Crouching Sweep Kick!
        fKneeX = hipX + 16;
        fKneeY = -7;
        fFootX = hipX + 38;
        fFootY = -4;
      } else if (pose === "uppercut") {
        // Rising Dragon Knee!
        fKneeX = hipX + 13;
        fKneeY = hipY - 5;
        fFootX = hipX + 6;
        fFootY = hipY + 9;
      } else if (!f.grounded) {
        fKneeX = hipX + 11;
        fKneeY = hipY + 5;
        fFootX = hipX + 7;
        fFootY = hipY + 16;
      }

      drawPixelLimb(hipX + 3, hipY, fKneeX, fKneeY, 6, pantsCol);
      drawPixelLimb(fKneeX, fKneeY, fFootX, fFootY, 5, pantsCol);
      ctx.fillStyle = d.band;
      ctx.fillRect(Math.round(fFootX) - 4, Math.round(fFootY) - 3, 10, 5);

      // --- 4. TORSO / GI / JACKET & BLACK BELT ---
      ctx.fillStyle = "#090a0f";
      ctx.fillRect(Math.round(shX) - 11, Math.round(shY) - 2, 22, 26);
      ctx.fillStyle = giColor;
      ctx.fillRect(Math.round(shX) - 9, Math.round(shY), 18, 22);
      ctx.fillStyle = giShade;
      ctx.fillRect(Math.round(shX) - 9, Math.round(shY), 6, 22);
      // Chest V-neck
      ctx.fillStyle = skinCol;
      ctx.fillRect(Math.round(shX) + 1, Math.round(shY), 5, 7);
      // Martial arts belt / sash
      ctx.fillStyle = "#090a0f";
      ctx.fillRect(Math.round(shX) - 10, Math.round(shY) + 16, 20, 4);
      ctx.fillStyle = d.band;
      ctx.fillRect(Math.round(shX) - 9, Math.round(shY) + 17, 18, 2);

      // --- 5. HEAD, HAIR & FLUTTERING HEADBAND ---
      ctx.fillStyle = "#090a0f";
      ctx.fillRect(Math.round(headX) - 8, Math.round(headY) - 8, 16, 16);
      ctx.fillStyle = skinCol;
      ctx.fillRect(Math.round(headX) - 6, Math.round(headY) - 6, 12, 12);
      // Hair
      ctx.fillStyle = d.hair;
      ctx.fillRect(Math.round(headX) - 7, Math.round(headY) - 8, 14, 5);
      // Headband + Animated Fluttering Tails
      ctx.fillStyle = d.band;
      ctx.fillRect(Math.round(headX) - 7, Math.round(headY) - 4, 14, 3);
      const flutter = Math.sin(f.animPhase * 2.5) * 3;
      ctx.fillRect(Math.round(headX) - 14, Math.round(headY) - 3 + flutter * 0.4, 7, 2);
      ctx.fillRect(Math.round(headX) - 12, Math.round(headY) - 1 + flutter, 5, 2);
      // Eyes
      ctx.fillStyle = "#090a0f";
      ctx.fillRect(Math.round(headX) + 2, Math.round(headY) - 1, 3, 2);

      // --- 6. FRONT ARM (PUNCH / UPPERCUT / HADOUKEN / GUARD) ---
      let fElbowX = shX + 7;
      let fElbowY = shY + 10;
      let fHandX = shX + 14;
      let fHandY = shY + 4;

      if (pose === "punch") {
        fElbowX = shX + 16;
        fElbowY = shY + 4;
        fHandX = shX + 34;
        fHandY = shY + 3;
      } else if (pose === "uppercut") {
        // Rising Shoryuken Fist Skyward!
        fElbowX = shX + 9;
        fElbowY = shY - 8;
        fHandX = shX + 12;
        fHandY = shY - 28;
      } else if (pose === "hadouken") {
        fElbowX = shX + 14;
        fElbowY = shY + 5;
        fHandX = shX + 26;
        fHandY = shY + 5;
      } else if (pose === "slam") {
        fElbowX = shX + 14;
        fElbowY = shY + 12;
        fHandX = shX + 24;
        fHandY = shY + 24;
      } else if (f.blocking || f.state === "blockstun" || f.state === "parry") {
        fElbowX = shX + 8;
        fElbowY = shY + 8;
        fHandX = shX + 14;
        fHandY = shY - 4;
      } else if (f.state === "victory") {
        fElbowX = shX + 8;
        fElbowY = shY - 6;
        fHandX = shX + 10;
        fHandY = shY - 22;
      }

      drawPixelLimb(shX + 3, shY + 3, fElbowX, fElbowY, 5, skinCol);
      drawPixelLimb(fElbowX, fElbowY, fHandX, fHandY, 5, skinCol);
      // Gloved Fist
      ctx.fillStyle = "#090a0f";
      ctx.fillRect(Math.round(fHandX) - 4, Math.round(fHandY) - 4, 9, 9);
      ctx.fillStyle = d.gloves;
      ctx.fillRect(Math.round(fHandX) - 3, Math.round(fHandY) - 3, 7, 7);

      // Motion Smear Arc on Active Attacks!
      if (f.state === "attack" && f.attack) {
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = d.accent;
        if (pose === "punch") {
          ctx.fillRect(Math.round(fHandX) - 10, Math.round(fHandY) - 5, 18, 10);
        } else if (pose === "kick" || pose === "sweep") {
          ctx.fillRect(Math.round(fFootX) - 12, Math.round(fFootY) - 5, 20, 10);
        } else if (pose === "uppercut") {
          ctx.fillStyle = d.color;
          ctx.fillRect(Math.round(fHandX) - 7, Math.round(fHandY) - 8, 14, 28);
        }
        ctx.restore();
      }

      // Guard / Parry Energy Barrier
      if (f.blocking || f.state === "blockstun" || f.state === "parry") {
        ctx.strokeStyle = f.state === "parry" ? "#34d399" : "#60a5fa";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(14, -32 + crouch, 20, -1.15, 1.15);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawHadouken(pr) {
      ctx.save();
      ctx.translate(Math.round(pr.x), Math.round(pr.y));
      ctx.scale(pr.dir, 1);

      // Multi-layered SF2-style Pixel Plasma Fireball
      ctx.fillStyle = pr.color;
      ctx.fillRect(-20, -5, 14, 10);
      ctx.fillRect(-26, -2, 8, 4);
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.arc(2, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, -4, 7, 8);
      ctx.restore();
    }

    function drawArcadeHud() {
      if (!state.p1 || !state.p2) return;
      const barW = Math.min(200, Math.floor(W * 0.37));
      const y = 14;
      const mid = Math.floor(W * 0.5);

      // P1 SF2 Yellow-over-Red Health Bar
      const p1Pct = Math.max(0, state.p1.hp / state.p1.maxHp);
      const p1Disp = Math.max(0, state.p1.displayHp / state.p1.maxHp);
      const p1X = mid - 22 - barW;
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(p1X, y, barW, 12);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(p1X + Math.round(barW * (1 - p1Disp)), y, Math.round(barW * p1Disp), 12);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(p1X + Math.round(barW * (1 - p1Pct)), y, Math.round(barW * p1Pct), 12);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p1X, y, barW, 12);

      // P2 Health Bar
      const p2Pct = Math.max(0, state.p2.hp / state.p2.maxHp);
      const p2Disp = Math.max(0, state.p2.displayHp / state.p2.maxHp);
      const p2X = mid + 22;
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(p2X, y, barW, 12);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(p2X, y, Math.round(barW * p2Disp), 12);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(p2X, y, Math.round(barW * p2Pct), 12);
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(p2X, y, barW, 12);

      // Central KO Emblem + Golden Arcade Timer
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(mid - 18, y - 2, 36, 16);
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(mid - 18, y - 2, 36, 16);
      ctx.fillStyle = "#ffffff";
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.fillText("KO", mid, y + 10);

      ctx.fillStyle = "#fbbf24";
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText(String(Math.ceil(state.timer)).padStart(2, "0"), mid, y + 28);

      // Names & Win Stars
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(state.p1.def.shortName, p1X, y + 23);
      for (let w = 0; w < state.p1Wins; w++) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("★", p1X + barW - 10 - w * 12, y + 23);
      }

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.fillText(state.p2.def.shortName, p2X + barW, y + 23);
      for (let w = 0; w < state.p2Wins; w++) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("★", p2X + 10 + w * 12, y + 23);
      }

      // 3-Bar Super Meters
      const mW = Math.min(130, Math.floor(W * 0.26));
      const mY = H - 15;
      [
        { f: state.p1, x: 14 },
        { f: state.p2, x: W - 14 - mW }
      ].forEach(({ f, x }) => {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(x, mY, mW, 8);
        ctx.fillStyle = f.meter >= 300 ? "#fbbf24" : "#38bdf8";
        ctx.fillRect(x, mY, Math.round(mW * (f.meter / 300)), 8);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, mY, mW, 8);
        ctx.fillStyle = "#000";
        ctx.fillRect(x + Math.floor(mW / 3), mY, 1, 8);
        ctx.fillRect(x + Math.floor((mW * 2) / 3), mY, 1, 8);
        if (f.meter >= 300) {
          ctx.fillStyle = "#fbbf24";
          ctx.font = '6px "Press Start 2P", monospace';
          ctx.textAlign = "left";
          ctx.fillText("MAX SUPER [U]", x, mY - 4);
        }
      });
    }

    function draw() {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (state.shake > 0.2) {
        ctx.translate(
          Math.round((Math.random() - 0.5) * state.shake),
          Math.round((Math.random() - 0.5) * state.shake)
        );
      }

      drawStageBackdrop();

      if (state.superFlash > 0) {
        ctx.fillStyle = `rgba(5, 8, 22, ${Math.min(0.75, state.superFlash * 1.4)})`;
        ctx.fillRect(0, 0, W, H);
      }

      state.traps.forEach((tr) => {
        ctx.fillStyle = tr.color;
        ctx.fillRect(Math.round(tr.x) - 10, Math.round(tr.y) - 4, 20, 6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(tr.x) - 4, Math.round(tr.y) - 3, 8, 2);
      });

      if (state.p1 && state.p2) {
        drawArticulatedFighter(state.p1);
        drawArticulatedFighter(state.p2);
      }

      state.projectiles.forEach(drawHadouken);

      state.beams.forEach((bm) => {
        ctx.save();
        ctx.globalAlpha = bm.life / bm.maxLife;
        const bx = bm.dir === 1 ? bm.x : bm.x - bm.len;
        ctx.fillStyle = bm.color;
        ctx.fillRect(bx, bm.y - 18, bm.len, 36);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bx, bm.y - 7, bm.len, 14);
        ctx.restore();
      });

      state.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
      });
      ctx.globalAlpha = 1;

      ctx.textAlign = "center";
      state.popups.forEach((pp) => {
        ctx.globalAlpha = Math.max(0, pp.life);
        ctx.font = `${pp.size}px "Press Start 2P", monospace`;
        ctx.fillStyle = "#090a0f";
        ctx.fillText(pp.text, Math.round(pp.x) + 1, Math.round(pp.y) + 1);
        ctx.fillStyle = pp.color;
        ctx.fillText(pp.text, Math.round(pp.x), Math.round(pp.y));
      });
      ctx.globalAlpha = 1;

      drawArcadeHud();

      if (state.superFlash > 0 && state.superName) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(0, Math.round(H * 0.39), W, 26);
        ctx.fillStyle = "#090b12";
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.textAlign = "center";
        ctx.fillText(`★ ${state.superName} ★`, W * 0.5, Math.round(H * 0.39) + 17);
      }

      if (state.bannerTimer > 0 && state.bannerText) {
        ctx.fillStyle = "rgba(0,0,0,0.72)";
        ctx.fillRect(0, Math.round(H * 0.44) - 16, W, 32);
        ctx.fillStyle = "#ffffff";
        ctx.font = '13px "Press Start 2P", monospace';
        ctx.textAlign = "center";
        ctx.fillText(state.bannerText, W * 0.5, Math.round(H * 0.44) + 6);
      }

      ctx.restore();
    }

    function loop(ts) {
      if (destroyed) return;
      const dt = Math.min(0.035, (ts - lastTime) / 1000 || 0.016);
      lastTime = ts;
      update(dt);
      draw();
      rafId = requestAnimationFrame(loop);
    }

    function triggerDash(dir) {
      const f = state.p1;
      if (!f || state.mode !== "fighting" || !f.grounded) return;
      if (f.state !== "idle" && f.state !== "walk") return;
      f.state = "dash";
      f.stateTimer = 0.16;
      f.vx = dir * 340;
      if (dir === -f.facing) f.invuln = 0.14;
      sfx.tone(360, 0.06, "sine", 0.05, 520);
    }

    function onKeyDown(e) {
      if (e.repeat) return;
      keys[e.code] = true;

      if (e.code === "KeyM") {
        openMoveList();
        return;
      }
      if (state.mode === "select" && e.code === "Enter") {
        startMatch();
        return;
      }
      if (state.mode !== "fighting") return;

      const p1 = state.p1;
      const p2 = state.p2;

      if (["KeyA", "ArrowLeft", "KeyD", "ArrowRight"].includes(e.code)) {
        const dir = e.code === "KeyD" || e.code === "ArrowRight" ? 1 : -1;
        const now = performance.now();
        if (dir === state.lastTapDir && now - state.lastTapTime < 230) {
          triggerDash(dir);
          state.lastTapDir = 0;
        } else {
          state.lastTapDir = dir;
          state.lastTapTime = now;
        }
      }

      if (e.code === "KeyU" || (e.code === "KeyJ" && keys.KeyK) || (e.code === "KeyK" && keys.KeyJ)) {
        if (p1.meter >= 300) {
          startAttack(p1, p2, "super");
          return;
        }
      }

      if (e.code === "KeyJ" || e.code === "KeyZ") {
        const holdingFwd =
          (p1.facing === 1 && (keys.KeyD || keys.ArrowRight)) ||
          (p1.facing === -1 && (keys.KeyA || keys.ArrowLeft));
        startAttack(p1, p2, holdingFwd ? "throw" : "light");
      } else if (e.code === "KeyK" || e.code === "KeyX") {
        startAttack(p1, p2, "heavy");
      } else if (e.code === "KeyL" || e.code === "KeyC") {
        const holdingBackOrDown =
          keys.KeyS ||
          keys.ArrowDown ||
          touchState.crouch ||
          (p1.facing === 1 && (keys.KeyA || keys.ArrowLeft)) ||
          (p1.facing === -1 && (keys.KeyD || keys.ArrowRight));
        startAttack(p1, p2, holdingBackOrDown ? "spec2" : "spec1");
      }
    }

    function onKeyUp(e) {
      keys[e.code] = false;
    }

    container.querySelectorAll("[data-act]").forEach((btn) => {
      const act = btn.dataset.act;
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (act === "left") touchState.left = true;
        else if (act === "right") touchState.right = true;
        else if (act === "crouch") touchState.crouch = true;
        else if (act === "jump" && state.p1 && state.p1.grounded && state.mode === "fighting") {
          state.p1.vy = -465;
          state.p1.grounded = false;
        } else if (state.mode === "fighting") {
          if (act === "light") startAttack(state.p1, state.p2, "light");
          if (act === "heavy") startAttack(state.p1, state.p2, "heavy");
          if (act === "special") startAttack(state.p1, state.p2, touchState.left || touchState.crouch ? "spec2" : "spec1");
          if (act === "super") startAttack(state.p1, state.p2, "super");
        }
      });
      const release = () => {
        if (act === "left") touchState.left = false;
        if (act === "right") touchState.right = false;
        if (act === "crouch") touchState.crouch = false;
      };
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointerleave", release);
    });

    movesBtn.addEventListener("click", openMoveList);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", resize);

    renderSelectMenu();
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);

    return {
      destroy() {
        destroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("resize", resize);
      }
    };
  }
};