/* =========================================================
   PORTFOLIO V0.2.1 — GRAVITY FLIP RUNNER (ARCADE EDITION)
   - Flip Gravity: SPACE / ArrowUp / ArrowDown / Tap Canvas / FLIP btn
   - Plasma Blaster: F / Enter / FIRE btn (destroys aerial drones)
   - Hazards: Spikes, Void Gaps, Hovering Security Drones, Laser Gates
   - Boost Orbs: SHIELD, RAPID FIRE, 2X OVERDRIVE
   - Live CSS-variable theme sync (Oxblood Light <-> Glacial Cyan Dark)
   ========================================================= */

(function () {
  const canvas = document.getElementById("gravityCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const stageEl = document.getElementById("gameStage");
  const scoreEl = document.getElementById("gameScore");
  const bestEl = document.getElementById("gameBest");
  const boostEl = document.getElementById("gameBoost");
  const overlay = document.getElementById("gameOverlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlaySub = document.getElementById("overlaySub");
  const startBtn = document.getElementById("gameStartBtn");
  const resetBtn = document.getElementById("gameResetBtn");
  const flipBtn = document.getElementById("gameFlipBtn");
  const fireBtn = document.getElementById("gameFireBtn");

  const W = canvas.width; // 900
  const H = canvas.height; // 320
  const RAIL_H = 38;
  const CEIL_Y = RAIL_H;
  const FLOOR_Y = H - RAIL_H;

  const BEST_KEY = "kai_gravity_arcade_best_v21";
  let bestScore = Number(localStorage.getItem(BEST_KEY) || 0);
  if (bestEl) bestEl.textContent = String(bestScore).padStart(3, "0");

  // Live theme colors synced from :root / [data-theme]
  let palette = {};
  function refreshPalette() {
    const styles = getComputedStyle(document.documentElement);
    palette = {
      bg: styles.getPropertyValue("--surface").trim() || "#e9e9e5",
      rail: styles.getPropertyValue("--ink").trim() || "#121212",
      grid: styles.getPropertyValue("--line").trim() || "rgba(18,18,18,0.12)",
      muted: styles.getPropertyValue("--muted").trim() || "#5d5d58",
      ink: styles.getPropertyValue("--ink").trim() || "#121212",
      paper: styles.getPropertyValue("--bg").trim() || "#f4f4f2",
      accent: styles.getPropertyValue("--accent").trim() || "#9b1c24",
      accentDeep: styles.getPropertyValue("--accent-deep").trim() || "#731319",
      accentInk: styles.getPropertyValue("--accent-ink").trim() || "#f4f4f2"
    };
  }
  refreshPalette();

  // Game state
  let state = "idle"; // idle | running | gameover
  let lastTime = 0;
  let score = 0;
  let stage = 1;
  let speed = 350;
  let gridOffset = 0;
  let spawnTimer = 0.7;
  let boostSpawnTimer = 6.5;
  let lastSide = "floor";
  let shakeTime = 0;
  let shakeIntensity = 0;
  let timeElapsed = 0;

  // Player state
  const player = {
    x: 148,
    y: FLOOR_Y - 32,
    size: 32,
    vy: 0,
    gravityDir: 1, // 1 = floor, -1 = ceiling
    grounded: true,
    coyoteTimer: 0,
    rotation: 0,
    targetRotation: 0,
    squash: 1,
    fireCooldown: 0,
    invulnTimer: 0,
    shield: false,
    rapidTimer: 0,
    overdriveTimer: 0,
    recoil: 0
  };

  let obstacles = []; // spikes, voids, drones, lasers
  let bullets = [];
  let boosts = []; // { kind: 'shield'|'rapid'|'overdrive', x, y, baseY, phase, r }
  let particles = [];
  let popups = []; // { x, y, text, life, maxLife, color }
  let trail = [];

  function triggerShake(duration, intensity) {
    shakeTime = Math.max(shakeTime, duration);
    shakeIntensity = Math.max(shakeIntensity, intensity);
  }

  function addPopup(x, y, text, color) {
    popups.push({
      x,
      y,
      text,
      life: 0.75,
      maxLife: 0.75,
      color: color || palette.accent
    });
  }

  function emitParticles(x, y, count, color, spread) {
    const mag = spread || 210;
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: -speed * 0.2 + (Math.random() - 0.5) * mag,
        vy: (Math.random() - 0.5) * mag,
        size: 3 + Math.random() * 4.5,
        life: 0.26 + Math.random() * 0.26,
        maxLife: 0.52,
        color
      });
    }
  }

  function updateBoostHud() {
    if (!boostEl) return;
    const labels = [];
    if (player.shield) labels.push("SHIELD");
    if (player.rapidTimer > 0) {
      labels.push("RAPID " + Math.ceil(player.rapidTimer) + "S");
    }
    if (player.overdriveTimer > 0) {
      labels.push("2X " + Math.ceil(player.overdriveTimer) + "S");
    }

    if (labels.length > 0) {
      boostEl.textContent = labels.join(" • ");
      boostEl.hidden = false;
    } else {
      boostEl.hidden = true;
    }
  }

  function updateHud() {
    const scoreInt = Math.floor(score);
    if (scoreEl) scoreEl.textContent = String(scoreInt).padStart(3, "0");
    if (stageEl) stageEl.textContent = String(stage).padStart(2, "0");

    if (scoreInt > bestScore) {
      bestScore = scoreInt;
      localStorage.setItem(BEST_KEY, String(bestScore));
    }
    if (bestEl) bestEl.textContent = String(bestScore).padStart(3, "0");
    updateBoostHud();
  }

  function resetGame(autoStart) {
    score = 0;
    stage = 1;
    speed = 350;
    gridOffset = 0;
    spawnTimer = 0.75;
    boostSpawnTimer = 5.5;
    shakeTime = 0;
    shakeIntensity = 0;
    obstacles = [];
    bullets = [];
    boosts = [];
    particles = [];
    popups = [];
    trail = [];

    player.y = FLOOR_Y - player.size;
    player.vy = 0;
    player.gravityDir = 1;
    player.grounded = true;
    player.coyoteTimer = 0;
    player.rotation = 0;
    player.targetRotation = 0;
    player.squash = 1;
    player.fireCooldown = 0;
    player.invulnTimer = 0;
    player.shield = false;
    player.rapidTimer = 0;
    player.overdriveTimer = 0;
    player.recoil = 0;

    updateHud();

    if (autoStart) {
      state = "running";
      overlay.classList.add("hidden");
    } else {
      state = "idle";
      overlay.classList.remove("hidden");
      overlayTitle.textContent = "FLIP GRAVITY & BLAST DRONES";
      overlaySub.textContent =
        "SPACE / TAP = FLIP • F / ENTER / FIRE = SHOOT • GRAB SHIELD, RAPID & 2X BOOSTS";
      startBtn.textContent = "PLAY";
    }
  }

  function flipGravity() {
    if (state === "idle" || state === "gameover") {
      resetGame(true);
      return;
    }
    if (state !== "running") return;
    if (!player.grounded && player.coyoteTimer <= 0) return;

    player.gravityDir *= -1;
    player.grounded = false;
    player.coyoteTimer = 0;
    player.vy = player.gravityDir * 300;
    player.targetRotation += Math.PI * 0.5 * player.gravityDir;
    player.squash = 1.24;

    emitParticles(
      player.x + player.size / 2,
      player.y + player.size / 2,
      8,
      palette.accent,
      190
    );
  }

  function fireBlaster() {
    if (state === "idle" || state === "gameover") {
      resetGame(true);
      return;
    }
    if (state !== "running") return;
    if (player.fireCooldown > 0) return;

    const isRapid = player.rapidTimer > 0;
    player.fireCooldown = isRapid ? 0.1 : 0.25;
    player.recoil = 6;

    const bx = player.x + player.size + 4;
    const by = player.y + player.size / 2;

    if (isRapid) {
      bullets.push({ x: bx, y: by - 6, vx: 780, w: 18, h: 5 });
      bullets.push({ x: bx, y: by + 6, vx: 780, w: 18, h: 5 });
    } else {
      bullets.push({ x: bx, y: by, vx: 720, w: 16, h: 5 });
    }

    emitParticles(bx, by, 4, palette.accent, 110);
  }

  function spawnObstacle() {
    const roll = Math.random();
    const side =
      Math.random() < 0.65
        ? lastSide === "floor"
          ? "ceil"
          : "floor"
        : lastSide;
    lastSide = side;

    if (roll < 0.28) {
      // Hovering Security Drone (shootable for +50 bonus!)
      const lanes = [CEIL_Y + 42, H * 0.5, FLOOR_Y - 42];
      const baseY = lanes[Math.floor(Math.random() * lanes.length)];
      const armored = stage >= 3 && Math.random() < 0.32;
      obstacles.push({
        type: "drone",
        x: W + 45,
        y: baseY,
        baseY,
        w: armored ? 36 : 30,
        h: armored ? 28 : 24,
        hp: armored ? 2 : 1,
        maxHp: armored ? 2 : 1,
        phase: Math.random() * Math.PI * 2,
        bobAmp: 12 + Math.random() * 14,
        hitFlash: 0
      });
    } else if (roll < 0.48 && stage >= 1) {
      // Pulsing Half-Lane Laser Gate (forces clean rail flip)
      const beamH = 74 + Math.min(18, stage * 3);
      obstacles.push({
        type: "laser",
        side,
        x: W + 45,
        w: 18,
        h: beamH,
        phase: Math.random() * Math.PI * 2
      });
    } else if (roll < 0.72) {
      // Void Gap in rail
      const voidWidth = 98 + Math.random() * 68;
      obstacles.push({
        type: "void",
        side,
        x: W + 45,
        w: voidWidth,
        h: RAIL_H
      });
    } else {
      // Spikes cluster
      const spikeCount = stage >= 2 && Math.random() < 0.42 ? 2 : 1;
      const singleW = 26;
      const spikeH = 26 + Math.min(9, stage * 1.6);
      obstacles.push({
        type: "spike",
        side,
        x: W + 45,
        w: singleW * spikeCount,
        h: spikeH,
        count: spikeCount
      });
    }

    const minGapTime = Math.max(0.5, 0.9 - stage * 0.05);
    const maxGapTime = Math.max(0.84, 1.32 - stage * 0.055);
    spawnTimer = minGapTime + Math.random() * (maxGapTime - minGapTime);
  }

  function spawnBoost() {
    const kinds = ["shield", "rapid", "overdrive"];
    // Avoid spawning another shield if already shielded
    const pool = player.shield ? ["rapid", "overdrive"] : kinds;
    const kind = pool[Math.floor(Math.random() * pool.length)];
    const yOptions = [CEIL_Y + 48, H * 0.5, FLOOR_Y - 48];
    const baseY = yOptions[Math.floor(Math.random() * yOptions.length)];

    boosts.push({
      kind,
      x: W + 40,
      y: baseY,
      baseY,
      r: 15,
      phase: Math.random() * Math.PI * 2
    });

    boostSpawnTimer = 7.5 + Math.random() * 5.5;
  }

  function hasVoidUnderPlayer(side) {
    const pxLeft = player.x + 6;
    const pxRight = player.x + player.size - 6;

    for (let i = 0; i < obstacles.length; i++) {
      const ob = obstacles[i];
      if (ob.type !== "void" || ob.side !== side) continue;
      if (pxLeft > ob.x + 2 && pxRight < ob.x + ob.w - 2) {
        return true;
      }
    }
    return false;
  }

  function handlePlayerHit(reason, hitObstacleIdx) {
    if (player.invulnTimer > 0 && reason !== "void") return;

    // Shield absorbs non-void hazards
    if (player.shield && reason !== "void") {
      player.shield = false;
      player.invulnTimer = 0.85;
      if (typeof hitObstacleIdx === "number" && obstacles[hitObstacleIdx]) {
        const ob = obstacles[hitObstacleIdx];
        if (ob.type === "drone") {
          obstacles.splice(hitObstacleIdx, 1);
        }
      }
      triggerShake(0.22, 8);
      emitParticles(
        player.x + player.size / 2,
        player.y + player.size / 2,
        20,
        palette.accent,
        290
      );
      addPopup(player.x, player.y - 10, "SHIELD SAVED!", palette.ink);
      updateBoostHud();
      return;
    }

    state = "gameover";
    triggerShake(0.3, 11);
    emitParticles(
      player.x + player.size / 2,
      player.y + player.size / 2,
      24,
      palette.accent,
      320
    );
    updateHud();

    const titles = {
      void: "LOST IN THE VOID",
      drone: "DRONE INTERCEPTED",
      laser: "LASER GATE BREACH",
      spike: "IMPACT DETECTED"
    };

    overlayTitle.textContent = titles[reason] || "RUN TERMINATED";
    overlaySub.textContent =
      "SCORE " +
      String(Math.floor(score)).padStart(3, "0") +
      " — STAGE " +
      String(stage).padStart(2, "0") +
      " • PRESS SPACE OR TAP TO RETRY";
    startBtn.textContent = "PLAY AGAIN";
    overlay.classList.remove("hidden");
  }

  function update(dt) {
    timeElapsed += dt;

    if (shakeTime > 0) {
      shakeTime = Math.max(0, shakeTime - dt);
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Floating score / boost popups
    for (let i = popups.length - 1; i >= 0; i--) {
      const pop = popups[i];
      pop.y -= 42 * dt;
      pop.life -= dt;
      if (pop.life <= 0) popups.splice(i, 1);
    }

    if (state !== "running") return;

    // Cooldowns & active boosts
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    player.invulnTimer = Math.max(0, player.invulnTimer - dt);
    player.recoil = Math.max(0, player.recoil - dt * 36);

    if (player.rapidTimer > 0) {
      player.rapidTimer = Math.max(0, player.rapidTimer - dt);
    }
    if (player.overdriveTimer > 0) {
      player.overdriveTimer = Math.max(0, player.overdriveTimer - dt);
    }

    // Speed & Score progression
    const mult = player.overdriveTimer > 0 ? 2 : 1;
    const activeSpeed = speed * (player.overdriveTimer > 0 ? 1.16 : 1);
    score += dt * (activeSpeed / 22) * mult;
    stage = Math.min(9, 1 + Math.floor(score / 220));
    speed = Math.min(640, 350 + (stage - 1) * 34 + score * 0.045);
    gridOffset = (gridOffset + activeSpeed * dt) % 60;
    updateHud();

    // Motion trail
    trail.push({
      x: player.x + player.size / 2,
      y: player.y + player.size / 2,
      life: 0.22
    });
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].x -= activeSpeed * dt * 0.65;
      trail[i].life -= dt;
      if (trail[i].life <= 0) trail.splice(i, 1);
    }

    // Spawn hazards & boosts
    spawnTimer -= dt;
    if (spawnTimer <= 0) spawnObstacle();

    boostSpawnTimer -= dt;
    if (boostSpawnTimer <= 0) spawnBoost();

    // Update bullets & check drone hits
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;

      let hit = false;
      for (let j = obstacles.length - 1; j >= 0; j--) {
        const ob = obstacles[j];
        if (ob.type !== "drone") continue;
        const dLeft = ob.x - ob.w / 2;
        const dRight = ob.x + ob.w / 2;
        const dTop = ob.y - ob.h / 2;
        const dBottom = ob.y + ob.h / 2;

        if (
          b.x + b.w > dLeft &&
          b.x < dRight &&
          b.y + b.h / 2 > dTop &&
          b.y - b.h / 2 < dBottom
        ) {
          ob.hp -= 1;
          ob.hitFlash = 0.12;
          hit = true;
          emitParticles(b.x, b.y, 7, palette.accent, 180);

          if (ob.hp <= 0) {
            const bonus = (ob.maxHp > 1 ? 80 : 50) * mult;
            score += bonus;
            triggerShake(0.14, 5);
            emitParticles(ob.x, ob.y, 18, palette.accent, 270);
            emitParticles(ob.x, ob.y, 8, palette.ink, 210);
            addPopup(ob.x, ob.y - 10, "+" + bonus, palette.accent);
            obstacles.splice(j, 1);
          }
          break;
        }
      }

      if (hit || b.x > W + 40) {
        bullets.splice(i, 1);
      }
    }

    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      if (ob.type === "drone") {
        ob.x -= activeSpeed * 1.12 * dt;
        ob.phase += dt * 4.2;
        ob.y = ob.baseY + Math.sin(ob.phase) * ob.bobAmp;
        ob.hitFlash = Math.max(0, ob.hitFlash - dt);
      } else {
        ob.x -= activeSpeed * dt;
      }

      if (ob.x + (ob.w || 40) < -80) {
        obstacles.splice(i, 1);
      }
    }

    // Move & collect boost orbs
    const pcx = player.x + player.size / 2;
    const pcy = player.y + player.size / 2;
    for (let i = boosts.length - 1; i >= 0; i--) {
      const orb = boosts[i];
      orb.x -= activeSpeed * 0.92 * dt;
      orb.phase += dt * 5;
      orb.y = orb.baseY + Math.sin(orb.phase) * 10;

      if (Math.hypot(pcx - orb.x, pcy - orb.y) < player.size * 0.55 + orb.r) {
        if (orb.kind === "shield") {
          player.shield = true;
          addPopup(orb.x, orb.y - 14, "SHIELD READY!", palette.accent);
        } else if (orb.kind === "rapid") {
          player.rapidTimer = 7.5;
          addPopup(orb.x, orb.y - 14, "RAPID FIRE!", palette.accent);
        } else {
          player.overdriveTimer = 7.0;
          addPopup(orb.x, orb.y - 14, "2X OVERDRIVE!", palette.accent);
        }
        emitParticles(orb.x, orb.y, 14, palette.accent, 230);
        boosts.splice(i, 1);
        updateBoostHud();
        continue;
      }

      if (orb.x < -50) boosts.splice(i, 1);
    }

    // Player gravity physics
    const gravityAccel = 2750;
    player.vy += player.gravityDir * gravityAccel * dt;
    player.y += player.vy * dt;
    player.rotation += (player.targetRotation - player.rotation) * Math.min(1, dt * 16);
    player.squash += (1 - player.squash) * Math.min(1, dt * 12);

    const wasGrounded = player.grounded;

    // Rail collision (respecting void gaps)
    if (player.gravityDir === 1) {
      const overFloorVoid = hasVoidUnderPlayer("floor");
      if (
        !overFloorVoid &&
        player.y + player.size >= FLOOR_Y &&
        player.y + player.size <= FLOOR_Y + 26
      ) {
        if (!player.grounded) {
          player.squash = 0.84;
          emitParticles(player.x + player.size / 2, FLOOR_Y, 5, palette.ink, 120);
        }
        player.y = FLOOR_Y - player.size;
        player.vy = 0;
        player.grounded = true;
        player.coyoteTimer = 0.08;
      } else if (overFloorVoid && player.y + player.size >= FLOOR_Y) {
        player.grounded = false;
      }
    } else {
      const underCeilVoid = hasVoidUnderPlayer("ceil");
      if (!underCeilVoid && player.y <= CEIL_Y && player.y >= CEIL_Y - 26) {
        if (!player.grounded) {
          player.squash = 0.84;
          emitParticles(player.x + player.size / 2, CEIL_Y, 5, palette.ink, 120);
        }
        player.y = CEIL_Y;
        player.vy = 0;
        player.grounded = true;
        player.coyoteTimer = 0.08;
      } else if (underCeilVoid && player.y <= CEIL_Y) {
        player.grounded = false;
      }
    }

    if (!player.grounded && wasGrounded) {
      player.coyoteTimer = 0.08;
    } else if (!player.grounded) {
      player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
    }

    // Void out-of-bounds
    if (player.y > H + 24 || player.y + player.size < -24) {
      handlePlayerHit("void");
      return;
    }

    // Hazard collisions (forgiving inner hitbox)
    const pad = 5;
    const pLeft = player.x + pad;
    const pRight = player.x + player.size - pad;
    const pTop = player.y + pad;
    const pBottom = player.y + player.size - pad;

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];

      if (ob.type === "spike") {
        const sLeft = ob.x + 4;
        const sRight = ob.x + ob.w - 4;
        const sTop = ob.side === "floor" ? FLOOR_Y - ob.h + 5 : CEIL_Y;
        const sBottom = ob.side === "floor" ? FLOOR_Y : CEIL_Y + ob.h - 5;

        if (pRight > sLeft && pLeft < sRight && pBottom > sTop && pTop < sBottom) {
          handlePlayerHit("spike", i);
          if (state !== "running") return;
        }
      } else if (ob.type === "laser") {
        const lLeft = ob.x + 3;
        const lRight = ob.x + ob.w - 3;
        const lTop = ob.side === "floor" ? FLOOR_Y - ob.h : CEIL_Y;
        const lBottom = ob.side === "floor" ? FLOOR_Y : CEIL_Y + ob.h;

        if (pRight > lLeft && pLeft < lRight && pBottom > lTop && pTop < lBottom) {
          handlePlayerHit("laser", i);
          if (state !== "running") return;
        }
      } else if (ob.type === "drone") {
        const dLeft = ob.x - ob.w / 2 + 3;
        const dRight = ob.x + ob.w / 2 - 3;
        const dTop = ob.y - ob.h / 2 + 3;
        const dBottom = ob.y + ob.h / 2 - 3;

        if (pRight > dLeft && pLeft < dRight && pBottom > dTop && pTop < dBottom) {
          handlePlayerHit("drone", i);
          if (state !== "running") return;
        }
      }
    }
  }

  function drawRailWithVoids(side) {
    const y = side === "floor" ? FLOOR_Y : 0;
    const voids = obstacles
      .filter((o) => o.type === "void" && o.side === side)
      .sort((a, b) => a.x - b.x);

    ctx.fillStyle = palette.rail;
    let cursor = 0;

    for (let i = 0; i < voids.length; i++) {
      const v = voids[i];
      const segEnd = Math.max(cursor, Math.min(W, v.x));
      if (segEnd > cursor) {
        ctx.fillRect(cursor, y, segEnd - cursor, RAIL_H);
      }

      // Accent caution edge caps on void gaps
      ctx.fillStyle = palette.accent;
      if (v.x > 0 && v.x < W) {
        ctx.fillRect(v.x - 4, side === "floor" ? FLOOR_Y : RAIL_H - 6, 4, 6);
      }
      if (v.x + v.w > 0 && v.x + v.w < W) {
        ctx.fillRect(v.x + v.w, side === "floor" ? FLOOR_Y : RAIL_H - 6, 4, 6);
      }
      ctx.fillStyle = palette.rail;
      cursor = Math.max(cursor, v.x + v.w);
    }

    if (cursor < W) {
      ctx.fillRect(cursor, y, W - cursor, RAIL_H);
    }
  }

  function drawHazards() {
    for (let i = 0; i < obstacles.length; i++) {
      const ob = obstacles[i];

      if (ob.type === "spike") {
        const count = ob.count || 1;
        const singleW = ob.w / count;
        for (let c = 0; c < count; c++) {
          const bx = ob.x + c * singleW;
          ctx.beginPath();
          if (ob.side === "floor") {
            ctx.moveTo(bx, FLOOR_Y);
            ctx.lineTo(bx + singleW / 2, FLOOR_Y - ob.h);
            ctx.lineTo(bx + singleW, FLOOR_Y);
          } else {
            ctx.moveTo(bx, CEIL_Y);
            ctx.lineTo(bx + singleW / 2, CEIL_Y + ob.h);
            ctx.lineTo(bx + singleW, CEIL_Y);
          }
          ctx.closePath();
          ctx.fillStyle = palette.accent;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = palette.ink;
          ctx.stroke();
        }
      } else if (ob.type === "laser") {
        const pulse = 0.72 + Math.sin(timeElapsed * 18 + ob.phase) * 0.28;
        const yTop = ob.side === "floor" ? FLOOR_Y - ob.h : CEIL_Y;

        // Outer beam glow
        ctx.save();
        ctx.globalAlpha = 0.28 * pulse;
        ctx.fillStyle = palette.accent;
        ctx.fillRect(ob.x - 4, yTop, ob.w + 8, ob.h);
        ctx.restore();

        // Core plasma beam
        ctx.fillStyle = palette.accent;
        ctx.fillRect(ob.x + 3, yTop, ob.w - 6, ob.h);

        // White-hot inner filament
        ctx.fillStyle = palette.accentInk;
        ctx.fillRect(ob.x + ob.w / 2 - 1.5, yTop, 3, ob.h);

        // Emitter cap mounted to rail
        ctx.fillStyle = palette.ink;
        const capY = ob.side === "floor" ? FLOOR_Y - 10 : CEIL_Y;
        ctx.fillRect(ob.x - 3, capY, ob.w + 6, 10);
      } else if (ob.type === "drone") {
        ctx.save();
        ctx.translate(ob.x, ob.y);

        // Outer hexagonal / diamond hull
        ctx.beginPath();
        ctx.moveTo(-ob.w / 2, 0);
        ctx.lineTo(-ob.w * 0.22, -ob.h / 2);
        ctx.lineTo(ob.w * 0.32, -ob.h / 2);
        ctx.lineTo(ob.w / 2, 0);
        ctx.lineTo(ob.w * 0.32, ob.h / 2);
        ctx.lineTo(-ob.w * 0.22, ob.h / 2);
        ctx.closePath();
        ctx.fillStyle = ob.hitFlash > 0 ? palette.accentInk : palette.ink;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = palette.accent;
        ctx.stroke();

        // Glowing scanner eye
        ctx.beginPath();
        ctx.arc(-4, 0, ob.maxHp > 1 ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = palette.accent;
        ctx.fill();

        // Armored drone pip indicator
        if (ob.hp > 1) {
          ctx.fillStyle = palette.accentInk;
          ctx.fillRect(6, -3, 5, 6);
        }

        ctx.restore();
      }
    }
  }

  function drawBoosts() {
    for (let i = 0; i < boosts.length; i++) {
      const orb = boosts[i];
      ctx.save();
      ctx.translate(orb.x, orb.y);

      // Pulsing outer ring
      const pulseR = orb.r + 3 + Math.sin(timeElapsed * 7 + orb.phase) * 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Solid rotated diamond badge
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = palette.accent;
      ctx.fillRect(-10, -10, 20, 20);
      ctx.rotate(-Math.PI / 4);

      // Crisp 1-2 character icon letter
      ctx.fillStyle = palette.accentInk;
      ctx.font = '900 10px "Unbounded", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label =
        orb.kind === "shield" ? "S" : orb.kind === "rapid" ? "R" : "2X";
      ctx.fillText(label, 0, 0.5);

      ctx.restore();
    }
  }

  function drawBullets() {
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y - b.h / 2, b.w, b.h, 3);
      ctx.fill();

      ctx.fillStyle = palette.accentInk;
      ctx.fillRect(b.x + b.w - 6, b.y - 1.5, 5, 3);
    }
  }

  function drawPlayer() {
    // Speed trail
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const alpha = (t.life / 0.22) * (player.overdriveTimer > 0 ? 0.34 : 0.14);
      ctx.fillStyle = player.overdriveTimer > 0 ? palette.accent : palette.ink;
      ctx.globalAlpha = Math.max(0, alpha);
      const sz = 14 * (t.life / 0.22);
      ctx.fillRect(t.x - sz / 2, t.y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;

    // Blink briefly during post-shield invulnerability
    if (player.invulnTimer > 0 && Math.floor(timeElapsed * 20) % 2 === 0) {
      return;
    }

    const cx = player.x - player.recoil + player.size / 2;
    const cy = player.y + player.size / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Active Shield Aura
    if (player.shield) {
      ctx.beginPath();
      ctx.arc(0, 0, player.size * 0.78, 0, Math.PI * 2);
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Forward Blaster Barrel (always faces right)
    ctx.fillStyle = player.rapidTimer > 0 ? palette.accent : palette.ink;
    ctx.fillRect(player.size * 0.38, -4, 11, 8);

    // Rotating Runner Chassis
    ctx.rotate(player.rotation);
    ctx.scale(2 - player.squash, player.squash);

    const half = player.size / 2;
    ctx.beginPath();
    ctx.roundRect(-half, -half, player.size, player.size, 6);
    ctx.fillStyle = palette.ink;
    ctx.fill();

    // Inner Dual-Polarity Core
    ctx.beginPath();
    ctx.roundRect(-half + 6, -half + 6, player.size - 12, player.size - 12, 3);
    ctx.fillStyle = palette.accent;
    ctx.fill();

    // Gravity direction pip
    ctx.beginPath();
    ctx.arc(0, player.gravityDir * 3, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = palette.accentInk;
    ctx.fill();

    ctx.restore();
  }

  function drawPopups() {
    ctx.font = '800 11px "Unbounded", sans-serif';
    ctx.textAlign = "center";
    for (let i = 0; i < popups.length; i++) {
      const pop = popups[i];
      ctx.globalAlpha = Math.max(0, pop.life / pop.maxLife);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    ctx.save();

    if (shakeTime > 0) {
      const dx = (Math.random() - 0.5) * shakeIntensity;
      const dy = (Math.random() - 0.5) * shakeIntensity;
      ctx.translate(dx, dy);
    }

    // Concrete backdrop
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle parallax concrete grid
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let x = -gridOffset; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, CEIL_Y);
      ctx.lineTo(x, FLOOR_Y);
      ctx.stroke();
    }

    // Center horizon guide
    ctx.save();
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.restore();

    drawRailWithVoids("ceil");
    drawRailWithVoids("floor");
    drawBoosts();
    drawHazards();
    drawBullets();

    // Particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    drawPlayer();
    drawPopups();

    ctx.restore();
  }

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
    lastTime = timestamp;

    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // Controls (Canvas Tap + Dedicated FLIP & FIRE buttons + Keyboard)
  canvas.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    flipGravity();
  });

  if (flipBtn) {
    flipBtn.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      flipGravity();
    });
  }

  if (fireBtn) {
    fireBtn.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      fireBlaster();
    });
  }

  if (startBtn) {
    startBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      resetGame(true);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      resetGame(true);
    });
  }

  window.addEventListener("keydown", function (e) {
    if (document.body.classList.contains("modal-open")) return;
    const tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    const rect = canvas.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "ArrowDown") {
      if (state === "running" || e.code === "Space") {
        e.preventDefault();
        flipGravity();
      }
    } else if (e.code === "KeyF" || e.code === "Enter") {
      if (state === "running") {
        e.preventDefault();
        fireBlaster();
      }
    }
  });

  window.addEventListener("portfolio-theme-change", refreshPalette);

  resetGame(false);
  requestAnimationFrame(loop);
})();