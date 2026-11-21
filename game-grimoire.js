/* =========================================================
   CARTRIDGE 02: GRIMOIRE: ABYSS (V0.4 — 16-BIT PIXEL OVERHAUL)
   Wizard of Legend Pixel Aesthetic • Torch-Lit Stone Dungeon
   50 Spells • 7 Synergies • 10 Optional Fusions • 12 Cursed Pacts
   ========================================================= */

window.CRT_GAMES = window.CRT_GAMES || {};

window.CRT_GAMES.grimoire = {
  mount(container, api) {
    const DATA = window.GRIMOIRE_DATA;
    const BEST_KEY = "kai_v04_grimoire_best_lvl";
    let bestLevel = Number(localStorage.getItem(BEST_KEY) || 1);

    container.innerHTML = `
      <div class="arcade-root">
        <div class="arcade-hud">
          <div class="arcade-hud-group">
            <span class="arcade-stat">
              <span class="arcade-stat-label">HP</span>
              <span class="arcade-stat-val" id="grimHp" style="color:#fb7185">120 / 120</span>
            </span>
            <span class="arcade-stat">
              <span class="arcade-stat-label">LVL</span>
              <span class="arcade-stat-val" id="grimLvl" style="color:#c084fc">1</span>
            </span>
            <span class="arcade-stat">
              <span class="arcade-stat-label">KILLS</span>
              <span class="arcade-stat-val" id="grimKills">0</span>
            </span>
            <span class="arcade-stat">
              <span class="arcade-stat-label">TIME</span>
              <span class="arcade-stat-val" id="grimTime">00:00</span>
            </span>
          </div>
          <div class="arcade-hud-group">
            <span class="arcade-pill" id="grimBuildBadge">ARCANA: 1 • PACTS: 0</span>
            <button type="button" class="touch-btn" id="grimTomeBtn">TOME [TAB]</button>
          </div>
        </div>

        <div class="arcade-stage" id="grimStage">
          <canvas id="grimCanvas" class="pixel-canvas"></canvas>

          <div class="arcade-overlay" id="grimOverlay">
            <span class="arcade-pill" style="border-color:#c084fc;color:#e9d5ff;background:rgba(168,85,247,0.18)">
              TAPE 02 // 16-BIT ARCANA ROGUELIKE
            </span>
            <h3 class="arcade-ov-title" id="grimOvTitle">GRIMOIRE: ABYSS</h3>
            <p class="arcade-ov-sub" id="grimOvSub">
              Step through the cyan dungeon portal as a hooded battle-mage. Master 50 elemental arcana across 7 schools, unleash roaring fireballs &amp; lightning chains, forge optional Duo Fusions, and defeat Chaos Council Bosses every 10 levels. (Best Level: ${bestLevel})
            </p>
            <div id="grimDraftMount"></div>
            <div class="arcade-btn-row" id="grimBtnRow">
              <button type="button" class="arcade-btn" id="grimStartBtn" style="background:#c084fc;border-color:#c084fc;color:#12071f">
                ENTER DUNGEON [ENTER]
              </button>
            </div>
          </div>
        </div>

        <div class="arcade-controls-bar">
          <span><strong>WASD / ARROWS:</strong> Move &nbsp;|&nbsp; <strong>SPACE / SHIFT:</strong> Cape Dash &nbsp;|&nbsp; <strong>TAB:</strong> Spell Tome &nbsp;|&nbsp; <strong>1 / 2 / 3:</strong> Pick Card</span>
          <div class="arcade-touch-btns">
            <button type="button" class="touch-btn" id="grimTouchDash">CAPE DASH</button>
          </div>
        </div>
      </div>
    `;

    const stage = container.querySelector("#grimStage");
    const canvas = container.querySelector("#grimCanvas");
    const ctx = canvas.getContext("2d");

    const hpEl = container.querySelector("#grimHp");
    const lvlEl = container.querySelector("#grimLvl");
    const killsEl = container.querySelector("#grimKills");
    const timeEl = container.querySelector("#grimTime");
    const buildBadge = container.querySelector("#grimBuildBadge");
    const tomeBtn = container.querySelector("#grimTomeBtn");

    const overlay = container.querySelector("#grimOverlay");
    const ovTitle = container.querySelector("#grimOvTitle");
    const ovSub = container.querySelector("#grimOvSub");
    const draftMount = container.querySelector("#grimDraftMount");
    const btnRow = container.querySelector("#grimBtnRow");
    const startBtn = container.querySelector("#grimStartBtn");
    const touchDash = container.querySelector("#grimTouchDash");

    const sfx = {
      tone: (f, d, t, g, ef) => api && api.tone && api.tone(f, d, t, g, ef),
      noise: (d, g) => api && api.noise && api.noise(d, g)
    };

    /* ---------------------------------------------------------
       16-BIT PIXEL SPRITE BAKER (PRE-RENDERED OFFSCREEN CANVASES)
       --------------------------------------------------------- */
    function bakeSprite(rows, palette, px = 2) {
      const h = rows.length;
      const w = rows[0].length;
      const c = document.createElement("canvas");
      c.width = w * px;
      c.height = h * px;
      const g = c.getContext("2d");
      g.imageSmoothingEnabled = false;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const ch = rows[y][x];
          if (ch !== "." && palette[ch]) {
            g.fillStyle = palette[ch];
            g.fillRect(x * px, y * px, px, px);
          }
        }
      }
      return c;
    }

    // Hooded Battle-Mage (Wizard of Legend Crimson Cloak + Gold Trim + Shadow Eyes)
    const WIZ_PAL = {
      o: "#0d0914",
      r: "#dc2626",
      R: "#991b1b",
      h: "#f87171",
      k: "#14101c",
      y: "#fef08a",
      g: "#f59e0b",
      d: "#1e1b2e",
      b: "#5c3a21"
    };
    const WIZ_F1 = [
      "....oooo......",
      "...oRRRRo.....",
      "..oRRrrrRo....",
      "..oRkkkkRo....",
      "..oRkkykko....",
      "..oRkkkkRo....",
      ".oRRrrrrRRoo..",
      "oRRhrrrrrRRRo.",
      "oRrrrrgggrRRo.",
      ".oRrrddddrRo..",
      "..oRddddddo...",
      "..ooddo.ddo...",
      "...obbo.bbo...",
      "...ooo..ooo..."
    ];
    const WIZ_F2 = [
      "....oooo......",
      "...oRRRRo.....",
      "..oRRrrrRo....",
      "..oRkkkkRo....",
      "..oRkkykko....",
      "..oRkkkkRo....",
      "ooRRrrrrRRo...",
      "oRRhrrrrrRRo..",
      ".oRrrrgggrRo..",
      "..oRrddddrRo..",
      "..ooddddddo...",
      "..obbo..ddo...",
      "..ooo...bbo...",
      "........ooo..."
    ];

    // Armored Steel Spear-Knight
    const KNIGHT_PAL = {
      o: "#0b0d14",
      s: "#cbd5e1",
      S: "#64748b",
      w: "#f8fafc",
      g: "#eab308",
      d: "#1e293b",
      k: "#090b10",
      c: "#38bdf8"
    };
    const KNIGHT_F1 = [
      "....oooo......",
      "...oSSSSo..oo.",
      "..oSssssSo.ow.",
      "..oSkcckSo.os.",
      "..oSssssSo.os.",
      ".oogSSSSgooos.",
      "ogSSssssSSgos.",
      ".oSdssssdSoos.",
      "..oSddddSo.os.",
      "..oSddddSo.os.",
      "..oSSooSSo.oo.",
      "..oddo.ddo....",
      "..ooo..ooo...."
    ];

    // Crimson Heavy Lancer
    const LANCER_PAL = {
      o: "#0b0910",
      r: "#b91c1c",
      R: "#7f1d1d",
      h: "#ef4444",
      g: "#fbbf24",
      k: "#120c14",
      y: "#fef08a",
      s: "#e2e8f0"
    };
    const LANCER_F1 = [
      "....oooo......",
      "...oRRRRo.....",
      "..oRrhhrRo..o.",
      "..oRkyykRo.os.",
      "..oRrrrrRo.os.",
      ".oogRRRRgoos..",
      "ogRRhrrhRRos..",
      "oRRrggggrRo...",
      ".oRRrrrrRRo...",
      "..oRrrrrRo....",
      "..oRRooRRo....",
      "..oRRo.RRo....",
      "..ooo..ooo...."
    ];

    // Hooded Shadow Mage
    const MAGE_PAL = {
      o: "#090710",
      p: "#7c3aed",
      P: "#4c1d95",
      h: "#c084fc",
      k: "#090612",
      y: "#fde047",
      g: "#f59e0b",
      c: "#38bdf8"
    };
    const MAGE_F1 = [
      ".....ooo......",
      "....oPPPo.....",
      "...oPpppPo.oc.",
      "..oPkkkkPo.oc.",
      "..oPkyykPo.og.",
      "..oPkkkkPo.og.",
      ".oPPppppPPog..",
      "oPPhppppPPog..",
      ".oPpggggpPog..",
      "..oPppppPo.o..",
      "..oPPppPPo....",
      "..oPPooPPo....",
      "..ooo..ooo...."
    ];

    // Frost Sentinel
    const FROST_PAL = {
      o: "#07131e",
      c: "#38bdf8",
      C: "#0284c7",
      w: "#e0f2fe",
      d: "#1e3a5f",
      y: "#ffffff"
    };
    const FROST_F1 = [
      "....oooo......",
      "...oCCCCo.....",
      "..oCcwwcCo....",
      "..oCkyykCo....",
      "..oCccccCo....",
      ".oCCwccwCCo...",
      "oCCccccccCCo..",
      "oCcddddddCco..",
      ".oCddddddCo...",
      "..oCCccCCo....",
      "..oCCooCCo....",
      "..oddo.ddo....",
      "..ooo..ooo...."
    ];

    // Chaos Council Boss Sprite
    const BOSS_PAL = {
      o: "#09050e",
      r: "#e11d48",
      R: "#881337",
      p: "#7c3aed",
      P: "#3b0764",
      g: "#fbbf24",
      y: "#fef08a",
      k: "#110818",
      w: "#ffffff"
    };
    const BOSS_F1 = [
      "....oo..oo..oo....",
      "...oggooggoggo....",
      "...ogggggggggo....",
      "..oPPppppppPPo....",
      "..oPkkkkkkkkPo....",
      "..oPkkykkkykPo....",
      "..oPkkkkkkkkPo....",
      ".oRRPggggggPRRo...",
      "oRRrrPppppPrrRRo..",
      "oRRrrPpgppPrrRRo..",
      "oRrrrPppppPrrrRo..",
      ".oRrrPggggPrrRo...",
      "..oRrPPppPPrRo....",
      "..oRrPPooPPrRo....",
      "...ooPP..PPoo.....",
      ".....oo..oo......."
    ];

    const SPRITES = {
      wiz1: bakeSprite(WIZ_F1, WIZ_PAL, 2),
      wiz2: bakeSprite(WIZ_F2, WIZ_PAL, 2),
      knight: bakeSprite(KNIGHT_F1, KNIGHT_PAL, 2),
      lancer: bakeSprite(LANCER_F1, LANCER_PAL, 2),
      mage: bakeSprite(MAGE_F1, MAGE_PAL, 2),
      frost: bakeSprite(FROST_F1, FROST_PAL, 2),
      boss: bakeSprite(BOSS_F1, BOSS_PAL, 3)
    };

    // 10x10 Pixel Icons for Draft Cards (Rendered inside .draft-icon-box)
    const ICON_MATRICES = {
      fire: [
        "....yy....",
        "...yoo....",
        "..yoooy...",
        ".yooyyoy..",
        ".yoywwyoy.",
        "yooywwyooy",
        "yooyyyyoo.",
        ".yoooooo..",
        "..roorrr..",
        "...rrrr..."
      ],
      ice: [
        "....ww....",
        "...wccw...",
        "..wccccw..",
        ".wcwccwcw.",
        "wccwwwwccw",
        ".wcwccwcw.",
        "..wccccw..",
        "...wccw...",
        "....cc....",
        "....CC...."
      ],
      bolt: [
        ".....yyy..",
        "....yyyy..",
        "...yyy....",
        "..yyyyyy..",
        ".yywwwwyy.",
        "....yyy...",
        "...yyy....",
        "..yyy.....",
        ".yy.......",
        "y........."
      ],
      astral: [
        "....ww....",
        "....cc....",
        "..c.ww.c..",
        "...cwwc...",
        "wwcwwwwcww",
        "...cwwc...",
        "..c.ww.c..",
        "....cc....",
        "....ww....",
        ".........."
      ],
      blood: [
        "....rr....",
        "...rrrr...",
        "..rrhhrr..",
        "..rhhhrr..",
        ".rhhrrrrr.",
        ".rrrrrrrr.",
        ".rrrRRrrr.",
        "..rrRRrr..",
        "...rrrr...",
        ".........."
      ],
      gravity: [
        "..pppppp..",
        ".ppkkkkpp.",
        "ppkwwwwkpp",
        "pkwwkkwwkp",
        "pkwkppkwkp",
        "pkwkppkwkp",
        "pkwwkkwwkp",
        "ppkwwwwkpp",
        ".ppkkkkpp.",
        "..pppppp.."
      ],
      familiar: [
        "..gg..gg..",
        ".gggggggg.",
        ".ggkggkgg.",
        "gggggggggg",
        "ggwggggwgg",
        ".gggggggg.",
        "..ggwwgg..",
        "..gggggg..",
        "...g..g...",
        ".........."
      ],
      fusion: [
        "....yy....",
        "..y.yy.y..",
        "...ywwy...",
        ".yywwwwyy.",
        "ywwwwwwwwy",
        ".yywwwwyy.",
        "...ywwy...",
        "..y.yy.y..",
        "....yy....",
        ".........."
      ],
      pact: [
        "..rrrrrr..",
        ".rrrrrrrr.",
        "rrkrrrrkrr",
        "rrkkrrkkrr",
        "rrrrrrrrrr",
        ".rrrkkrrr.",
        "..rrrrrr..",
        "..r.rr.r..",
        "..r.rr.r..",
        ".........."
      ]
    };

    const ICON_PAL = {
      y: "#fef08a",
      o: "#f97316",
      r: "#f43f5e",
      R: "#9f1239",
      h: "#fda4af",
      w: "#ffffff",
      c: "#38bdf8",
      C: "#0284c7",
      p: "#c084fc",
      k: "#120a1c",
      g: "#34d399"
    };

    function createIconCanvas(key) {
      const mat = ICON_MATRICES[key] || ICON_MATRICES.astral;
      return bakeSprite(mat, ICON_PAL, 4);
    }

    function iconKeyForSchool(school) {
      if (school === "ashen") return "fire";
      if (school === "glacial") return "ice";
      if (school === "tempest") return "bolt";
      if (school === "crimson") return "blood";
      if (school === "gravity") return "gravity";
      if (school === "familiar") return "familiar";
      return "astral";
    }

    /* ---------------------------------------------------------
       VIRTUAL 16-BIT RESOLUTION & DUNGEON TILE HASH
       --------------------------------------------------------- */
    const PIXEL_SCALE = 2;
    let W = 640;
    let H = 360;
    let rafId = null;
    let destroyed = false;
    let lastTime = 0;

    function resize() {
      const rect = stage.getBoundingClientRect();
      W = Math.max(320, Math.floor(rect.width / PIXEL_SCALE));
      H = Math.max(200, Math.floor(rect.height / PIXEL_SCALE));
      canvas.width = W;
      canvas.height = H;
      ctx.imageSmoothingEnabled = false;
    }
    resize();

    function tileHash(tx, ty) {
      let n = Math.imul(tx, 374761393) + Math.imul(ty, 668265263);
      n = (n ^ (n >>> 13)) * 1274126177;
      return ((n ^ (n >>> 16)) >>> 0) % 100;
    }

    const keys = {};
    const pointer = { active: false, sx: 0, sy: 0 };

    const state = {
      mode: "menu",
      time: 0,
      kills: 0,
      level: 1,
      xp: 0,
      xpNext: 26,
      shake: 0,
      spawnTimer: 0.4,
      frenzyTimer: 0,
      regenTimer: 0,
      bossActive: null,
      nextBossLevel: 10,
      lastCastColor: "#f97316",
      activeDraftHandlers: [],
      stats: {},
      player: {
        x: 0,
        y: 0,
        facingX: 1,
        facingY: 0,
        r: 10,
        invuln: 0,
        dashCd: 0,
        dashTimer: 0,
        walkPhase: 0,
        cloakTrail: []
      },
      ownedSpells: [],
      fusedIds: new Set(),
      ownedPacts: [],
      schoolCounts: {},
      familiars: [],
      enemies: [],
      enemyBullets: [],
      projectiles: [],
      beams: [],
      novas: [],
      zones: [],
      chains: [],
      meteors: [],
      slashes: [],
      gems: [],
      particles: [],
      popups: []
    };

    function createBaseStats() {
      return {
        maxHp: 120,
        hp: 120,
        dmgMult: 1,
        speedMult: 1,
        aoeMult: 1,
        cdMult: 1,
        dmgTakenMult: 1,
        killHealChance: 0,
        noRegen: false,
        frenzyBurn: false,
        critChance: 0.14,
        critMult: 1.7,
        projSpeedMult: 1,
        bonusProj: 0,
        enemySpeedMult: 1,
        xpMult: 1,
        doubleCastChance: 0,
        pickupRadius: 68,
        spawnRateMult: 1,
        statusMult: 1,
        familiarMult: 1,
        dashCdMult: 1
      };
    }

    function recalcSchools() {
      const counts = {};
      Object.keys(DATA.schools).forEach((k) => {
        counts[k] = 0;
      });
      state.ownedSpells.forEach((s) => {
        if (counts[s.def.school] !== undefined) {
          counts[s.def.school] += s.isFusion ? 2 : 1;
        }
      });
      state.schoolCounts = counts;
    }

    function hasSynergy(school, tier) {
      return (state.schoolCounts[school] || 0) >= tier;
    }

    function syncFamiliars() {
      const famSpells = state.ownedSpells.filter((s) => s.def.kind === "familiar");
      famSpells.forEach((fs, idx) => {
        const existing = state.familiars.find((f) => f.spellId === fs.def.id);
        if (!existing) {
          const ang = (idx / Math.max(1, famSpells.length)) * Math.PI * 2;
          state.familiars.push({
            spellId: fs.def.id,
            spellRef: fs,
            x: state.player.x + Math.cos(ang) * 34,
            y: state.player.y + Math.sin(ang) * 34,
            cd: 0.25,
            angle: ang
          });
        } else {
          existing.spellRef = fs;
        }
      });
      state.familiars = state.familiars.filter((f) =>
        famSpells.some((fs) => fs.def.id === f.spellId)
      );
    }

    function addSpell(def, isFusion = false) {
      const found = state.ownedSpells.find((s) => s.def.id === def.id);
      if (found) found.level += 1;
      else state.ownedSpells.push({ def, level: 1, cdTimer: 0.2, isFusion });
      recalcSchools();
      syncFamiliars();
      updateHud();
    }

    function resetRun() {
      state.mode = "playing";
      state.time = 0;
      state.kills = 0;
      state.level = 1;
      state.xp = 0;
      state.xpNext = 24;
      state.shake = 0;
      state.spawnTimer = 0.25;
      state.frenzyTimer = 0;
      state.regenTimer = 0;
      state.bossActive = null;
      state.nextBossLevel = 10;
      state.lastCastColor = "#f97316";
      state.activeDraftHandlers = [];

      state.stats = createBaseStats();
      state.player = {
        x: 0,
        y: 0,
        facingX: 1,
        facingY: 0,
        r: 10,
        invuln: 0,
        dashCd: 0,
        dashTimer: 0,
        walkPhase: 0,
        cloakTrail: []
      };

      state.ownedSpells = [];
      state.fusedIds = new Set();
      state.ownedPacts = [];
      state.familiars = [];
      state.enemies = [];
      state.enemyBullets = [];
      state.projectiles = [];
      state.beams = [];
      state.novas = [];
      state.zones = [];
      state.chains = [];
      state.meteors = [];
      state.slashes = [];
      state.gems = [];
      state.particles = [];
      state.popups = [];

      // Start with Pyre Surge (Fireball) + Chain Tempest for instant Wizard-of-Legend action!
      const fireStarter = DATA.spells.find((s) => s.id === "pyre_surge") || DATA.spells[0];
      const arcStarter = DATA.spells.find((s) => s.id === "chain_tempest") || DATA.spells[1];
      addSpell(fireStarter, false);
      addSpell(arcStarter, false);

      draftMount.innerHTML = "";
      overlay.classList.add("hidden");
      sfx.tone(260, 0.1, "triangle", 0.08, 520);
    }

    function addParticles(x, y, color, count, speed = 95) {
      if (state.particles.length > 260) return;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = speed * (0.3 + Math.random() * 0.85);
        state.particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.22 + Math.random() * 0.28,
          maxLife: 0.5,
          size: Math.random() < 0.5 ? 2 : 3,
          color
        });
      }
    }

    function addPopup(x, y, text, color = "#ffffff", size = 8) {
      if (state.popups.length > 65) state.popups.shift();
      state.popups.push({ x, y, text, color, size, life: 0.72, vy: -26 });
    }

    function nearestEnemy(fromX, fromY, maxRange = 9999) {
      let best = null;
      let bestD2 = maxRange * maxRange;
      for (let i = 0; i < state.enemies.length; i++) {
        const e = state.enemies[i];
        const dx = e.x - fromX;
        const dy = e.y - fromY;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
          bestD2 = d2;
          best = e;
        }
      }
      return best;
    }

    function applyDamage(enemy, rawDmg, status, school, lifesteal = 0) {
      if (!enemy || enemy.hp <= 0) return;
      const st = state.stats;
      let dmg = rawDmg * st.dmgMult;

      if (school === "astral" && hasSynergy("astral", 4)) dmg *= 1.35;
      if (school === "familiar") dmg *= st.familiarMult * (hasSynergy("familiar", 4) ? 1.35 : 1);
      if (enemy.vulnTimer > 0) dmg *= 1.25;
      if (enemy.frostTimer > 0 && hasSynergy("glacial", 4)) dmg *= 1.35;
      if (enemy.pulledTimer > 0 && hasSynergy("gravity", 4)) dmg *= 1.3;

      const critRate = st.critChance + (school === "astral" && hasSynergy("astral", 4) ? 0.18 : 0);
      const isCrit = Math.random() < critRate;
      if (isCrit) dmg *= st.critMult;

      const finalDmg = Math.max(1, Math.round(dmg));
      enemy.hp -= finalDmg;
      enemy.hitFlash = 0.11;

      if (lifesteal > 0 && !st.noRegen) {
        st.hp = Math.min(st.maxHp, st.hp + Math.max(1, Math.round(finalDmg * lifesteal)));
      }

      addPopup(
        enemy.x + (Math.random() - 0.5) * 10,
        enemy.y - enemy.r - 4,
        isCrit ? `${finalDmg}!` : String(finalDmg),
        isCrit ? "#fbbf24" : "#f8fafc",
        isCrit ? 9 : 7
      );

      if (status === "burn") {
        enemy.burnTimer = 3.2;
      } else if (status === "frost") {
        enemy.frostTimer = 3.0;
        enemy.frostStacks = (enemy.frostStacks || 0) + 1;
        if (enemy.frostStacks >= 4) {
          enemy.frostStacks = 0;
          const burst = Math.round((enemy.isBoss ? 85 : enemy.maxHp * 0.24 + 24) * st.statusMult);
          enemy.hp -= burst;
          addPopup(enemy.x, enemy.y - enemy.r - 14, `SHATTER -${burst}`, "#38bdf8", 9);
          addParticles(enemy.x, enemy.y, "#38bdf8", 12, 110);
        }
      } else if (status === "bleed") {
        enemy.bleedStacks = (enemy.bleedStacks || 0) + 1;
        const threshold = hasSynergy("crimson", 2) ? 3 : 4;
        if (enemy.bleedStacks >= threshold) {
          enemy.bleedStacks = 0;
          const burst = Math.round((enemy.isBoss ? 110 : enemy.maxHp * 0.28 + 26) * st.statusMult);
          enemy.hp -= burst;
          addPopup(enemy.x, enemy.y - enemy.r - 14, `BLEED -${burst}`, "#f43f5e", 9);
          addParticles(enemy.x, enemy.y, "#f43f5e", 14, 120);
          if (hasSynergy("crimson", 4)) st.hp = Math.min(st.maxHp, st.hp + 4);
        }
      } else if (status === "shock") {
        enemy.shockTimer = 0.22;
        if (school === "tempest" && hasSynergy("tempest", 4) && Math.random() < 0.4) {
          let arcs = 0;
          for (let i = 0; i < state.enemies.length && arcs < 2; i++) {
            const o = state.enemies[i];
            if (o !== enemy && o.hp > 0 && Math.hypot(o.x - enemy.x, o.y - enemy.y) < 95) {
              o.hp -= Math.round(finalDmg * 0.45);
              state.chains.push({
                pts: [{ x: enemy.x, y: enemy.y }, { x: o.x, y: o.y }],
                color: "#fef08a",
                life: 0.16
              });
              arcs++;
            }
          }
        }
      } else if (status === "vuln") {
        enemy.vulnTimer = 3.8;
      } else if (status === "pull") {
        enemy.pulledTimer = 1.6;
      }

      if (enemy.hp <= 0) onEnemyKilled(enemy);
    }

    function onEnemyKilled(enemy) {
      if (enemy.dead) return;
      enemy.dead = true;
      state.kills += 1;
      const st = state.stats;

      addParticles(enemy.x, enemy.y, enemy.color, enemy.isBoss ? 36 : 9, enemy.isBoss ? 160 : 95);

      if (enemy.burnTimer > 0 && hasSynergy("ashen", 4)) {
        state.novas.push({
          x: enemy.x,
          y: enemy.y,
          r: 6,
          maxR: 56 * st.aoeMult,
          color: "#f97316",
          school: "ashen",
          life: 0.24,
          maxLife: 0.24
        });
        state.enemies.forEach((o) => {
          if (!o.dead && Math.hypot(o.x - enemy.x, o.y - enemy.y) < 56 * st.aoeMult) {
            applyDamage(o, 26 * st.statusMult, "burn", "ashen");
          }
        });
      }

      if (st.killHealChance > 0 && Math.random() < st.killHealChance) {
        st.hp = Math.min(st.maxHp, st.hp + 6);
        addPopup(state.player.x, state.player.y - 18, "+6 HP", "#34d399", 8);
      }

      const orbCount = enemy.isBoss ? 12 : 1;
      for (let i = 0; i < orbCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = enemy.isBoss ? 12 + Math.random() * 34 : 0;
        state.gems.push({
          x: enemy.x + Math.cos(ang) * dist,
          y: enemy.y + Math.sin(ang) * dist,
          val: enemy.isBoss ? 18 : enemy.xpVal,
          color: enemy.isBoss ? "#fbbf24" : enemy.xpVal > 12 ? "#c084fc" : "#38bdf8"
        });
      }

      if (enemy.isBoss) {
        state.bossActive = null;
        state.shake = 10;
        addPopup(enemy.x, enemy.y - 20, "COUNCIL LORD VANQUISHED!", "#fbbf24", 11);
        sfx.tone(440, 0.14, "triangle", 0.1, 880);
        st.hp = Math.min(st.maxHp, st.hp + Math.round(st.maxHp * 0.3));
      }
    }

    function castSpell(slot, isDouble = false) {
      const def = slot.def;
      const lvl = slot.level;
      const st = state.stats;
      const p = state.player;
      const dmg = def.dmg * (1 + (lvl - 1) * 0.28);
      const aoe = st.aoeMult * (hasSynergy("gravity", 2) ? 1.25 : 1);
      state.lastCastColor = def.color;

      const target = nearestEnemy(p.x, p.y, 400);
      const aimAngle = target
        ? Math.atan2(target.y - p.y, target.x - p.x)
        : Math.atan2(p.facingY, p.facingX);

      if (def.kind === "bolt") {
        const count = (def.count || 1) + st.bonusProj + Math.floor((lvl - 1) / 2);
        const speed = (def.speed || 440) * 0.68 * st.projSpeedMult * (hasSynergy("astral", 2) ? 1.18 : 1);
        const pierce = (def.pierce || 1) + (hasSynergy("astral", 2) ? 1 : 0);
        const spread = count > 1 ? 0.17 : 0;

        for (let i = 0; i < count; i++) {
          const offset = (i - (count - 1) / 2) * spread;
          const a = aimAngle + offset;
          state.projectiles.push({
            x: p.x,
            y: p.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            angle: a,
            r: def.explode ? 8 : 5,
            dmg,
            pierce,
            explode: (def.explode || 0) * 0.72 * aoe,
            color: def.color,
            status: def.status,
            school: def.school,
            life: 1.5,
            hitSet: new Set()
          });
        }
        sfx.tone(def.school === "ashen" ? 260 : 520, 0.06, "triangle", 0.04, 180);
      } else if (def.kind === "homing") {
        const count = (def.count || 3) + st.bonusProj + Math.floor((lvl - 1) / 2);
        const speed = (def.speed || 310) * 0.68 * st.projSpeedMult;
        for (let i = 0; i < count; i++) {
          const a = aimAngle + (Math.random() - 0.5) * 1.4;
          state.projectiles.push({
            homing: true,
            x: p.x,
            y: p.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            angle: a,
            speed,
            r: 5,
            dmg,
            pierce: 1,
            color: def.color,
            status: def.status,
            school: def.school,
            life: 2.5,
            hitSet: new Set()
          });
        }
        sfx.tone(640, 0.05, "sine", 0.03, 820);
      } else if (def.kind === "orb") {
        const speed = (def.speed || 130) * 0.72 * st.projSpeedMult;
        state.projectiles.push({
          isOrb: true,
          x: p.x,
          y: p.y,
          vx: Math.cos(aimAngle) * speed,
          vy: Math.sin(aimAngle) * speed,
          angle: aimAngle,
          r: (def.radius || 22) * 0.68 * aoe,
          dmg,
          tickCd: 0,
          pull: (def.pull || 0) * 0.72 * (hasSynergy("gravity", 2) ? 1.3 : 1),
          color: def.color,
          status: def.status,
          school: def.school,
          life: 3.0
        });
        sfx.tone(210, 0.11, "sine", 0.05, 150);
      } else if (def.kind === "beam") {
        const range = (def.range || 360) * 0.7 * aoe;
        const width = (def.width || 16) * 0.75 * aoe;
        const x2 = p.x + Math.cos(aimAngle) * range;
        const y2 = p.y + Math.sin(aimAngle) * range;
        state.beams.push({
          x1: p.x,
          y1: p.y,
          x2,
          y2,
          width,
          color: def.color,
          school: def.school,
          life: 0.28,
          maxLife: 0.28
        });

        const dx = x2 - p.x;
        const dy = y2 - p.y;
        const len2 = dx * dx + dy * dy || 1;
        state.enemies.forEach((e) => {
          if (e.dead) return;
          const t = Math.max(0, Math.min(1, ((e.x - p.x) * dx + (e.y - p.y) * dy) / len2));
          if (Math.hypot(e.x - (p.x + t * dx), e.y - (p.y + t * dy)) <= e.r + width * 0.55) {
            applyDamage(e, dmg, def.status, def.school, def.lifesteal || 0);
            addParticles(e.x, e.y, def.color, 5, 85);
          }
        });
        state.shake = Math.max(state.shake, def.width > 24 ? 5 : 2.5);
        sfx.tone(720, 0.12, "sawtooth", 0.05, 220);
      } else if (def.kind === "nova") {
        const radius = (def.radius || 135) * 0.68 * aoe;
        state.novas.push({
          x: p.x,
          y: p.y,
          r: 8,
          maxR: radius,
          color: def.color,
          school: def.school,
          life: 0.34,
          maxLife: 0.34
        });
        state.enemies.forEach((e) => {
          if (e.dead) return;
          const dist = Math.hypot(e.x - p.x, e.y - p.y);
          if (dist <= radius + e.r) {
            applyDamage(e, dmg, def.status, def.school);
            if (def.knockback) {
              const a = Math.atan2(e.y - p.y, e.x - p.x);
              e.x += Math.cos(a) * def.knockback * (e.isBoss ? 0.1 : 0.32);
              e.y += Math.sin(a) * def.knockback * (e.isBoss ? 0.1 : 0.32);
            }
          }
        });
        sfx.tone(180, 0.13, "triangle", 0.06, 95);
      } else if (def.kind === "zone") {
        const tx = target ? target.x : p.x + Math.cos(aimAngle) * 84;
        const ty = target ? target.y : p.y + Math.sin(aimAngle) * 84;
        state.zones.push({
          x: tx,
          y: ty,
          r: (def.radius || 82) * 0.68 * aoe,
          dmg,
          tick: 0,
          pull: (def.pull || 0) * 0.7 * (hasSynergy("gravity", 2) ? 1.35 : 1),
          color: def.color,
          status: def.status,
          school: def.school,
          life: def.duration || 3.0,
          maxLife: def.duration || 3.0
        });
        sfx.tone(155, 0.12, "sine", 0.05, 230);
      } else if (def.kind === "chain") {
        if (!target) return;
        const bounces = (def.bounces || 5) + Math.floor((lvl - 1) / 2);
        const range = (def.range || 240) * 0.68 * aoe;
        const visited = new Set();
        const pts = [{ x: p.x, y: p.y }];
        let cur = target;
        for (let b = 0; b < bounces && cur; b++) {
          visited.add(cur);
          pts.push({ x: cur.x, y: cur.y });
          applyDamage(cur, dmg, def.status, def.school);
          addParticles(cur.x, cur.y, def.color, 4, 80);

          let next = null;
          let bestD = range;
          for (let i = 0; i < state.enemies.length; i++) {
            const cand = state.enemies[i];
            if (cand.dead || visited.has(cand)) continue;
            const d = Math.hypot(cand.x - cur.x, cand.y - cur.y);
            if (d < bestD) {
              bestD = d;
              next = cand;
            }
          }
          cur = next;
        }
        state.chains.push({ pts, color: def.color, life: 0.24 });
        sfx.tone(860, 0.07, "square", 0.04, 420);
      } else if (def.kind === "meteor") {
        const count = (def.count || 1) + Math.floor((lvl - 1) / 2);
        for (let i = 0; i < count; i++) {
          const randE = state.enemies.length
            ? state.enemies[Math.floor(Math.random() * state.enemies.length)]
            : null;
          const mx = randE ? randE.x + (Math.random() - 0.5) * 28 : p.x + (Math.random() - 0.5) * 160;
          const my = randE ? randE.y + (Math.random() - 0.5) * 28 : p.y + (Math.random() - 0.5) * 120;
          state.meteors.push({
            x: mx,
            y: my,
            r: (def.radius || 68) * 0.68 * aoe,
            dmg,
            delay: 0.36 + i * 0.14,
            maxDelay: 0.36 + i * 0.14,
            color: def.color,
            status: def.status,
            school: def.school
          });
        }
      } else if (def.kind === "lash") {
        const range = (def.range || 132) * 0.68 * aoe;
        const arc = def.arc || 1.9;
        state.slashes.push({
          x: p.x,
          y: p.y,
          angle: aimAngle,
          arc,
          range,
          color: def.color,
          school: def.school,
          life: 0.22,
          maxLife: 0.22
        });
        state.enemies.forEach((e) => {
          if (e.dead) return;
          if (Math.hypot(e.x - p.x, e.y - p.y) <= range + e.r) {
            if (arc >= 6) {
              applyDamage(e, dmg, def.status, def.school, def.lifesteal || 0);
            } else {
              const ea = Math.atan2(e.y - p.y, e.x - p.x);
              let diff = Math.abs(ea - aimAngle);
              if (diff > Math.PI) diff = Math.PI * 2 - diff;
              if (diff <= arc * 0.55) {
                applyDamage(e, dmg, def.status, def.school, def.lifesteal || 0);
              }
            }
          }
        });
        sfx.tone(320, 0.08, "sawtooth", 0.04, 150);
      }

      if (!isDouble && st.doubleCastChance > 0 && Math.random() < st.doubleCastChance) {
        castSpell(slot, true);
      }
    }

    function spawnEnemy(isBoss = false) {
      const p = state.player;
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.max(W, H) * 0.58 + 40;
      const x = p.x + Math.cos(ang) * dist;
      const y = p.y + Math.sin(ang) * dist;

      const scale = 1 + (state.level - 1) * 0.18 + state.time / 95;

      if (isBoss) {
        const names = ["COUNCIL LORD IGNIS", "ARCH-MAGE FREIYA", "THE CHAOS SOVEREIGN", "ABYSSAL WARDEN"];
        const name = names[Math.floor((state.level / 10 - 1) % names.length)];
        const boss = {
          isBoss: true,
          name,
          sprite: "boss",
          x,
          y,
          r: 22,
          hp: Math.round(920 * scale),
          maxHp: Math.round(920 * scale),
          speed: 58 * state.stats.enemySpeedMult,
          dmg: Math.round(20 + state.level * 0.9),
          xpVal: 80,
          color: "#f43f5e",
          wobble: Math.random() * 10,
          shootCd: 1.75,
          hitFlash: 0,
          burnTimer: 0,
          frostTimer: 0,
          vulnTimer: 0,
          pulledTimer: 0,
          shockTimer: 0
        };
        state.enemies.push(boss);
        state.bossActive = boss;
        addPopup(p.x, p.y - 32, `BOSS: ${name}!`, "#f43f5e", 10);
        sfx.tone(110, 0.3, "sawtooth", 0.1, 70);
        return;
      }

      const archetypes = [
        { sprite: "knight", r: 11, hp: 36, speed: 56, dmg: 10, xp: 9, color: "#cbd5e1" },
        { sprite: "mage", r: 10, hp: 28, speed: 68, dmg: 10, xp: 10, color: "#c084fc", ranged: true },
        { sprite: "lancer", r: 12, hp: 62, speed: 64, dmg: 14, xp: 14, color: "#ef4444" },
        { sprite: "frost", r: 12, hp: 78, speed: 52, dmg: 15, xp: 16, color: "#38bdf8" }
      ];
      const maxIdx = Math.min(archetypes.length, 2 + Math.floor(state.level / 3));
      const base = archetypes[Math.floor(Math.random() * maxIdx)];

      state.enemies.push({
        isBoss: false,
        sprite: base.sprite,
        ranged: Boolean(base.ranged),
        shootCd: 2.2 + Math.random(),
        x,
        y,
        r: base.r,
        hp: Math.round(base.hp * scale),
        maxHp: Math.round(base.hp * scale),
        speed: base.speed * state.stats.enemySpeedMult,
        dmg: Math.round(base.dmg * (1 + state.level * 0.05)),
        xpVal: base.xp,
        color: base.color,
        wobble: Math.random() * 10,
        hitFlash: 0,
        burnTimer: 0,
        frostTimer: 0,
        vulnTimer: 0,
        pulledTimer: 0,
        shockTimer: 0
      });
    }

    function openLevelDraft() {
      state.mode = "draft";
      state.activeDraftHandlers = [];
      const ownedIds = new Set(state.ownedSpells.map((s) => s.def.id));
      const choices = [];

      const readyFusions = DATA.fusions.filter(
        (f) => !state.fusedIds.has(f.id) && f.requires.every((reqId) => ownedIds.has(reqId))
      );
      if (readyFusions.length) {
        choices.push({ type: "fusion", item: readyFusions[Math.floor(Math.random() * readyFusions.length)] });
      }

      const availPacts = DATA.pacts.filter((pk) => !state.ownedPacts.some((op) => op.id === pk.id));
      if (availPacts.length && (state.level % 3 === 0 || Math.random() < 0.28) && choices.length < 3) {
        choices.push({ type: "pact", item: availPacts[Math.floor(Math.random() * availPacts.length)] });
      }

      const usedIds = new Set(choices.map((c) => c.item.id));
      let guard = 0;
      while (choices.length < 3 && guard < 40) {
        guard++;
        const offerUpgrade =
          state.ownedSpells.length >= 2 && (state.ownedSpells.length >= 9 || Math.random() < 0.36);

        if (offerUpgrade) {
          const slot = state.ownedSpells[Math.floor(Math.random() * state.ownedSpells.length)];
          if (!usedIds.has(slot.def.id)) {
            usedIds.add(slot.def.id);
            choices.push({ type: "upgrade", item: slot.def, nextLvl: slot.level + 1 });
          }
        } else {
          const unowned = DATA.spells.filter((sp) => !ownedIds.has(sp.id) && !usedIds.has(sp.id));
          if (unowned.length) {
            const pick = unowned[Math.floor(Math.random() * unowned.length)];
            usedIds.add(pick.id);
            choices.push({ type: "spell", item: pick });
          }
        }
      }

      ovTitle.textContent = `LEVEL ${state.level} — ARCANA DRAFT`;
      ovSub.textContent =
        "Select an Elemental Arcana, Upgrade, Optional Duo Fusion, or Cursed Pact (Click or Press 1 / 2 / 3).";
      btnRow.innerHTML = "";

      const grid = document.createElement("div");
      grid.className = "draft-grid";

      choices.forEach((ch, idx) => {
        const card = document.createElement("button");
        card.type = "button";

        let badgeHtml = "";
        let nameText = "";
        let descHtml = "";
        let footerText = "";
        let iconKey = "astral";
        let onChoose = () => {};

        if (ch.type === "fusion") {
          card.className = "draft-card draft-card--fusion";
          iconKey = "fusion";
          badgeHtml = `[${idx + 1}] ✦ OPTIONAL DUO FUSION`;
          nameText = ch.item.name;
          descHtml = ch.item.desc;
          footerText = "OPTIONAL — IGNORING KEEPS BOTH SPELLS";
          onChoose = () => {
            state.fusedIds.add(ch.item.id);
            state.ownedSpells = state.ownedSpells.filter((s) => !ch.item.requires.includes(s.def.id));
            addSpell(ch.item, true);
            addPopup(state.player.x, state.player.y - 24, `FUSED: ${ch.item.name.toUpperCase()}!`, "#fbbf24", 10);
            sfx.tone(523, 0.14, "triangle", 0.1, 1046);
            closeOverlayToPlay();
          };
        } else if (ch.type === "pact") {
          card.className = "draft-card draft-card--pact";
          iconKey = "pact";
          badgeHtml = `[${idx + 1}] ☠ CURSED PACT`;
          nameText = ch.item.name;
          descHtml = `<strong style="color:#34d399">▲ ${ch.item.upside}</strong><br/><strong style="color:#fb7185">▼ ${ch.item.downside}</strong>`;
          footerText = "HIGH RISK • PERMANENT RUN MODIFIER";
          onChoose = () => {
            state.ownedPacts.push(ch.item);
            ch.item.apply(state.stats);
            addPopup(state.player.x, state.player.y - 24, `PACT: ${ch.item.name.toUpperCase()}`, "#fb7185", 9);
            sfx.tone(180, 0.18, "sawtooth", 0.08, 90);
            updateHud();
            closeOverlayToPlay();
          };
        } else if (ch.type === "upgrade") {
          const sc = DATA.schools[ch.item.school];
          card.className = "draft-card";
          iconKey = iconKeyForSchool(ch.item.school);
          badgeHtml = `<span style="color:${sc.color}">[${idx + 1}] ▲ UPGRADE • ${sc.name.toUpperCase()}</span>`;
          nameText = `${ch.item.name} (LVL ${ch.nextLvl})`;
          descHtml = "+28% Arcana Power, faster cooldown cadence & amplified multi-cast scaling.";
          footerText = sc.synergy2;
          onChoose = () => {
            addSpell(ch.item, false);
            sfx.tone(440, 0.09, "triangle", 0.07, 660);
            closeOverlayToPlay();
          };
        } else {
          const sc = DATA.schools[ch.item.school];
          const curCount = state.schoolCounts[ch.item.school] || 0;
          card.className = "draft-card";
          iconKey = iconKeyForSchool(ch.item.school);
          badgeHtml = `<span style="color:${sc.color}">[${idx + 1}] NEW ARCANA • ${sc.name.toUpperCase()} (${curCount + 1}/4)</span>`;
          nameText = ch.item.name;
          descHtml = ch.item.desc;
          footerText =
            curCount + 1 === 2
              ? "★ UNLOCKS 2-PC SCHOOL SYNERGY!"
              : curCount + 1 === 4
              ? "★ UNLOCKS 4-PC MASTER SYNERGY!"
              : sc.synergy2;
          onChoose = () => {
            addSpell(ch.item, false);
            sfx.tone(392, 0.09, "triangle", 0.07, 587);
            closeOverlayToPlay();
          };
        }

        card.innerHTML = `
          <div class="draft-card-head">
            <div class="draft-icon-box"></div>
            <div>
              <span class="draft-badge">${badgeHtml}</span>
              <h4 class="draft-name" style="margin-top:4px">${nameText}</h4>
            </div>
          </div>
          <p class="draft-desc">${descHtml}</p>
          <span class="draft-badge" style="color:#94a3b8;margin-top:auto">${footerText}</span>
        `;

        card.querySelector(".draft-icon-box").appendChild(createIconCanvas(iconKey));
        card.addEventListener("click", onChoose);
        state.activeDraftHandlers.push(onChoose);
        grid.appendChild(card);
      });

      draftMount.innerHTML = "";
      draftMount.appendChild(grid);
      overlay.classList.remove("hidden");
    }

    function openTomeModal() {
      if (state.mode === "tome") {
        closeOverlayToPlay();
        return;
      }
      if (state.mode !== "playing") return;
      state.mode = "tome";
      ovTitle.textContent = "ARCANE TOME & SYNERGIES";

      const activeSynergies = Object.values(DATA.schools)
        .filter((sc) => (state.schoolCounts[sc.id] || 0) >= 2)
        .map((sc) => {
          const c = state.schoolCounts[sc.id];
          return `<span style="color:${sc.color}"><strong>${sc.name} (${c})</strong>: ${c >= 4 ? sc.synergy4 : sc.synergy2}</span>`;
        });

      ovSub.innerHTML = activeSynergies.length
        ? activeSynergies.join(" &nbsp;•&nbsp; ")
        : "Collect 2 or 4 Arcana from the same school to activate School Synergies.";

      const listHtml = state.ownedSpells
        .map((s) => {
          const sc = DATA.schools[s.def.school];
          return `<div class="draft-card" style="padding:10px;border-color:${s.isFusion ? "#f59e0b" : "rgba(255,255,255,0.16)"}">
            <span class="draft-badge" style="color:${sc.color}">${s.isFusion ? "✦ FUSION" : sc.name.toUpperCase()} • LVL ${s.level}</span>
            <strong class="draft-name" style="font-size:0.64rem">${s.def.name}</strong>
          </div>`;
        })
        .join("");

      const pactsHtml = state.ownedPacts.length
        ? `<div style="margin-top:10px;font-size:0.74rem;color:#fb7185"><strong>ACTIVE PACTS:</strong> ${state.ownedPacts.map((p) => p.name).join(", ")}</div>`
        : "";

      draftMount.innerHTML = `<div class="draft-grid">${listHtml}</div>${pactsHtml}`;
      btnRow.innerHTML = `<button type="button" class="arcade-btn" id="grimResumeBtn">RESUME DUNGEON</button>`;
      container.querySelector("#grimResumeBtn").addEventListener("click", closeOverlayToPlay);
      overlay.classList.remove("hidden");
    }

    function closeOverlayToPlay() {
      state.mode = "playing";
      state.activeDraftHandlers = [];
      draftMount.innerHTML = "";
      overlay.classList.add("hidden");
    }

    function triggerDash() {
      if (state.mode !== "playing") return;
      const p = state.player;
      if (p.dashCd > 0) return;
      p.dashTimer = 0.16;
      p.invuln = Math.max(p.invuln, 0.28);
      p.dashCd = 1.3 * state.stats.dashCdMult;
      addParticles(p.x, p.y, "#38bdf8", 12, 120);
      sfx.tone(480, 0.08, "sine", 0.06, 920);
    }

    function triggerGameOver() {
      state.mode = "gameover";
      if (state.level > bestLevel) {
        bestLevel = state.level;
        localStorage.setItem(BEST_KEY, String(bestLevel));
      }
      sfx.noise(0.25, 0.12);
      sfx.tone(180, 0.35, "sawtooth", 0.09, 60);

      ovTitle.textContent = "TRIAL ENDED — MAGE FALLEN";
      ovSub.innerHTML = `REACHED <strong style="color:#c084fc">LEVEL ${state.level}</strong> &nbsp;•&nbsp; KILLS: <strong style="color:#38bdf8">${state.kills}</strong> &nbsp;•&nbsp; ARCANA: ${state.ownedSpells.length} &nbsp;•&nbsp; BEST LVL: ${bestLevel}`;
      draftMount.innerHTML = "";
      btnRow.innerHTML = `<button type="button" class="arcade-btn" id="grimRetryBtn" style="background:#c084fc;border-color:#c084fc;color:#12071f">RE-ENTER DUNGEON</button>`;
      container.querySelector("#grimRetryBtn").addEventListener("click", resetRun);
      overlay.classList.remove("hidden");
    }

    function updateHud() {
      const st = state.stats;
      hpEl.textContent = `${Math.max(0, Math.ceil(st.hp))} / ${st.maxHp}`;
      lvlEl.textContent = String(state.level);
      killsEl.textContent = String(state.kills);
      const mins = String(Math.floor(state.time / 60)).padStart(2, "0");
      const secs = String(Math.floor(state.time % 60)).padStart(2, "0");
      timeEl.textContent = `${mins}:${secs}`;
      buildBadge.textContent = `ARCANA: ${state.ownedSpells.length} • PACTS: ${state.ownedPacts.length}`;
    }

    function update(dt) {
      if (state.mode !== "playing") return;

      const p = state.player;
      const st = state.stats;
      state.time += dt;
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 20);
      if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);
      if (p.dashCd > 0) p.dashCd = Math.max(0, p.dashCd - dt);

      if (!st.noRegen && st.hp < st.maxHp) {
        state.regenTimer += dt;
        if (state.regenTimer >= 2.2) {
          state.regenTimer = 0;
          st.hp = Math.min(st.maxHp, st.hp + 1.5);
        }
      }
      if (st.frenzyBurn) {
        state.frenzyTimer += dt;
        if (state.frenzyTimer >= 2.5) {
          state.frenzyTimer = 0;
          st.hp = Math.max(1, st.hp - 2);
          state.novas.push({ x: p.x, y: p.y, r: 6, maxR: 80, color: "#f97316", school: "ashen", life: 0.24, maxLife: 0.24 });
          state.enemies.forEach((e) => {
            if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 80) applyDamage(e, 26, "burn", "ashen");
          });
        }
      }

      let mx = 0;
      let my = 0;
      if (keys.KeyW || keys.ArrowUp) my -= 1;
      if (keys.KeyS || keys.ArrowDown) my += 1;
      if (keys.KeyA || keys.ArrowLeft) mx -= 1;
      if (keys.KeyD || keys.ArrowRight) mx += 1;

      if (mx === 0 && my === 0 && pointer.active) {
        const dx = pointer.sx - W * 0.5;
        const dy = pointer.sy - H * 0.5;
        const d = Math.hypot(dx, dy);
        if (d > 10) {
          mx = dx / d;
          my = dy / d;
        }
      }

      if (mx !== 0 || my !== 0) {
        const mag = Math.hypot(mx, my);
        mx /= mag;
        my /= mag;
        p.facingX = mx;
        p.facingY = my;
        p.walkPhase += dt * 11;
      }

      let moveSpeed =
        142 *
        st.speedMult *
        (hasSynergy("tempest", 2) ? 1.12 : 1) *
        (hasSynergy("familiar", 4) ? 1.12 : 1);

      if (p.dashTimer > 0) {
        p.dashTimer -= dt;
        moveSpeed *= 2.9;
        if (mx === 0 && my === 0) {
          mx = p.facingX;
          my = p.facingY;
        }
      }

      p.x += mx * moveSpeed * dt;
      p.y += my * moveSpeed * dt;

      if (p.dashTimer > 0 || (mx !== 0 || my !== 0)) {
        if (Math.random() < (p.dashTimer > 0 ? 0.9 : 0.22)) {
          p.cloakTrail.push({ x: p.x, y: p.y, flip: p.facingX < 0, life: p.dashTimer > 0 ? 0.28 : 0.14 });
        }
      }
      for (let i = p.cloakTrail.length - 1; i >= 0; i--) {
        p.cloakTrail[i].life -= dt;
        if (p.cloakTrail[i].life <= 0) p.cloakTrail.splice(i, 1);
      }

      // Auto-cast owned spells
      const globalCd = st.cdMult * (hasSynergy("tempest", 2) ? 0.88 : 1);
      state.ownedSpells.forEach((slot) => {
        if (slot.def.kind === "familiar") return;
        if (slot.def.kind === "orbit") {
          slot.cdTimer -= dt;
          if (slot.cdTimer <= 0) {
            slot.cdTimer = Math.max(0.14, slot.def.cd * globalCd);
            const cnt = (slot.def.count || 2) + Math.floor((slot.level - 1) / 2);
            const rad = (slot.def.radius || 68) * 0.68 * st.aoeMult;
            const dmg = slot.def.dmg * (1 + (slot.level - 1) * 0.28);
            for (let k = 0; k < cnt; k++) {
              const ang = state.time * 3.4 + (k / cnt) * Math.PI * 2;
              const ox = p.x + Math.cos(ang) * rad;
              const oy = p.y + Math.sin(ang) * rad;
              state.enemies.forEach((e) => {
                if (!e.dead && Math.hypot(e.x - ox, e.y - oy) <= e.r + 16) {
                  applyDamage(e, dmg, slot.def.status, slot.def.school);
                }
              });
            }
          }
          return;
        }
        slot.cdTimer -= dt;
        if (slot.cdTimer <= 0 && state.enemies.length > 0) {
          const lvlCd = Math.max(0.55, 1 - (slot.level - 1) * 0.06);
          slot.cdTimer = Math.max(0.24, slot.def.cd * globalCd * lvlCd);
          castSpell(slot, false);
        }
      });

      // Familiars
      const famSpeedBonus = hasSynergy("familiar", 2) ? 1.25 : 1;
      state.familiars.forEach((f, idx) => {
        const def = f.spellRef.def;
        const dmg = def.dmg * (1 + (f.spellRef.level - 1) * 0.3);
        const tgt = nearestEnemy(f.x, f.y, 300);
        f.cd -= dt * famSpeedBonus;

        if (def.role === "chaser" && tgt) {
          const a = Math.atan2(tgt.y - f.y, tgt.x - f.x);
          f.x += Math.cos(a) * def.speed * 0.68 * dt;
          f.y += Math.sin(a) * def.speed * 0.68 * dt;
          if (Math.hypot(tgt.x - f.x, tgt.y - f.y) <= tgt.r + 12 && f.cd <= 0) {
            f.cd = def.cd;
            applyDamage(tgt, dmg, def.status, "familiar");
            addParticles(tgt.x, tgt.y, def.color, 5, 80);
          }
        } else {
          f.angle += dt * 2.1;
          const dx = p.x + Math.cos(f.angle + idx * 1.4) * 38;
          const dy = p.y + Math.sin(f.angle + idx * 1.4) * 38;
          f.x += (dx - f.x) * Math.min(1, dt * 6);
          f.y += (dy - f.y) * Math.min(1, dt * 6);
          if (tgt && f.cd <= 0) {
            f.cd = def.cd;
            const a = Math.atan2(tgt.y - f.y, tgt.x - f.x);
            state.projectiles.push({
              x: f.x,
              y: f.y,
              vx: Math.cos(a) * 280,
              vy: Math.sin(a) * 280,
              angle: a,
              r: def.role === "bomber" ? 6 : 4,
              dmg,
              pierce: 1,
              explode: def.role === "bomber" ? 38 * st.aoeMult : 0,
              color: def.color,
              status: def.status,
              school: "familiar",
              life: 1.4,
              hitSet: new Set()
            });
          }
        }
      });

      // Spawner
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0 && state.enemies.length < 85) {
        const batch = 1 + Math.floor(state.level / 5);
        for (let i = 0; i < batch; i++) spawnEnemy(false);
        state.spawnTimer = Math.max(0.28, (1.08 - state.level * 0.024) / st.spawnRateMult);
      }

      if (state.level >= state.nextBossLevel && !state.bossActive) {
        state.nextBossLevel += 10;
        spawnEnemy(true);
      }

      // Projectiles
      for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const pr = state.projectiles[i];
        pr.life -= dt;
        if (pr.homing) {
          const t = nearestEnemy(pr.x, pr.y, 310);
          if (t) {
            const desired = Math.atan2(t.y - pr.y, t.x - pr.x);
            const cur = Math.atan2(pr.vy, pr.vx);
            let diff = desired - cur;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const nextA = cur + Math.max(-5 * dt, Math.min(5 * dt, diff));
            pr.vx = Math.cos(nextA) * pr.speed;
            pr.vy = Math.sin(nextA) * pr.speed;
            pr.angle = nextA;
          }
        }
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;

        // Trailing ember / ice sparks on flying projectiles
        if (Math.random() < 0.45) {
          addParticles(pr.x, pr.y, pr.school === "ashen" ? "#fbbf24" : pr.color, 1, 24);
        }

        if (pr.isOrb) {
          pr.tickCd -= dt;
          if (pr.tickCd <= 0) {
            pr.tickCd = 0.24;
            state.enemies.forEach((e) => {
              if (e.dead) return;
              const d = Math.hypot(e.x - pr.x, e.y - pr.y);
              if (d <= pr.r + e.r + 8) applyDamage(e, pr.dmg * 0.42, pr.status, pr.school);
              if (pr.pull && d < pr.r * 3.2 && d > 5) {
                const a = Math.atan2(pr.y - e.y, pr.x - e.x);
                e.x += Math.cos(a) * pr.pull * dt * 2.2;
                e.y += Math.sin(a) * pr.pull * dt * 2.2;
              }
            });
          }
          if (pr.life <= 0) {
            state.novas.push({ x: pr.x, y: pr.y, r: pr.r, maxR: pr.r * 2.2, color: pr.color, school: pr.school, life: 0.24, maxLife: 0.24 });
            state.enemies.forEach((e) => {
              if (!e.dead && Math.hypot(e.x - pr.x, e.y - pr.y) <= pr.r * 2.2 + e.r) {
                applyDamage(e, pr.dmg, pr.status, pr.school);
              }
            });
            state.projectiles.splice(i, 1);
          }
          continue;
        }

        let remove = pr.life <= 0;
        for (let j = 0; j < state.enemies.length && !remove; j++) {
          const e = state.enemies[j];
          if (e.dead || pr.hitSet.has(e)) continue;
          if (Math.hypot(e.x - pr.x, e.y - pr.y) <= e.r + pr.r) {
            pr.hitSet.add(e);
            applyDamage(e, pr.dmg, pr.status, pr.school);
            if (pr.explode > 0) {
              state.novas.push({ x: pr.x, y: pr.y, r: 6, maxR: pr.explode, color: pr.color, school: pr.school, life: 0.22, maxLife: 0.22 });
              addParticles(pr.x, pr.y, "#fbbf24", 10, 95);
              state.enemies.forEach((o) => {
                if (!o.dead && o !== e && Math.hypot(o.x - pr.x, o.y - pr.y) <= pr.explode + o.r) {
                  applyDamage(o, pr.dmg * 0.65, pr.status, pr.school);
                }
              });
            }
            pr.pierce -= 1;
            if (pr.pierce <= 0) remove = true;
          }
        }
        if (remove) state.projectiles.splice(i, 1);
      }

      // Zones & Meteors
      for (let i = state.zones.length - 1; i >= 0; i--) {
        const z = state.zones[i];
        z.life -= dt;
        z.tick -= dt;
        if (z.pull) {
          state.enemies.forEach((e) => {
            if (e.dead) return;
            const d = Math.hypot(e.x - z.x, e.y - z.y);
            if (d < z.r * 1.4 && d > 5) {
              const a = Math.atan2(z.y - e.y, z.x - e.x);
              const mult = e.isBoss ? 0.2 : 1;
              e.x += Math.cos(a) * z.pull * mult * dt;
              e.y += Math.sin(a) * z.pull * mult * dt;
              e.pulledTimer = 0.6;
            }
          });
        }
        if (z.tick <= 0) {
          z.tick = 0.42;
          state.enemies.forEach((e) => {
            if (!e.dead && Math.hypot(e.x - z.x, e.y - z.y) <= z.r + e.r) {
              applyDamage(e, z.dmg, z.status, z.school);
            }
          });
        }
        if (z.life <= 0) state.zones.splice(i, 1);
      }

      for (let i = state.meteors.length - 1; i >= 0; i--) {
        const m = state.meteors[i];
        m.delay -= dt;
        if (m.delay <= 0) {
          state.novas.push({ x: m.x, y: m.y, r: 8, maxR: m.r, color: m.color, school: m.school, life: 0.28, maxLife: 0.28 });
          addParticles(m.x, m.y, m.color, 16, 130);
          state.shake = Math.max(state.shake, 4.5);
          sfx.noise(0.08, 0.06);
          state.enemies.forEach((e) => {
            if (!e.dead && Math.hypot(e.x - m.x, e.y - m.y) <= m.r + e.r) {
              applyDamage(e, m.dmg, m.status, m.school);
            }
          });
          state.meteors.splice(i, 1);
        }
      }

      for (let i = state.beams.length - 1; i >= 0; i--) {
        state.beams[i].life -= dt;
        if (state.beams[i].life <= 0) state.beams.splice(i, 1);
      }
      for (let i = state.novas.length - 1; i >= 0; i--) {
        const n = state.novas[i];
        n.life -= dt;
        n.r = n.maxR * (1 - n.life / n.maxLife);
        if (n.life <= 0) state.novas.splice(i, 1);
      }
      for (let i = state.chains.length - 1; i >= 0; i--) {
        state.chains[i].life -= dt;
        if (state.chains[i].life <= 0) state.chains.splice(i, 1);
      }
      for (let i = state.slashes.length - 1; i >= 0; i--) {
        state.slashes[i].life -= dt;
        if (state.slashes[i].life <= 0) state.slashes.splice(i, 1);
      }

      // Enemies
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        if (e.dead) {
          state.enemies.splice(i, 1);
          continue;
        }
        e.wobble += dt * 8;
        if (e.hitFlash > 0) e.hitFlash -= dt;
        if (e.vulnTimer > 0) e.vulnTimer -= dt;
        if (e.pulledTimer > 0) e.pulledTimer -= dt;
        if (e.shockTimer > 0) e.shockTimer -= dt;

        if (e.burnTimer > 0) {
          e.burnTimer -= dt;
          const burnMult = hasSynergy("ashen", 2) ? 1.4 : 1;
          e.hp -= (e.isBoss ? 22 : e.maxHp * 0.08 + 7) * burnMult * st.statusMult * dt;
          if (Math.random() < 0.2) addParticles(e.x, e.y - 4, "#f97316", 1, 28);
          if (e.hp <= 0) {
            onEnemyKilled(e);
            state.enemies.splice(i, 1);
            continue;
          }
        }

        let slow = 1;
        if (e.frostTimer > 0) {
          e.frostTimer -= dt;
          slow = hasSynergy("glacial", 2) ? 0.52 : 0.72;
        }
        if (e.shockTimer > 0) slow *= 0.25;

        const a = Math.atan2(p.y - e.y, p.x - e.x);
        e.facingLeft = Math.cos(a) < 0;
        e.x += Math.cos(a) * e.speed * slow * dt;
        e.y += Math.sin(a) * e.speed * slow * dt;

        if (e.isBoss) {
          e.shootCd -= dt;
          if (e.shootCd <= 0) {
            e.shootCd = 2.0;
            for (let s = 0; s < 10; s++) {
              const ba = a + (s / 10) * Math.PI * 2;
              state.enemyBullets.push({
                x: e.x,
                y: e.y,
                vx: Math.cos(ba) * 128,
                vy: Math.sin(ba) * 128,
                r: 4,
                dmg: Math.round(e.dmg * 0.7),
                life: 3.4
              });
            }
            sfx.tone(150, 0.14, "sawtooth", 0.06, 90);
          }
        } else if (e.ranged) {
          e.shootCd -= dt;
          if (e.shootCd <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 220) {
            e.shootCd = 2.6;
            state.enemyBullets.push({
              x: e.x,
              y: e.y,
              vx: Math.cos(a) * 105,
              vy: Math.sin(a) * 105,
              r: 3.5,
              dmg: e.dmg,
              life: 2.6
            });
          }
        }

        if (Math.hypot(e.x - p.x, e.y - p.y) <= e.r + p.r - 2 && p.invuln <= 0) {
          const taken = Math.max(1, Math.round(e.dmg * st.dmgTakenMult));
          st.hp -= taken;
          p.invuln = 0.52;
          state.shake = Math.max(state.shake, 6);
          addPopup(p.x, p.y - 16, `-${taken}`, "#fb7185", 9);
          sfx.noise(0.09, 0.08);
          if (st.hp <= 0) {
            triggerGameOver();
            return;
          }
        }
      }

      for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
        const b = state.enemyBullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        if (Math.hypot(b.x - p.x, b.y - p.y) <= b.r + p.r && p.invuln <= 0) {
          const taken = Math.max(1, Math.round(b.dmg * st.dmgTakenMult));
          st.hp -= taken;
          p.invuln = 0.5;
          state.shake = Math.max(state.shake, 5);
          state.enemyBullets.splice(i, 1);
          if (st.hp <= 0) {
            triggerGameOver();
            return;
          }
          continue;
        }
        if (b.life <= 0) state.enemyBullets.splice(i, 1);
      }

      // Gems
      for (let i = state.gems.length - 1; i >= 0; i--) {
        const g = state.gems[i];
        const d = Math.hypot(p.x - g.x, p.y - g.y);
        if (d < st.pickupRadius) {
          const a = Math.atan2(p.y - g.y, p.x - g.x);
          g.x += Math.cos(a) * 260 * dt;
          g.y += Math.sin(a) * 260 * dt;
        }
        if (d < p.r + 8) {
          state.xp += g.val * st.xpMult;
          state.gems.splice(i, 1);
          sfx.tone(720, 0.04, "sine", 0.025, 960);
          if (state.xp >= state.xpNext) {
            state.xp -= state.xpNext;
            state.level += 1;
            state.xpNext = Math.round(state.xpNext * 1.24 + 14);
            st.hp = Math.min(st.maxHp, st.hp + 12);
            updateHud();
            openLevelDraft();
            return;
          }
        }
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

      updateHud();
    }

    /* ---------------------------------------------------------
       16-BIT DUNGEON RENDERER (WIZARD OF LEGEND AESTHETIC)
       --------------------------------------------------------- */
    function drawDungeonTiles(camX, camY) {
      const TS = 32;
      const startX = Math.floor(camX / TS) - 1;
      const startY = Math.floor(camY / TS) - 1;
      const endX = startX + Math.ceil(W / TS) + 2;
      const endY = startY + Math.ceil(H / TS) + 2;

      for (let ty = startY; ty <= endY; ty++) {
        for (let tx = startX; tx <= endX; tx++) {
          const sx = tx * TS;
          const sy = ty * TS;
          const h = tileHash(tx, ty);

          // Stone flagstone tile
          ctx.fillStyle = h < 30 ? "#24252d" : h < 65 ? "#292b34" : "#21222a";
          ctx.fillRect(sx, sy, TS, TS);

          // Mortar seams & bevel highlight
          ctx.fillStyle = "#16171d";
          ctx.fillRect(sx, sy + TS - 1, TS, 1);
          ctx.fillRect(sx + TS - 1, sy, 1, TS);
          ctx.fillStyle = "rgba(255,255,255,0.035)";
          ctx.fillRect(sx + 1, sy + 1, TS - 3, 1);

          // Cracked stone detail
          if (h > 84 && h < 92) {
            ctx.fillStyle = "#15161c";
            ctx.fillRect(sx + 8, sy + 10, 6, 1);
            ctx.fillRect(sx + 13, sy + 11, 4, 1);
          }

          // Glowing Ember Iron Grate (Wizard of Legend Forge Dungeon vibe!)
          if (h >= 96 && (Math.abs(tx) > 1 || Math.abs(ty) > 1)) {
            const glow = 0.65 + Math.sin(state.time * 4 + tx + ty) * 0.25;
            ctx.fillStyle = "#0e0c12";
            ctx.fillRect(sx + 4, sy + 4, TS - 8, TS - 8);
            ctx.fillStyle = `rgba(234, 88, 12, ${glow})`;
            ctx.fillRect(sx + 6, sy + 6, TS - 12, TS - 12);
            ctx.fillStyle = `rgba(254, 240, 138, ${glow * 0.7})`;
            ctx.fillRect(sx + 10, sy + 10, TS - 20, TS - 20);
            // Iron bars
            ctx.fillStyle = "#27272a";
            for (let gx = sx + 8; gx < sx + TS - 6; gx += 5) {
              ctx.fillRect(gx, sy + 4, 2, TS - 8);
            }
            ctx.fillRect(sx + 4, sy + 14, TS - 8, 2);
          }

          // Flickering Dungeon Torch Brazier
          if (h === 12 && (Math.abs(tx) > 1 || Math.abs(ty) > 1)) {
            ctx.fillStyle = "#3f3f46";
            ctx.fillRect(sx + 11, sy + 16, 10, 8);
            const fl = Math.sin(state.time * 14 + tx) * 2;
            ctx.fillStyle = "#ea580c";
            ctx.fillRect(sx + 12, sy + 10 + fl * 0.4, 8, 7);
            ctx.fillStyle = "#fef08a";
            ctx.fillRect(sx + 14, sy + 12 + fl * 0.3, 4, 4);
          }
        }
      }

      // Glowing Cyan Entry Portal at World Origin (0,0)
      const pulse = Math.sin(state.time * 4.2) * 2;
      ctx.fillStyle = "#181a24";
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16 + pulse * 0.4, 22 + pulse * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
      ctx.fill();
    }

    function drawPixelProjectile(pr) {
      ctx.save();
      ctx.translate(Math.round(pr.x), Math.round(pr.y));
      ctx.rotate(pr.angle || 0);

      if (pr.school === "ashen") {
        // Roaring Pixel Fireball with Flame Tail
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(-12, -4, 10, 8);
        ctx.fillRect(-16, -2, 6, 4);
        ctx.fillStyle = "#f97316";
        ctx.fillRect(-7, -6, 14, 12);
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(-2, -4, 8, 8);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(1, -2, 4, 4);
      } else if (pr.school === "glacial") {
        // Jagged Pixel Icicle Spear
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(-10, -3, 18, 6);
        ctx.fillStyle = "#7dd3fc";
        ctx.fillRect(-6, -2, 16, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(2, -1, 10, 2);
      } else if (pr.school === "tempest") {
        // Crackling Pixel Thunder Spear
        ctx.fillStyle = "#eab308";
        ctx.fillRect(-11, -3, 20, 6);
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(-8, -1, 18, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(4, -2, 6, 4);
      } else if (pr.school === "crimson") {
        // Blood Razor Shard
        ctx.fillStyle = "#9f1239";
        ctx.fillRect(-9, -4, 14, 8);
        ctx.fillStyle = "#fb7185";
        ctx.fillRect(-4, -2, 12, 4);
      } else if (pr.isOrb) {
        // Swirling Arcane / Gravity Orb
        ctx.fillStyle = pr.color;
        ctx.beginPath();
        ctx.arc(0, 0, pr.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, pr.r * 0.65, state.time * 5, state.time * 5 + 4);
        ctx.stroke();
      } else {
        // Astral Star Shard
        ctx.fillStyle = pr.color;
        ctx.fillRect(-8, -3, 16, 6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-2, -5, 4, 10);
      }
      ctx.restore();
    }

    function drawJaggedLightning(pts, color) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const segs = 4;
        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          const jitter = s === 0 || s === segs ? 0 : (Math.random() - 0.5) * 14;
          const px = a.x + (b.x - a.x) * t + jitter;
          const py = a.y + (b.y - a.y) * t + jitter;
          if (i === 0 && s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
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

      ctx.fillStyle = "#16171d";
      ctx.fillRect(0, 0, W, H);

      const camX = Math.round(state.player.x - W * 0.5);
      const camY = Math.round(state.player.y - H * 0.5);

      ctx.save();
      ctx.translate(-camX, -camY);

      drawDungeonTiles(camX, camY);

      // Ground Arcane Zones (Swirling Elemental Sigils)
      state.zones.forEach((z) => {
        ctx.save();
        ctx.globalAlpha = 0.26 + Math.sin(state.time * 8) * 0.08;
        ctx.fillStyle = z.color;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = z.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, state.time * 2, state.time * 2 + Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Meteor Telegraphs
      state.meteors.forEach((m) => {
        const prog = 1 - m.delay / m.maxDelay;
        ctx.save();
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * prog, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // XP Crystals
      state.gems.forEach((g) => {
        ctx.fillStyle = g.color;
        ctx.fillRect(Math.round(g.x) - 2, Math.round(g.y) - 3, 4, 6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(g.x) - 1, Math.round(g.y) - 2, 2, 2);
      });

      // Orbiting Elemental Shields & Scythes
      state.ownedSpells
        .filter((s) => s.def.kind === "orbit")
        .forEach((slot) => {
          const cnt = (slot.def.count || 2) + Math.floor((slot.level - 1) / 2);
          const rad = (slot.def.radius || 68) * 0.68 * state.stats.aoeMult;
          for (let k = 0; k < cnt; k++) {
            const ang = state.time * 3.4 + (k / cnt) * Math.PI * 2;
            const ox = Math.round(state.player.x + Math.cos(ang) * rad);
            const oy = Math.round(state.player.y + Math.sin(ang) * rad);
            ctx.fillStyle = slot.def.color;
            ctx.fillRect(ox - 4, oy - 4, 8, 8);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(ox - 2, oy - 2, 4, 4);
          }
        });

      // Pixel Enemies (Sorted by Y for 2.5D depth!)
      const sortedEnemies = [...state.enemies].sort((a, b) => a.y - b.y);
      sortedEnemies.forEach((e) => {
        const spr = SPRITES[e.sprite] || SPRITES.knight;
        const bob = Math.round(Math.sin(e.wobble) * 1.5);
        const ex = Math.round(e.x);
        const ey = Math.round(e.y);

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(ex - e.r, ey + 6, e.r * 2, 4);

        ctx.save();
        ctx.translate(ex, ey + bob);
        if (e.facingLeft) ctx.scale(-1, 1);
        ctx.drawImage(spr, -spr.width * 0.5, -spr.height * 0.6);

        if (e.hitFlash > 0) {
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillRect(-spr.width * 0.5, -spr.height * 0.6, spr.width, spr.height);
        }
        ctx.restore();

        // Status indicator pixel pips
        if (e.burnTimer > 0) {
          ctx.fillStyle = "#f97316";
          ctx.fillRect(ex - 4, ey - e.r - 6, 3, 3);
        }
        if (e.frostTimer > 0) {
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(ex + 1, ey - e.r - 6, 3, 3);
        }
      });

      // Familiars
      state.familiars.forEach((f) => {
        const fx = Math.round(f.x);
        const fy = Math.round(f.y + Math.sin(state.time * 7) * 2);
        ctx.fillStyle = f.spellRef.def.color;
        ctx.fillRect(fx - 5, fy - 5, 10, 10);
        ctx.fillStyle = "#0b0d14";
        ctx.fillRect(fx - 3, fy - 2, 2, 2);
        ctx.fillRect(fx + 1, fy - 2, 2, 2);
      });

      // Wizard Hero + Cape Dash Afterimages
      const p = state.player;
      p.cloakTrail.forEach((tr) => {
        ctx.save();
        ctx.globalAlpha = tr.life * 1.4;
        ctx.translate(Math.round(tr.x), Math.round(tr.y));
        if (tr.flip) ctx.scale(-1, 1);
        ctx.drawImage(SPRITES.wiz1, -SPRITES.wiz1.width * 0.5, -SPRITES.wiz1.height * 0.6);
        ctx.restore();
      });

      const blink = p.invuln > 0 && Math.floor(p.invuln * 18) % 2 === 0;
      if (!blink) {
        const px = Math.round(p.x);
        const py = Math.round(p.y);
        ctx.fillStyle = "rgba(0,0,0,0.48)";
        ctx.fillRect(px - 9, py + 7, 18, 4);

        const wizSpr = Math.floor(p.walkPhase) % 2 === 0 ? SPRITES.wiz1 : SPRITES.wiz2;
        ctx.save();
        ctx.translate(px, py);
        if (p.facingX < 0) ctx.scale(-1, 1);
        ctx.drawImage(wizSpr, -wizSpr.width * 0.5, -wizSpr.height * 0.6);
        ctx.restore();
      }

      // Pixel Projectiles
      state.projectiles.forEach(drawPixelProjectile);

      // Enemy Bullets
      state.enemyBullets.forEach((b) => {
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(Math.round(b.x) - 3, Math.round(b.y) - 3, 6, 6);
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(Math.round(b.x) - 1, Math.round(b.y) - 1, 2, 2);
      });

      // Beams
      state.beams.forEach((bm) => {
        ctx.save();
        ctx.globalAlpha = bm.life / bm.maxLife;
        ctx.strokeStyle = bm.color;
        ctx.lineWidth = bm.width;
        ctx.beginPath();
        ctx.moveTo(bm.x1, bm.y1);
        ctx.lineTo(bm.x2, bm.y2);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(2, bm.width * 0.35);
        ctx.stroke();
        ctx.restore();
      });

      // Elemental Novas
      state.novas.forEach((n) => {
        ctx.save();
        ctx.globalAlpha = n.life / n.maxLife;
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(2, n.r - 4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Jagged Pixel Lightning Chains
      state.chains.forEach((c) => {
        ctx.save();
        ctx.globalAlpha = c.life / 0.24;
        drawJaggedLightning(c.pts, c.color);
        ctx.restore();
      });

      // Elemental Slash Arcs
      state.slashes.forEach((sl) => {
        ctx.save();
        ctx.globalAlpha = sl.life / sl.maxLife;
        ctx.strokeStyle = sl.color;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(sl.x, sl.y, sl.range, sl.angle - sl.arc * 0.5, sl.angle + sl.arc * 0.5);
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      // Pixel Particles
      state.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
      });
      ctx.globalAlpha = 1;

      // Floating Damage Numbers
      ctx.textAlign = "center";
      state.popups.forEach((pp) => {
        ctx.globalAlpha = Math.max(0, pp.life / 0.72);
        ctx.font = `bold ${pp.size}px "Press Start 2P", monospace`;
        ctx.fillStyle = "#090710";
        ctx.fillText(pp.text, Math.round(pp.x) + 1, Math.round(pp.y) + 1);
        ctx.fillStyle = pp.color;
        ctx.fillText(pp.text, Math.round(pp.x), Math.round(pp.y));
      });
      ctx.globalAlpha = 1;

      ctx.restore(); // End world camera

      // Top XP Bar
      const xpRatio = Math.min(1, state.xp / Math.max(1, state.xpNext));
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, W, 4);
      ctx.fillStyle = "#c084fc";
      ctx.fillRect(0, 0, Math.round(W * xpRatio), 4);

      // Boss HP Bar
      if (state.bossActive && !state.bossActive.dead) {
        const b = state.bossActive;
        const bw = Math.min(320, W - 40);
        const bx = Math.round((W - bw) * 0.5);
        const by = 12;
        ctx.fillStyle = "rgba(8,6,14,0.88)";
        ctx.fillRect(bx - 3, by - 3, bw + 6, 20);
        ctx.fillStyle = "#4c0519";
        ctx.fillRect(bx, by + 9, bw, 6);
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(bx, by + 9, Math.round(bw * Math.max(0, b.hp / b.maxHp)), 6);
        ctx.fillStyle = "#fef2f2";
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = "center";
        ctx.fillText(`BOSS // ${b.name}`, W * 0.5, by + 6);
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

    function onKeyDown(e) {
      keys[e.code] = true;
      if (state.mode === "draft") {
        if (e.code === "Digit1" && state.activeDraftHandlers[0]) state.activeDraftHandlers[0]();
        else if (e.code === "Digit2" && state.activeDraftHandlers[1]) state.activeDraftHandlers[1]();
        else if (e.code === "Digit3" && state.activeDraftHandlers[2]) state.activeDraftHandlers[2]();
        return;
      }
      if (e.code === "Space" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
        if (state.mode === "playing") {
          e.preventDefault();
          triggerDash();
        }
      } else if (e.code === "Enter" && (state.mode === "menu" || state.mode === "gameover")) {
        resetRun();
      } else if (e.code === "Tab") {
        e.preventDefault();
        openTomeModal();
      }
    }

    function onKeyUp(e) {
      keys[e.code] = false;
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.sx = (e.clientX - rect.left) / PIXEL_SCALE;
      pointer.sy = (e.clientY - rect.top) / PIXEL_SCALE;
    }

    function onPointerDown(e) {
      pointer.active = true;
      onPointerMove(e);
    }

    function onPointerUp() {
      pointer.active = false;
    }

    startBtn.addEventListener("click", resetRun);
    tomeBtn.addEventListener("click", openTomeModal);
    touchDash.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      triggerDash();
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", resize);

    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);

    return {
      destroy() {
        destroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("resize", resize);
      }
    };
  }
};