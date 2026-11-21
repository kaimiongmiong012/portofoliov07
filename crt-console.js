/* =========================================================
   KAI-VISION TJOC × FNAF HORROR ARCADE ENGINE (V0.7.1)
   Scroll-Proximity Back-Alley Rain Audio • Door-Pull Entry
   4 Distant Full-Body Cabinets • Eerie Music-Box + Static
   Camera Glide -> Reveal Title -> Real Coin Slot Insertion
   ========================================================= */

window.CRTConsole = (function () {
  let audioCtx = null;
  let isMuted = false;
  let activeGame = null;
  let activeCartId = null;
  let selectedCartId = "runner";
  let isTransitioning = false;
  let loungeOpen = false;
  let currentView = "hall"; // "hall" | "closeup"

  let staticRafId = null;
  let hallStaticRafId = null;
  let closeupStaticRafId = null;
  let fogRafId = null;
  let dustRafId = null;
  let rainRafId = null;
  let povRafId = null;
  let clockIntervalId = null;
  let musicBoxTimerId = null;
  let portfolioMelodyTimerId = null;
  let portfolioMusicGain = null;

  let ambientNodes = null;
  let rainAudioNodes = null;
  let updateRainVolumeFn = null;

  // Color profiles for each machine's spotlight & close-up horror theme
  const LAMP_THEMES = {
    runner: { rgb: "56, 189, 248", hex: "#38bdf8", tint: [0.88, 1.02, 1.1] },
    grimoire: { rgb: "168, 85, 247", hex: "#a855f7", tint: [1.04, 0.88, 1.12] },
    campus: { rgb: "245, 158, 11", hex: "#f59e0b", tint: [1.1, 0.96, 0.82] },
    monolith: { rgb: "220, 38, 38", hex: "#dc2626", tint: [1.16, 0.76, 0.76] }
  };

  function ensureAudio() {
    if (isMuted) return null;
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  /* ---------------------------------------------------------
     PROCEDURAL WEB AUDIO SYNTH API (SHARED ACROSS PORTFOLIO)
     --------------------------------------------------------- */
  function tone(freq = 440, dur = 0.1, type = "triangle", gainVal = 0.06, endFreq = null) {
    const ctx = ensureAudio();
    if (!ctx || isMuted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freq), now);
    if (endFreq && endFreq > 20) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function noise(dur = 0.12, gainVal = 0.08, cutoff = 1800) {
    const ctx = ensureAudio();
    if (!ctx || isMuted) return;
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - (i / bufferSize) * 0.65);
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  /* ---------------------------------------------------------
     HARDWARE, COIN-OP, SLOT REEL & ALLEY CAT SFX
     --------------------------------------------------------- */
  function playKeySwitch(pitchOffset = 0) {
    if (isMuted) return;
    noise(0.032, 0.055, 3200);
    tone(260 + pitchOffset * 45, 0.04, "square", 0.028, 140 + pitchOffset * 20);
    setTimeout(() => {
      tone(520 + pitchOffset * 70, 0.05, "triangle", 0.022, 680 + pitchOffset * 70);
    }, 24);
  }

  function playSlotClick() {
    if (isMuted) return;
    noise(0.035, 0.075, 2400);
    tone(180, 0.045, "square", 0.04, 110);
    setTimeout(() => tone(340, 0.035, "triangle", 0.026, 260), 32);
  }

  function playCoinDrop() {
    if (isMuted) return;
    // Metallic slot clink -> coin chute tumble -> double credit chime
    noise(0.03, 0.07, 4200);
    tone(1560, 0.065, "sine", 0.06, 1610);
    setTimeout(() => tone(2349, 0.14, "sine", 0.065, 2380), 75);
  }

  function playBootCoinClink() {
    if (isMuted) return;
    noise(0.028, 0.075, 4800);
    tone(1680, 0.06, "sine", 0.065, 1740);
    setTimeout(() => tone(2489, 0.16, "sine", 0.07, 2520), 68);
  }

  function playCrtPowerOn() {
    if (isMuted) return;
    // Heavy CRT degauss thump + static snap + subtle tube power-on whine
    tone(92, 0.26, "sawtooth", 0.06, 46);
    noise(0.11, 0.075, 3200);
    setTimeout(() => {
      tone(3400, 0.34, "sine", 0.018, 4800);
      tone(180, 0.22, "triangle", 0.032, 95);
    }, 55);
  }

  function playDegauss() {
    if (isMuted) return;
    tone(110, 0.28, "sawtooth", 0.045, 58);
    tone(220, 0.22, "sine", 0.035, 110);
    noise(0.08, 0.04, 1400);
  }

  function playDoorPullAudio() {
    if (isMuted) return;
    noise(0.045, 0.11, 2400);
    tone(175, 0.05, "square", 0.055, 85);
    setTimeout(() => {
      tone(118, 0.42, "sawtooth", 0.032, 68);
      noise(0.36, 0.045, 520);
    }, 95);
    setTimeout(() => {
      tone(190, 0.26, "sine", 0.025, 110);
    }, 340);
  }

  function playDoorExitAudio() {
    if (isMuted) return;
    tone(145, 0.2, "triangle", 0.045, 62);
    setTimeout(() => {
      noise(0.06, 0.09, 1400);
      tone(95, 0.07, "square", 0.045, 52);
    }, 140);
  }

  function playApproachWhoosh() {
    if (isMuted) return;
    noise(0.38, 0.065, 920);
    tone(88, 0.42, "sine", 0.045, 142);
    setTimeout(() => {
      noise(0.14, 0.05, 2800);
      tone(116, 0.16, "sawtooth", 0.022, 84);
    }, 280);
  }

  function playStepBackAudio() {
    if (isMuted) return;
    noise(0.28, 0.05, 760);
    tone(132, 0.28, "sine", 0.035, 76);
  }

  function playStaticBuzzBurst() {
    if (isMuted || !loungeOpen || activeCartId) return;
    noise(0.24, 0.06, 3600);
    tone(118, 0.22, "sawtooth", 0.026, 92);
    setTimeout(() => tone(1480, 0.04, "square", 0.011, 620), 65);
  }

  function playAlarmBeep() {
    if (isMuted) return;
    [0, 120, 240, 360].forEach((ms) => {
      setTimeout(() => tone(2093, 0.068, "square", 0.045), ms);
    });
  }

  function playCatPurr() {
    const ctx = ensureAudio();
    if (!ctx || isMuted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(52, now);
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(24, now);
    lfoGain.gain.setValueAtTime(14, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(260, now);

    mainGain.gain.setValueAtTime(0.001, now);
    mainGain.gain.linearRampToValueAtTime(0.065, now + 0.14);
    mainGain.gain.linearRampToValueAtTime(0.055, now + 0.55);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.88);
    lfo.stop(now + 0.88);
  }

  function playCatMeow() {
    const ctx = ensureAudio();
    if (!ctx || isMuted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(790, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.38);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1150, now);
    filter.Q.value = 1.6;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.085, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  function playCatChirp() {
    if (isMuted) return;
    tone(680, 0.09, "sine", 0.055, 1120);
    setTimeout(() => tone(940, 0.07, "triangle", 0.04, 1340), 75);
  }

  function playCoinInsertSequence() {
    if (isMuted) return;
    // 1. Brass coin slides into steel slit & falls into coin box
    setTimeout(() => {
      noise(0.04, 0.09, 3600);
      tone(1180, 0.045, "triangle", 0.05, 890);
    }, 220);

    // 2. Credit accepted arcade double-chime
    setTimeout(() => playCoinDrop(), 380);

    // 3. CRT cabinet power surge & ZZZ tube-suction sweep
    setTimeout(() => {
      tone(125, 0.54, "sawtooth", 0.068, 1320);
      tone(70, 0.5, "sine", 0.085, 36);
      noise(0.34, 0.09, 2600);
    }, 660);

    setTimeout(() => {
      noise(0.68, 0.1, 4400);
      tone(980, 0.06, "square", 0.035, 620);
    }, 1120);

    setTimeout(() => {
      tone(587.33, 0.08, "triangle", 0.06);
      setTimeout(() => tone(880, 0.16, "triangle", 0.07, 1174.66), 90);
    }, 1560);
  }

  function playGameExitSequence() {
    if (isMuted) return;
    tone(780, 0.24, "sawtooth", 0.055, 72);
    setTimeout(() => {
      noise(0.1, 0.11, 2000);
      tone(220, 0.08, "square", 0.05, 360);
    }, 130);
  }

  /* ---------------------------------------------------------
     EERIE DETUNED FNAF-STYLE HORROR MUSIC BOX LULLABY
     --------------------------------------------------------- */
  const HORROR_MELODY = [
    { f: 587.33, ms: 720 },
    { f: 698.46, ms: 720 },
    { f: 880.0, ms: 960 },
    { f: 830.61, ms: 1080 },
    { f: 698.46, ms: 720 },
    { f: 659.25, ms: 840 },
    { f: 554.37, ms: 1380 },
    { f: 0, ms: 620 },
    { f: 587.33, ms: 740 },
    { f: 698.46, ms: 740 },
    { f: 932.33, ms: 920 },
    { f: 880.0, ms: 820 },
    { f: 622.25, ms: 980 },
    { f: 587.33, ms: 1650 },
    { f: 0, ms: 1100 }
  ];
  let melodyIdx = 0;

  function triggerMusicBoxPlink(freq, volume, detuneCents = 0) {
    const ctx = ensureAudio();
    if (!ctx || isMuted || !freq) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    const drift = 1 + (Math.random() - 0.5) * 0.012;
    const startFreq = freq * drift * Math.pow(2, detuneCents / 1200);
    osc1.frequency.setValueAtTime(startFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(startFreq * 0.992, now + 1.45);

    osc2.frequency.setValueAtTime(startFreq * 3.01, now);
    osc2.frequency.exponentialRampToValueAtTime(startFreq * 2.98, now + 0.55);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(640, now + 1.4);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(volume * 0.24, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(filter);
    osc2.connect(overtoneGain);
    overtoneGain.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.6);
    osc2.stop(now + 0.52);
  }

  function startHorrorMusicBox() {
    stopHorrorMusicBox();
    if (isMuted || !loungeOpen || activeCartId) return;

    function step() {
      if (!loungeOpen || activeCartId || isMuted) return;
      const note = HORROR_MELODY[melodyIdx % HORROR_MELODY.length];
      melodyIdx++;

      if (note.f > 0) {
        triggerMusicBoxPlink(note.f, 0.028, (Math.random() - 0.5) * 14);
        setTimeout(() => {
          if (loungeOpen && !activeCartId && !isMuted) {
            triggerMusicBoxPlink(note.f, 0.011, -18);
          }
        }, 280);
      }

      const jitter = (Math.random() - 0.5) * 90;
      musicBoxTimerId = setTimeout(step, Math.max(360, note.ms + jitter));
    }

    musicBoxTimerId = setTimeout(step, 520);
  }

  function stopHorrorMusicBox() {
    if (musicBoxTimerId) {
      clearTimeout(musicBoxTimerId);
      musicBoxTimerId = null;
    }
  }

  /* ---------------------------------------------------------
     SCROLL-PROXIMITY PROCEDURAL RAIN AMBIENCE (FADE IN / OUT)
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     COZY PORTFOLIO MELODY <-> RAINY ALLEY SCROLL CROSSFADE
     Normal sections: gentle warm music-box melody
     Approaching #lounge: melody fades out -> rain fades in
     On #lounge: pure rain only | Inside arcade: scary horror box
     --------------------------------------------------------- */
  const PORTFOLIO_STEP_MS = 185;
  // Upbeat Japanese-arcade lobby loop (Lead square synth + bouncy triangle bass)
  const PORTFOLIO_MELODY = [
    // Bar 1 — Cmaj7
    { l: 659.25, b: 130.81 }, // E5  / C3
    { l: 783.99, b: 0 },      // G5
    { l: 1046.5, b: 196.0 },  // C6  / G3
    { l: 0,      b: 0 },
    { l: 987.77, b: 130.81 }, // B5  / C3
    { l: 783.99, b: 0 },      // G5
    { l: 659.25, b: 196.0 },  // E5  / G3
    { l: 587.33, b: 0 },      // D5

    // Bar 2 — Am7
    { l: 523.25, b: 110.0 },  // C5  / A2
    { l: 659.25, b: 0 },      // E5
    { l: 880.0,  b: 164.81 }, // A5  / E3
    { l: 0,      b: 0 },
    { l: 783.99, b: 110.0 },  // G5  / A2
    { l: 659.25, b: 0 },      // E5
    { l: 587.33, b: 164.81 }, // D5  / E3
    { l: 659.25, b: 0 },      // E5

    // Bar 3 — Fmaj7
    { l: 698.46, b: 87.31 },  // F5  / F2
    { l: 880.0,  b: 0 },      // A5
    { l: 1046.5, b: 130.81 }, // C6  / C3
    { l: 880.0,  b: 0 },      // A5
    { l: 783.99, b: 87.31 },  // G5  / F2
    { l: 698.46, b: 0 },      // F5
    { l: 659.25, b: 130.81 }, // E5  / C3
    { l: 0,      b: 0 },

    // Bar 4 — G9 turnaround
    { l: 587.33, b: 98.0 },   // D5  / G2
    { l: 659.25, b: 0 },      // E5
    { l: 783.99, b: 146.83 }, // G5  / D3
    { l: 987.77, b: 0 },      // B5
    { l: 880.0,  b: 98.0 },   // A5  / G2
    { l: 783.99, b: 0 },      // G5
    { l: 587.33, b: 146.83 }, // D5  / D3
    { l: 0,      b: 196.0 }   //     / G3 pickup
  ];
  let portfolioMelodyIdx = 0;

  function triggerArcadeNote(leadFreq, bassFreq) {
    if (!audioCtx || !portfolioMusicGain || isMuted) return;
    const now = audioCtx.currentTime;

    // 1. Snappy retro square-wave chiptune lead (warm-filtered so it's never harsh)
    if (leadFreq > 0) {
      const leadOsc = audioCtx.createOscillator();
      const leadFilter = audioCtx.createBiquadFilter();
      const leadEnv = audioCtx.createGain();

      leadOsc.type = "square";
      leadOsc.frequency.setValueAtTime(leadFreq, now);

      leadFilter.type = "lowpass";
      leadFilter.frequency.setValueAtTime(2500, now);
      leadFilter.frequency.exponentialRampToValueAtTime(1150, now + 0.16);

      leadEnv.gain.setValueAtTime(0.0001, now);
      leadEnv.gain.linearRampToValueAtTime(0.014, now + 0.01);
      leadEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.175);

      leadOsc.connect(leadFilter);
      leadFilter.connect(leadEnv);
      leadEnv.connect(portfolioMusicGain);

      leadOsc.start(now);
      leadOsc.stop(now + 0.19);
    }

    // 2. Bouncy NES/arcade triangle bassline
    if (bassFreq > 0) {
      const bassOsc = audioCtx.createOscillator();
      const bassFilter = audioCtx.createBiquadFilter();
      const bassEnv = audioCtx.createGain();

      bassOsc.type = "triangle";
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(620, now);

      bassEnv.gain.setValueAtTime(0.0001, now);
      bassEnv.gain.linearRampToValueAtTime(0.032, now + 0.012);
      bassEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassEnv);
      bassEnv.connect(portfolioMusicGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.24);
    }
  }

  function startPortfolioMelodyLoop() {
    if (portfolioMelodyTimerId) return;
    function step() {
      const beat = PORTFOLIO_MELODY[portfolioMelodyIdx % PORTFOLIO_MELODY.length];
      portfolioMelodyIdx++;

      const canPlay =
        audioCtx &&
        audioCtx.state === "running" &&
        !isMuted &&
        !loungeOpen &&
        !activeCartId &&
        !document.body.classList.contains("modal-open") &&
        !document.body.classList.contains("theater-open");

      if (canPlay) {
        triggerArcadeNote(beat.l, beat.b);
      }

      portfolioMelodyTimerId = setTimeout(step, PORTFOLIO_STEP_MS);
    }
    portfolioMelodyTimerId = setTimeout(step, 260);
  }

  function initScrollRainAudio(alleySection) {
    if (!alleySection) return;

    function buildAudioBeds() {
      if (isMuted) return;
      const ctx = ensureAudio();
      if (!ctx || ctx.state !== "running") return;

      if (!portfolioMusicGain) {
        portfolioMusicGain = ctx.createGain();
        portfolioMusicGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        portfolioMusicGain.connect(ctx.destination);
        startPortfolioMelodyLoop();
      }

      if (!rainAudioNodes) {
        const bufLen = ctx.sampleRate * 3;
        const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const out = noiseBuf.getChannelData(0);
        let b0 = 0;
        let b1 = 0;
        let b2 = 0;
        for (let i = 0; i < bufLen; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.997 * b0 + white * 0.029;
          b1 = 0.985 * b1 + white * 0.032;
          b2 = 0.95 * b2 + white * 0.048;
          out[i] = (b0 + b1 + b2 + white * 0.18) * 0.55;
        }

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        masterGain.connect(ctx.destination);

        const srcWash = ctx.createBufferSource();
        srcWash.buffer = noiseBuf;
        srcWash.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 980;
        const washGain = ctx.createGain();
        washGain.gain.value = 0.72;
        srcWash.connect(lp);
        lp.connect(washGain);
        washGain.connect(masterGain);

        const srcPatter = ctx.createBufferSource();
        srcPatter.buffer = noiseBuf;
        srcPatter.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 2850;
        bp.Q.value = 0.75;
        const patterGain = ctx.createGain();
        patterGain.gain.value = 0.34;
        srcPatter.connect(bp);
        bp.connect(patterGain);
        patterGain.connect(masterGain);

        srcWash.start();
        srcPatter.start(0, 1.1);

        rainAudioNodes = { masterGain, srcWash, srcPatter };
      }
    }

    function updateRainVolume() {
      if (!audioCtx) return;

      const blocked =
        isMuted ||
        loungeOpen ||
        Boolean(activeCartId) ||
        document.body.classList.contains("modal-open") ||
        document.body.classList.contains("theater-open");

      let rainTarget = 0.0001;
      let melodyTarget = 0.0001;

      if (!blocked) {
        const rect = alleySection.getBoundingClientRect();
        const vpH = window.innerHeight || 800;
        const secCenter = rect.top + rect.height * 0.5;
        const vpCenter = vpH * 0.5;
        const fadeRadius = vpH * 1.05;
        const proximity = Math.max(0, 1 - Math.abs(secCenter - vpCenter) / fadeRadius);

        // Rain swells as you reach the alley
        rainTarget = Math.max(0.0001, Math.pow(proximity, 1.35) * 0.16);

        // Cozy portfolio melody fades completely away as you near the rain
        const melodyFactor = Math.max(0, 1 - proximity * 1.55);
        melodyTarget = Math.max(0.0001, Math.pow(melodyFactor, 1.2));
      }

      if (rainAudioNodes) {
        rainAudioNodes.masterGain.gain.setTargetAtTime(rainTarget, audioCtx.currentTime, 0.18);
      }
      if (portfolioMusicGain) {
        portfolioMusicGain.gain.setTargetAtTime(melodyTarget, audioCtx.currentTime, 0.22);
      }
    }

    updateRainVolumeFn = updateRainVolume;

    function unlockAndStartBeds() {
      if (isMuted) return;
      const ctx = ensureAudio();
      if (!ctx) return;
      const boot = () => {
        buildAudioBeds();
        updateRainVolume();
      };
      if (ctx.state === "running") boot();
      else ctx.resume().then(boot).catch(() => {});
    }

    window.addEventListener("scroll", updateRainVolume, { passive: true });
    window.addEventListener("resize", updateRainVolume, { passive: true });
    window.addEventListener("pointerdown", unlockAndStartBeds, { passive: true });
    window.addEventListener("keydown", unlockAndStartBeds, { passive: true });
  }

  /* ---------------------------------------------------------
     INDOOR HORROR ARCADE AMBIENCE (SUB-DRONE + CRT STATIC + MUSIC BOX)
     --------------------------------------------------------- */
  function startAmbientArcadeHum() {
    if (isMuted || ambientNodes || !loungeOpen || activeCartId) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(1.0, now + 0.65);
    masterGain.connect(ctx.destination);

    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = "sine";
    droneOsc.frequency.value = 46;
    droneGain.gain.value = 0.022;
    droneOsc.connect(droneGain);
    droneGain.connect(masterGain);
    droneOsc.start(now);

    const humOsc = ctx.createOscillator();
    const humGain = ctx.createGain();
    humOsc.type = "triangle";
    humOsc.frequency.value = 60;
    humGain.gain.value = 0.015;
    humOsc.connect(humGain);
    humGain.connect(masterGain);
    humOsc.start(now);

    const bufLen = ctx.sampleRate * 2;
    const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const out = noiseBuf.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufLen; i++) {
      const white = Math.random() * 2 - 1;
      out[i] = (lastOut + 0.14 * white) / 1.14;
      lastOut = out[i];
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    noiseSrc.loop = true;

    const bandFilter = ctx.createBiquadFilter();
    bandFilter.type = "bandpass";
    bandFilter.frequency.value = 1420;
    bandFilter.Q.value = 0.72;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.032;

    noiseSrc.connect(bandFilter);
    bandFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSrc.start(now);

    ambientNodes = { masterGain, droneOsc, humOsc, noiseSrc };
    startHorrorMusicBox();
  }

  function stopAmbientArcadeHum() {
    stopHorrorMusicBox();
    if (!ambientNodes) return;
    const nodes = ambientNodes;
    ambientNodes = null;
    try {
      const ctx = audioCtx;
      if (ctx) {
        const now = ctx.currentTime;
        nodes.masterGain.gain.cancelScheduledValues(now);
        nodes.masterGain.gain.setValueAtTime(nodes.masterGain.gain.value, now);
        nodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      }
      setTimeout(() => {
        try {
          nodes.droneOsc.stop();
          nodes.humOsc.stop();
          nodes.noiseSrc.stop();
          nodes.masterGain.disconnect();
        } catch (_) {}
      }, 280);
    } catch (_) {}
  }

  /* ---------------------------------------------------------
     LIVE DIAGONAL RAIN IN THE BACK-ALLEY (#alleyRainCanvas)
     --------------------------------------------------------- */
  function initAlleyRain(canvas, container) {
    if (!canvas || !container) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    let W = 960;
    let H = 585;

    function resize() {
      W = Math.max(300, container.clientWidth);
      H = Math.max(260, container.clientHeight);
      canvas.width = W;
      canvas.height = H;
    }
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from({ length: 112 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      len: 11 + Math.random() * 19,
      speed: 6.0 + Math.random() * 5.8,
      alpha: 0.14 + Math.random() * 0.28
    }));

    const splashes = [];

    function tick() {
      rainRafId = requestAnimationFrame(tick);
      if (loungeOpen || document.body.classList.contains("modal-open") || document.body.classList.contains("theater-open")) {
        return;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1.1;

      for (const d of drops) {
        d.x -= d.speed * 0.22;
        d.y += d.speed;

        if (d.y > H - 14) {
          if (Math.random() < 0.38 && splashes.length < 36) {
            splashes.push({ x: d.x, y: H - 6 - Math.random() * 18, r: 1, maxR: 5 + Math.random() * 6, a: 0.36 });
          }
          d.y = -20 - Math.random() * 40;
          d.x = Math.random() * (W + 140);
        }

        ctx.strokeStyle = `rgba(186, 230, 253, ${d.alpha})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.22, d.y + d.len);
        ctx.stroke();
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.r += 0.35;
        s.a *= 0.88;
        ctx.strokeStyle = `rgba(186, 230, 253, ${s.a})`;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.r, s.r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (s.r >= s.maxR || s.a < 0.03) splashes.splice(i, 1);
      }
    }
    tick();
  }

  /* ---------------------------------------------------------
     STAGE 1: LIVE STATIC ACROSS ALL 4 CORRIDOR MACHINES
     --------------------------------------------------------- */
  function startCorridorMiniStatic(canvases) {
    stopCorridorMiniStatic();
    if (!canvases || !canvases.length) return;

    const SW = 72;
    const SH = 52;
    const entries = Array.from(canvases).map((cv, idx) => {
      cv.width = SW;
      cv.height = SH;
      const ctx = cv.getContext("2d");
      const cartId = cv.closest(".tjoc-bay")?.dataset.cart || "runner";
      const tint = (LAMP_THEMES[cartId] || LAMP_THEMES.runner).tint;
      return { ctx, img: ctx.createImageData(SW, SH), tint, phase: idx * 37 };
    });

    let tick = 0;

    function loop() {
      if (!loungeOpen) return;
      hallStaticRafId = requestAnimationFrame(loop);
      if (activeCartId || currentView !== "hall") return;

      tick++;
      if (tick % 2 !== 0) return;

      for (const e of entries) {
        const buf = e.img.data;
        const [tr, tg, tb] = e.tint;
        for (let i = 0; i < buf.length; i += 4) {
          const v = Math.random() > 0.48 ? 165 + ((Math.random() * 88) | 0) : 14 + ((Math.random() * 44) | 0);
          buf[i] = Math.min(255, (v * tr) | 0);
          buf[i + 1] = Math.min(255, (v * tg) | 0);
          buf[i + 2] = Math.min(255, (v * tb) | 0);
          buf[i + 3] = 255;
        }
        e.ctx.putImageData(e.img, 0, 0);

        const barY = ((tick * 1.4 + e.phase) % (SH + 14)) - 7;
        e.ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
        e.ctx.fillRect(0, barY, SW, 4);
      }
    }
    loop();
  }

  function stopCorridorMiniStatic() {
    if (hallStaticRafId) {
      cancelAnimationFrame(hallStaticRafId);
      hallStaticRafId = null;
    }
  }

  /* ---------------------------------------------------------
     STAGE 2: CLOSE-UP CABINET BUZZING STATIC ENGINE
     --------------------------------------------------------- */
  function startCloseupStatic(canvas, previewFrameEl, statusEl) {
    stopCloseupStatic();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const W = 240;
    const H = 150;
    canvas.width = W;
    canvas.height = H;

    const imgData = ctx.createImageData(W, H);
    const buf = imgData.data;

    let frame = 0;
    let buzzCountdown = 175;
    let buzzFramesLeft = 0;

    function renderLoop() {
      if (!loungeOpen) return;
      closeupStaticRafId = requestAnimationFrame(renderLoop);
      if (activeCartId || currentView !== "closeup") return;

      frame++;
      buzzCountdown--;

      if (buzzCountdown <= 0 && buzzFramesLeft === 0) {
        buzzFramesLeft = 22 + ((Math.random() * 18) | 0);
        buzzCountdown = 190 + ((Math.random() * 180) | 0);
        playStaticBuzzBurst();
        if (statusEl && !isTransitioning) statusEl.textContent = "SIGNAL // SYNC BUZZ";
      }

      const isBuzzing = buzzFramesLeft > 0;
      if (isBuzzing) {
        buzzFramesLeft--;
        if (buzzFramesLeft === 0 && statusEl && !isTransitioning) {
          statusEl.textContent = "STATIC // READY";
        }
      }

      const theme = LAMP_THEMES[selectedCartId] || LAMP_THEMES.runner;
      const [tr, tg, tb] = theme.tint;

      for (let i = 0; i < buf.length; i += 4) {
        const r = Math.random();
        const v = isBuzzing
          ? r > 0.35 ? 205 + ((Math.random() * 50) | 0) : 22 + ((Math.random() * 48) | 0)
          : r > 0.46 ? 168 + ((Math.random() * 80) | 0) : 14 + ((Math.random() * 42) | 0);
        buf[i] = Math.min(255, (v * tr) | 0);
        buf[i + 1] = Math.min(255, (v * tg) | 0);
        buf[i + 2] = Math.min(255, (v * tb) | 0);
        buf[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);

      const humBarY = (frame * (isBuzzing ? 8.5 : 2.4)) % (H + 30) - 15;
      ctx.fillStyle = isBuzzing ? "rgba(255, 255, 255, 0.42)" : "rgba(255, 255, 255, 0.18)";
      ctx.fillRect(0, humBarY, W, isBuzzing ? 16 : 9);

      if (isBuzzing) {
        for (let b = 0; b < 4; b++) {
          const gy = (Math.random() * H) | 0;
          const gh = 2 + ((Math.random() * 7) | 0);
          ctx.fillStyle = `rgba(${theme.rgb}, 0.58)`;
          ctx.fillRect(0, gy, W, gh);
        }
        ctx.fillStyle = "rgba(4, 6, 10, 0.72)";
        ctx.fillRect(0, (frame * 15) % H, W, 11);
      }

      if (previewFrameEl) {
        const glow = isBuzzing ? 68 : 42;
        const alpha = isBuzzing ? 0.58 : 0.34;
        previewFrameEl.style.boxShadow = `inset 0 0 75px rgba(0, 0, 0, 0.92), 0 0 ${glow}px rgba(${theme.rgb}, ${alpha})`;
      }
    }

    renderLoop();
  }

  function stopCloseupStatic() {
    if (closeupStaticRafId) {
      cancelAnimationFrame(closeupStaticRafId);
      closeupStaticRafId = null;
    }
  }

  /* ---------------------------------------------------------
     BARELY-VISIBLE DRIFTING GROUND SMOKE / FOG (#arcadeFogCanvas)
     --------------------------------------------------------- */
  function startGroundFog(canvas) {
    stopGroundFog();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const W = window.innerWidth;
    const H = Math.round(window.innerHeight * 0.4);
    canvas.width = W;
    canvas.height = H;

    const wisps = Array.from({ length: 14 }, (_, i) => ({
      x: (i / 14) * W + Math.random() * 140,
      y: H * (0.5 + Math.random() * 0.42),
      rx: 180 + Math.random() * 220,
      ry: 44 + Math.random() * 54,
      vx: (Math.random() < 0.5 ? 1 : -1) * (0.18 + Math.random() * 0.28),
      alpha: 0.022 + Math.random() * 0.024
    }));

    function tick() {
      if (!loungeOpen) return;
      fogRafId = requestAnimationFrame(tick);
      if (activeCartId) return;

      ctx.clearRect(0, 0, W, H);
      for (const w of wisps) {
        w.x += w.vx;
        if (w.x - w.rx > W + 40) w.x = -w.rx - 40;
        if (w.x + w.rx < -40) w.x = W + w.rx + 40;

        const g = ctx.createRadialGradient(w.x, w.y, 4, w.x, w.y, w.rx);
        g.addColorStop(0, `rgba(198, 212, 228, ${w.alpha})`);
        g.addColorStop(0.55, `rgba(148, 163, 184, ${w.alpha * 0.42})`);
        g.addColorStop(1, "rgba(15, 23, 42, 0)");

        ctx.save();
        ctx.translate(w.x, w.y);
        ctx.scale(1, w.ry / w.rx);
        ctx.translate(-w.x, -w.y);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    tick();
  }

  function stopGroundFog() {
    if (fogRafId) {
      cancelAnimationFrame(fogRafId);
      fogRafId = null;
    }
  }

  /* ---------------------------------------------------------
     FLOATING DUST MOTES IN SPOTLIGHT CONES
     --------------------------------------------------------- */
  function startDustParticles(canvas) {
    stopDustParticles();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const motes = Array.from({ length: 34 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.8 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -0.08 - Math.random() * 0.18,
      a: 0.1 + Math.random() * 0.24,
      phase: Math.random() * Math.PI * 2
    }));

    function tick() {
      if (!loungeOpen) return;
      dustRafId = requestAnimationFrame(tick);
      if (activeCartId) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const m of motes) {
        m.phase += 0.014;
        m.x += m.vx + Math.sin(m.phase) * 0.16;
        m.y += m.vy;
        if (m.y < -10) {
          m.y = canvas.height + 10;
          m.x = Math.random() * canvas.width;
        }
        if (m.x < -10) m.x = canvas.width + 10;
        if (m.x > canvas.width + 10) m.x = -10;

        ctx.fillStyle = `rgba(210, 224, 240, ${m.a})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    tick();
  }

  function stopDustParticles() {
    if (dustRafId) {
      cancelAnimationFrame(dustRafId);
      dustRafId = null;
    }
  }

  /* ---------------------------------------------------------
     AUTO-ADAPTING VISITOR TIMEZONE 1980s LED CLOCK
     --------------------------------------------------------- */
  let clockMode = 0;
  let liveTempC = "24°C";

  function detectVisitorTzShort() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz === "Asia/Jakarta" || tz === "Asia/Pontianak") return "WIB";
      if (tz === "Asia/Makassar") return "WITA";
      if (tz === "Asia/Jayapura") return "WIT";

      const parts = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(new Date());
      const shortName = parts.find((p) => p.type === "timeZoneName")?.value || "LOC";
      return shortName.replace("GMT", "UTC").slice(0, 5).toUpperCase();
    } catch (_) {
      return "LOC";
    }
  }

  function getTzRepresentativeCoords() {
    let tz = "";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (_) {}

    const map = {
      "Asia/Jakarta": [-6.2, 106.8],
      "Asia/Makassar": [-5.14, 119.43],
      "Asia/Singapore": [1.35, 103.82],
      "Asia/Tokyo": [35.68, 139.69],
      "Asia/Seoul": [37.56, 126.97],
      "Asia/Shanghai": [31.23, 121.47],
      "Europe/London": [51.5, -0.12],
      "Europe/Berlin": [52.52, 13.4],
      "America/New_York": [40.71, -74.0],
      "America/Chicago": [41.87, -87.63],
      "America/Los_Angeles": [34.05, -118.24],
      "Australia/Sydney": [-33.86, 151.21]
    };

    if (map[tz]) return map[tz];
    if (tz.startsWith("America/")) return [40.71, -74.0];
    if (tz.startsWith("Europe/")) return [51.5, -0.12];
    if (tz.startsWith("Asia/")) return [1.35, 103.82];
    return null;
  }

  function initAdaptiveTimezoneClock() {
    const snoozeBtn = document.getElementById("alarmSnoozeBtn");
    const modeEl = document.getElementById("alarmModeLabel");
    const digitsEl = document.getElementById("alarmDigits");
    const tempEl = document.getElementById("alarmTempVal");
    if (!digitsEl) return;

    const tzShort = detectVisitorTzShort();
    const coords = getTzRepresentativeCoords();

    if (coords) {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&current_weather=true`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && json.current_weather && typeof json.current_weather.temperature === "number") {
            liveTempC = `${Math.round(json.current_weather.temperature)}°C`;
            paintClock();
          }
        })
        .catch(() => {});
    }

    function paintClock() {
      const now = new Date();
      const colon = now.getSeconds() % 2 === 0 ? ":" : " ";
      const h24 = now.getHours();
      const mm = String(now.getMinutes()).padStart(2, "0");

      if (clockMode === 0) {
        if (modeEl) modeEl.textContent = tzShort;
        digitsEl.textContent = `${String(h24).padStart(2, "0")}${colon}${mm}`;
        if (tempEl) tempEl.textContent = liveTempC;
      } else if (clockMode === 1) {
        const ampm = h24 >= 12 ? "PM" : "AM";
        const h12 = h24 % 12 || 12;
        if (modeEl) modeEl.textContent = ampm;
        digitsEl.textContent = `${String(h12).padStart(2, "0")}${colon}${mm}`;
        if (tempEl) tempEl.textContent = tzShort;
      } else {
        if (modeEl) modeEl.textContent = "TMP";
        digitsEl.textContent = liveTempC;
        if (tempEl) tempEl.textContent = tzShort;
      }
    }

    paintClock();
    if (clockIntervalId) clearInterval(clockIntervalId);
    clockIntervalId = setInterval(paintClock, 1000);

    if (snoozeBtn) {
      snoozeBtn.addEventListener("click", () => {
        clockMode = (clockMode + 1) % 3;
        paintClock();
        playKeySwitch(clockMode);
      });

      snoozeBtn.addEventListener("dblclick", () => {
        playAlarmBeep();
        const prev = digitsEl.textContent;
        digitsEl.textContent = "ALRM!";
        setTimeout(() => {
          digitsEl.textContent = prev;
          paintClock();
        }, 620);
      });
    }
  }

  /* ---------------------------------------------------------
     LIVE 60FPS PROCEDURAL ANALOG TV STATIC SNOW (ZZZ WARP)
     --------------------------------------------------------- */
  function startZzzStatic(canvas) {
    stopZzzStatic();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const SW = 240;
    const SH = 135;
    canvas.width = SW;
    canvas.height = SH;

    const imgData = ctx.createImageData(SW, SH);
    const buf = imgData.data;
    let frame = 0;

    function renderStatic() {
      frame++;
      for (let i = 0; i < buf.length; i += 4) {
        const v = Math.random() > 0.5 ? 180 + ((Math.random() * 75) | 0) : (Math.random() * 52) | 0;
        buf[i] = v;
        buf[i + 1] = v;
        buf[i + 2] = v;
        buf[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);

      const barY = (frame * 7) % SH;
      ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
      ctx.fillRect(0, barY, SW, 6);
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(0, (barY + 34) % SH, SW, 11);

      if (frame % 5 === 0) {
        const gy = (Math.random() * SH) | 0;
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(100, 227, 219, 0.35)" : "rgba(239, 68, 68, 0.35)";
        ctx.fillRect(0, gy, SW, 3);
      }

      staticRafId = requestAnimationFrame(renderStatic);
    }

    renderStatic();
  }

  function stopZzzStatic() {
    if (staticRafId) {
      cancelAnimationFrame(staticRafId);
      staticRafId = null;
    }
  }

  const audioApi = { tone, noise };
  let syncMuteUiFn = null;
  let enterLoungeFn = null;
  let exitLoungeFn = null;

  function toggleMute() {
    isMuted = !isMuted;
    if (typeof syncMuteUiFn === "function") syncMuteUiFn();
    if (typeof updateRainVolumeFn === "function") updateRainVolumeFn();
    if (isMuted) {
      stopAmbientArcadeHum();
    } else {
      tone(520, 0.08, "triangle", 0.05, 780);
      if (loungeOpen && !activeCartId) startAmbientArcadeHum();
    }
  }

  function init() {
    const DATA = window.PORTFOLIO_DATA;
    if (!DATA || !DATA.cartridges) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    // Alley Entrance Elements
    const alleySection = document.getElementById("lounge");
    const alleyStage = document.getElementById("loungeDoorStage");
    const alleyRainCanvas = document.getElementById("alleyRainCanvas");
    const doorTrigger = document.getElementById("loungeDoorTrigger");
    const enterCta = document.getElementById("enterLoungeCta");
    const doorLeaf = document.getElementById("loungeDoorLeaf");
    const doorSpill = document.getElementById("loungeDoorSpill");

    // Arcade Parlor Shell Elements
    const loungeModal = document.getElementById("loungeRoomModal");
    const loungeShell = document.getElementById("loungePovShell");
    const loungeExitBtn = document.getElementById("loungeExitBtn");
    const backHallBtn = document.getElementById("loungeBackHallBtn");
    const povCamLabel = document.getElementById("povCamLabel");
    const fogCanvas = document.getElementById("arcadeFogCanvas");
    const dustCanvas = document.getElementById("loungeDustCanvas");

    // Stage 1: Wide 4-Cabinet Corridor Elements
    const cameraRig = document.getElementById("arcadeCameraRig");
    const corridorBays = document.querySelectorAll(".tjoc-bay[data-cart]");
    const miniStaticCanvases = document.querySelectorAll(".cab-mini-static");
    const hallBottomPrompt = document.getElementById("hallBottomPrompt");

    // Stage 2: Close-Up Cabinet & Real Coin-Mech Elements
    const closeupStage = document.getElementById("cabinetCloseupStage");
    const closeupLampWash = document.getElementById("closeupLampWash");
    const tvUnit = document.getElementById("crtTvUnit");
    const closeupMarqueeTitle = document.getElementById("closeupMarqueeTitle");
    const previewFrame = document.getElementById("crtPreviewFrame");
    const broadcastCanvas = document.getElementById("crtBroadcastCanvas");
    const staticNoise = document.getElementById("crtStaticNoise");
    const crtFlash = document.getElementById("crtFlash");

    const attractSlotTag = document.getElementById("attractSlotTag");
    const attractTitle = document.getElementById("attractTitle");
    const attractDesc = document.getElementById("attractDesc");
    const attractMeta = document.getElementById("attractMeta");

    const coinSlotBtn = document.getElementById("crtDeckSlot");
    const coinArrowGuide = document.getElementById("coinArrowGuide");
    const mechQuarterBtn = document.getElementById("mechQuarterBtn");
    const mechSlitFlash = document.getElementById("mechSlitFlash");
    const insertingCoin = document.getElementById("insertingCoin");
    const crtStatusText = document.getElementById("crtStatusText");
    const closeupCreditLabel = document.getElementById("closeupCreditLabel");
    const coinPromptHint = document.getElementById("vcrPlayPrompt");

    // ZZZ Warp & Game Theater Elements
    const zzzWarp = document.getElementById("crtZzzWarp");
    const zzzCanvas = document.getElementById("zzzStaticCanvas");
    const zzzStatusText = document.getElementById("zzzStatusText");
    const zzzSubText = document.getElementById("zzzSubText");
    const zzzBarFill = document.getElementById("zzzBarFill");

    const muteBtn = document.getElementById("crtMuteBtn");
    const navSfxBtn = document.getElementById("navSfxBtn");
    const navSfxLabel = document.getElementById("navSfxLabel");

    const theater = document.getElementById("crtTheater");
    const theaterShell = document.getElementById("crtTheaterShell");
    const theaterCartTag = document.getElementById("theaterCartTag");
    const theaterTitle = document.getElementById("theaterTitle");
    const theaterMuteBtn = document.getElementById("theaterMuteBtn");
    const theaterEjectBtn = document.getElementById("theaterEjectBtn");
    const gameMount = document.getElementById("crtGameMount");

    if (!loungeModal || !previewFrame || !theater || !gameMount) return;

    // Boot Rain Visuals + Scroll-Proximity Rain Audio
    initAlleyRain(alleyRainCanvas, alleyStage);
    initScrollRainAudio(alleySection || alleyStage);

    function syncMuteButtons() {
      const label = isMuted ? "SFX: OFF" : "SFX: ON";
      if (muteBtn) {
        muteBtn.textContent = `♪ ${label}`;
        muteBtn.setAttribute("aria-pressed", String(isMuted));
      }
      if (theaterMuteBtn) {
        theaterMuteBtn.textContent = label;
        theaterMuteBtn.setAttribute("aria-pressed", String(isMuted));
      }
      if (navSfxBtn) {
        navSfxBtn.classList.toggle("is-muted", isMuted);
        navSfxBtn.setAttribute("aria-pressed", String(isMuted));
      }
      if (navSfxLabel) {
        navSfxLabel.textContent = isMuted ? "MUTE" : "SFX";
      }
    }
    syncMuteUiFn = syncMuteButtons;

    if (muteBtn) muteBtn.addEventListener("click", toggleMute);
    if (theaterMuteBtn) theaterMuteBtn.addEventListener("click", toggleMute);
    if (navSfxBtn) navSfxBtn.addEventListener("click", toggleMute);

    /* ---------------------------------------------------------
       SUBTLE CORRIDOR POV SWAY IN STAGE 1
       --------------------------------------------------------- */
    let povTargetX = 0;
    let povTargetY = 0;
    let povCurX = 0;
    let povCurY = 0;
    let breathPhase = 0;

    loungeModal.addEventListener("pointermove", (e) => {
      if (!loungeOpen || isTouchDevice) return;
      povTargetX = e.clientX / window.innerWidth - 0.5;
      povTargetY = e.clientY / window.innerHeight - 0.5;
    });

    function startPovParallax() {
      stopPovParallax();
      if (prefersReducedMotion) return;

      function tick() {
        if (!loungeOpen) return;
        povRafId = requestAnimationFrame(tick);
        if (activeCartId || isTransitioning || currentView !== "hall") return;

        breathPhase += 0.014;
        povCurX += (povTargetX - povCurX) * 0.055;
        povCurY += (povTargetY - povCurY) * 0.055;

        const tx = (-povCurX * 20).toFixed(2);
        const ty = (-povCurY * 9 + Math.sin(breathPhase) * 2.0).toFixed(2);
        if (cameraRig) {
          cameraRig.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1)`;
        }
      }
      tick();
    }

    function stopPovParallax() {
      if (povRafId) {
        cancelAnimationFrame(povRafId);
        povRafId = null;
      }
    }

    /* ---------------------------------------------------------
       RESET COIN MECHANISM UI
       --------------------------------------------------------- */
    function resetCoinMechUI() {
      if (crtStatusText) crtStatusText.textContent = "STATIC // READY";
      if (closeupCreditLabel) closeupCreditLabel.textContent = "CREDIT 00";
      if (coinPromptHint) coinPromptHint.textContent = "1 TOKEN = PLAY";
      if (coinArrowGuide) coinArrowGuide.style.opacity = "1";
      if (mechSlitFlash) mechSlitFlash.style.opacity = "0";
      if (insertingCoin) {
        if (window.gsap) window.gsap.set(insertingCoin, { clearProps: "all", opacity: 0 });
        else insertingCoin.style.opacity = "0";
      }
    }

    /* ---------------------------------------------------------
       STAGE 1 <-> STAGE 2: SMOOTH CAMERA DRAG INTO SELECTED CABINET
       --------------------------------------------------------- */
    function populateCloseupMachine(cartId) {
      const cart = DATA.cartridges[cartId];
      const theme = LAMP_THEMES[cartId] || LAMP_THEMES.runner;
      if (!cart) return;

      selectedCartId = cartId;

      if (closeupLampWash) closeupLampWash.style.setProperty("--cu-rgb", theme.rgb);
      if (tvUnit) {
        tvUnit.style.setProperty("--cu-rgb", theme.rgb);
        tvUnit.style.setProperty("--cu-hex", theme.hex);
      }
      if (closeupMarqueeTitle) closeupMarqueeTitle.textContent = cart.title;
      if (attractSlotTag) attractSlotTag.textContent = `${cart.slot} // ${cart.genre}`;
      if (attractTitle) attractTitle.textContent = cart.title;
      if (attractDesc) attractDesc.textContent = cart.desc;
      if (attractMeta) attractMeta.innerHTML = cart.tags.map((t) => `<span>${t}</span>`).join("");
      if (povCamLabel) povCamLabel.textContent = `● ${cart.slot} // STANDING BY`;
      resetCoinMechUI();
    }

    function approachCabinet(bayEl, cartId) {
      if (isTransitioning || currentView !== "hall" || !DATA.cartridges[cartId]) return;
      isTransitioning = true;

      populateCloseupMachine(cartId);
      playApproachWhoosh();

      const screenEl = bayEl.querySelector(".cab-screen-recess") || bayEl;
      const rect = screenEl.getBoundingClientRect();
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const dx = vpW * 0.5 - (rect.left + rect.width * 0.5);
      const dy = vpH * 0.44 - (rect.top + rect.height * 0.5);

      const finishApproach = () => {
        currentView = "closeup";
        loungeModal.setAttribute("data-view", "closeup");
        if (backHallBtn) backHallBtn.hidden = false;
        if (closeupStage) {
          closeupStage.classList.add("is-active");
          closeupStage.setAttribute("aria-hidden", "false");
        }
        startCloseupStatic(broadcastCanvas, previewFrame, crtStatusText);
        isTransitioning = false;
      };

      if (window.gsap && cameraRig && closeupStage && !prefersReducedMotion) {
        const tl = window.gsap.timeline({
          onComplete: finishApproach
        });

        if (hallBottomPrompt) {
          tl.to(hallBottomPrompt, { opacity: 0, duration: 0.22, ease: "power2.out" }, 0);
        }

        // Smooth camera drag & zoom directly toward the chosen distant cabinet
        tl.to(
          cameraRig,
          {
            x: dx * 2.5,
            y: dy * 2.2,
            scale: 2.9,
            duration: 0.72,
            ease: "power3.inOut"
          },
          0
        ).to(cameraRig, { opacity: 0, duration: 0.28, ease: "power2.in" }, 0.42);

        tl.call(
          () => {
            currentView = "closeup";
            loungeModal.setAttribute("data-view", "closeup");
            if (backHallBtn) backHallBtn.hidden = false;
            closeupStage.classList.add("is-active");
            closeupStage.setAttribute("aria-hidden", "false");
            startCloseupStatic(broadcastCanvas, previewFrame, crtStatusText);
          },
          null,
          0.42
        );

        tl.fromTo(
          closeupStage,
          { opacity: 0 },
          { opacity: 1, duration: 0.36, ease: "power2.out" },
          0.44
        );

        if (tvUnit) {
          tl.fromTo(
            tvUnit,
            { scale: 0.86, y: 24 },
            { scale: 1, y: 0, duration: 0.46, ease: "power3.out" },
            0.44
          );
        }
      } else {
        if (cameraRig) cameraRig.style.opacity = "0";
        if (hallBottomPrompt) hallBottomPrompt.style.opacity = "0";
        if (closeupStage) closeupStage.style.opacity = "1";
        finishApproach();
      }
    }

    function stepBackToHall() {
      if (isTransitioning || currentView !== "closeup") return;
      isTransitioning = true;
      playStepBackAudio();

      const finishStepBack = () => {
        stopCloseupStatic();
        currentView = "hall";
        loungeModal.setAttribute("data-view", "hall");
        if (backHallBtn) backHallBtn.hidden = true;
        if (povCamLabel) povCamLabel.textContent = "● CAM 04 // ARCADE HALL";
        if (closeupStage) {
          closeupStage.classList.remove("is-active");
          closeupStage.setAttribute("aria-hidden", "true");
        }
        isTransitioning = false;
      };

      if (window.gsap && cameraRig && closeupStage && !prefersReducedMotion) {
        const tl = window.gsap.timeline({ onComplete: finishStepBack });

        if (tvUnit) {
          tl.to(tvUnit, { scale: 0.9, y: 16, duration: 0.28, ease: "power2.in" }, 0);
        }
        tl.to(closeupStage, { opacity: 0, duration: 0.28, ease: "power2.in" }, 0);

        tl.to(
          cameraRig,
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.64,
            ease: "power3.out"
          },
          0.16
        );

        if (hallBottomPrompt) {
          tl.to(hallBottomPrompt, { opacity: 1, duration: 0.32, ease: "power2.out" }, 0.45);
        }
      } else {
        if (closeupStage) closeupStage.style.opacity = "0";
        if (cameraRig) {
          cameraRig.style.opacity = "1";
          cameraRig.style.transform = "translate3d(0,0,0) scale(1)";
        }
        if (hallBottomPrompt) hallBottomPrompt.style.opacity = "1";
        finishStepBack();
      }
    }

    corridorBays.forEach((bay) => {
      const cartId = bay.dataset.cart;
      bay.addEventListener("click", () => approachCabinet(bay, cartId));
      bay.addEventListener("keydown", (e) => {
        if (e.code === "Enter" || e.code === "Space") {
          e.preventDefault();
          approachCabinet(bay, cartId);
        }
      });
    });

    if (backHallBtn) backHallBtn.addEventListener("click", stepBackToHall);

    /* ---------------------------------------------------------
       ENTER / EXIT BACK-ALLEY INTO TJOC 4-CABINET PARLOR
       --------------------------------------------------------- */
    function resetHallStateImmediate() {
      currentView = "hall";
      loungeModal.setAttribute("data-view", "hall");
      if (backHallBtn) backHallBtn.hidden = true;
      if (povCamLabel) povCamLabel.textContent = "● CAM 04 // ARCADE HALL";
      if (closeupStage) {
        closeupStage.classList.remove("is-active");
        closeupStage.setAttribute("aria-hidden", "true");
        closeupStage.style.opacity = "0";
      }
      if (hallBottomPrompt) hallBottomPrompt.style.opacity = "1";
      if (cameraRig) {
        if (window.gsap) window.gsap.set(cameraRig, { x: 0, y: 0, scale: 1, opacity: 1 });
        else {
          cameraRig.style.opacity = "1";
          cameraRig.style.transform = "translate3d(0,0,0) scale(1)";
        }
      }
      resetCoinMechUI();
    }

    function revealArcadeRoom() {
      loungeOpen = true;
      document.body.classList.add("lounge-open");
      loungeModal.classList.add("is-open");
      loungeModal.setAttribute("aria-hidden", "false");
      if (typeof updateRainVolumeFn === "function") updateRainVolumeFn();

      resetHallStateImmediate();
      startCorridorMiniStatic(miniStaticCanvases);
      startGroundFog(fogCanvas);
      startDustParticles(dustCanvas);
      startPovParallax();
      startAmbientArcadeHum();

      if (window.gsap && !prefersReducedMotion) {
        window.gsap.fromTo(loungeModal, { opacity: 0 }, { opacity: 1, duration: 0.48, ease: "power2.out" });
        window.gsap.fromTo(
          loungeShell,
          { scale: 1.12 },
          {
            scale: 1,
            duration: 0.72,
            ease: "power3.out",
            onComplete: () => {
              if (doorLeaf) window.gsap.set(doorLeaf, { clearProps: "transform" });
              if (doorSpill) window.gsap.set(doorSpill, { clearProps: "width,opacity,transform" });
              isTransitioning = false;
            }
          }
        );
      } else {
        isTransitioning = false;
      }
    }

    function enterLounge() {
      if (loungeOpen || isTransitioning) return;
      isTransitioning = true;
      playDoorPullAudio();

      if (window.gsap && doorLeaf && !prefersReducedMotion) {
        const tl = window.gsap.timeline({
          onComplete: revealArcadeRoom
        });

        tl.to(doorLeaf, { rotateY: -108, duration: 0.62, ease: "power3.inOut" }, 0);

        if (doorSpill) {
          tl.to(doorSpill, { width: 204, opacity: 1, duration: 0.55, ease: "power2.in" }, 0.05);
        }

        if (doorTrigger) {
          tl.to(
            doorTrigger,
            {
              scale: 1.32,
              duration: 0.52,
              ease: "expo.in",
              onComplete: () => window.gsap.set(doorTrigger, { clearProps: "transform" })
            },
            0.22
          );
        }
      } else {
        revealArcadeRoom();
      }
    }

    function exitLounge() {
      if (!loungeOpen || isTransitioning) return;
      isTransitioning = true;
      stopAmbientArcadeHum();
      stopCorridorMiniStatic();
      stopCloseupStatic();
      stopGroundFog();
      stopDustParticles();
      stopPovParallax();
      playDoorExitAudio();

      const finishExit = () => {
        loungeOpen = false;
        loungeModal.classList.remove("is-open");
        loungeModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lounge-open");
        resetHallStateImmediate();
        if (window.gsap && loungeShell) {
          window.gsap.set(loungeShell, { clearProps: "transform" });
          window.gsap.set(loungeModal, { opacity: 1 });
        }
        isTransitioning = false;
        if (typeof updateRainVolumeFn === "function") updateRainVolumeFn();
      };

      if (window.gsap && !prefersReducedMotion) {
        window.gsap.to(loungeShell, { scale: 0.92, duration: 0.3, ease: "power2.in" });
        window.gsap.to(loungeModal, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: finishExit });
      } else {
        finishExit();
      }
    }

    enterLoungeFn = enterLounge;
    exitLoungeFn = exitLounge;

    if (doorTrigger) doorTrigger.addEventListener("click", enterLounge);
    if (enterCta) enterCta.addEventListener("click", enterLounge);
    if (loungeExitBtn) loungeExitBtn.addEventListener("click", exitLounge);

    /* ---------------------------------------------------------
       REAL BRASS COIN INSERTION -> CRT TUBE SUCTION -> GAME THEATER
       --------------------------------------------------------- */
    function openTheaterAndMount(cart, engine) {
      const theme = LAMP_THEMES[cart.id] || LAMP_THEMES.runner;
      theaterCartTag.textContent = cart.slot;
      theaterCartTag.style.color = theme.hex;
      theaterCartTag.style.borderColor = theme.hex;
      theaterTitle.textContent = cart.title;

      document.body.classList.add("theater-open");
      theater.classList.add("is-open");
      theater.setAttribute("aria-hidden", "false");

      if (window.gsap) {
        if (tvUnit) window.gsap.set(tvUnit, { clearProps: "transform" });
        if (staticNoise) window.gsap.set(staticNoise, { opacity: 0 });
        if (crtFlash) window.gsap.set(crtFlash, { opacity: 0 });
        resetCoinMechUI();

        window.gsap.set(theater, { opacity: 1 });
        window.gsap.fromTo(
          theaterShell,
          { scale: 1.08, opacity: 0.2 },
          { scale: 1, opacity: 1, duration: 0.34, ease: "power3.out" }
        );

        if (zzzWarp && zzzWarp.classList.contains("is-active")) {
          window.gsap.to(zzzWarp, {
            opacity: 0,
            duration: 0.28,
            ease: "power2.out",
            onComplete: () => {
              stopZzzStatic();
              zzzWarp.classList.remove("is-active");
              zzzWarp.setAttribute("aria-hidden", "true");
              window.gsap.set(zzzWarp, { opacity: 1 });
              isTransitioning = false;
            }
          });
        } else {
          stopZzzStatic();
          isTransitioning = false;
        }
      } else {
        stopZzzStatic();
        if (zzzWarp) {
          zzzWarp.classList.remove("is-active");
          zzzWarp.setAttribute("aria-hidden", "true");
        }
        resetCoinMechUI();
        isTransitioning = false;
      }

      gameMount.innerHTML = "";
      requestAnimationFrame(() => {
        activeGame = engine.mount(gameMount, audioApi);
      });
    }

    function launchCartridge(cartId) {
      if (isTransitioning || currentView !== "closeup") return;
      const cart = DATA.cartridges[cartId];
      const engine = window.CRT_GAMES && window.CRT_GAMES[cartId];
      const theme = LAMP_THEMES[cartId] || LAMP_THEMES.runner;
      if (!cart || !engine) return;

      if (activeGame && typeof activeGame.destroy === "function") {
        activeGame.destroy();
        activeGame = null;
      }

      stopAmbientArcadeHum();
      isTransitioning = true;
      activeCartId = cartId;
      playCoinInsertSequence();

      if (crtStatusText) crtStatusText.textContent = "INSERTING COIN...";
      if (coinPromptHint) coinPromptHint.textContent = "READING TOKEN";

      if (!window.gsap || prefersReducedMotion) {
        openTheaterAndMount(cart, engine);
        return;
      }

      const tl = window.gsap.timeline({
        onComplete: () => openTheaterAndMount(cart, engine)
      });

      if (coinArrowGuide) {
        tl.to(coinArrowGuide, { opacity: 0.22, duration: 0.2, ease: "power2.out" }, 0);
      }

      // 1. Metallic brass arcade coin appears, turns edge-first, and slides into steel slit!
      if (insertingCoin) {
        tl.fromTo(
          insertingCoin,
          { x: 48, y: 12, scale: 1.15, scaleX: 1, rotateY: 0, opacity: 0 },
          { x: 10, y: 0, scale: 1, scaleX: 0.65, rotateY: 48, opacity: 1, duration: 0.22, ease: "power2.out" },
          0
        ).to(
          insertingCoin,
          {
            x: -36,
            y: -2,
            scaleX: 0.16,
            scaleY: 0.86,
            rotateY: 84,
            opacity: 0,
            duration: 0.26,
            ease: "power3.in"
          },
          0.2
        );
      }

      // 2. Coin slit flashes gold & 25¢ credit registers!
      if (mechSlitFlash) {
        tl.to(mechSlitFlash, { opacity: 1, duration: 0.1, ease: "power2.out" }, 0.38)
          .to(mechSlitFlash, { opacity: 0, duration: 0.22, ease: "power2.in" }, 0.48);
      }

      if (mechQuarterBtn) {
        tl.to(mechQuarterBtn, { scale: 0.92, duration: 0.08, yoyo: true, repeat: 1 }, 0.38);
      }

      tl.call(
        () => {
          if (closeupCreditLabel) closeupCreditLabel.textContent = "CREDIT 01";
          if (crtStatusText) crtStatusText.textContent = "COIN ACCEPTED";
          if (coinPromptHint) coinPromptHint.textContent = `BOOTING ${cart.slot}`;
        },
        null,
        0.4
      );

      // 3. CRT screen crackles with static & phosphor flash
      if (staticNoise) {
        tl.to(staticNoise, { opacity: 0.78, duration: 0.2, ease: "steps(4)" }, 0.54)
          .to(staticNoise, { opacity: 0.25, duration: 0.1, ease: "none" }, 0.74)
          .to(staticNoise, { opacity: 0.96, duration: 0.2, ease: "steps(4)" }, 0.84);
      }

      if (crtFlash) {
        tl.to(crtFlash, { opacity: 0.65, duration: 0.12, ease: "power2.out" }, 0.6)
          .to(crtFlash, { opacity: 0.12, duration: 0.12, ease: "power2.in" }, 0.72)
          .to(crtFlash, { opacity: 0.96, duration: 0.26, ease: "power3.in" }, 0.88);
      }

      // 4. Pull camera straight into the CRT glass
      if (tvUnit) {
        tl.to(
          tvUnit,
          {
            scale: 1.48,
            y: 44,
            duration: 0.54,
            ease: "expo.in",
            onStart: () => {
              if (crtStatusText) crtStatusText.textContent = `ENTERING ${cart.channel}...`;
            }
          },
          0.66
        );
      }

      // 5. ZZZ Static Warp Transition -> Game Mount
      if (zzzWarp) {
        tl.call(
          () => {
            if (zzzStatusText) {
              zzzStatusText.textContent = `CREDIT 01 // ${cart.channel}`;
              zzzStatusText.style.color = theme.hex;
            }
            if (zzzSubText) zzzSubText.textContent = `LOADING ${cart.slot}...`;
            if (zzzBarFill) {
              zzzBarFill.style.width = "0%";
              zzzBarFill.style.background = theme.hex;
            }
            zzzWarp.classList.add("is-active");
            zzzWarp.setAttribute("aria-hidden", "false");
            startZzzStatic(zzzCanvas);
          },
          null,
          1.12
        );

        tl.fromTo(zzzWarp, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "power2.out" }, 1.12);

        if (zzzBarFill) {
          tl.to(zzzBarFill, { width: "62%", duration: 0.34, ease: "power2.out" }, 1.22)
            .call(
              () => {
                if (zzzSubText) zzzSubText.textContent = `BOOTING // ${cart.title}`;
              },
              null,
              1.56
            )
            .to(zzzBarFill, { width: "100%", duration: 0.34, ease: "expo.inOut" }, 1.58);
        }
      }
    }

    function ejectCartridge() {
      if (!theater.classList.contains("is-open") || isTransitioning) return;
      isTransitioning = true;
      playGameExitSequence();

      if (activeGame && typeof activeGame.destroy === "function") {
        activeGame.destroy();
        activeGame = null;
      }
      activeCartId = null;

      const finishClose = () => {
        gameMount.innerHTML = "";
        theater.classList.remove("is-open");
        theater.setAttribute("aria-hidden", "true");
        document.body.classList.remove("theater-open");
        resetCoinMechUI();
        isTransitioning = false;
        if (loungeOpen) {
          startAmbientArcadeHum();
        }
      };

      if (window.gsap && theaterShell && !prefersReducedMotion) {
        window.gsap.to(theaterShell, { scale: 0.82, opacity: 0, duration: 0.24, ease: "power2.in" });
        window.gsap.to(theater, { opacity: 0, duration: 0.24, ease: "power2.in", onComplete: finishClose });
      } else {
        finishClose();
      }
    }

    if (coinSlotBtn) {
      coinSlotBtn.addEventListener("click", () => launchCartridge(selectedCartId));
    }

    if (theaterEjectBtn) theaterEjectBtn.addEventListener("click", ejectCartridge);
    theater.addEventListener("click", (e) => {
      if (e.target === theater) ejectCartridge();
    });

    window.addEventListener("keydown", (e) => {
      if (theater.classList.contains("is-open")) {
        if (e.code === "Escape" && (e.shiftKey || activeCartId !== "monolith")) {
          ejectCartridge();
        }
        return;
      }

      if (loungeOpen && e.code === "Escape") {
        if (currentView === "closeup") stepBackToHall();
        else exitLounge();
        return;
      }

      if (
        !document.body.classList.contains("modal-open") &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) &&
        e.code === "KeyM"
      ) {
        toggleMute();
      }
    });

    initAdaptiveTimezoneClock();
    syncMuteButtons();
  }

  return {
    init,
    tone,
    noise,
    toggleMute,
    unlockAudio: () => ensureAudio(),
    playKeySwitch,
    playSlotClick,
    playCoinDrop,
    playBootCoinClink,
    playCrtPowerOn,
    playDegauss,
    playCatPurr,
    playCatMeow,
    playCatChirp,
    syncRain: () => typeof updateRainVolumeFn === "function" && updateRainVolumeFn(),
    enterLounge: () => typeof enterLoungeFn === "function" && enterLoungeFn(),
    exitLounge: () => typeof exitLoungeFn === "function" && exitLoungeFn(),
    isLoungeOpen: () => loungeOpen
  };
})();