/* =========================================================
   CARTRIDGE 04: VEIL OF THE MONOLITH (V0.4 — PS1/PS2 3D OVERHAUL)
   Procedural Pixel-Textured Three.js • 3.5x Scale Colossi
   Articulated Hero & Twin Chain-Blades • Anti-Cheese Climbing
   Timed Crest Parries • Charge Plunge • Full Touch Support
   ========================================================= */

window.CRT_GAMES = window.CRT_GAMES || {};

window.CRT_GAMES.monolith = {
  mount(container, api) {
    const SAVE_KEY = "kai_v04_monolith_oath";

    function loadSave() {
      try {
        const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
        return Array.isArray(parsed.defeated) ? parsed.defeated : [];
      } catch {
        return [];
      }
    }

    function writeSave(defeated) {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ defeated }));
    }

    let defeatedList = loadSave();

    const MONOLITHS = [
      {
        id: "verdant",
        num: "I",
        name: "VERDANT, THE STEPPE SOVEREIGN",
        arena: "WINDSWEPT EMERALD STEPPE",
        archetype: "42M STONE COLOSSUS",
        tactic: "Parry stomps or cleave ankles to stagger, grapple [E] onto its leg, then climb [W] up its mossy spine to the Crown.",
        sky: 0x2f5a5c,
        fog: 0x3b6968,
        accent: "#34d399",
        sigilColor: 0x38bdf8,
        sigilHp: [240, 280, 340]
      },
      {
        id: "aurelia",
        num: "II",
        name: "AURELIA, THE CLOUD LEVIATHAN",
        arena: "SHATTERED CLOUD SPIRE",
        archetype: "WINGED SKY SERPENT",
        tactic: "Step onto cyan updraft wind-vents to launch skyward, grapple [E] onto its tail ring, and climb [W] along its spine to the Crest.",
        sky: 0x223a63,
        fog: 0x4b6e94,
        accent: "#38bdf8",
        sigilColor: 0xfbbf24,
        sigilHp: [260, 310, 370]
      },
      {
        id: "ignis",
        num: "III",
        name: "IGNIS, THE CALDERA BEHEMOTH",
        arena: "OBSIDIAN CALDERA",
        archetype: "VOLCANIC SIEGE-TITAN",
        tactic: "Time Crest Parry [RMB/SHIFT] to reflect magma boulders back and stagger Ignis, then climb [W] from its foreleg to the Furnace Crown.",
        sky: 0x210d0e,
        fog: 0x3c1512,
        accent: "#f97316",
        sigilColor: 0xf43f5e,
        sigilHp: [300, 350, 420]
      }
    ];

    const OILS = [
      { id: "ember", name: "CRIMSON EMBER", color: 0xf97316, hex: "#f97316", dmgMult: 1.24, speedMult: 1.0, slowBoss: 1.0 },
      { id: "gale", name: "GALE EDGE", color: 0x34d399, hex: "#34d399", dmgMult: 1.05, speedMult: 1.22, slowBoss: 1.0 },
      { id: "frost", name: "FROSTFANG", color: 0x38bdf8, hex: "#38bdf8", dmgMult: 1.08, speedMult: 1.05, slowBoss: 0.76 }
    ];

    container.innerHTML = `
      <div class="arcade-root">
        <div class="arcade-hud">
          <div class="arcade-hud-group">
            <span class="arcade-stat">
              <span class="arcade-stat-label">HP</span>
              <span class="arcade-stat-val" id="vmHp" style="color:#34d399">100 / 100</span>
            </span>
            <span class="arcade-stat">
              <span class="arcade-stat-label">GRIP</span>
              <span class="arcade-stat-val" id="vmStam" style="color:#fbbf24">100%</span>
            </span>
            <span class="arcade-stat">
              <span class="arcade-stat-label">OIL</span>
              <span class="arcade-stat-val" id="vmOil" style="color:#f97316">CRIMSON EMBER</span>
            </span>
          </div>
          <div class="arcade-hud-group">
            <span class="arcade-pill" id="vmBossStatus">SUNKEN SANCTUM • ${defeatedList.length}/3 SEALS</span>
            <button type="button" class="touch-btn" id="vmHubBtn">SANCTUM [ESC]</button>
          </div>
        </div>

        <div class="arcade-stage" id="vmStage">
          <canvas id="vmCanvas" class="pixel-canvas"></canvas>

          <!-- Live In-Fight Boss Bar, Plunge Gauge & Climb Indicator -->
          <div id="vmFightHud" style="position:absolute;inset:0;pointer-events:none;display:none;flex-direction:column;justify-content:space-between;padding:14px 20px;z-index:4;">
            <div style="width:min(600px,100%);margin:0 auto;text-align:center;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-family:'Press Start 2P',monospace;font-size:0.56rem;text-shadow:2px 2px 0 #000;">
                <span id="vmBossName">VERDANT, THE STEPPE SOVEREIGN</span>
                <span id="vmSigilCount" style="color:#38bdf8">SEALS: 3 LEFT</span>
              </div>
              <div style="height:11px;background:rgba(0,0,0,0.72);border:2px solid rgba(255,255,255,0.34);border-radius:4px;overflow:hidden;">
                <div id="vmBossHpFill" style="height:100%;width:100%;background:linear-gradient(90deg,#e11d48,#f97316);transition:width 0.1s linear;"></div>
              </div>
              <!-- Stagger / Posture Bar -->
              <div style="height:5px;width:58%;margin:4px auto 0;background:rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.2);border-radius:3px;overflow:hidden;">
                <div id="vmStaggerFill" style="height:100%;width:0%;background:#fbbf24;transition:width 0.1s linear;"></div>
              </div>
            </div>

            <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;">
              <div id="vmBanner" style="font-family:'Press Start 2P',monospace;font-size:0.66rem;line-height:1.5;color:#fef08a;text-shadow:2px 2px 0 #000;min-height:20px;"></div>

              <!-- Plunge Charge Meter (Visible when charging blade while climbing) -->
              <div id="vmChargeWrap" style="display:none;width:190px;padding:4px;background:rgba(8,10,16,0.86);border:1.5px solid #fbbf24;border-radius:4px;">
                <div style="font-family:'Press Start 2P',monospace;font-size:0.44rem;color:#fbbf24;margin-bottom:3px;">PLUNGE CHARGE</div>
                <div style="height:6px;background:#1e1b2e;overflow:hidden;">
                  <div id="vmChargeFill" style="height:100%;width:0%;background:linear-gradient(90deg,#38bdf8,#fbbf24);"></div>
                </div>
              </div>

              <div id="vmClimbHint" style="font-family:'Press Start 2P',monospace;font-size:0.48rem;line-height:1.6;padding:6px 12px;border-radius:4px;background:rgba(6,10,16,0.86);border:1.5px solid rgba(100,227,219,0.6);color:#64e3db;display:none;">
                CLIMBING — [W/S] ASCEND/DESCEND • HOLD [J/LMB] PLUNGE • HOLD [SHIFT/RMB] BRACE SHAKE
              </div>
            </div>
          </div>

          <!-- Sanctum Gate Overlay -->
          <div class="arcade-overlay" id="vmOverlay">
            <span class="arcade-pill" style="border-color:#34d399;color:#a7f3d0;background:rgba(16,185,129,0.18)">
              TAPE 04 // PS1/PS2 3D COLOSSUS CLIMBER
            </span>
            <h3 class="arcade-ov-title" id="vmOvTitle">VEIL OF THE MONOLITH</h3>
            <p class="arcade-ov-sub" id="vmOvSub"></p>
            <div id="vmMenuMount" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:12px;"></div>
          </div>
        </div>

        <div class="arcade-controls-bar">
          <span><strong>WASD:</strong> Move / Climb &nbsp;|&nbsp; <strong>SPACE:</strong> Jump/Slingshot &nbsp;|&nbsp; <strong>J / LMB:</strong> Blades (Hold=Plunge) &nbsp;|&nbsp; <strong>SHIFT / RMB:</strong> Parry / Brace &nbsp;|&nbsp; <strong>E:</strong> Grapple &nbsp;|&nbsp; <strong>Q:</strong> Lock &nbsp;|&nbsp; <strong>R:</strong> Oil</span>
          <div class="arcade-touch-btns">
            <button type="button" class="touch-btn" data-mv="up">▲</button>
            <button type="button" class="touch-btn" data-mv="down">▼</button>
            <button type="button" class="touch-btn" data-mv="left">◀</button>
            <button type="button" class="touch-btn" data-mv="right">▶</button>
            <button type="button" class="touch-btn" id="vmActJump">JUMP</button>
            <button type="button" class="touch-btn" id="vmActSlash">SLASH</button>
            <button type="button" class="touch-btn" id="vmActParry">PARRY/BRACE</button>
            <button type="button" class="touch-btn" id="vmActGrapple" style="border-color:#34d399;color:#34d399">GRAPPLE</button>
            <button type="button" class="touch-btn" id="vmActOil">OIL</button>
          </div>
        </div>
      </div>
    `;

    const stageEl = container.querySelector("#vmStage");
    const canvas = container.querySelector("#vmCanvas");
    const hpEl = container.querySelector("#vmHp");
    const stamEl = container.querySelector("#vmStam");
    const oilEl = container.querySelector("#vmOil");
    const bossStatusEl = container.querySelector("#vmBossStatus");
    const hubBtn = container.querySelector("#vmHubBtn");

    const fightHud = container.querySelector("#vmFightHud");
    const bossNameEl = container.querySelector("#vmBossName");
    const sigilCountEl = container.querySelector("#vmSigilCount");
    const bossHpFill = container.querySelector("#vmBossHpFill");
    const staggerFill = container.querySelector("#vmStaggerFill");
    const bannerEl = container.querySelector("#vmBanner");
    const chargeWrap = container.querySelector("#vmChargeWrap");
    const chargeFill = container.querySelector("#vmChargeFill");
    const climbHintEl = container.querySelector("#vmClimbHint");

    const overlay = container.querySelector("#vmOverlay");
    const ovTitle = container.querySelector("#vmOvTitle");
    const ovSub = container.querySelector("#vmOvSub");
    const menuMount = container.querySelector("#vmMenuMount");

    const sfx = {
      tone: (f, d, t, g, ef) => api && api.tone && api.tone(f, d, t, g, ef),
      noise: (d, g) => api && api.noise && api.noise(d, g)
    };

    if (!window.THREE) {
      ovTitle.textContent = "THREE.JS WEBGL REQUIRED";
      ovSub.textContent = "Could not load Three.js CDN. Check your internet connection and reload.";
      return { destroy() {} };
    }

    const THREE = window.THREE;
    let destroyed = false;
    let rafId = null;
    let lastTime = 0;

    // Authentic PS1/PS2 crisp low-res WebGL buffer upscaled cleanly
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(0.85, window.devicePixelRatio * 0.65));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.3, 420);

    function resize() {
      const rect = stageEl.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(220, Math.floor(rect.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();

    /* ---------------------------------------------------------
       PROCEDURAL PS1/PS2 PIXEL TEXTURE GENERATOR
       --------------------------------------------------------- */
    const createdTextures = [];
    function makePixelTexture(size, repeatX, repeatY, paintFn) {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const g = c.getContext("2d");
      paintFn(g, size);
      const tex = new THREE.CanvasTexture(c);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
      createdTextures.push(tex);
      return tex;
    }

    const TEX = {
      stone: makePixelTexture(64, 2, 2, (g, s) => {
        g.fillStyle = "#4d554f";
        g.fillRect(0, 0, s, s);
        for (let y = 0; y < s; y += 16) {
          g.fillStyle = "#2b302c";
          g.fillRect(0, y, s, 2);
          const off = (y / 16) % 2 === 0 ? 0 : 16;
          for (let x = off; x < s; x += 32) {
            g.fillRect(x, y, 2, 16);
            g.fillStyle = "#5d665f";
            g.fillRect(x + 3, y + 3, 26, 4);
            g.fillStyle = "#2b302c";
          }
        }
        // Pixel noise & moss flecks
        for (let i = 0; i < 140; i++) {
          g.fillStyle = i % 5 === 0 ? "#2e5c38" : i % 2 === 0 ? "#3c433e" : "#677068";
          g.fillRect(Math.floor(Math.random() * s), Math.floor(Math.random() * s), 3, 3);
        }
      }),
      furGrip: makePixelTexture(32, 2, 2, (g, s) => {
        g.fillStyle = "#1c3b28";
        g.fillRect(0, 0, s, s);
        for (let i = 0; i < 90; i++) {
          g.fillStyle = i % 3 === 0 ? "#34d399" : i % 2 === 0 ? "#14291c" : "#2b6b42";
          g.fillRect(Math.floor(Math.random() * s), Math.floor(Math.random() * s), 2, 6);
        }
      }),
      goldMarble: makePixelTexture(64, 2, 2, (g, s) => {
        g.fillStyle = "#7c8594";
        g.fillRect(0, 0, s, s);
        g.fillStyle = "#b48a3c";
        g.fillRect(0, 6, s, 6);
        g.fillRect(0, s - 12, s, 6);
        g.fillStyle = "#fbbf24";
        g.fillRect(0, 8, s, 2);
        for (let i = 0; i < 110; i++) {
          g.fillStyle = i % 2 === 0 ? "#666f7d" : "#96a0b0";
          g.fillRect(Math.floor(Math.random() * s), Math.floor(Math.random() * s), 3, 2);
        }
      }),
      basaltLava: makePixelTexture(64, 2, 2, (g, s) => {
        g.fillStyle = "#1f191a";
        g.fillRect(0, 0, s, s);
        for (let i = 0; i < 120; i++) {
          g.fillStyle = i % 2 === 0 ? "#2e2526" : "#120e0f";
          g.fillRect(Math.floor(Math.random() * s), Math.floor(Math.random() * s), 4, 4);
        }
        // Glowing magma cracks
        g.fillStyle = "#ea580c";
        g.fillRect(10, 0, 3, s);
        g.fillRect(0, 34, s, 3);
        g.fillStyle = "#fef08a";
        g.fillRect(11, 0, 1, s);
        g.fillRect(0, 35, s, 1);
      }),
      steppeGround: makePixelTexture(64, 16, 16, (g, s) => {
        g.fillStyle = "#2d6039";
        g.fillRect(0, 0, s, s);
        for (let i = 0; i < 220; i++) {
          g.fillStyle = i % 4 === 0 ? "#3f7d4b" : i % 3 === 0 ? "#214a2b" : "#4f6b3a";
          g.fillRect(Math.floor(Math.random() * s), Math.floor(Math.random() * s), 3, 2);
        }
      }),
      cloudGround: makePixelTexture(64, 12, 12, (g, s) => {
        g.fillStyle = "#5c6a7d";
        g.fillRect(0, 0, s, s);
        g.strokeStyle = "#3c4857";
        g.lineWidth = 2;
        g.strokeRect(2, 2, 28, 28);
        g.strokeRect(34, 2, 28, 28);
        g.strokeRect(2, 34, 28, 28);
        g.strokeRect(34, 34, 28, 28);
      }),
      calderaGround: makePixelTexture(64, 14, 14, (g, s) => {
        g.fillStyle = "#1c1718";
        g.fillRect(0, 0, s, s);
        for (let i = 0; i < 160; i++) {
          g.fillStyle = i % 16 === 0 ? "#c2410c" : i % 2 === 0 ? "#292224" : "#120f10";
          g.fillRect(Math.floor(Math.random() * s), Math.floor(Math.random() * s), 3, 3);
        }
      })
    };

    const arenaGroup = new THREE.Group();
    const fxGroup = new THREE.Group();
    scene.add(arenaGroup);
    scene.add(fxGroup);

    const hemiLight = new THREE.HemisphereLight(0xdff5ff, 0x242c24, 0.85);
    scene.add(hemiLight);
    const sunLight = new THREE.DirectionalLight(0xfff0d4, 1.25);
    sunLight.position.set(42, 76, 36);
    scene.add(sunLight);

    const keys = {};
    const touchMove = { up: false, down: false, left: false, right: false };
    const mouse = { dragging: false, lastX: 0, lastY: 0 };

    const state = {
      mode: "hub",
      activeDef: null,
      time: 0,
      hitStop: 0,
      shake: 0,
      bannerTimer: 0,
      oilIdx: 0,
      lockOn: true,
      camYaw: 0,
      camPitch: 0.22,
      hero: {
        pos: new THREE.Vector3(0, 0, 38),
        vel: new THREE.Vector3(),
        yaw: Math.PI,
        hp: 100,
        maxHp: 100,
        stam: 100,
        grounded: true,
        guarding: false,
        parryWindow: 0,
        slashTimer: 0,
        slashCd: 0,
        comboStep: 0,
        charging: false,
        chargeVal: 0,
        invuln: 0,
        walkPhase: 0,
        climbTier: -1, // -1 = free, 0 = Ankle/Tail, 1 = Spine/Furnace, 2 = Crown
        climbProgress: 0, // 0..2 continuous climb position along Colossus tiers
        group: null,
        parts: null,
        bladeMats: [],
        slashArcMesh: null,
        grappleLine: null
      },
      monolith: null,
      windVents: [],
      shockwaves: [],
      boulders: [],
      debris: [],
      ambientMotes: []
    };

    function disposeGroup(grp) {
      while (grp.children.length > 0) {
        const child = grp.children[0];
        grp.remove(child);
        child.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else obj.material.dispose();
          }
        });
      }
    }

    function showBanner(msg, dur = 1.6) {
      bannerEl.textContent = msg;
      state.bannerTimer = dur;
    }

    /* ---------------------------------------------------------
       ARTICULATED PS1/PS2 WANDERER HERO + GLEAMING TWIN CHAIN-BLADES
       --------------------------------------------------------- */
    function buildHero() {
      const h = state.hero;
      if (h.group) {
        scene.remove(h.group);
        h.group.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose();
        });
      }

      const g = new THREE.Group();
      const curse = defeatedList.length;
      const ponchoColors = [0xe6dfd0, 0x8d8980, 0x3b3145, 0x160f20];

      const tunicMat = new THREE.MeshStandardMaterial({ color: 0x166534, flatShading: true, roughness: 0.8 });
      const ponchoMat = new THREE.MeshStandardMaterial({ color: ponchoColors[Math.min(3, curse)], flatShading: true, roughness: 0.9 });
      const leatherMat = new THREE.MeshStandardMaterial({ color: 0x452c1b, flatShading: true, roughness: 0.85 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xf1c79a, flatShading: true });
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e1815, flatShading: true });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4dbe3, metalness: 0.65, roughness: 0.3, flatShading: true });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7, roughness: 0.25, flatShading: true });

      const oil = OILS[state.oilIdx];
      const bladeEdgeMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: curse >= 3 ? 0xa855f7 : oil.color,
        emissiveIntensity: 0.95,
        metalness: 0.75,
        roughness: 0.2,
        flatShading: true
      });
      h.bladeMats = [bladeEdgeMat];

      // Legs (Pivoted at hips for proper running animation)
      const legLPivot = new THREE.Group();
      legLPivot.position.set(-0.22, 0.92, 0);
      const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 0.26), leatherMat);
      thighL.position.y = -0.24;
      const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.48, 0.34), leatherMat);
      bootL.position.set(0, -0.68, -0.04);
      legLPivot.add(thighL, bootL);

      const legRPivot = legLPivot.clone();
      legRPivot.position.x = 0.22;
      g.add(legLPivot, legRPivot);

      // Torso & Belt
      const torso = new THREE.Group();
      torso.position.y = 0.95;
      const chest = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.92, 0.44), tunicMat);
      chest.position.y = 0.48;
      const belt = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.16, 0.48), leatherMat);
      belt.position.y = 0.12;
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.52), goldMat);
      buckle.position.y = 0.12;

      // Nomadic Flowing Poncho Shoulder Mantle + Trailing Cape Flap
      const mantle = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.66, 0.44, 6), ponchoMat);
      mantle.position.set(0, 0.8, 0.02);
      const capePivot = new THREE.Group();
      capePivot.position.set(0, 0.85, 0.24);
      const capeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.12, 0.08), ponchoMat);
      capeMesh.position.set(0, -0.52, 0.06);
      capePivot.add(capeMesh);

      // Head, Hair & Hooded Cap
      const headGrp = new THREE.Group();
      headGrp.position.y = 1.18;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), skinMat);
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.24, 0.52), hairMat);
      hair.position.set(0, 0.16, 0.04);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.72, 5), tunicMat);
      cap.position.set(0, 0.36, 0.16);
      cap.rotation.x = -0.45;
      headGrp.add(head, hair, cap);

      // Helper to build a visible gleaming Chain-Blade Sword!
      function makeChainBlade(scaleLen = 1) {
        const sw = new THREE.Group();
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.34, 6), leatherMat);
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.12), goldMat);
        guard.position.y = 0.18;
        const bladeMain = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.55 * scaleLen, 0.05), bladeEdgeMat);
        bladeMain.position.y = 0.18 + 0.78 * scaleLen;
        const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.38, 4), bladeEdgeMat);
        bladeTip.position.y = 0.18 + 1.55 * scaleLen + 0.18;
        const chainLink = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 4, 6), metalMat);
        chainLink.position.y = -0.22;
        sw.add(grip, guard, bladeMain, bladeTip, chainLink);
        return sw;
      }

      // RIGHT ARM + PRIMARY CHAIN-BLADE
      const armRPivot = new THREE.Group();
      armRPivot.position.set(0.52, 0.82, 0);
      const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.22), tunicMat);
      armRMesh.position.y = -0.3;
      const handR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), leatherMat);
      handR.position.y = -0.68;
      const swordR = makeChainBlade(1.1);
      swordR.position.set(0, -0.7, -0.15);
      swordR.rotation.x = -Math.PI * 0.45;
      armRPivot.add(armRMesh, handR, swordR);

      // LEFT ARM + CREST SHIELD + OFF-HAND CHAIN-BLADE
      const armLPivot = new THREE.Group();
      armLPivot.position.set(-0.52, 0.82, 0);
      const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.22), tunicMat);
      armLMesh.position.y = -0.3;
      const handL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), leatherMat);
      handL.position.y = -0.68;

      const shieldGrp = new THREE.Group();
      shieldGrp.position.set(-0.18, -0.46, -0.24);
      const shieldBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.96, 0.74),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x0b1f54, flatShading: true, metalness: 0.4 })
      );
      const shieldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.34), goldMat);
      shieldTrim.position.set(-0.02, 0.08, 0);
      shieldGrp.add(shieldBody, shieldTrim);

      const swordL = makeChainBlade(0.95);
      swordL.position.set(0.05, -0.7, -0.15);
      swordL.rotation.x = -Math.PI * 0.45;
      armLPivot.add(armLMesh, handL, shieldGrp, swordL);

      // Glowing 3D Slash Arc Trail (Flashes on swing!)
      const slashArcMesh = new THREE.Mesh(
        new THREE.RingGeometry(1.1, 2.35, 16, 1, -1.1, 2.2),
        new THREE.MeshBasicMaterial({
          color: oil.color,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide
        })
      );
      slashArcMesh.rotation.x = Math.PI * 0.5;
      slashArcMesh.position.set(0, 0.55, -0.5);
      torso.add(slashArcMesh);
      h.slashArcMesh = slashArcMesh;

      torso.add(chest, belt, buckle, mantle, capePivot, headGrp, armRPivot, armLPivot);
      g.add(torso);

      if (!h.grappleLine) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x64e3db });
        h.grappleLine = new THREE.Line(lineGeo, lineMat);
        h.grappleLine.visible = false;
        scene.add(h.grappleLine);
      }

      scene.add(g);
      h.group = g;
      h.parts = { legLPivot, legRPivot, armLPivot, armRPivot, capePivot, torso, shieldBody };
    }

    /* ---------------------------------------------------------
       ARENAS & SANCTUM BACKDROP
       --------------------------------------------------------- */
    function buildSanctumBackdrop() {
      disposeGroup(arenaGroup);
      disposeGroup(fxGroup);
      state.monolith = null;
      state.windVents = [];
      state.ambientMotes = [];

      scene.background = new THREE.Color(0x0d121c);
      scene.fog = new THREE.FogExp2(0x0d121c, 0.018);

      const floor = new THREE.Mesh(
        new THREE.CylinderGeometry(36, 38, 1.5, 16),
        new THREE.MeshStandardMaterial({ map: TEX.stone, flatShading: true, roughness: 0.92 })
      );
      floor.position.y = -0.75;
      arenaGroup.add(floor);

      const coreMat = new THREE.MeshStandardMaterial({
        color: defeatedList.length >= 3 ? 0x120a1c : 0x3b4252,
        emissive: defeatedList.length >= 3 ? 0xa855f7 : 0x34d399,
        emissiveIntensity: 0.55 + defeatedList.length * 0.25,
        flatShading: true
      });
      const obelisk = new THREE.Mesh(new THREE.OctahedronGeometry(4.2, 0), coreMat);
      obelisk.scale.set(0.8, 2.7, 0.8);
      obelisk.position.set(0, 8, 0);
      arenaGroup.add(obelisk);

      // 3 Ancient Stone Gates representing the 3 Monoliths
      const pilMat = new THREE.MeshStandardMaterial({ map: TEX.stone, flatShading: true });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const p = new THREE.Mesh(new THREE.BoxGeometry(2.2, 14, 2.2), pilMat);
        p.position.set(Math.cos(a) * 20, 7, Math.sin(a) * 20);
        arenaGroup.add(p);
      }
    }

    function buildArena(def) {
      disposeGroup(arenaGroup);
      disposeGroup(fxGroup);
      state.windVents = [];
      state.shockwaves = [];
      state.boulders = [];
      state.debris = [];
      state.ambientMotes = [];

      scene.background = new THREE.Color(def.sky);
      scene.fog = new THREE.FogExp2(def.fog, 0.0065);

      const floorTex =
        def.id === "verdant" ? TEX.steppeGround : def.id === "aurelia" ? TEX.cloudGround : TEX.calderaGround;
      const ground = new THREE.Mesh(
        new THREE.CylinderGeometry(96, 102, 3, 28),
        new THREE.MeshStandardMaterial({ map: floorTex, flatShading: true, roughness: 0.95 })
      );
      ground.position.y = -1.5;
      arenaGroup.add(ground);

      // Atmospheric floating dust / wind / volcanic embers
      const moteMat = new THREE.MeshBasicMaterial({
        color: def.id === "ignis" ? 0xf97316 : def.id === "aurelia" ? 0xe0f2fe : 0xd9f99d
      });
      for (let i = 0; i < 42; i++) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), moteMat);
        m.position.set((Math.random() - 0.5) * 120, 1 + Math.random() * 34, (Math.random() - 0.5) * 120);
        arenaGroup.add(m);
        state.ambientMotes.push({ mesh: m, spd: 0.6 + Math.random() * 1.4 });
      }

      if (def.id === "verdant") {
        // Ancient Stone Ruin Arches & Distant Jagged Steppe Mountains
        const ruinMat = new THREE.MeshStandardMaterial({ map: TEX.stone, flatShading: true });
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const pil = new THREE.Mesh(new THREE.BoxGeometry(3.5, 16 + (i % 3) * 6, 3.5), ruinMat);
          pil.position.set(Math.cos(a) * 62, 8, Math.sin(a) * 62);
          arenaGroup.add(pil);
        }
        const mtnMat = new THREE.MeshStandardMaterial({ color: 0x223b3b, flatShading: true });
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          const peak = new THREE.Mesh(new THREE.ConeGeometry(28, 55 + Math.random() * 35, 5), mtnMat);
          peak.position.set(Math.cos(a) * 125, 24, Math.sin(a) * 125);
          arenaGroup.add(peak);
        }
      } else if (def.id === "aurelia") {
        // Shattered Cloud Spire: Massive Floating Temple Columns + 4 Cyan Updraft Wind-Vents
        const colMat = new THREE.MeshStandardMaterial({ map: TEX.goldMarble, flatShading: true });
        const cloudMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, flatShading: true });
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const p = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 3.0, 26 + (i % 3) * 10, 6), colMat);
          p.position.set(Math.cos(a) * 64, 10, Math.sin(a) * 64);
          arenaGroup.add(p);
          const cl = new THREE.Mesh(new THREE.DodecahedronGeometry(14, 0), cloudMat);
          cl.position.set(Math.cos(a + 0.25) * 95, -10, Math.sin(a + 0.25) * 95);
          arenaGroup.add(cl);
        }

        const ventMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.9,
          transparent: true,
          opacity: 0.58,
          flatShading: true
        });
        for (let v = 0; v < 4; v++) {
          const a = (v / 4) * Math.PI * 2 + 0.4;
          const vx = Math.cos(a) * 32;
          const vz = Math.sin(a) * 32;
          const ring = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 3.6, 8, 8, 1, true), ventMat);
          ring.position.set(vx, 4, vz);
          arenaGroup.add(ring);
          state.windVents.push({ x: vx, z: vz, r: 4.8, mesh: ring });
        }
      } else {
        // Obsidian Caldera: Molten Magma Crater Rim & Towering Basalt Spires
        const lavaRing = new THREE.Mesh(
          new THREE.TorusGeometry(88, 8, 6, 28),
          new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.35, flatShading: true })
        );
        lavaRing.rotation.x = Math.PI * 0.5;
        lavaRing.position.y = -0.4;
        arenaGroup.add(lavaRing);

        const spikeMat = new THREE.MeshStandardMaterial({ map: TEX.basaltLava, flatShading: true });
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          const sp = new THREE.Mesh(new THREE.ConeGeometry(7, 32 + (i % 3) * 14, 5), spikeMat);
          sp.position.set(Math.cos(a) * 80, 14, Math.sin(a) * 80);
          arenaGroup.add(sp);
        }
      }
    }

    /* ---------------------------------------------------------
       BUILD 3.5x TOWERING TEXTURED COLOSSI + 3 TIERED SIGIL LOCKS
       --------------------------------------------------------- */
    function makeSigilNode(parent, x, y, z, colorHex, hp, label, tierIdx) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);

      // Climbable Moss/Fur Grip Patch around the Sigil
      const gripPatch = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 4.2, 1.2),
        new THREE.MeshStandardMaterial({ map: TEX.furGrip, flatShading: true, roughness: 0.95 })
      );
      grp.add(gripPatch);

      // Glowing Weak-Point Seal Core
      const coreMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 1.5,
        flatShading: true
      });
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.75, 0), coreMat);
      core.position.z = 0.85;
      grp.add(core);

      // Iron Anchor-Chain Ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.3, 0.28, 5, 10),
        new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.75, roughness: 0.35, flatShading: true })
      );
      ring.position.z = 0.85;
      grp.add(ring);

      parent.add(grp);
      return { tierIdx, label, mesh: grp, core, ring, hp, maxHp: hp, broken: false };
    }

    function buildMonolith(def) {
      const root = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        map: def.id === "ignis" ? TEX.basaltLava : def.id === "aurelia" ? TEX.goldMarble : TEX.stone,
        flatShading: true,
        roughness: 0.9
      });
      const furMat = new THREE.MeshStandardMaterial({
        map: TEX.furGrip,
        flatShading: true,
        roughness: 0.95
      });
      const eyeMat = new THREE.MeshStandardMaterial({
        color: def.sigilColor,
        emissive: def.sigilColor,
        emissiveIntensity: 2.0,
        flatShading: true
      });

      const sigils = [];
      const parts = {};

      if (def.id === "verdant") {
        // TOWERING 42-UNIT STONE SOVEREIGN (Shadow of the Colossus Valus Scale!)
        const legL = new THREE.Group();
        legL.position.set(-5.8, 16, 0);
        const legLMesh = new THREE.Mesh(new THREE.BoxGeometry(5.2, 16.5, 5.4), bodyMat);
        legLMesh.position.y = -8;
        const kneePlateL = new THREE.Mesh(new THREE.BoxGeometry(5.8, 4.5, 6.2), furMat);
        kneePlateL.position.y = -7.5;
        legL.add(legLMesh, kneePlateL);

        const legR = legL.clone();
        legR.position.x = 5.8;
        root.add(legL, legR);

        // Massive Torso + Mossy Climbable Back + Pauldrons
        const torso = new THREE.Mesh(new THREE.BoxGeometry(15.5, 16.5, 9.5), bodyMat);
        torso.position.y = 24.5;
        const backFur = new THREE.Mesh(new THREE.BoxGeometry(11.5, 14.5, 1.4), furMat);
        backFur.position.set(0, 24.5, -5.0);
        const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(6.8, 5.2, 10.8), bodyMat);
        pauldronL.position.set(-9.5, 31.5, 0);
        const pauldronR = pauldronL.clone();
        pauldronR.position.x = 9.5;
        root.add(torso, backFur, pauldronL, pauldronR);

        // Colossal Stone Arms & Greatclub Fist
        const armL = new THREE.Group();
        armL.position.set(-11.2, 30, 0);
        const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(4.4, 18.5, 4.6), bodyMat);
        armLMesh.position.y = -8.5;
        armL.add(armLMesh);

        const armR = armL.clone();
        armR.position.x = 11.2;
        const club = new THREE.Mesh(new THREE.BoxGeometry(3.8, 16, 3.8), bodyMat);
        club.position.set(0, -20, 2.8);
        club.rotation.x = 0.25;
        armR.add(club);
        root.add(armL, armR);

        // Horned Stone Head & Glowing Eyes
        const head = new THREE.Mesh(new THREE.BoxGeometry(7.2, 7.2, 7.2), bodyMat);
        head.position.y = 36.8;
        const crownFur = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.8, 6.4), furMat);
        crownFur.position.y = 40.6;
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.75, 0.8), eyeMat);
        eyeL.position.set(-1.7, 37.2, 3.5);
        const eyeR = eyeL.clone();
        eyeR.position.x = 1.7;
        root.add(head, crownFur, eyeL, eyeR);

        parts.legL = legL;
        parts.legR = legR;
        parts.armL = armL;
        parts.armR = armR;

        sigils.push(makeSigilNode(legR, 0, -9.5, 3.2, def.sigilColor, def.sigilHp[0], "TIER I: KNEE LOCK", 0));
        sigils.push(makeSigilNode(torso, 0, 1.5, -5.2, def.sigilColor, def.sigilHp[1], "TIER II: SPINE SEAL", 1));
        sigils.push(makeSigilNode(head, 0, 4.2, 0, def.sigilColor, def.sigilHp[2], "TIER III: CROWN SIGIL", 2));
        root.position.set(0, 0, -28);
      } else if (def.id === "aurelia") {
        // MASSIVE 50-UNIT WINGED SKY SERPENT
        const segs = [];
        for (let i = 0; i < 7; i++) {
          const size = 6.2 - i * 0.55;
          const seg = new THREE.Mesh(new THREE.OctahedronGeometry(size, 0), bodyMat);
          seg.position.set(0, 0, -i * 8.2);
          const dorsalFur = new THREE.Mesh(new THREE.BoxGeometry(size * 0.9, 1.4, size * 1.1), furMat);
          dorsalFur.position.y = size * 0.78;
          seg.add(dorsalFur);
          root.add(seg);
          segs.push(seg);
        }
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 9.5), bodyMat);
        wingL.position.set(-14.5, 0.8, -8);
        const wingR = wingL.clone();
        wingR.position.x = 14.5;
        root.add(wingL, wingR);

        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.2), eyeMat);
        eyeL.position.set(-2.2, 1.4, 4.8);
        const eyeR = eyeL.clone();
        eyeR.position.x = 2.2;
        root.add(eyeL, eyeR);

        parts.segs = segs;
        parts.wingL = wingL;
        parts.wingR = wingR;

        sigils.push(makeSigilNode(segs[5], 0, 3.4, 0, def.sigilColor, def.sigilHp[0], "TIER I: TAIL RING", 0));
        sigils.push(makeSigilNode(segs[2], 0, 5.0, 0, def.sigilColor, def.sigilHp[1], "TIER II: DORSAL LOCK", 1));
        sigils.push(makeSigilNode(segs[0], 0, 6.2, 0, def.sigilColor, def.sigilHp[2], "TIER III: SKY CREST", 2));
        root.position.set(0, 18, -32);
      } else {
        // IGNIS: COLOSSAL FOUR-LEGGED VOLCANIC SIEGE-TITAN
        const body = new THREE.Mesh(new THREE.BoxGeometry(18.5, 11.5, 25), bodyMat);
        body.position.y = 16.5;
        const furnace = new THREE.Mesh(
          new THREE.CylinderGeometry(6.8, 8.2, 5.2, 8),
          new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0xc2410c, emissiveIntensity: 0.95, flatShading: true })
        );
        furnace.position.set(0, 23.5, -2);
        const ridgeFur = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 20), furMat);
        ridgeFur.position.set(0, 22.5, 0);
        root.add(body, furnace, ridgeFur);

        const legCoords = [
          [-8.5, 7, 9.5],
          [8.5, 7, 9.5],
          [-8.5, 7, -9.5],
          [8.5, 7, -9.5]
        ];
        parts.legs = legCoords.map(([lx, ly, lz]) => {
          const lg = new THREE.Mesh(new THREE.BoxGeometry(5.2, 14, 5.6), bodyMat);
          lg.position.set(lx, ly, lz);
          root.add(lg);
          return lg;
        });

        const head = new THREE.Mesh(new THREE.BoxGeometry(9.6, 7.6, 9.2), bodyMat);
        head.position.set(0, 17.5, 15.8);
        const visor = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.3, 1.1), eyeMat);
        visor.position.set(0, 18.2, 20.5);
        root.add(head, visor);
        parts.head = head;

        sigils.push(makeSigilNode(parts.legs[0], -2.8, -1.5, 2.2, def.sigilColor, def.sigilHp[0], "TIER I: FORELEG ANCHOR", 0));
        sigils.push(makeSigilNode(furnace, 0, 3.2, 0, def.sigilColor, def.sigilHp[1], "TIER II: FURNACE CORE", 1));
        sigils.push(makeSigilNode(head, 0, 4.4, 0.8, def.sigilColor, def.sigilHp[2], "TIER III: CALDERA CROWN", 2));
        root.position.set(0, 0, -34);
      }

      arenaGroup.add(root);
      const totalMaxHp = def.sigilHp.reduce((a, b) => a + b, 0);

      state.monolith = {
        def,
        group: root,
        parts,
        sigils,
        pos: root.position,
        yaw: 0,
        orbitAngle: 0,
        attackTimer: 2.6,
        staggerTimer: 0,
        posture: 0, // 0..100 -> fills from ankle strikes or Perfect Parry!
        shakeWarning: 0, // Telegraph before violent shake!
        shakeTimer: 0,
        enraged: false,
        totalMaxHp
      };
    }

    function spawnDebris(worldPos, colorHex, count = 12) {
      const mat = new THREE.MeshStandardMaterial({ color: colorHex, flatShading: true });
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), mat);
        mesh.position.copy(worldPos);
        fxGroup.add(mesh);
        state.debris.push({
          mesh,
          vel: new THREE.Vector3((Math.random() - 0.5) * 20, 8 + Math.random() * 14, (Math.random() - 0.5) * 20),
          life: 0.95 + Math.random() * 0.5
        });
      }
    }

    function spawnShockwave(x, z, colorHex, maxR = 46) {
      const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.88, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 3.0, 28), mat);
      ring.rotation.x = -Math.PI * 0.5;
      ring.position.set(x, 0.4, z);
      fxGroup.add(ring);
      state.shockwaves.push({ mesh: ring, r: 2.2, maxR, hit: false });
      sfx.noise(0.22, 0.12);
      sfx.tone(72, 0.28, "sawtooth", 0.1, 38);
    }

    function spawnBoulder(origin, targetPos, colorHex) {
      const mat = new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 1.0, flatShading: true });
      const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 0), mat);
      mesh.position.copy(origin);
      fxGroup.add(mesh);
      const dir = new THREE.Vector3().subVectors(targetPos, origin).normalize();
      state.boulders.push({ mesh, vel: dir.multiplyScalar(28), reflected: false, life: 5.0 });
      sfx.tone(160, 0.14, "sawtooth", 0.08, 85);
    }

    /* ---------------------------------------------------------
       THE SUNKEN SANCTUM GATE HUB
       --------------------------------------------------------- */
    function openSanctumHub(customTitle = "", customSub = "") {
      state.mode = "hub";
      fightHud.style.display = "none";
      if (state.hero.grappleLine) state.hero.grappleLine.visible = false;
      buildSanctumBackdrop();
      buildHero();

      const count = defeatedList.length;
      bossStatusEl.textContent = `SUNKEN SANCTUM • ${count}/3 SEALS`;

      if (customTitle) {
        ovTitle.textContent = customTitle;
        ovSub.textContent = customSub;
      } else if (count >= 3) {
        ovTitle.textContent = "THE VEIL IS TORN";
        ovSub.textContent =
          "All three Monoliths have fallen. Void ash coils around your Wanderer's cloak (+54% Void Power). Choose any Gate below to re-challenge a Colossus.";
      } else {
        ovTitle.textContent = "THE SUNKEN SANCTUM";
        ovSub.textContent =
          `Seals Broken: ${count}/3. Stagger each giant or climb from its lower anchor up to the Crown. Brace [SHIFT/RMB] during violent shakes and Hold [J/LMB] to Plunge-Strike.`;
      }

      const cards = MONOLITHS.map((m) => {
        const done = defeatedList.includes(m.id);
        return `
          <button type="button" class="draft-card" data-enter-arena="${m.id}" style="border-color:${done ? "#34d399" : m.accent}">
            <span class="draft-badge" style="color:${m.accent}">GATE ${m.num} • ${m.archetype}</span>
            <h4 class="draft-name">${m.name}</h4>
            <p class="draft-desc">${m.tactic}</p>
            <span class="draft-badge" style="color:${done ? "#34d399" : "#fbbf24"};margin-top:auto">
              ${done ? "✓ SEAL SEVERED — REPLAY HUNT" : "▶ ENTER GATE"}
            </span>
          </button>
        `;
      }).join("");

      menuMount.innerHTML = `
        <div class="monolith-arena-grid">${cards}</div>
        ${
          count > 0
            ? `<div class="arcade-btn-row"><button type="button" class="arcade-btn arcade-btn--ghost" id="vmResetOathBtn">RESET SANCTUM OATH</button></div>`
            : ""
        }
      `;

      menuMount.querySelectorAll("[data-enter-arena]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const def = MONOLITHS.find((x) => x.id === btn.dataset.enterArena);
          if (def) startArenaFight(def);
        });
      });

      const resetBtn = menuMount.querySelector("#vmResetOathBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          defeatedList = [];
          writeSave(defeatedList);
          openSanctumHub();
        });
      }

      overlay.classList.remove("hidden");
    }

    function startArenaFight(def) {
      state.activeDef = def;
      state.mode = "fight";
      state.hitStop = 0;
      state.shake = 0;

      buildArena(def);
      buildMonolith(def);
      buildHero();

      const h = state.hero;
      h.pos.set(0, 0, 42);
      h.vel.set(0, 0, 0);
      h.yaw = Math.PI;
      h.hp = 100;
      h.maxHp = 100;
      h.stam = 100;
      h.grounded = true;
      h.guarding = false;
      h.climbTier = -1;
      h.climbProgress = 0;
      h.charging = false;
      h.chargeVal = 0;
      h.invuln = 0;
      state.lockOn = true;

      bossNameEl.textContent = def.name;
      bossStatusEl.textContent = def.arena;
      fightHud.style.display = "flex";
      climbHintEl.style.display = "none";
      chargeWrap.style.display = "none";
      overlay.classList.add("hidden");

      showBanner(`${def.name} RISES!`, 2.4);
      sfx.tone(110, 0.28, "sawtooth", 0.1, 70);
      updateHud();
    }

    function cycleOil() {
      state.oilIdx = (state.oilIdx + 1) % OILS.length;
      const oil = OILS[state.oilIdx];
      oilEl.textContent = oil.name;
      oilEl.style.color = oil.hex;
      state.hero.bladeMats.forEach((m) => m.emissive.setHex(oil.color));
      if (state.hero.slashArcMesh) state.hero.slashArcMesh.material.color.setHex(oil.color);
      showBanner(`WHETSTONE: ${oil.name}`, 1.2);
      sfx.tone(540, 0.08, "triangle", 0.06, 780);
    }

    /* ---------------------------------------------------------
       ANTI-CHEESE GRAPPLE & TIERED CLIMBING MECHANIC
       --------------------------------------------------------- */
    function triggerGrapple() {
      if (state.mode !== "fight" || !state.monolith) return;
      const h = state.hero;
      const m = state.monolith;

      if (h.climbTier >= 0) {
        // Slingshot leap off Colossus!
        h.climbTier = -1;
        h.charging = false;
        h.chargeVal = 0;
        chargeWrap.style.display = "none";
        h.vel.y = 18;
        h.grounded = false;
        climbHintEl.style.display = "none";
        showBanner("CHAIN SLINGSHOT!", 0.9);
        sfx.tone(420, 0.08, "triangle", 0.06, 760);
        return;
      }

      if (h.stam < 22) {
        showBanner("LOW GRIP STAMINA — RECOVER FIRST!", 1.0);
        return;
      }

      // Check proximity to climbable anchor points!
      // Anti-Cheese Rule: From the ground, you can ONLY latch Tier 0 (Ankle/Tail) — UNLESS
      // the Colossus is staggered OR you launched skyward off a Wind-Vent (h.pos.y > 9)!
      const tmp = new THREE.Vector3();
      let targetTier = -1;
      let bestDist = 20;

      m.sigils.forEach((sig) => {
        sig.mesh.getWorldPosition(tmp);
        const d = tmp.distanceTo(h.pos);
        const reachable =
          sig.tierIdx === 0 ||
          m.staggerTimer > 0 ||
          h.pos.y > 8.5 ||
          (sig.tierIdx === 1 && m.sigils[0].broken && d < 22);

        if (reachable && d < bestDist) {
          bestDist = d;
          targetTier = sig.tierIdx;
        }
      });

      if (targetTier >= 0) {
        h.climbTier = targetTier;
        h.climbProgress = targetTier;
        h.vel.set(0, 0, 0);
        h.grounded = false;
        climbHintEl.style.display = "inline-block";
        showBanner(`LATCHED! USE [W/S] TO CLIMB • HOLD [J] FOR PLUNGE!`, 1.8);
        sfx.tone(300, 0.12, "square", 0.07, 660);
      } else {
        showBanner(
          m.def.id === "aurelia"
            ? "STEP ON A CYAN WIND-VENT TO LAUNCH & GRAPPLE!"
            : "GET CLOSE TO ITS LEG OR PARRY-STAGGER TO GRAPPLE!",
          1.4
        );
      }
    }

    function executeBladeStrike(chargePower = 0) {
      if (state.mode !== "fight" || !state.monolith) return;
      const h = state.hero;
      const m = state.monolith;
      if (h.slashCd > 0) return;

      const oil = OILS[state.oilIdx];
      const curseBonus = 1 + defeatedList.length * 0.18;
      h.comboStep = (h.comboStep + 1) % 3;
      h.slashTimer = 0.22;
      h.slashCd = (chargePower > 0.65 ? 0.52 : 0.26) / oil.speedMult;

      if (h.slashArcMesh) {
        h.slashArcMesh.material.opacity = chargePower > 0.65 ? 0.95 : 0.68;
        h.slashArcMesh.rotation.z = h.comboStep * 1.1;
      }

      sfx.tone(chargePower > 0.65 ? 190 : 420, 0.09, "sawtooth", 0.07, 130);

      // CLIMBING STRIKE: Only damages the Sigil you are physically perched on!
      if (h.climbTier >= 0) {
        const nearestTier = Math.round(h.climbProgress);
        const sig = m.sigils[nearestTier];
        if (sig && !sig.broken && Math.abs(h.climbProgress - nearestTier) < 0.28) {
          const isPlunge = chargePower >= 0.72;
          const dmg = (isPlunge ? 92 : 24) * oil.dmgMult * curseBonus;
          damageSigil(sig, dmg, isPlunge);
          if (isPlunge) {
            showBanner("★ CHARGED PLUNGE CLEAVE! ★", 1.1);
            h.stam = Math.max(0, h.stam - 10);
          }
        } else {
          showBanner("CLIMB [W/S] ONTO AN ACTIVE GLOWING SIGIL!", 0.9);
        }
        return;
      }

      // GROUND STRIKE: Builds Posture/Stagger on legs & damages reachable Tier 0 ankle!
      const tmp = new THREE.Vector3();
      const tier0 = m.sigils[0];
      tier0.mesh.getWorldPosition(tmp);
      if (tmp.distanceTo(h.pos) < 9.5) {
        if (!tier0.broken) damageSigil(tier0, 22 * oil.dmgMult * curseBonus, false);
        addBossPosture(18);
      } else if (m.pos.distanceTo(h.pos) < 16) {
        addBossPosture(12);
        spawnDebris(h.pos.clone().add(new THREE.Vector3(0, 1.5, 0)), 0x94a3b8, 4);
      }
    }

    function addBossPosture(val) {
      const m = state.monolith;
      if (!m || m.staggerTimer > 0) return;
      m.posture = Math.min(100, m.posture + val);
      if (m.posture >= 100) {
        m.posture = 0;
        m.staggerTimer = 4.2;
        state.shake = 0.7;
        showBanner("MONOLITH STAGGERED! GRAPPLE [E] & CLIMB!", 2.2);
        sfx.noise(0.18, 0.12);
        sfx.tone(140, 0.25, "sawtooth", 0.09, 65);
      }
      updateHud();
    }

    function damageSigil(sig, amount, isPlunge = false) {
      sig.hp = Math.max(0, sig.hp - amount);
      state.hitStop = isPlunge ? 0.11 : 0.04;
      state.shake = Math.max(state.shake, isPlunge ? 0.55 : 0.22);

      const wp = new THREE.Vector3();
      sig.mesh.getWorldPosition(wp);
      spawnDebris(wp, state.activeDef.sigilColor, isPlunge ? 14 : 4);

      if (sig.hp <= 0 && !sig.broken) {
        sig.broken = true;
        sig.mesh.visible = false;
        state.hitStop = 0.2;
        state.shake = 1.0;
        spawnDebris(wp, state.activeDef.sigilColor, 26);
        spawnDebris(wp, 0x576158, 16);
        sfx.noise(0.28, 0.15);
        sfx.tone(540, 0.24, "triangle", 0.11, 200);

        const remaining = state.monolith.sigils.filter((s) => !s.broken).length;
        if (remaining === 0) {
          onMonolithSlain();
        } else {
          state.monolith.enraged = true;
          showBanner(`${sig.label} SHATTERED! CLIMB [W] TO NEXT SEAL!`, 2.2);
        }
      }
      updateHud();
    }

    function onMonolithSlain() {
      const def = state.activeDef;
      if (!defeatedList.includes(def.id)) {
        defeatedList.push(def.id);
        writeSave(defeatedList);
      }
      state.mode = "victory";
      sfx.tone(220, 0.2, "triangle", 0.1, 440);
      sfx.tone(330, 0.38, "triangle", 0.1, 660);

      setTimeout(() => {
        if (destroyed) return;
        openSanctumHub(
          `${def.name} VANQUISHED`,
          `The colossus collapses into ancient dust. Dark Void energy threads across your cloak (${defeatedList.length}/3 Seals Severed).`
        );
      }, 1300);
    }

    function damageHero(amount, knockFrom) {
      const h = state.hero;
      if (h.invuln > 0) return;

      // Perfect Timed Crest Shield Parry!
      if (h.parryWindow > 0 && h.climbTier < 0) {
        state.hitStop = 0.14;
        state.shake = 0.55;
        h.stam = Math.min(100, h.stam + 40);
        addBossPosture(55);
        showBanner("★ PERFECT CREST PARRY! (+55 STAGGER) ★", 1.7);
        sfx.tone(860, 0.16, "triangle", 0.12, 480);
        return;
      }

      if (h.guarding && h.stam > 12 && h.climbTier < 0) {
        h.stam = Math.max(0, h.stam - 24);
        h.hp = Math.max(1, h.hp - Math.round(amount * 0.25));
        showBanner("SHIELD GUARD!", 0.9);
        sfx.tone(280, 0.08, "square", 0.07, 190);
        updateHud();
        return;
      }

      h.hp = Math.max(0, h.hp - amount);
      h.invuln = 0.9;
      state.shake = 0.65;
      if (h.climbTier >= 0) {
        h.climbTier = -1;
        h.charging = false;
        h.chargeVal = 0;
        chargeWrap.style.display = "none";
        climbHintEl.style.display = "none";
      }
      if (knockFrom) {
        const push = new THREE.Vector3().subVectors(h.pos, knockFrom).setY(0).normalize();
        h.vel.x = push.x * 20;
        h.vel.z = push.z * 20;
        h.vel.y = 9;
        h.grounded = false;
      }
      sfx.noise(0.16, 0.11);
      updateHud();

      if (h.hp <= 0) {
        state.mode = "defeat";
        openSanctumHub(
          "FALLEN BEFORE THE COLOSSUS",
          `${state.activeDef.name} crushed your Wanderer. Parry shockwaves/boulders with [SHIFT/RMB] and brace while climbing during violent shakes.`
        );
      }
    }

    function updateHud() {
      const h = state.hero;
      hpEl.textContent = `${Math.ceil(h.hp)} / ${h.maxHp}`;
      stamEl.textContent = `${Math.round(h.stam)}%`;
      if (state.monolith) {
        const curHp = state.monolith.sigils.reduce((sum, s) => sum + Math.max(0, s.hp), 0);
        const rem = state.monolith.sigils.filter((s) => !s.broken).length;
        bossHpFill.style.width = `${Math.max(0, (curHp / state.monolith.totalMaxHp) * 100)}%`;
        staggerFill.style.width = `${state.monolith.staggerTimer > 0 ? 100 : state.monolith.posture}%`;
        sigilCountEl.textContent = `SEALS: ${rem} LEFT`;
      }
    }

    function update(dt) {
      state.time += dt;

      if (state.mode !== "fight") {
        camera.position.set(
          Math.cos(state.time * 0.24) * 32,
          13 + Math.sin(state.time * 0.5) * 1.6,
          Math.sin(state.time * 0.24) * 32
        );
        camera.lookAt(0, 6.5, 0);
        return;
      }

      if (state.bannerTimer > 0) {
        state.bannerTimer -= dt;
        if (state.bannerTimer <= 0) bannerEl.textContent = "";
      }
      if (state.hitStop > 0) {
        state.hitStop -= dt;
        return;
      }
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 2.4);

      const h = state.hero;
      const m = state.monolith;
      const oil = OILS[state.oilIdx];

      if (h.invuln > 0) h.invuln = Math.max(0, h.invuln - dt);
      if (h.parryWindow > 0) h.parryWindow = Math.max(0, h.parryWindow - dt);
      if (h.slashCd > 0) h.slashCd = Math.max(0, h.slashCd - dt);
      if (h.slashTimer > 0) h.slashTimer = Math.max(0, h.slashTimer - dt);
      if (h.slashArcMesh && h.slashArcMesh.material.opacity > 0) {
        h.slashArcMesh.material.opacity = Math.max(0, h.slashArcMesh.material.opacity - dt * 4.5);
      }

      // Drift atmospheric dust/embers
      state.ambientMotes.forEach((am) => {
        am.mesh.position.y += am.spd * dt;
        if (am.mesh.position.y > 38) am.mesh.position.y = 1;
      });

      // Movement & Climb input
      let inX = 0;
      let inZ = 0;
      if (keys.KeyW || keys.ArrowUp || touchMove.up) inZ -= 1;
      if (keys.KeyS || keys.ArrowDown || touchMove.down) inZ += 1;
      if (keys.KeyA || keys.ArrowLeft || touchMove.left) inX -= 1;
      if (keys.KeyD || keys.ArrowRight || touchMove.right) inX += 1;

      if (h.climbTier >= 0) {
        // --- VERTICAL CLIMBING ALONG THE COLOSSUS'S 3 TIERS! ---
        if (!h.charging && inZ !== 0) {
          h.climbProgress = Math.max(0, Math.min(2, h.climbProgress - inZ * 0.72 * dt));
          h.walkPhase += dt * 9;
        }
        h.climbTier = Math.round(h.climbProgress);

        // Interpolate Hero position smoothly between Sigil 0 -> Sigil 1 -> Sigil 2
        const lowerIdx = Math.floor(h.climbProgress);
        const upperIdx = Math.min(2, lowerIdx + 1);
        const frac = h.climbProgress - lowerIdx;
        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        m.sigils[lowerIdx].mesh.getWorldPosition(pA);
        m.sigils[upperIdx].mesh.getWorldPosition(pB);
        const anchorPos = pA.lerp(pB, frac);

        const climbOutOffset = new THREE.Vector3(0, 0.2, 2.3).applyAxisAngle(new THREE.Vector3(0, 1, 0), m.yaw);
        h.pos.lerp(anchorPos.clone().add(climbOutOffset), Math.min(1, dt * 14));

        // Plunge Charge while holding J/LMB
        if (h.charging) {
          h.chargeVal = Math.min(1, h.chargeVal + dt * 1.15);
          chargeWrap.style.display = "block";
          chargeFill.style.width = `${Math.round(h.chargeVal * 100)}%`;
        } else {
          chargeWrap.style.display = "none";
        }

        // VIOLENT SHAKE CHECK: Must Hold SHIFT/RMB to Brace!
        let drainRate = 8.5;
        if (m.shakeTimer > 0) {
          if (h.guarding) {
            drainRate = 11; // Braced safely!
          } else {
            drainRate = 48; // Unbraced gets flung off!
            if (Math.random() < dt * 2.4) {
              damageHero(14, m.pos);
              showBanner("THROWN OFF! HOLD [SHIFT/RMB] TO BRACE SHAKES!", 1.8);
            }
          }
        }
        h.stam = Math.max(0, h.stam - drainRate * dt);

        if (h.grappleLine) {
          h.grappleLine.visible = true;
          h.grappleLine.geometry.setFromPoints([h.pos.clone().add(new THREE.Vector3(0, 1.4, 0)), anchorPos]);
        }

        if (h.stam <= 0 && h.climbTier >= 0) {
          h.climbTier = -1;
          h.charging = false;
          h.chargeVal = 0;
          chargeWrap.style.display = "none";
          climbHintEl.style.display = "none";
          h.vel.y = 10;
          showBanner("GRIP EXHAUSTED! RECOVER STAMINA ON GROUND!", 1.4);
        }
      } else {
        if (h.grappleLine) h.grappleLine.visible = false;
        chargeWrap.style.display = "none";
        h.stam = Math.min(100, h.stam + (h.guarding ? 10 : 28) * dt);

        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const moveVec = new THREE.Vector3();
        moveVec.addScaledVector(forward, -inZ);
        moveVec.addScaledVector(right, inX);
        if (moveVec.lengthSq() > 0.01) {
          moveVec.normalize();
          const speed = (h.guarding ? 8 : 17.5) * oil.speedMult;
          h.vel.x = THREE.MathUtils.lerp(h.vel.x, moveVec.x * speed, Math.min(1, dt * 10));
          h.vel.z = THREE.MathUtils.lerp(h.vel.z, moveVec.z * speed, Math.min(1, dt * 10));
          h.yaw = Math.atan2(-moveVec.x, -moveVec.z);
          h.walkPhase += dt * 12;
        } else if (h.grounded) {
          h.vel.x *= Math.pow(0.002, dt);
          h.vel.z *= Math.pow(0.002, dt);
        }

        h.vel.y -= 34 * dt;
        h.pos.addScaledVector(h.vel, dt);

        if (h.pos.y <= 0) {
          h.pos.y = 0;
          h.vel.y = 0;
          h.grounded = true;
        }

        const rad = Math.hypot(h.pos.x, h.pos.z);
        if (rad > 78) {
          h.pos.x = (h.pos.x / rad) * 78;
          h.pos.z = (h.pos.z / rad) * 78;
        }

        // Cloud Spire Updraft Wind-Vents!
        state.windVents.forEach((v) => {
          v.mesh.rotation.y += dt * 3.5;
          if (Math.hypot(h.pos.x - v.x, h.pos.z - v.z) < v.r && h.pos.y < 24) {
            h.vel.y = 28;
            h.grounded = false;
            showBanner("UPDRAFT LAUNCH! PRESS [E] NEAR AURELIA TO GRAPPLE!", 1.2);
            sfx.tone(340, 0.14, "sine", 0.06, 880);
          }
        });
      }

      // Articulated Hero Limb Animation
      h.group.position.copy(h.pos);
      h.group.rotation.y = h.yaw;
      const hp = h.parts;
      if (hp) {
        const running = h.grounded && Math.hypot(h.vel.x, h.vel.z) > 2;
        const swing = running ? Math.sin(h.walkPhase) * 0.72 : 0;
        hp.legLPivot.rotation.x = swing;
        hp.legRPivot.rotation.x = -swing;
        hp.capePivot.rotation.x = running ? 0.45 + Math.sin(state.time * 12) * 0.14 : 0.12 + Math.sin(state.time * 3) * 0.06;

        if (h.slashTimer > 0) {
          const arc = Math.sin((h.slashTimer / 0.22) * Math.PI);
          hp.armRPivot.rotation.x = -1.6 * arc;
          hp.armRPivot.rotation.z = -0.6 * arc;
          hp.armLPivot.rotation.x = -1.1 * arc;
        } else if (h.charging) {
          hp.armRPivot.rotation.x = -2.6;
          hp.armLPivot.rotation.x = -2.4;
        } else if (h.guarding) {
          hp.armLPivot.rotation.x = -1.25;
          hp.armLPivot.rotation.z = 0.5;
          hp.armRPivot.rotation.x = -0.35;
        } else {
          hp.armRPivot.rotation.x = -swing * 0.55;
          hp.armRPivot.rotation.z = 0;
          hp.armLPivot.rotation.x = swing * 0.55;
          hp.armLPivot.rotation.z = 0;
        }
        hp.shieldBody.material.emissiveIntensity = h.parryWindow > 0 ? 2.2 : h.guarding ? 1.1 : 0.25;
      }

      // Towering Monolith AI, Heavy Footsteps & Violent Shake Warnings
      const bossSpeed = (m.enraged ? 1.24 : 1.0) * oil.slowBoss;
      if (m.staggerTimer > 0) {
        m.staggerTimer -= dt;
        m.group.rotation.x = 0.22; // Bows down low when staggered!
        m.group.rotation.z = Math.sin(state.time * 16) * 0.04;
      } else {
        m.group.rotation.x = THREE.MathUtils.lerp(m.group.rotation.x, 0, Math.min(1, dt * 4));
        m.group.rotation.z = 0;
        const dx = h.pos.x - m.pos.x;
        const dz = h.pos.z - m.pos.z;
        const dist = Math.hypot(dx, dz);

        if (m.def.id === "verdant") {
          m.yaw = Math.atan2(dx, dz);
          m.group.rotation.y = m.yaw;
          if (dist > 17 && h.climbTier < 0) {
            m.pos.x += (dx / dist) * 6.2 * bossSpeed * dt;
            m.pos.z += (dz / dist) * 6.2 * bossSpeed * dt;
          }
          const stride = Math.sin(state.time * 2.4 * bossSpeed);
          m.parts.legL.rotation.x = stride * 0.26;
          m.parts.legR.rotation.x = -stride * 0.26;
          m.parts.armL.rotation.x = -stride * 0.3;
          m.parts.armR.rotation.x = stride * 0.34;
        } else if (m.def.id === "aurelia") {
          m.orbitAngle += dt * 0.48 * bossSpeed;
          const ox = Math.cos(m.orbitAngle) * 32;
          const oz = Math.sin(m.orbitAngle) * 32;
          const oy = 14 + Math.sin(state.time * 1.4) * 5.5;
          m.yaw = Math.atan2(ox - m.pos.x, oz - m.pos.z);
          m.pos.set(ox, oy, oz);
          m.group.rotation.y = m.yaw;
          m.parts.wingL.rotation.z = Math.sin(state.time * 3.8) * 0.35;
          m.parts.wingR.rotation.z = -Math.sin(state.time * 3.8) * 0.35;
        } else {
          m.yaw = Math.atan2(dx, dz);
          m.group.rotation.y = m.yaw;
          if (dist > 22 && h.climbTier < 0) {
            m.pos.x += (dx / dist) * 5.0 * bossSpeed * dt;
            m.pos.z += (dz / dist) * 5.0 * bossSpeed * dt;
          }
          m.parts.legs.forEach((lg, idx) => {
            lg.rotation.x = Math.sin(state.time * 2.2 + idx * Math.PI * 0.5) * 0.22;
          });
        }

        // Telegraph Shake Warning before Violent Shake
        if (m.shakeWarning > 0) {
          m.shakeWarning -= dt;
          if (m.shakeWarning <= 0) {
            m.shakeTimer = 1.6;
            sfx.noise(0.24, 0.13);
            sfx.tone(90, 0.3, "sawtooth", 0.09, 55);
          }
        }

        m.attackTimer -= dt * bossSpeed;
        if (m.attackTimer <= 0) {
          m.attackTimer = m.enraged ? 2.8 : 3.7;
          if (h.climbTier >= 0) {
            m.shakeWarning = 0.85;
            showBanner("⚠ COLOSSUS ROARS! HOLD [SHIFT/RMB] TO BRACE SHAKE!", 1.8);
            sfx.tone(160, 0.18, "sawtooth", 0.08, 120);
          } else if (m.def.id === "verdant") {
            spawnShockwave(m.pos.x, m.pos.z, 0x38bdf8, 48);
          } else if (m.def.id === "aurelia") {
            spawnBoulder(m.pos.clone(), h.pos.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xfbbf24);
          } else {
            if (Math.random() < 0.65) {
              spawnBoulder(m.pos.clone().add(new THREE.Vector3(0, 16, 0)), h.pos.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xf97316);
              showBanner("MAGMA BOULDER! TIME PARRY [SHIFT/RMB] TO REFLECT!", 1.4);
            } else {
              spawnShockwave(m.pos.x, m.pos.z, 0xf43f5e, 52);
            }
          }
        }
      }

      if (m.shakeTimer > 0) {
        m.shakeTimer -= dt;
        m.group.rotation.z = Math.sin(state.time * 28) * 0.09;
      }

      m.sigils.forEach((s) => {
        if (!s.broken) {
          s.core.rotation.y += dt * 2.4;
          s.ring.rotation.x += dt * 1.4;
        }
      });

      // Shockwaves
      for (let i = state.shockwaves.length - 1; i >= 0; i--) {
        const sw = state.shockwaves[i];
        sw.r += 28 * dt;
        sw.mesh.scale.setScalar(sw.r * 0.48);
        sw.mesh.material.opacity = Math.max(0, 1 - sw.r / sw.maxR);

        if (!sw.hit && h.pos.y < 2.4 && h.climbTier < 0) {
          const d = Math.hypot(h.pos.x - sw.mesh.position.x, h.pos.z - sw.mesh.position.z);
          if (Math.abs(d - sw.r * 1.15) < 3.0) {
            sw.hit = true;
            damageHero(22, sw.mesh.position);
          }
        }
        if (sw.r >= sw.maxR) {
          fxGroup.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          sw.mesh.material.dispose();
          state.shockwaves.splice(i, 1);
        }
      }

      // Parryable Magma / Sky Boulders
      for (let i = state.boulders.length - 1; i >= 0; i--) {
        const b = state.boulders[i];
        b.life -= dt;
        b.mesh.position.addScaledVector(b.vel, dt);
        b.mesh.rotation.x += dt * 5;

        if (!b.reflected && b.mesh.position.distanceTo(h.pos.clone().add(new THREE.Vector3(0, 1.4, 0))) < 3.6) {
          if (h.parryWindow > 0 || h.guarding) {
            b.reflected = true;
            b.vel.copy(m.pos.clone().add(new THREE.Vector3(0, 14, 0)).sub(b.mesh.position).normalize().multiplyScalar(54));
            state.hitStop = 0.1;
            showBanner("★ BOULDER PARRIED BACK AT MONOLITH! ★", 1.5);
            sfx.tone(880, 0.15, "triangle", 0.12, 460);
          } else {
            damageHero(26, b.mesh.position);
            b.life = 0;
          }
        } else if (b.reflected && b.mesh.position.distanceTo(m.pos.clone().add(new THREE.Vector3(0, 14, 0))) < 14) {
          addBossPosture(100);
          const activeSig = m.sigils.find((s) => !s.broken);
          if (activeSig) damageSigil(activeSig, 75, true);
          b.life = 0;
        }

        if (b.life <= 0 || b.mesh.position.y < -1) {
          fxGroup.remove(b.mesh);
          b.mesh.geometry.dispose();
          b.mesh.material.dispose();
          state.boulders.splice(i, 1);
        }
      }

      // Debris
      for (let i = state.debris.length - 1; i >= 0; i--) {
        const db = state.debris[i];
        db.life -= dt;
        db.vel.y -= 30 * dt;
        db.mesh.position.addScaledVector(db.vel, dt);
        db.mesh.rotation.x += dt * 6;
        if (db.life <= 0) {
          fxGroup.remove(db.mesh);
          db.mesh.geometry.dispose();
          state.debris.splice(i, 1);
        }
      }

      // Epic Shadow-of-the-Colossus Low-Angle Camera Framing!
      if (state.lockOn && m) {
        const toBoss = new THREE.Vector3().subVectors(m.pos, h.pos);
        const targetYaw = Math.atan2(-toBoss.x, -toBoss.z);
        state.camYaw = THREE.MathUtils.lerp(state.camYaw, targetYaw, Math.min(1, dt * 4.5));
      }

      const camDist = h.climbTier >= 0 ? 18 : 16;
      const camX = h.pos.x + Math.sin(state.camYaw) * camDist;
      const camZ = h.pos.z + Math.cos(state.camYaw) * camDist;
      const camY = Math.max(3.0, h.pos.y + 4.4 + state.camPitch * 8);

      camera.position.lerp(new THREE.Vector3(camX, camY, camZ), Math.min(1, dt * 8));
      if (state.shake > 0.02) {
        camera.position.x += (Math.random() - 0.5) * state.shake;
        camera.position.y += (Math.random() - 0.5) * state.shake;
      }

      const lookTarget = state.lockOn && m
        ? h.pos.clone().lerp(m.pos.clone().add(new THREE.Vector3(0, 16, 0)), 0.42)
        : h.pos.clone().add(new THREE.Vector3(0, 2.4, 0));
      camera.lookAt(lookTarget);

      updateHud();
    }

    function loop(ts) {
      if (destroyed) return;
      const dt = Math.min(0.035, (ts - lastTime) / 1000 || 0.016);
      lastTime = ts;
      update(dt);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    }

    function startGuard() {
      if (state.mode !== "fight") return;
      if (!state.hero.guarding) {
        state.hero.guarding = true;
        state.hero.parryWindow = 0.3;
      }
    }

    function stopGuard() {
      state.hero.guarding = false;
    }

    function beginAttackInput() {
      if (state.mode !== "fight") return;
      if (state.hero.climbTier >= 0) {
        state.hero.charging = true;
        state.hero.chargeVal = 0;
      } else {
        executeBladeStrike(0);
      }
    }

    function endAttackInput() {
      if (state.mode !== "fight") return;
      if (state.hero.charging) {
        const power = state.hero.chargeVal;
        state.hero.charging = false;
        state.hero.chargeVal = 0;
        chargeWrap.style.display = "none";
        executeBladeStrike(power);
      }
    }

    function onKeyDown(e) {
      if (e.repeat) return;
      keys[e.code] = true;

      if (e.code === "Escape" && state.mode === "fight") {
        openSanctumHub();
        return;
      }
      if (state.mode !== "fight") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (state.hero.climbTier >= 0) triggerGrapple();
        else if (state.hero.grounded) {
          state.hero.vel.y = 15.5;
          state.hero.grounded = false;
          sfx.tone(240, 0.07, "sine", 0.04, 380);
        }
      } else if (e.code === "KeyJ") {
        beginAttackInput();
      } else if (e.code === "KeyE") {
        triggerGrapple();
      } else if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        startGuard();
      } else if (e.code === "KeyQ" || e.code === "Tab") {
        e.preventDefault();
        state.lockOn = !state.lockOn;
        showBanner(state.lockOn ? "CAMERA LOCK-ON: ENGAGED" : "CAMERA: FREE ORBIT", 1.0);
      } else if (e.code === "KeyR") {
        cycleOil();
      }
    }

    function onKeyUp(e) {
      keys[e.code] = false;
      if (e.code === "KeyJ") endAttackInput();
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") stopGuard();
    }

    function onPointerDown(e) {
      if (state.mode !== "fight") return;
      if (e.button === 2) {
        startGuard();
      } else if (e.button === 0) {
        mouse.dragging = true;
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
        beginAttackInput();
      }
    }

    function onPointerMove(e) {
      if (!mouse.dragging || state.mode !== "fight") return;
      const dx = e.clientX - mouse.lastX;
      const dy = e.clientY - mouse.lastY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
      if (!state.lockOn) {
        state.camYaw -= dx * 0.008;
        state.camPitch = Math.max(-0.1, Math.min(0.65, state.camPitch + dy * 0.004));
      }
    }

    function onPointerUp(e) {
      if (e.button === 2) stopGuard();
      if (e.button === 0) endAttackInput();
      mouse.dragging = false;
    }

    function onContextMenu(e) {
      e.preventDefault();
    }

    // Touch D-Pad + Action Buttons
    container.querySelectorAll("[data-mv]").forEach((btn) => {
      const dir = btn.dataset.mv;
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        touchMove[dir] = true;
      });
      const stop = () => {
        touchMove[dir] = false;
      };
      btn.addEventListener("pointerup", stop);
      btn.addEventListener("pointerleave", stop);
    });

    hubBtn.addEventListener("click", () => openSanctumHub());
    container.querySelector("#vmActJump").addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (state.mode !== "fight") return;
      if (state.hero.climbTier >= 0) triggerGrapple();
      else if (state.hero.grounded) {
        state.hero.vel.y = 15.5;
        state.hero.grounded = false;
      }
    });

    const slashBtn = container.querySelector("#vmActSlash");
    slashBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      beginAttackInput();
    });
    slashBtn.addEventListener("pointerup", endAttackInput);

    const parryBtn = container.querySelector("#vmActParry");
    parryBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      startGuard();
    });
    parryBtn.addEventListener("pointerup", stopGuard);
    parryBtn.addEventListener("pointerleave", stopGuard);

    container.querySelector("#vmActGrapple").addEventListener("pointerdown", (e) => {
      e.preventDefault();
      triggerGrapple();
    });
    container.querySelector("#vmActOil").addEventListener("pointerdown", (e) => {
      e.preventDefault();
      cycleOil();
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", resize);

    openSanctumHub();
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);

    return {
      destroy() {
        destroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("contextmenu", onContextMenu);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("resize", resize);

        disposeGroup(arenaGroup);
        disposeGroup(fxGroup);
        createdTextures.forEach((t) => t.dispose());
        if (state.hero.group) scene.remove(state.hero.group);
        if (state.hero.grappleLine) {
          scene.remove(state.hero.grappleLine);
          state.hero.grappleLine.geometry.dispose();
          state.hero.grappleLine.material.dispose();
        }
        renderer.dispose();
      }
    };
  }
};