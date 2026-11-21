/* =========================================================
   CARTRIDGE 01: GRAVITY FLIP RUNNER (HIGH-FREQUENCY V0.3)
   Synth-Parkour & Plasma Blaster • Drone Squadrons • Combos
   ========================================================= */

window.CRT_GAMES = window.CRT_GAMES || {};

window.CRT_GAMES.runner = {
  mount(container, api) {
    const HIGH_SCORE_KEY = "kai_v03_runner_best";
    let bestScore = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);

    container.innerHTML = `
      <div class="arcade-root">
        <div class="arcade-hud">
          <div class="arcade-hud-group">
            <span class="arcade-stat">
              <span class="arcade-stat-label">SCORE</span>
              <span class="arcade-stat-val" id="runScore">00000</span>
            </span>
            <span class="arcade-stat">
              <span class="arcade-stat-label">BEST</span>
              <span class="arcade-stat-val" id="runBest">${String(bestScore).padStart(5, "0")}</span>
            </span>
            <span class="arcade-stat">
              <span class="arcade-stat-label">COMBO</span>
              <span class="arcade-stat-val" id="runCombo" style="color:#fbbf24">x1</span>
            </span>
          </div>
          <div class="arcade-hud-group">
            <span class="arcade-pill" id="runPowerBadge">SYSTEM NOMINAL</span>
            <span class="arcade-stat">
              <span class="arcade-stat-label">SPEED</span>
              <span class="arcade-stat-val" id="runSpeed">1.0x</span>
            </span>
          </div>
        </div>

        <div class="arcade-stage" id="runStage">
          <canvas id="runCanvas"></canvas>

          <div class="arcade-overlay" id="runOverlay">
            <span class="arcade-pill">CARTRIDGE 01 // SYNTH PARKOUR</span>
            <h3 class="arcade-ov-title" id="runOvTitle">GRAVITY FLIP RUNNER</h3>
            <p class="arcade-ov-sub" id="runOvSub">
              Flip rapidly between neon floor &amp; ceiling rails, blast incoming drone squadrons, and grab Shield, Rapid Fire, and 2X Overdrive orbs to stack massive combo chains.
            </p>
            <div class="arcade-btn-row">
              <button type="button" class="arcade-btn" id="runStartBtn">LAUNCH RUN [SPACE]</button>
            </div>
          </div>
        </div>

        <div class="arcade-controls-bar">
          <span><strong>SPACE / W / UP:</strong> Flip Gravity &nbsp;|&nbsp; <strong>F / J / CLICK:</strong> Plasma Blaster &nbsp;|&nbsp; <strong>P:</strong> Pause</span>
          <div class="arcade-touch-btns">
            <button type="button" class="touch-btn" id="runTouchFlip">FLIP RAIL</button>
            <button type="button" class="touch-btn" id="runTouchFire">FIRE BLASTER</button>
          </div>
        </div>
      </div>
    `;

    const stage = container.querySelector("#runStage");
    const canvas = container.querySelector("#runCanvas");
    const ctx = canvas.getContext("2d");

    const scoreEl = container.querySelector("#runScore");
    const bestEl = container.querySelector("#runBest");
    const comboEl = container.querySelector("#runCombo");
    const speedEl = container.querySelector("#runSpeed");
    const powerBadge = container.querySelector("#runPowerBadge");
    const overlay = container.querySelector("#runOverlay");
    const ovTitle = container.querySelector("#runOvTitle");
    const ovSub = container.querySelector("#runOvSub");
    const startBtn = container.querySelector("#runStartBtn");
    const touchFlip = container.querySelector("#runTouchFlip");
    const touchFire = container.querySelector("#runTouchFire");

    const sfx = {
      tone: (f, d, t, g, ef) => api && api.tone && api.tone(f, d, t, g, ef),
      noise: (d, g) => api && api.noise && api.noise(d, g)
    };

    let W = 960;
    let H = 500;
    let rafId = null;
    let destroyed = false;
    let lastTime = 0;

    function resize() {
      const rect = stage.getBoundingClientRect();
      W = Math.max(360, Math.floor(rect.width));
      H = Math.max(260, Math.floor(rect.height));
      canvas.width = W;
      canvas.height = H;
    }
    resize();

    const RAIL_H = 44;
    const state = {
      mode: "menu", // menu | playing | paused | gameover
      score: 0,
      distance: 0,
      speed: 410,
      speedMult: 1,
      combo: 1,
      comboTimer: 0,
      shake: 0,
      flash: 0,
      gridOffset: 0,
      bgOffset: 0,
      spawnHazardTimer: 0.75,
      spawnDroneTimer: 1.6,
      spawnPickupTimer: 3.4,
      lastRail: 1,
      fireHeld: false,
      fireCd: 0,
      player: {
        x: 145,
        y: 0,
        vy: 0,
        w: 30,
        h: 36,
        gravDir: 1, // 1 = floor, -1 = ceiling
        grounded: true,
        shield: false,
        rapidTimer: 0,
        overdriveTimer: 0,
        invuln: 0,
        runPhase: 0,
        trail: []
      },
      hazards: [],
      drones: [],
      bullets: [],
      enemyShots: [],
      pickups: [],
      particles: [],
      popups: [],
      stars: Array.from({ length: 55 }, () => ({
        x: Math.random() * 1200,
        y: Math.random() * 520,
        r: 0.8 + Math.random() * 1.8,
        s: 20 + Math.random() * 55
      })),
      buildings: Array.from({ length: 18 }, (_, i) => ({
        x: i * 95,
        w: 48 + Math.random() * 54,
        h: 70 + Math.random() * 140,
        hue: i % 2 === 0 ? "#1e1b4b" : "#172554"
      }))
    };

    function floorY() {
      return H - RAIL_H;
    }

    function ceilingY() {
      return RAIL_H;
    }

    function addParticles(x, y, color, count, speed = 180) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = speed * (0.35 + Math.random() * 0.85);
        state.particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.28 + Math.random() * 0.32,
          maxLife: 0.6,
          size: 2.5 + Math.random() * 3.5,
          color
        });
      }
    }

    function addPopup(x, y, text, color = "#fbbf24") {
      state.popups.push({ x, y, text, color, life: 0.85, vy: -52 });
    }

    function bumpCombo(amount, x, y, label) {
      state.combo = Math.min(12, state.combo + amount);
      state.comboTimer = 3.2;
      if (label) addPopup(x, y, label, "#fbbf24");
    }

    function resetRun() {
      state.mode = "playing";
      state.score = 0;
      state.distance = 0;
      state.speed = 420;
      state.speedMult = 1;
      state.combo = 1;
      state.comboTimer = 0;
      state.shake = 0;
      state.flash = 0;
      state.spawnHazardTimer = 0.65;
      state.spawnDroneTimer = 1.45;
      state.spawnPickupTimer = 3.2;
      state.fireCd = 0;

      const p = state.player;
      p.x = Math.min(160, Math.max(96, W * 0.17));
      p.gravDir = 1;
      p.y = floorY() - p.h;
      p.vy = 0;
      p.grounded = true;
      p.shield = false;
      p.rapidTimer = 0;
      p.overdriveTimer = 0;
      p.invuln = 0;
      p.trail = [];

      state.hazards = [];
      state.drones = [];
      state.bullets = [];
      state.enemyShots = [];
      state.pickups = [];
      state.particles = [];
      state.popups = [];

      overlay.classList.add("hidden");
      sfx.tone(330, 0.08, "sawtooth", 0.08, 660);
    }

    function flipGravity() {
      if (state.mode === "menu" || state.mode === "gameover") {
        resetRun();
        return;
      }
      if (state.mode !== "playing") return;

      const p = state.player;
      p.gravDir *= -1;
      p.grounded = false;
      p.vy = p.gravDir * 290;

      // Reward tight alternating flips with combo extension
      if (state.comboTimer > 0) {
        state.comboTimer = Math.min(3.4, state.comboTimer + 0.55);
      }
      addParticles(p.x + p.w * 0.5, p.y + p.h * 0.5, p.gravDir === 1 ? "#38bdf8" : "#f472b6", 9, 150);
      sfx.tone(p.gravDir === 1 ? 260 : 420, 0.09, "triangle", 0.08, p.gravDir === 1 ? 520 : 210);
    }

    function shootBlaster() {
      if (state.mode !== "playing" || state.fireCd > 0) return;
      const p = state.player;
      const rapid = p.rapidTimer > 0;
      state.fireCd = rapid ? 0.095 : 0.19;

      const bx = p.x + p.w + 4;
      const by = p.y + p.h * 0.45;
      const color = rapid ? "#fbbf24" : "#38bdf8";

      state.bullets.push({ x: bx, y: by, vx: 820, vy: 0, w: 18, h: 5, color, dmg: 1 });
      if (rapid) {
        state.bullets.push({ x: bx, y: by - 8, vx: 800, vy: -70, w: 14, h: 4, color: "#f97316", dmg: 1 });
        state.bullets.push({ x: bx, y: by + 8, vx: 800, vy: 70, w: 14, h: 4, color: "#f97316", dmg: 1 });
      }
      sfx.tone(rapid ? 780 : 620, 0.055, "square", 0.045, 260);
    }

    function spawnHazardPattern() {
      // High-frequency rhythmic rail patterns
      const roll = Math.random();
      const rail = Math.random() < 0.72 ? -state.lastRail : state.lastRail;
      state.lastRail = rail;

      if (roll < 0.42) {
        // Crisp laser pylon
        const h = 58 + Math.random() * 58;
        const w = 26 + Math.random() * 14;
        state.hazards.push({
          type: "pylon",
          x: W + 40,
          y: rail === 1 ? floorY() - h : ceilingY(),
          w,
          h,
          rail,
          color: "#f43f5e"
        });
      } else if (roll < 0.76) {
        // Staggered Quick-Flip Double Gate (forces rapid up-down-up!)
        const h1 = 66 + Math.random() * 34;
        const h2 = 66 + Math.random() * 34;
        const gap = Math.max(175, 245 - state.speedMult * 22);
        state.hazards.push({
          type: "pylon",
          x: W + 40,
          y: rail === 1 ? floorY() - h1 : ceilingY(),
          w: 28,
          h: h1,
          rail,
          color: "#fb7185"
        });
        state.hazards.push({
          type: "pylon",
          x: W + 40 + gap,
          y: rail === 1 ? ceilingY() : floorY() - h2,
          w: 28,
          h: h2,
          rail: -rail,
          color: "#e879f9"
        });
      } else {
        // Oscillating Mid-Air Plasma Mine
        const midY = ceilingY() + 75 + Math.random() * Math.max(60, H - RAIL_H * 2 - 150);
        state.hazards.push({
          type: "mine",
          x: W + 45,
          y: midY,
          baseY: midY,
          w: 28,
          h: 28,
          amp: 34 + Math.random() * 28,
          phase: Math.random() * Math.PI * 2,
          color: "#f97316"
        });
      }
    }

    function spawnDroneSquadron() {
      // Spawn 2- or 3-drone squadrons
      const count = Math.random() < 0.55 ? 2 : 3;
      const squadId = Math.random();
      const baseY = ceilingY() + 62 + Math.random() * Math.max(70, H - RAIL_H * 2 - 140);

      for (let i = 0; i < count; i++) {
        state.drones.push({
          squadId,
          x: W + 45 + i * 56,
          y: Math.max(ceilingY() + 26, Math.min(floorY() - 56, baseY + (i - 1) * 44)),
          w: 32,
          h: 24,
          hp: 1,
          bob: i * 1.1,
          shootCd: 1.05 + i * 0.45,
          color: i === 0 ? "#a855f7" : "#ec4899"
        });
      }
    }

    function spawnPickup() {
      const types = [
        { kind: "shield", label: "SHIELD", color: "#34d399" },
        { kind: "rapid", label: "RAPID FIRE", color: "#f97316" },
        { kind: "overdrive", label: "2X OVERDRIVE", color: "#fbbf24" }
      ];
      const pick = types[Math.floor(Math.random() * types.length)];
      const lane = Math.random();
      let py = H * 0.5;
      if (lane < 0.35) py = floorY() - 48;
      else if (lane < 0.7) py = ceilingY() + 48;

      state.pickups.push({
        x: W + 40,
        y: py,
        r: 15,
        bob: Math.random() * Math.PI * 2,
        ...pick
      });
    }

    function triggerDamage() {
      const p = state.player;
      if (p.invuln > 0) return;

      if (p.shield) {
        p.shield = false;
        p.invuln = 1.1;
        state.shake = 14;
        state.flash = 0.38;
        // Shield EMP clears nearby hazards & shots
        state.hazards = state.hazards.filter((h) => h.x > p.x + 180 || h.x < p.x - 40);
        state.enemyShots = [];
        addParticles(p.x + p.w * 0.5, p.y + p.h * 0.5, "#34d399", 26, 280);
        addPopup(p.x, p.y - 16, "SHIELD EMP!", "#34d399");
        sfx.noise(0.18, 0.12);
        sfx.tone(520, 0.16, "sawtooth", 0.08, 120);
        return;
      }

      // Game Over
      state.mode = "gameover";
      state.shake = 18;
      state.flash = 0.5;
      addParticles(p.x + p.w * 0.5, p.y + p.h * 0.5, "#f43f5e", 34, 300);
      sfx.noise(0.28, 0.14);
      sfx.tone(240, 0.3, "sawtooth", 0.1, 55);

      const finalScore = Math.floor(state.score);
      if (finalScore > bestScore) {
        bestScore = finalScore;
        localStorage.setItem(HIGH_SCORE_KEY, String(bestScore));
        bestEl.textContent = String(bestScore).padStart(5, "0");
      }

      ovTitle.textContent = "SIGNAL LOST // RUN ENDED";
      ovSub.innerHTML = `FINAL SCORE: <strong style="color:#38bdf8">${finalScore}</strong> &nbsp;•&nbsp; BEST: <strong style="color:#fbbf24">${bestScore}</strong> &nbsp;•&nbsp; MAX SPEED: ${state.speedMult.toFixed(1)}x`;
      startBtn.textContent = "RETRY RUN [SPACE]";
      overlay.classList.remove("hidden");
    }

    function rectsOverlap(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function update(dt) {
      if (state.mode !== "playing") return;

      const p = state.player;
      state.distance += state.speed * dt;
      state.speedMult = Math.min(2.35, 1 + state.distance / 14500);
      const overdriveBonus = p.overdriveTimer > 0 ? 1.15 : 1;
      const curSpeed = 420 * state.speedMult * overdriveBonus;
      state.speed = curSpeed;

      const scoreMult = state.combo * (p.overdriveTimer > 0 ? 2 : 1);
      state.score += dt * 42 * scoreMult;

      state.gridOffset = (state.gridOffset + curSpeed * dt) % 48;
      state.bgOffset = (state.bgOffset + curSpeed * 0.22 * dt) % 1400;

      if (state.comboTimer > 0) {
        state.comboTimer -= dt;
        if (state.comboTimer <= 0) state.combo = 1;
      }

      if (p.rapidTimer > 0) p.rapidTimer = Math.max(0, p.rapidTimer - dt);
      if (p.overdriveTimer > 0) p.overdriveTimer = Math.max(0, p.overdriveTimer - dt);
      if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);
      if (state.fireCd > 0) state.fireCd = Math.max(0, state.fireCd - dt);
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 36);
      if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 1.9);

      if (state.fireHeld) shootBlaster();

      // Player vertical physics
      p.vy += p.gravDir * 2850 * dt;
      p.y += p.vy * dt;
      p.runPhase += dt * (14 * state.speedMult);

      if (p.gravDir === 1 && p.y + p.h >= floorY()) {
        if (!p.grounded) addParticles(p.x + p.w * 0.5, floorY(), "#38bdf8", 6, 90);
        p.y = floorY() - p.h;
        p.vy = 0;
        p.grounded = true;
      } else if (p.gravDir === -1 && p.y <= ceilingY()) {
        if (!p.grounded) addParticles(p.x + p.w * 0.5, ceilingY(), "#f472b6", 6, 90);
        p.y = ceilingY();
        p.vy = 0;
        p.grounded = true;
      }

      // Neon afterimage trail
      p.trail.push({
        x: p.x,
        y: p.y,
        life: 0.2,
        color: p.overdriveTimer > 0 ? "#fbbf24" : p.gravDir === 1 ? "#38bdf8" : "#f472b6"
      });
      for (let i = p.trail.length - 1; i >= 0; i--) {
        p.trail[i].x -= curSpeed * dt * 0.65;
        p.trail[i].life -= dt;
        if (p.trail[i].life <= 0) p.trail.splice(i, 1);
      }

      // High-frequency spawners
      state.spawnHazardTimer -= dt;
      if (state.spawnHazardTimer <= 0) {
        spawnHazardPattern();
        state.spawnHazardTimer = Math.max(0.42, (0.98 / state.speedMult) + Math.random() * 0.26);
      }

      state.spawnDroneTimer -= dt;
      if (state.spawnDroneTimer <= 0) {
        spawnDroneSquadron();
        state.spawnDroneTimer = Math.max(1.35, (2.65 / state.speedMult) + Math.random() * 0.8);
      }

      state.spawnPickupTimer -= dt;
      if (state.spawnPickupTimer <= 0) {
        spawnPickup();
        state.spawnPickupTimer = 4.2 + Math.random() * 2.4;
      }

      // Update hazards
      const pHit = { x: p.x + 4, y: p.y + 4, w: p.w - 8, h: p.h - 8 };
      for (let i = state.hazards.length - 1; i >= 0; i--) {
        const h = state.hazards[i];
        h.x -= curSpeed * dt;
        if (h.type === "mine") {
          h.phase += dt * 4.4;
          h.y = h.baseY + Math.sin(h.phase) * h.amp;
        }
        if (rectsOverlap(pHit, h)) {
          triggerDamage();
          if (state.mode !== "playing") return;
        }
        if (h.x + h.w < -40) state.hazards.splice(i, 1);
      }

      // Update drones & enemy shots
      for (let i = state.drones.length - 1; i >= 0; i--) {
        const d = state.drones[i];
        d.x -= curSpeed * 0.62 * dt;
        d.bob += dt * 5;
        d.y += Math.sin(d.bob) * 58 * dt;

        d.shootCd -= dt;
        if (d.shootCd <= 0 && d.x < W - 40 && d.x > p.x + 120) {
          d.shootCd = 1.65;
          state.enemyShots.push({
            x: d.x - 6,
            y: d.y + d.h * 0.5,
            vx: -curSpeed * 0.95 - 140,
            w: 14,
            h: 5
          });
        }

        if (rectsOverlap(pHit, d)) {
          triggerDamage();
          if (state.mode !== "playing") return;
        }
        if (d.x + d.w < -50) state.drones.splice(i, 1);
      }

      for (let i = state.enemyShots.length - 1; i >= 0; i--) {
        const s = state.enemyShots[i];
        s.x += s.vx * dt;
        if (rectsOverlap(pHit, s)) {
          state.enemyShots.splice(i, 1);
          triggerDamage();
          if (state.mode !== "playing") return;
          continue;
        }
        if (s.x < -30) state.enemyShots.splice(i, 1);
      }

      // Update player bullets
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        let hit = false;
        for (let j = state.drones.length - 1; j >= 0; j--) {
          const d = state.drones[j];
          if (rectsOverlap(b, d)) {
            hit = true;
            d.hp -= b.dmg;
            if (d.hp <= 0) {
              const sid = d.squadId;
              state.drones.splice(j, 1);
              const bonus = Math.round(140 * scoreMult);
              state.score += bonus;
              bumpCombo(1, d.x, d.y, `+${bonus}`);
              addParticles(d.x + d.w * 0.5, d.y + d.h * 0.5, d.color, 15, 220);
              state.shake = Math.max(state.shake, 5);
              sfx.noise(0.08, 0.08);
              sfx.tone(480, 0.09, "square", 0.06, 860);

              // Check squadron wipe bonus
              if (!state.drones.some((other) => other.squadId === sid)) {
                state.score += 250 * state.combo;
                addPopup(d.x, d.y - 22, "SQUADRON WIPE!", "#34d399");
              }
            }
            break;
          }
        }

        // Bullets can also destroy oscillating plasma mines
        if (!hit) {
          for (let j = state.hazards.length - 1; j >= 0; j--) {
            const h = state.hazards[j];
            if (h.type === "mine" && rectsOverlap(b, h)) {
              hit = true;
              state.hazards.splice(j, 1);
              state.score += 110 * state.combo;
              bumpCombo(1, h.x, h.y, "MINE CLEARED!");
              addParticles(h.x + 14, h.y + 14, "#f97316", 14, 210);
              sfx.tone(360, 0.08, "sawtooth", 0.06, 620);
              break;
            }
          }
        }

        if (hit || b.x > W + 40 || b.y < 0 || b.y > H) {
          state.bullets.splice(i, 1);
        }
      }

      // Update pickups
      for (let i = state.pickups.length - 1; i >= 0; i--) {
        const pk = state.pickups[i];
        pk.x -= curSpeed * 0.85 * dt;
        pk.bob += dt * 4.5;
        const py = pk.y + Math.sin(pk.bob) * 10;

        const box = { x: pk.x - pk.r, y: py - pk.r, w: pk.r * 2, h: pk.r * 2 };
        if (rectsOverlap(pHit, box)) {
          if (pk.kind === "shield") p.shield = true;
          if (pk.kind === "rapid") p.rapidTimer = 6.5;
          if (pk.kind === "overdrive") p.overdriveTimer = 7.0;
          bumpCombo(1, pk.x, py, pk.label + "!");
          addParticles(pk.x, py, pk.color, 18, 220);
          sfx.tone(520, 0.08, "triangle", 0.08, 1040);
          state.pickups.splice(i, 1);
          continue;
        }
        if (pk.x < -40) state.pickups.splice(i, 1);
      }

      // Particles & floating popups
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

      // HUD sync
      scoreEl.textContent = String(Math.floor(state.score)).padStart(5, "0");
      comboEl.textContent = `x${state.combo}${p.overdriveTimer > 0 ? " (2X)" : ""}`;
      speedEl.textContent = `${state.speedMult.toFixed(1)}x`;

      const activeBuffs = [];
      if (p.shield) activeBuffs.push("SHIELD");
      if (p.rapidTimer > 0) activeBuffs.push(`RAPID ${p.rapidTimer.toFixed(1)}s`);
      if (p.overdriveTimer > 0) activeBuffs.push(`2X ${p.overdriveTimer.toFixed(1)}s`);
      powerBadge.textContent = activeBuffs.length ? activeBuffs.join(" • ") : "SYSTEM NOMINAL";
    }

    function draw() {
      ctx.save();
      if (state.shake > 0.2) {
        ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
      }

      // Synthwave gradient sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#090d1f");
      sky.addColorStop(0.5, "#141033");
      sky.addColorStop(1, "#09182c");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Drifting stars
      ctx.fillStyle = "rgba(186, 230, 253, 0.55)";
      state.stars.forEach((st) => {
        const sx = ((st.x - state.bgOffset * (st.s / 40)) % (W + 20) + W + 20) % (W + 20);
        ctx.fillRect(sx, st.y % H, st.r, st.r);
      });

      // Retro horizon sun
      const sunGrad = ctx.createLinearGradient(0, H * 0.25, 0, H * 0.72);
      sunGrad.addColorStop(0, "rgba(251, 146, 60, 0.35)");
      sunGrad.addColorStop(1, "rgba(244, 63, 94, 0.08)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(W * 0.72, H * 0.5, 92, 0, Math.PI * 2);
      ctx.fill();

      // Parallax cyber skyline
      state.buildings.forEach((b) => {
        const bx = ((b.x - state.bgOffset) % (W + 240) + W + 240) % (W + 240) - 120;
        ctx.fillStyle = b.hue;
        ctx.fillRect(bx, floorY() - b.h, b.w, b.h);
        ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
        for (let wy = floorY() - b.h + 12; wy < floorY() - 12; wy += 18) {
          ctx.fillRect(bx + 8, wy, b.w - 16, 4);
        }
      });

      // Ceiling & Floor Neon Rails
      ctx.fillStyle = "#0b1120";
      ctx.fillRect(0, 0, W, ceilingY());
      ctx.fillRect(0, floorY(), W, RAIL_H);

      // Perspective rail chevrons
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 2;
      for (let gx = -state.gridOffset; gx < W + 48; gx += 48) {
        ctx.beginPath();
        ctx.moveTo(gx, floorY());
        ctx.lineTo(gx - 22, H);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(gx, ceilingY());
        ctx.lineTo(gx - 22, 0);
        ctx.stroke();
      }

      // Glowing rail trim
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#38bdf8";
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(0, floorY() - 2, W, 3);
      ctx.shadowColor = "#f472b6";
      ctx.fillStyle = "#f472b6";
      ctx.fillRect(0, ceilingY() - 1, W, 3);
      ctx.shadowBlur = 0;

      // Pickups
      state.pickups.forEach((pk) => {
        const py = pk.y + Math.sin(pk.bob) * 10;
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = pk.color;
        ctx.fillStyle = pk.color;
        ctx.beginPath();
        ctx.arc(pk.x, py, pk.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#090d16";
        ctx.font = "900 11px Unbounded, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pk.kind === "shield" ? "S" : pk.kind === "rapid" ? "R" : "2X", pk.x, py + 1);
        ctx.restore();
      });

      // Hazards
      state.hazards.forEach((h) => {
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = h.color;
        if (h.type === "pylon") {
          ctx.fillStyle = "#1e1b2e";
          ctx.fillRect(h.x, h.y, h.w, h.h);
          ctx.fillStyle = h.color;
          ctx.fillRect(h.x + 4, h.y + 3, h.w - 8, h.h - 6);
          ctx.fillStyle = "#ffe4e6";
          ctx.fillRect(h.x + h.w * 0.4, h.y + 6, 4, h.h - 12);
        } else {
          // Spinning plasma mine
          ctx.translate(h.x + h.w * 0.5, h.y + h.h * 0.5);
          ctx.rotate(h.phase * 1.4);
          ctx.fillStyle = h.color;
          ctx.fillRect(-12, -12, 24, 24);
          ctx.fillStyle = "#fef08a";
          ctx.fillRect(-5, -5, 10, 10);
        }
        ctx.restore();
      });

      // Drone squadrons
      state.drones.forEach((d) => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = d.color;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y + d.h * 0.5);
        ctx.lineTo(d.x + d.w * 0.65, d.y);
        ctx.lineTo(d.x + d.w, d.y + d.h * 0.5);
        ctx.lineTo(d.x + d.w * 0.65, d.y + d.h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(d.x + 8, d.y + d.h * 0.4, 8, 5);
        ctx.restore();
      });

      // Enemy shots
      ctx.fillStyle = "#f43f5e";
      state.enemyShots.forEach((s) => {
        ctx.fillRect(s.x, s.y, s.w, s.h);
      });

      // Player bullets
      state.bullets.forEach((b) => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.restore();
      });

      // Player afterimage trail
      const p = state.player;
      p.trail.forEach((t) => {
        ctx.globalAlpha = Math.max(0, t.life * 1.8);
        ctx.fillStyle = t.color;
        ctx.fillRect(t.x, t.y, p.w, p.h);
      });
      ctx.globalAlpha = 1;

      // Player cyber-runner sprite
      ctx.save();
      const blink = p.invuln > 0 && Math.floor(p.invuln * 16) % 2 === 0;
      if (!blink) {
        const px = p.x;
        const py = p.y;
        const accent = p.overdriveTimer > 0 ? "#fbbf24" : p.gravDir === 1 ? "#38bdf8" : "#f472b6";

        ctx.translate(px + p.w * 0.5, py + p.h * 0.5);
        if (p.gravDir === -1) ctx.scale(1, -1);

        // Jetpack glow
        ctx.fillStyle = accent;
        ctx.fillRect(-16, -4, 6, 12);

        // Torso & head
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(-9, -12, 18, 19);
        // Visor
        ctx.fillStyle = accent;
        ctx.fillRect(2, -9, 9, 5);
        // Animated legs
        const stride = p.grounded ? Math.sin(p.runPhase) * 6 : 4;
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(-7 + stride, 7, 6, 10);
        ctx.fillRect(1 - stride, 7, 6, 10);
      }
      ctx.restore();

      // Shield bubble
      if (p.shield) {
        ctx.save();
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#34d399";
        ctx.beginPath();
        ctx.arc(p.x + p.w * 0.5, p.y + p.h * 0.5, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Particles
      state.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      });
      ctx.globalAlpha = 1;

      // Floating score popups
      ctx.font = "900 12px Unbounded, sans-serif";
      ctx.textAlign = "center";
      state.popups.forEach((pp) => {
        ctx.globalAlpha = Math.max(0, pp.life);
        ctx.fillStyle = pp.color;
        ctx.fillText(pp.text, pp.x, pp.y);
      });
      ctx.globalAlpha = 1;

      if (state.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${state.flash * 0.45})`;
        ctx.fillRect(0, 0, W, H);
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
      if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
        e.preventDefault();
        flipGravity();
      } else if (e.code === "KeyF" || e.code === "KeyJ") {
        e.preventDefault();
        state.fireHeld = true;
        shootBlaster();
      } else if (e.code === "KeyP") {
        if (state.mode === "playing") {
          state.mode = "paused";
          ovTitle.textContent = "PAUSED";
          ovSub.textContent = "Press P or click below to resume your synth run.";
          startBtn.textContent = "RESUME";
          overlay.classList.remove("hidden");
        } else if (state.mode === "paused") {
          state.mode = "playing";
          overlay.classList.add("hidden");
        }
      }
    }

    function onKeyUp(e) {
      if (e.code === "KeyF" || e.code === "KeyJ") state.fireHeld = false;
    }

    function onCanvasPointerDown(e) {
      if (state.mode !== "playing") return;
      if (e.button === 2) {
        flipGravity();
      } else {
        state.fireHeld = true;
        shootBlaster();
      }
    }

    function onCanvasPointerUp() {
      state.fireHeld = false;
    }

    startBtn.addEventListener("click", () => {
      if (state.mode === "paused") {
        state.mode = "playing";
        overlay.classList.add("hidden");
      } else {
        resetRun();
      }
    });

    touchFlip.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      flipGravity();
    });
    touchFire.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      state.fireHeld = true;
      shootBlaster();
    });
    touchFire.addEventListener("pointerup", () => {
      state.fireHeld = false;
    });
    touchFire.addEventListener("pointerleave", () => {
      state.fireHeld = false;
    });

    canvas.addEventListener("pointerdown", onCanvasPointerDown);
    window.addEventListener("pointerup", onCanvasPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", resize);

    // Position player nicely for menu backdrop
    state.player.y = floorY() - state.player.h;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);

    return {
      destroy() {
        destroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        canvas.removeEventListener("pointerdown", onCanvasPointerDown);
        window.removeEventListener("pointerup", onCanvasPointerUp);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("resize", resize);
      }
    };
  }
};