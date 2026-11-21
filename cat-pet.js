/* =========================================================
   PORTFOLIO V0.6.1 — ROAMING PIXEL ALLEY CAT & 3D PET INSPECTOR
   84x84 Wall-Climbing & Slab-Hopping Desktop Pet
   Theme-Inverting Coat: Black/White (Light) <-> White/Black (Dark)
   360° Resident Evil-Style 3D Raycast Petting Modal (Three.js)
   ========================================================= */

window.AlleyCat = (function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let catEnabled = localStorage.getItem("kai_v06_cat") !== "off";
  let openInspectorFn = null;
  let syncToggleUiFn = null;
  let sync3dCoatFn = null;
  let forceRedraw2dFn = null;

  function isDarkMode() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function isOverlayBlocking() {
    return (
      document.body.classList.contains("lounge-open") ||
      document.body.classList.contains("theater-open") ||
      document.body.classList.contains("modal-open")
    );
  }

  /* =========================================================
     PART 1: SCREEN-ROAMING, WALL-CLIMBING & SLAB-HOPPING CAT
     ========================================================= */
  function initRoamingCat() {
    const canvas = document.getElementById("roamingCatCanvas");
    const navCatBtn = document.getElementById("navCatBtn");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const SIZE = 84;
    const GRID = 34; // Crisp 34x34 pixel sprite scaled cleanly to 84x84
    canvas.width = GRID;
    canvas.height = GRID;

    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;

    window.addEventListener(
      "pointermove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      },
      { passive: true }
    );

    const cat = {
      x: Math.min(window.innerWidth - SIZE - 48, 190),
      y: window.innerHeight - SIZE + 6,
      vx: 1.25,
      vy: 0,
      dir: 1,
      state: "walk_floor",
      timer: 220,
      animTick: 0,
      blinkTimer: 160,
      targetSlab: null,
      slabOffsetX: 64,
      wallSide: "left"
    };

    function syncCatVisibility() {
      const shouldHide = !catEnabled || isOverlayBlocking();
      canvas.classList.toggle("is-hidden", shouldHide);
      if (navCatBtn) {
        navCatBtn.classList.toggle("is-off", !catEnabled);
        navCatBtn.setAttribute("aria-pressed", String(catEnabled));
      }
    }
    syncToggleUiFn = syncCatVisibility;

    function toggleCat() {
      catEnabled = !catEnabled;
      localStorage.setItem("kai_v06_cat", catEnabled ? "on" : "off");
      syncCatVisibility();
      if (catEnabled && window.CRTConsole && window.CRTConsole.playCatChirp) {
        window.CRTConsole.playCatChirp();
      } else if (window.CRTConsole && window.CRTConsole.playKeySwitch) {
        window.CRTConsole.playKeySwitch(0);
      }
    }

    if (navCatBtn) navCatBtn.addEventListener("click", toggleCat);

    window.addEventListener("keydown", (e) => {
      if (
        isOverlayBlocking() ||
        ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
      ) {
        return;
      }
      if (e.code === "KeyC") toggleCat();
    });

    canvas.addEventListener("click", () => {
      if (typeof openInspectorFn === "function") openInspectorFn();
    });

    function findReachableSlab() {
      const slabs = Array.from(document.querySelectorAll(".concrete-slab"));
      const visible = slabs.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 180 && r.top > 120 && r.top < window.innerHeight - 100;
      });
      if (!visible.length) return null;
      return visible[(Math.random() * visible.length) | 0];
    }

    function launchJumpTo(destX, destY, targetSlab = null) {
      const dx = destX - cat.x;
      const dy = destY - cat.y;
      const frames = 32;
      cat.vx = dx / frames;
      cat.vy = (dy - 0.5 * 0.48 * frames * frames) / frames;
      cat.dir = dx >= 0 ? 1 : -1;
      cat.targetSlab = targetSlab;
      if (targetSlab) {
        const r = targetSlab.getBoundingClientRect();
        cat.slabOffsetX = Math.max(20, Math.min(r.width - SIZE - 20, destX - r.left));
      }
      cat.state = "jump";
      cat.timer = frames;
    }

    function pickNextFloorAction() {
      const roll = Math.random();
      if (roll < 0.22) {
        cat.state = "sit";
        cat.timer = 110 + ((Math.random() * 110) | 0);
      } else if (roll < 0.36) {
        cat.state = "lick";
        cat.timer = 120 + ((Math.random() * 80) | 0);
      } else if (roll < 0.48) {
        cat.state = "stretch";
        cat.timer = 95 + ((Math.random() * 45) | 0);
      } else if (roll < 0.58) {
        cat.state = "yawn";
        cat.timer = 85 + ((Math.random() * 35) | 0);
      } else if (roll < 0.68) {
        cat.state = "look_user";
        cat.timer = 115 + ((Math.random() * 75) | 0);
      } else if (roll < 0.84) {
        const slab = findReachableSlab();
        if (slab) {
          const r = slab.getBoundingClientRect();
          const landX = r.left + 28 + Math.random() * Math.max(20, r.width - SIZE - 56);
          launchJumpTo(landX, r.top - SIZE + 10, slab);
          return;
        }
        cat.state = "walk_floor";
        cat.dir = Math.random() > 0.5 ? 1 : -1;
        cat.timer = 160 + ((Math.random() * 180) | 0);
      } else {
        cat.state = "walk_floor";
        cat.dir = Math.random() > 0.5 ? 1 : -1;
        cat.timer = 180 + ((Math.random() * 180) | 0);
      }
    }

    function updatePhysics() {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const floorY = H - SIZE + 6;

      cat.animTick++;
      cat.blinkTimer--;
      if (cat.blinkTimer < -8) cat.blinkTimer = 140 + ((Math.random() * 180) | 0);

      if (cat.state === "walk_floor") {
        cat.y = floorY;
        cat.x += cat.dir * 1.28;
        cat.timer--;

        if (cat.x <= 2) {
          cat.x = 2;
          if (Math.random() < 0.55) {
            cat.state = "climb_wall";
            cat.wallSide = "left";
            cat.dir = -1;
            cat.vy = -1.25;
            cat.timer = 130 + ((Math.random() * 120) | 0);
            return;
          }
          cat.dir = 1;
        } else if (cat.x >= W - SIZE - 2) {
          cat.x = W - SIZE - 2;
          if (Math.random() < 0.55) {
            cat.state = "climb_wall";
            cat.wallSide = "right";
            cat.dir = 1;
            cat.vy = -1.25;
            cat.timer = 130 + ((Math.random() * 120) | 0);
            return;
          }
          cat.dir = -1;
        }

        if (cat.timer <= 0) pickNextFloorAction();
      } else if (cat.state === "climb_wall") {
        cat.x = cat.wallSide === "left" ? 0 : W - SIZE;
        cat.y += cat.vy;
        cat.timer--;

        if (cat.y < 110) {
          cat.y = 110;
          cat.vy = 1.2;
        }

        if (cat.y >= floorY) {
          cat.y = floorY;
          cat.dir = cat.wallSide === "left" ? 1 : -1;
          cat.state = "walk_floor";
          cat.timer = 160;
          return;
        }

        if (cat.timer <= 0) {
          const slab = findReachableSlab();
          if (slab) {
            const r = slab.getBoundingClientRect();
            const landX = r.left + 28 + Math.random() * Math.max(20, r.width - SIZE - 56);
            launchJumpTo(landX, r.top - SIZE + 10, slab);
          } else {
            const landX =
              cat.wallSide === "left"
                ? 96 + Math.random() * 140
                : W - SIZE - 96 - Math.random() * 140;
            launchJumpTo(landX, floorY, null);
          }
        }
      } else if (cat.state === "jump") {
        cat.x += cat.vx;
        cat.y += cat.vy;
        cat.vy += 0.48;
        cat.timer--;

        if (cat.targetSlab && cat.timer <= 0) {
          const r = cat.targetSlab.getBoundingClientRect();
          if (r.top > 85 && r.top < H - 30) {
            cat.y = r.top - SIZE + 10;
            cat.x = Math.max(r.left + 14, Math.min(r.right - SIZE - 14, r.left + cat.slabOffsetX));
            cat.state = Math.random() < 0.5 ? "walk_slab" : "sit_slab";
            cat.timer = 140 + ((Math.random() * 120) | 0);
            return;
          }
          cat.targetSlab = null;
        }

        if (cat.y >= floorY) {
          cat.y = floorY;
          cat.targetSlab = null;
          cat.state = "walk_floor";
          cat.timer = 140;
        }
      } else if (cat.state === "walk_slab" || cat.state === "sit_slab") {
        if (!cat.targetSlab) {
          launchJumpTo(cat.x, floorY, null);
          return;
        }
        const r = cat.targetSlab.getBoundingClientRect();
        if (r.top < 80 || r.top > H - 36) {
          cat.targetSlab = null;
          launchJumpTo(Math.max(30, Math.min(W - SIZE - 30, cat.x)), floorY, null);
          return;
        }

        cat.y = r.top - SIZE + 10;
        if (cat.state === "walk_slab") {
          cat.slabOffsetX += cat.dir * 1.05;
          if (cat.slabOffsetX < 16) {
            cat.slabOffsetX = 16;
            cat.dir = 1;
          } else if (cat.slabOffsetX > r.width - SIZE - 16) {
            cat.slabOffsetX = r.width - SIZE - 16;
            cat.dir = -1;
          }
        }
        cat.x = r.left + cat.slabOffsetX;
        cat.timer--;

        if (cat.timer <= 0) {
          if (Math.random() < 0.45) {
            cat.state = cat.state === "walk_slab" ? "sit_slab" : "walk_slab";
            cat.timer = 120 + ((Math.random() * 90) | 0);
          } else {
            cat.targetSlab = null;
            const dropX = Math.max(40, Math.min(W - SIZE - 40, cat.x + cat.dir * 105));
            launchJumpTo(dropX, floorY, null);
          }
        }
      } else {
        cat.y = floorY;
        cat.timer--;
        if (cat.state === "look_user") {
          cat.dir = mouseX >= cat.x + SIZE * 0.5 ? 1 : -1;
        }
        if (cat.timer <= 0) {
          cat.state = "walk_floor";
          cat.dir = Math.random() > 0.5 ? 1 : -1;
          cat.timer = 170 + ((Math.random() * 190) | 0);
        }
      }

      cat.x = Math.max(0, Math.min(W - SIZE, cat.x));
    }

    /* ---------------------------------------------------------
       CRISP 34x34 PIXEL-ART CAT RENDERER (POLARITY-INVERTING COAT)
       Light Mode -> Black Tuxedo Cat w/ White Socks & Chest
       Dark Mode  -> Snow-White Cat w/ Charcoal-Black Accents
       --------------------------------------------------------- */
    function px(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    function drawPixelCat() {
      ctx.clearRect(0, 0, GRID, GRID);

      const dark = isDarkMode();
      const fur = dark ? "#f1f3f7" : "#191a20";
      const furHi = dark ? "#cfd5e2" : "#30333e";
      const patch = dark ? "#1c1f28" : "#eceef2";
      const eyeCol = dark ? "#0f766e" : "#fde047";
      const eyeGlint = dark ? "#64e3db" : "#fffbeb";
      const noseCol = "#f472b6";

      const t = cat.animTick;
      const blinking = cat.blinkTimer < 0;

      ctx.save();

      if (cat.state === "climb_wall") {
        if (cat.wallSide === "left") {
          ctx.translate(GRID, 0);
          ctx.scale(-1, 1);
        }
        const climbStep = Math.floor(t / 8) % 2;
        const wag = Math.round(Math.sin(t * 0.16) * 2);
        px(20, 25 + wag, 3, 6, fur);
        px(18, 28 + wag, 3, 3, patch);
        px(21, 11, 8, 15, fur);
        px(23, 13, 3, 10, furHi);
        px(21, 5, 9, 7, fur);
        px(22, 3, 2, 3, patch);
        px(27, 3, 2, 3, fur);
        if (!blinking) {
          px(27, 7, 2, 2, eyeCol);
          px(28, 7, 1, 1, eyeGlint);
        }
        px(28, 10 + climbStep * 3, 4, 3, patch);
        px(28, 20 - climbStep * 3, 4, 3, patch);
        ctx.restore();
        return;
      }

      if (cat.dir < 0) {
        ctx.translate(GRID, 0);
        ctx.scale(-1, 1);
      }

      const wag = Math.round(Math.sin(t * 0.14) * 2);

      if (cat.state === "stretch") {
        px(4, 15 + wag, 4, 2, patch);
        px(7, 13 + wag, 2, 6, fur);
        px(8, 18, 8, 8, fur);
        px(14, 21, 7, 6, fur);
        px(10, 19, 5, 2, furHi);
        px(9, 25, 3, 6, fur);
        px(9, 29, 3, 2, patch);
        px(21, 28, 8, 3, fur);
        px(26, 29, 4, 2, patch);
        px(19, 20, 9, 8, fur);
        px(20, 18, 2, 3, patch);
        px(25, 18, 2, 3, fur);
        px(23, 23, 3, 1, eyeCol);
        px(27, 25, 1, 1, noseCol);
      } else if (
        cat.state === "sit" ||
        cat.state === "sit_slab" ||
        cat.state === "lick" ||
        cat.state === "yawn" ||
        cat.state === "look_user"
      ) {
        px(5, 25 + (wag > 0 ? 1 : 0), 6, 3, fur);
        px(4, 23 + wag, 3, 4, patch);
        px(10, 18, 11, 13, fur);
        px(12, 20, 5, 7, furHi);
        px(16, 22, 4, 6, patch);
        px(16, 29, 5, 2, patch);
        px(10, 29, 4, 2, patch);

        const headBob = cat.state === "lick" ? Math.round(Math.sin(t * 0.25) * 1.5) : 0;
        px(12, 10 + headBob, 11, 9, fur);
        px(13, 7 + headBob, 2, 3, patch);
        px(14, 8 + headBob, 1, 2, noseCol);
        px(20, 7 + headBob, 2, 3, fur);
        px(20, 8 + headBob, 1, 2, noseCol);

        if (cat.state === "look_user") {
          if (!blinking) {
            px(14, 13, 2, 2, eyeCol);
            px(19, 13, 2, 2, eyeCol);
            px(15, 13, 1, 1, eyeGlint);
            px(20, 13, 1, 1, eyeGlint);
          } else {
            px(14, 14, 2, 1, eyeCol);
            px(19, 14, 2, 1, eyeCol);
          }
          px(17, 15, 1, 1, noseCol);
        } else if (cat.state === "yawn") {
          px(15, 13, 2, 1, eyeCol);
          px(19, 13, 2, 1, eyeCol);
          if (Math.sin(t * 0.12) > -0.2) {
            px(18, 15, 4, 3, noseCol);
            px(19, 15, 2, 1, "#ffffff");
          } else {
            px(21, 15, 1, 1, noseCol);
          }
        } else if (cat.state === "lick") {
          px(15, 13 + headBob, 2, 1, eyeCol);
          px(19, 13 + headBob, 2, 1, eyeCol);
          const pawLift = Math.round(Math.sin(t * 0.25) * 2);
          px(21, 16 + pawLift, 4, 3, patch);
          if (pawLift < 0) px(21, 15 + headBob, 2, 2, noseCol);
        } else {
          if (!blinking) {
            px(16, 13, 2, 2, eyeCol);
            px(20, 13, 2, 2, eyeCol);
            px(17, 13, 1, 1, eyeGlint);
            px(21, 13, 1, 1, eyeGlint);
          } else {
            px(16, 14, 2, 1, eyeCol);
            px(20, 14, 2, 1, eyeCol);
          }
          px(22, 15, 1, 1, noseCol);
        }
      } else {
        const step = cat.state === "jump" ? 2 : Math.floor(t / 7) % 4;
        const legA = step === 0 ? 1 : step === 2 ? -1 : 0;
        const legB = -legA;
        const bob = step % 2 === 1 ? -1 : 0;

        px(4, 17 + wag + bob, 4, 2, patch);
        px(6, 19 + bob, 4, 2, fur);
        px(9, 18 + bob, 13, 8, fur);
        px(11, 19 + bob, 8, 3, furHi);
        px(18, 22 + bob, 4, 3, patch);
        px(10 + legA, 25 + bob, 3, 6, fur);
        px(10 + legA, 29 + bob, 3, 2, patch);
        px(18 + legB, 25 + bob, 3, 6, fur);
        px(18 + legB, 29 + bob, 3, 2, patch);
        px(19, 12 + bob, 10, 8, fur);
        px(20, 9 + bob, 2, 3, patch);
        px(26, 9 + bob, 2, 3, fur);
        px(21, 10 + bob, 1, 2, noseCol);
        px(26, 10 + bob, 1, 2, noseCol);
        if (!blinking) {
          px(24, 15 + bob, 2, 2, eyeCol);
          px(25, 15 + bob, 1, 1, eyeGlint);
        } else {
          px(24, 16 + bob, 2, 1, eyeCol);
        }
        px(28, 17 + bob, 1, 1, noseCol);
      }

      ctx.restore();
    }

    forceRedraw2dFn = drawPixelCat;

    function loop() {
      requestAnimationFrame(loop);
      syncCatVisibility();
      if (!catEnabled || isOverlayBlocking() || prefersReducedMotion) return;

      updatePhysics();
      drawPixelCat();
      canvas.style.transform = `translate3d(${Math.round(cat.x)}px, ${Math.round(cat.y)}px, 0)`;
    }

    syncCatVisibility();
    drawPixelCat();
    canvas.style.transform = `translate3d(${Math.round(cat.x)}px, ${Math.round(cat.y)}px, 0)`;
    loop();
  }

  /* =========================================================
     PART 2: RESIDENT EVIL STYLE 360° 3D ALLEY CAT INSPECTOR
     ========================================================= */
  function initCat3DInspector() {
    const modal = document.getElementById("catInspectorModal");
    const canvas = document.getElementById("cat3dCanvas");
    const badgeEl = document.getElementById("catReactionBadge");
    const statusEl = document.getElementById("catInspectStatus");
    const closeBtn = document.getElementById("catInspectCloseBtn");
    const resetBtn = document.getElementById("catResetViewBtn");

    if (!modal || !canvas || !window.THREE) return;
    const THREE = window.THREE;

    let renderer = null;
    let scene = null;
    let camera = null;
    let catRoot = null;
    let headGroup = null;
    let leftEye = null;
    let rightEye = null;
    let leftEar = null;
    let rightEar = null;
    let tailGroup = null;
    let pawFL = null;
    let pawFR = null;
    let furMat = null;
    let bellyMat = null;
    let eyeMat = null;
    let raycastTargets = [];

    let isOpen = false;
    let rafId = null;

    let rotX = 0.14;
    let rotY = -0.36;
    let velX = 0;
    let velY = 0;
    let curZoom = 5.6;
    let targetZoom = 4.6;
    let dragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let lastPos = { x: 0, y: 0 };

    let reactionType = "idle";
    let reactionTimer = 0;
    let animTime = 0;

    function apply3dCoatPolarity() {
      if (!furMat || !bellyMat || !eyeMat) return;
      const dark = isDarkMode();
      if (dark) {
        // Dark Mode: Inverted Snow-White Cat with Charcoal Accents & Glacial Cyan Eyes
        furMat.color.setHex(0xf1f3f7);
        bellyMat.color.setHex(0x1b1e27);
        eyeMat.color.setHex(0x64e3db);
        eyeMat.emissive.setHex(0x2ea8a0);
      } else {
        // Light Mode: Tuxedo Black Cat with White Chest/Socks & Amber Eyes
        furMat.color.setHex(0x22242c);
        bellyMat.color.setHex(0xe8eaef);
        eyeMat.color.setHex(0xfde047);
        eyeMat.emissive.setHex(0xfacc15);
      }
    }
    sync3dCoatFn = apply3dCoatPolarity;

    function tagZone(mesh, zoneName) {
      mesh.userData.zone = zoneName;
      raycastTargets.push(mesh);
      return mesh;
    }

    function buildLowPolyCat() {
      raycastTargets = [];
      const root = new THREE.Group();

      furMat = new THREE.MeshStandardMaterial({
        color: 0x22242c,
        roughness: 0.78,
        metalness: 0.08,
        flatShading: true
      });

      bellyMat = new THREE.MeshStandardMaterial({
        color: 0xe8eaef,
        roughness: 0.82,
        metalness: 0.04,
        flatShading: true
      });

      const pinkMat = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        roughness: 0.55,
        flatShading: true
      });

      eyeMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xfacc15,
        emissiveIntensity: 0.72,
        roughness: 0.2
      });

      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

      // TORSO / BELLY
      const torso = tagZone(new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.92, 1.85), furMat), "belly");
      torso.position.set(0, 0.15, 0);
      root.add(torso);

      const chestPatch = tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.58, 1.56), bellyMat), "belly");
      chestPatch.position.set(0, -0.08, 0.16);
      root.add(chestPatch);

      // HEAD GROUP
      headGroup = new THREE.Group();
      headGroup.position.set(0, 0.72, 0.96);
      root.add(headGroup);

      const skull = tagZone(new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.92, 0.96), furMat), "head");
      headGroup.add(skull);

      const muzzle = tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.36, 0.32), bellyMat), "head");
      muzzle.position.set(0, -0.18, 0.48);
      headGroup.add(muzzle);

      const nose = tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.12), pinkMat), "head");
      nose.position.set(0, -0.08, 0.64);
      headGroup.add(nose);

      // Ears (Asymmetric Tuxedo / Inverted Accent Ear)
      leftEar = new THREE.Group();
      leftEar.position.set(-0.34, 0.56, 0.06);
      const earConeL = tagZone(new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.46, 4), bellyMat), "head");
      earConeL.rotation.y = Math.PI * 0.25;
      const earInL = tagZone(new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 4), pinkMat), "head");
      earInL.position.set(0, -0.02, 0.08);
      earInL.rotation.y = Math.PI * 0.25;
      leftEar.add(earConeL, earInL);
      headGroup.add(leftEar);

      rightEar = new THREE.Group();
      rightEar.position.set(0.34, 0.56, 0.06);
      const earConeR = tagZone(new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.46, 4), furMat), "head");
      earConeR.rotation.y = Math.PI * 0.25;
      const earInR = tagZone(new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 4), pinkMat), "head");
      earInR.position.set(0, -0.02, 0.08);
      earInR.rotation.y = Math.PI * 0.25;
      rightEar.add(earConeR, earInR);
      headGroup.add(rightEar);

      // Eyes
      leftEye = new THREE.Group();
      leftEye.position.set(-0.26, 0.08, 0.49);
      leftEye.add(tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.06), eyeMat), "head"));
      leftEye.add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), pupilMat));
      headGroup.add(leftEye);

      rightEye = new THREE.Group();
      rightEye.position.set(0.26, 0.08, 0.49);
      rightEye.add(tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.06), eyeMat), "head"));
      rightEye.add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), pupilMat));
      headGroup.add(rightEye);

      // Paws with Contrasting Socks
      function makeLeg(x, z, isFront) {
        const g = new THREE.Group();
        g.position.set(x, -0.28, z);
        const leg = tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.68, 0.3), furMat), "paw");
        leg.position.y = -0.26;
        const sock = tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.24, 0.36), bellyMat), "paw");
        sock.position.set(0, -0.58, isFront ? 0.05 : 0.03);
        g.add(leg, sock);
        return g;
      }

      pawFL = makeLeg(-0.38, 0.66, true);
      pawFR = makeLeg(0.38, 0.66, true);
      const pawBL = makeLeg(-0.38, -0.66, false);
      const pawBR = makeLeg(0.38, -0.66, false);
      root.add(pawFL, pawFR, pawBL, pawBR);

      // Articulated Tail
      tailGroup = new THREE.Group();
      tailGroup.position.set(0, 0.36, -0.92);
      const t1 = tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.68, 0.2), furMat), "tail");
      t1.position.set(0, 0.28, -0.18);
      t1.rotation.x = -0.45;
      const t2 = tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), furMat), "tail");
      t2.position.set(0, 0.78, -0.34);
      t2.rotation.x = -0.15;
      const tTip = tagZone(new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.2, 0.19), bellyMat), "tail");
      tTip.position.set(0, 1.06, -0.36);
      tailGroup.add(t1, t2, tTip);
      root.add(tailGroup);

      // Inspection Pedestal Ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.45, 0.025, 8, 48),
        new THREE.MeshBasicMaterial({ color: 0x64e3db, transparent: true, opacity: 0.34 })
      );
      ring.rotation.x = Math.PI * 0.5;
      ring.position.y = -1.04;
      root.add(ring);

      apply3dCoatPolarity();
      return root;
    }

    function triggerReaction(zone) {
      reactionType = zone;
      reactionTimer = 55;

      if (zone === "head") {
        if (badgeEl) badgeEl.textContent = "MOOD: PURRING (HAPPY)";
        if (statusEl) statusEl.textContent = "Miong squints happily and leans into your hand with a warm low purr.";
        if (window.CRTConsole && window.CRTConsole.playCatPurr) window.CRTConsole.playCatPurr();
      } else if (zone === "belly") {
        if (badgeEl) badgeEl.textContent = "MOOD: STARTLED BELLY TRAP!";
        if (statusEl) statusEl.textContent = "Tummy tap detected! Miong squirms playfully and lets out a dramatic meow.";
        if (window.CRTConsole && window.CRTConsole.playCatMeow) window.CRTConsole.playCatMeow();
      } else if (zone === "paw") {
        if (badgeEl) badgeEl.textContent = "MOOD: PAW HIGH-FIVE";
        if (statusEl) statusEl.textContent = "Gentle paw tap! Miong lifts its paw with a cheerful chirp.";
        if (window.CRTConsole && window.CRTConsole.playCatChirp) window.CRTConsole.playCatChirp();
      } else {
        if (badgeEl) badgeEl.textContent = "MOOD: TAIL FLICK";
        if (statusEl) statusEl.textContent = "Miong flicks its tail tip and gives you a curious side-glance.";
        if (window.CRTConsole && window.CRTConsole.playCatChirp) window.CRTConsole.playCatChirp();
      }
    }

    function resize() {
      if (!renderer || !camera || !isOpen) return;
      const w = Math.max(320, window.innerWidth);
      const h = Math.max(240, window.innerHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function openInspector() {
      if (isOpen) return;
      isOpen = true;
      rotX = 0.14;
      rotY = -0.36;
      velX = 0;
      velY = 0;
      curZoom = 6.0;
      targetZoom = 4.6;
      reactionType = "idle";
      reactionTimer = 0;

      if (badgeEl) badgeEl.textContent = isDarkMode() ? "COAT: INVERTED SNOW" : "COAT: TUXEDO NOIR";
      if (statusEl) {
        statusEl.textContent =
          "Drag to rotate 360°. Tap its head to pet, tap its belly at your own risk, or tap its paws for a high-five.";
      }

      document.body.classList.add("modal-open");
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      if (typeof syncToggleUiFn === "function") syncToggleUiFn();
      if (window.CRTConsole && window.CRTConsole.syncRain) window.CRTConsole.syncRain();

      if (!renderer) {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);

        scene.add(new THREE.AmbientLight(0xffffff, 0.72));
        const keyLight = new THREE.DirectionalLight(0xfff5e0, 0.95);
        keyLight.position.set(4, 7, 6);
        scene.add(keyLight);

        const rimLight = new THREE.PointLight(0x64e3db, 1.5, 20);
        rimLight.position.set(-4, 2, -4);
        scene.add(rimLight);

        const alleyNeon = new THREE.PointLight(0xf43f5e, 1.1, 18);
        alleyNeon.position.set(4, -2, -3);
        scene.add(alleyNeon);

        catRoot = buildLowPolyCat();
        scene.add(catRoot);
      } else {
        apply3dCoatPolarity();
      }

      resize();
      if (window.CRTConsole && window.CRTConsole.playCatChirp) window.CRTConsole.playCatChirp();
      if (window.gsap) {
        window.gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: "power2.out" });
      }

      function loop() {
        if (!isOpen) return;
        rafId = requestAnimationFrame(loop);
        animTime += 0.04;

        if (!dragging) {
          rotY += velY;
          rotX += velX;
          velY *= 0.93;
          velX *= 0.93;
        }
        rotX = Math.max(-1.25, Math.min(1.25, rotX));
        curZoom += (targetZoom - curZoom) * 0.1;
        camera.position.set(0, 0.25, curZoom);

        if (catRoot) {
          catRoot.rotation.y += (rotY - catRoot.rotation.y) * 0.14;
          catRoot.rotation.x += (rotX - catRoot.rotation.x) * 0.14;

          catRoot.position.y = Math.sin(animTime * 1.4) * 0.05;
          catRoot.rotation.z *= 0.85;
          if (tailGroup) tailGroup.rotation.z = Math.sin(animTime * 2.2) * 0.22;
          if (headGroup) {
            headGroup.rotation.x *= 0.85;
            headGroup.rotation.z *= 0.85;
          }
          if (leftEye && rightEye) {
            leftEye.scale.y += (1 - leftEye.scale.y) * 0.2;
            rightEye.scale.y += (1 - rightEye.scale.y) * 0.2;
          }
          if (leftEar && rightEar) {
            leftEar.rotation.z += (0 - leftEar.rotation.z) * 0.18;
            rightEar.rotation.z += (0 - rightEar.rotation.z) * 0.18;
          }
          if (pawFL && pawFR) {
            pawFL.rotation.x += (0 - pawFL.rotation.x) * 0.18;
            pawFR.rotation.x += (0 - pawFR.rotation.x) * 0.18;
          }

          if (reactionTimer > 0) {
            reactionTimer--;
            const p = reactionTimer / 55;
            if (reactionType === "head") {
              if (leftEye && rightEye) {
                leftEye.scale.y = 0.24;
                rightEye.scale.y = 0.24;
              }
              if (headGroup) {
                headGroup.rotation.x = Math.sin(animTime * 5) * 0.16;
                headGroup.rotation.z = Math.sin(animTime * 3.5) * 0.12;
              }
              if (leftEar && rightEar) {
                leftEar.rotation.z = 0.28 * p;
                rightEar.rotation.z = -0.28 * p;
              }
            } else if (reactionType === "belly") {
              catRoot.rotation.z = Math.sin(animTime * 10) * 0.34 * p;
              catRoot.position.y = Math.abs(Math.sin(animTime * 7)) * 0.26 * p;
              if (tailGroup) tailGroup.rotation.z = Math.sin(animTime * 12) * 0.65;
            } else if (reactionType === "paw") {
              if (pawFR) pawFR.rotation.x = -1.25 * Math.sin(p * Math.PI);
              if (pawFL) pawFL.rotation.x = -0.45 * Math.sin(p * Math.PI);
              if (headGroup) headGroup.rotation.z = 0.18 * p;
            } else if (reactionType === "tail") {
              if (tailGroup) tailGroup.rotation.z = Math.sin(animTime * 14) * 0.72;
              if (headGroup) headGroup.rotation.y = Math.sin(p * Math.PI) * 0.45;
            }
          }
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
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (typeof syncToggleUiFn === "function") syncToggleUiFn();
      if (window.CRTConsole && window.CRTConsole.syncRain) window.CRTConsole.syncRain();
    }

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    canvas.addEventListener("pointerdown", (e) => {
      if (!isOpen) return;
      dragging = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      lastPos = { x: e.clientX, y: e.clientY };
      velX = 0;
      velY = 0;
    });

    window.addEventListener("pointermove", (e) => {
      if (!isOpen || !dragging) return;
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      lastPos = { x: e.clientX, y: e.clientY };
      velY = dx * 0.009;
      velX = dy * 0.009;
      rotY += velY;
      rotX += velX;
    });

    window.addEventListener("pointerup", (e) => {
      if (!isOpen || !dragging) return;
      dragging = false;

      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moveDist < 7 && camera && raycastTargets.length) {
        const rect = canvas.getBoundingClientRect();
        pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(raycastTargets, false);
        if (hits.length > 0) {
          triggerReaction(hits[0].object.userData.zone || "head");
        }
      }
    });

    canvas.addEventListener(
      "wheel",
      (e) => {
        if (!isOpen) return;
        e.preventDefault();
        targetZoom = Math.max(2.7, Math.min(7.2, targetZoom + e.deltaY * 0.003));
      },
      { passive: false }
    );

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        rotX = 0.14;
        rotY = -0.36;
        velX = 0;
        velY = 0;
        targetZoom = 4.6;
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", closeInspector);
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", (e) => {
      if (e.code === "Escape" && isOpen) closeInspector();
    });

    openInspectorFn = openInspector;
  }

  function syncTheme() {
    if (typeof sync3dCoatFn === "function") sync3dCoatFn();
    if (typeof forceRedraw2dFn === "function") forceRedraw2dFn();
  }

  function init() {
    initCat3DInspector();
    initRoamingCat();
  }

  return {
    init,
    syncTheme,
    openInspector: () => typeof openInspectorFn === "function" && openInspectorFn()
  };
})();