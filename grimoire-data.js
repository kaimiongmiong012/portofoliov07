/* =========================================================
   GRIMOIRE: ABYSS — COMPLETE ARCANE ENCYCLOPEDIA
   50 Original Spells (7 Schools) • 10 Optional Duo Fusions
   12 Cursed Trade-Off Pacts • 7 School Synergy Passives
   ========================================================= */

window.GRIMOIRE_DATA = {
  /* ---------------------------------------------------------
     7 ARCANE SCHOOLS + SYNERGY PASSIVES (2+ / 4+ SPELLS)
     --------------------------------------------------------- */
  schools: {
    astral: {
      id: "astral",
      name: "Astral & Lunar",
      color: "#60a5fa",
      synergy2: "Starlight Attunement: +18% projectile speed & +1 pierce",
      synergy4: "Celestial Convergence: +35% Astral damage & +18% crit burst"
    },
    ashen: {
      id: "ashen",
      name: "Ashen Flame & Reaper",
      color: "#f97316",
      synergy2: "Cinder Wake: Ashburn deals +40% Max-HP burn over time",
      synergy4: "Reaper's Toll: Burning foes explode in an ash blast on death"
    },
    crimson: {
      id: "crimson",
      name: "Crimson & Hemorrhage",
      color: "#f43f5e",
      synergy2: "Blood Ritual: Hemorrhage triggers 25% faster on stacked hits",
      synergy4: "Sanguine Feast: Hemorrhage bursts restore +4 HP to the wizard"
    },
    glacial: {
      id: "glacial",
      name: "Glacial & Frost",
      color: "#38bdf8",
      synergy2: "Frost Resonance: Chilled doodles move 32% slower",
      synergy4: "Brittle Shatter: Frostbitten foes take +35% damage from all sources"
    },
    tempest: {
      id: "tempest",
      name: "Tempest & Arc",
      color: "#facc15",
      synergy2: "Static Surge: +12% movement speed & -12% all cooldowns",
      synergy4: "Superconductor: Tempest hits arc bonus lightning to 2 nearby foes"
    },
    gravity: {
      id: "gravity",
      name: "Gravity & Singularity",
      color: "#a855f7",
      synergy2: "Heavy Mass: +25% AoE radius & stronger inward pull",
      synergy4: "Crushing Orbit: Pulled enemies take +30% bonus crush damage"
    },
    familiar: {
      id: "familiar",
      name: "Arcane Familiars",
      color: "#34d399",
      synergy2: "Pack Bond: Familiars attack 25% faster",
      synergy4: "Arch-Summoner: +35% Familiar damage & +12% wizard move speed"
    }
  },

  /* ---------------------------------------------------------
     50 ORIGINAL SPELLS ACROSS 7 SCHOOLS
     kind: beam | orb | bolt | homing | orbit | nova | zone | chain | meteor | lash | familiar
     --------------------------------------------------------- */
  spells: [
    // ================= 1. ASTRAL & LUNAR (7) =================
    {
      id: "aether_beam",
      name: "Aether Beam",
      school: "astral",
      kind: "beam",
      color: "#60a5fa",
      dmg: 36,
      cd: 2.3,
      range: 390,
      width: 18,
      status: "vuln",
      desc: "Channels a piercing cerulean beam of condensed starlight across the screen."
    },
    {
      id: "eclipse_orb",
      name: "Eclipse Orb",
      school: "astral",
      kind: "orb",
      color: "#818cf8",
      dmg: 44,
      cd: 2.8,
      speed: 145,
      radius: 26,
      status: "frost",
      desc: "Launches a drifting dark-lunar sphere that chills doodles and detonates on expiry."
    },
    {
      id: "starfall_barrage",
      name: "Starfall Barrage",
      school: "astral",
      kind: "bolt",
      color: "#93c5fd",
      dmg: 16,
      cd: 1.05,
      speed: 440,
      count: 3,
      pierce: 1,
      status: null,
      desc: "Fires a rapid three-star fan volley at the closest approaching doodle."
    },
    {
      id: "void_lance",
      name: "Void Lance",
      school: "astral",
      kind: "bolt",
      color: "#6366f1",
      dmg: 34,
      cd: 1.65,
      speed: 560,
      count: 1,
      pierce: 6,
      status: "vuln",
      desc: "Hurls a needle-sharp astral spear that skewers straight through entire ranks."
    },
    {
      id: "celestial_phalanx",
      name: "Celestial Phalanx",
      school: "astral",
      kind: "orbit",
      color: "#38bdf8",
      dmg: 22,
      cd: 0.45,
      radius: 68,
      count: 4,
      status: null,
      desc: "Manifests four floating arcane daggers orbiting your wizard hat."
    },
    {
      id: "lunar_crescent",
      name: "Lunar Crescent",
      school: "astral",
      kind: "lash",
      color: "#c4b5fd",
      dmg: 32,
      cd: 1.4,
      range: 130,
      arc: 1.9,
      status: "frost",
      desc: "Sweeps a shimmering silver moon-arc that cleaves and chills foes in front."
    },
    {
      id: "nebula_rift",
      name: "Nebula Rift",
      school: "astral",
      kind: "zone",
      color: "#4f46e5",
      dmg: 18,
      cd: 3.1,
      radius: 78,
      duration: 3.4,
      status: "vuln",
      desc: "Tears open a starfield rift beneath enemies, weakening their defenses."
    },

    // ================= 2. ASHEN FLAME & REAPER (7) =================
    {
      id: "reapers_orbit",
      name: "Reaper's Orbit",
      school: "ashen",
      kind: "orbit",
      color: "#fb923c",
      dmg: 28,
      cd: 0.4,
      radius: 86,
      count: 2,
      status: "burn",
      desc: "Twin smoldering spectral scythes whirl endlessly around you, igniting doodles."
    },
    {
      id: "cinder_spiral",
      name: "Cinder Spiral",
      school: "ashen",
      kind: "zone",
      color: "#ea580c",
      dmg: 22,
      cd: 2.7,
      radius: 92,
      duration: 3.0,
      pull: 42,
      status: "burn",
      desc: "Erupts a swirling black-and-amber flame vortex that scorches Max HP."
    },
    {
      id: "pyre_surge",
      name: "Pyre Surge",
      school: "ashen",
      kind: "bolt",
      color: "#f97316",
      dmg: 30,
      cd: 1.35,
      speed: 370,
      count: 1,
      pierce: 1,
      explode: 56,
      status: "burn",
      desc: "Lobs a volatile cinder fireball that erupts into a burning splash radius."
    },
    {
      id: "soul_lantern",
      name: "Soul Lantern",
      school: "ashen",
      kind: "orb",
      color: "#fdba74",
      dmg: 32,
      cd: 2.6,
      speed: 115,
      radius: 22,
      status: "burn",
      desc: "Releases a drifting reaper lantern that sears everything passing through its halo."
    },
    {
      id: "ash_nova",
      name: "Ash Nova",
      school: "ashen",
      kind: "nova",
      color: "#fb7185",
      dmg: 35,
      cd: 2.4,
      radius: 135,
      status: "burn",
      desc: "Detonates an expanding ring of pale embers around the wizard."
    },
    {
      id: "ember_cleave",
      name: "Ember Cleave",
      school: "ashen",
      kind: "lash",
      color: "#f97316",
      dmg: 38,
      cd: 1.5,
      range: 122,
      arc: 2.2,
      status: "burn",
      desc: "Swings a blazing spectral halberd arc that sears close-range swarms."
    },
    {
      id: "wraith_pillars",
      name: "Wraith Pillars",
      school: "ashen",
      kind: "meteor",
      color: "#c2410c",
      dmg: 48,
      cd: 2.35,
      radius: 66,
      count: 2,
      status: "burn",
      desc: "Calls twin columns of ashen fire up beneath dense enemy clusters."
    },

    // ================= 3. CRIMSON & HEMORRHAGE (7) =================
    {
      id: "crimson_swarm",
      name: "Crimson Swarm",
      school: "crimson",
      kind: "homing",
      color: "#f43f5e",
      dmg: 14,
      cd: 1.15,
      speed: 290,
      count: 4,
      status: "bleed",
      desc: "Unleashes four relentless crimson insects that chase enemies and stack Hemorrhage."
    },
    {
      id: "vein_rupture",
      name: "Vein Rupture",
      school: "crimson",
      kind: "zone",
      color: "#be123c",
      dmg: 24,
      cd: 2.6,
      radius: 82,
      duration: 2.8,
      status: "bleed",
      desc: "Paints a boiling scarlet sigil on the floor that rapidly stacks bleed."
    },
    {
      id: "sanguine_spike",
      name: "Sanguine Spike",
      school: "crimson",
      kind: "bolt",
      color: "#e11d48",
      dmg: 27,
      cd: 1.1,
      speed: 490,
      count: 2,
      pierce: 3,
      status: "bleed",
      desc: "Fires crystallized crimson needles that pierce armor and draw blood."
    },
    {
      id: "blood_halo",
      name: "Blood Halo",
      school: "crimson",
      kind: "orbit",
      color: "#fb7185",
      dmg: 20,
      cd: 0.42,
      radius: 60,
      count: 3,
      status: "bleed",
      desc: "Three spinning razor rings carve close attackers and trigger bleed bursts."
    },
    {
      id: "scarlet_lash",
      name: "Scarlet Lash",
      school: "crimson",
      kind: "lash",
      color: "#f43f5e",
      dmg: 36,
      cd: 1.35,
      range: 145,
      arc: 1.7,
      status: "bleed",
      desc: "Cracks a wide crimson whip forward, ripping through front-line doodles."
    },
    {
      id: "hemorrhage_pulse",
      name: "Hemorrhage Pulse",
      school: "crimson",
      kind: "nova",
      color: "#9f1239",
      dmg: 32,
      cd: 2.2,
      radius: 130,
      status: "bleed",
      desc: "Emits a crimson shockwave that detonates active bleed stacks."
    },
    {
      id: "vital_siphon",
      name: "Vital Siphon",
      school: "crimson",
      kind: "beam",
      color: "#fb7185",
      dmg: 26,
      cd: 2.5,
      range: 310,
      width: 14,
      lifesteal: 0.08,
      status: "bleed",
      desc: "Drains essence along a scarlet tether, healing the wizard on hit."
    },

    // ================= 4. GLACIAL & FROST (7) =================
    {
      id: "permafrost_wave",
      name: "Permafrost Wave",
      school: "glacial",
      kind: "nova",
      color: "#38bdf8",
      dmg: 30,
      cd: 2.25,
      radius: 155,
      status: "frost",
      desc: "Sweeps a wide frostbite ring outward, heavily slowing every doodle caught."
    },
    {
      id: "icicle_volley",
      name: "Icicle Volley",
      school: "glacial",
      kind: "bolt",
      color: "#7dd3fc",
      dmg: 14,
      cd: 1.0,
      speed: 470,
      count: 4,
      pierce: 1,
      status: "frost",
      desc: "Sprays four jagged frost lances in a tight cone toward the nearest threat."
    },
    {
      id: "hoarfrost_ring",
      name: "Hoarfrost Ring",
      school: "glacial",
      kind: "orbit",
      color: "#bae6fd",
      dmg: 19,
      cd: 0.45,
      radius: 76,
      count: 3,
      status: "frost",
      desc: "Orbiting ice crystals chill anything daring to close distance."
    },
    {
      id: "shatter_nova",
      name: "Shatter Nova",
      school: "glacial",
      kind: "zone",
      color: "#0284c7",
      dmg: 26,
      cd: 2.5,
      radius: 86,
      duration: 2.6,
      status: "frost",
      desc: "Freezes a jagged patch of ground that fractures beneath enemies."
    },
    {
      id: "glacier_pillar",
      name: "Glacier Pillar",
      school: "glacial",
      kind: "meteor",
      color: "#0ea5e9",
      dmg: 52,
      cd: 2.3,
      radius: 68,
      count: 1,
      status: "frost",
      desc: "Drops a colossal frozen obelisk straight onto the thickest cluster."
    },
    {
      id: "rime_lance",
      name: "Rime Lance",
      school: "glacial",
      kind: "beam",
      color: "#e0f2fe",
      dmg: 32,
      cd: 2.0,
      range: 360,
      width: 15,
      status: "frost",
      desc: "Fires an instant sub-zero ray that flash-freezes everything in a straight line."
    },
    {
      id: "boreal_shards",
      name: "Boreal Shards",
      school: "glacial",
      kind: "homing",
      color: "#67e8f9",
      dmg: 18,
      cd: 1.3,
      speed: 330,
      count: 3,
      status: "frost",
      desc: "Releases three curving frost prisms that hunt down nimble enemies."
    },

    // ================= 5. TEMPEST & ARC (7) =================
    {
      id: "fulmen_spear",
      name: "Fulmen Spear",
      school: "tempest",
      kind: "bolt",
      color: "#facc15",
      dmg: 35,
      cd: 1.35,
      speed: 620,
      count: 1,
      pierce: 4,
      status: "shock",
      desc: "Hurls a blazing golden thunderbolt at supersonic speed."
    },
    {
      id: "chain_tempest",
      name: "Chain Tempest",
      school: "tempest",
      kind: "chain",
      color: "#fde047",
      dmg: 25,
      cd: 1.45,
      bounces: 5,
      range: 240,
      status: "shock",
      desc: "Zaps an enemy and arcs crackling lightning across five nearby targets."
    },
    {
      id: "static_orbit",
      name: "Static Orbit",
      school: "tempest",
      kind: "orbit",
      color: "#fef08a",
      dmg: 18,
      cd: 0.35,
      radius: 64,
      count: 4,
      status: "shock",
      desc: "Four high-voltage plasma nodes spin rapidly around your wizard cloak."
    },
    {
      id: "gale_repulse",
      name: "Gale Repulse",
      school: "tempest",
      kind: "nova",
      color: "#a7f3d0",
      dmg: 22,
      cd: 1.9,
      radius: 148,
      knockback: 185,
      status: "shock",
      desc: "Blasts a violent stormfront outward, shoving swarms safely back."
    },
    {
      id: "thunderclap",
      name: "Thunderclap",
      school: "tempest",
      kind: "meteor",
      color: "#eab308",
      dmg: 50,
      cd: 2.0,
      radius: 64,
      count: 2,
      status: "shock",
      desc: "Calls sudden sky-strikes onto random enemies with deafening impact."
    },
    {
      id: "arc_whip",
      name: "Arc Whip",
      school: "tempest",
      kind: "lash",
      color: "#fde047",
      dmg: 30,
      cd: 1.15,
      range: 140,
      arc: 2.0,
      status: "shock",
      desc: "Snaps a crackling lightning lash that hits fast and shocks crowds."
    },
    {
      id: "ion_seeker",
      name: "Ion Seeker",
      school: "tempest",
      kind: "homing",
      color: "#fef08a",
      dmg: 19,
      cd: 1.25,
      speed: 360,
      count: 3,
      status: "shock",
      desc: "Launches three magnetized spark spheres that lock onto nearby foes."
    },

    // ================= 6. GRAVITY & SINGULARITY (7) =================
    {
      id: "event_horizon",
      name: "Event Horizon",
      school: "gravity",
      kind: "zone",
      color: "#a855f7",
      dmg: 20,
      cd: 3.1,
      radius: 112,
      duration: 3.4,
      pull: 95,
      status: "pull",
      desc: "Conjures a violet black hole that drags hordes inward and crushes them."
    },
    {
      id: "meteor_slam",
      name: "Meteor Slam",
      school: "gravity",
      kind: "meteor",
      color: "#c084fc",
      dmg: 62,
      cd: 2.55,
      radius: 78,
      count: 1,
      status: "pull",
      desc: "Pulls a colossal amethyst rock out of orbit to flatten enemies."
    },
    {
      id: "gravity_well",
      name: "Gravity Well",
      school: "gravity",
      kind: "orb",
      color: "#9333ea",
      dmg: 30,
      cd: 2.5,
      speed: 120,
      radius: 26,
      pull: 65,
      status: "pull",
      desc: "Sends a heavy distortion orb gliding forward, vacuuming doodles along its path."
    },
    {
      id: "kinetic_crush",
      name: "Kinetic Crush",
      school: "gravity",
      kind: "nova",
      color: "#d8b4fe",
      dmg: 40,
      cd: 2.3,
      radius: 142,
      pull: -120,
      status: "vuln",
      desc: "Triggers a violent gravitational shockwave that cracks enemy armor."
    },
    {
      id: "orbiting_monolith",
      name: "Orbiting Monolith",
      school: "gravity",
      kind: "orbit",
      color: "#a855f7",
      dmg: 34,
      cd: 0.55,
      radius: 96,
      count: 2,
      status: "pull",
      desc: "Twin stone obelisks revolve around you, flattening doodles on contact."
    },
    {
      id: "singularity_lance",
      name: "Singularity Lance",
      school: "gravity",
      kind: "beam",
      color: "#c084fc",
      dmg: 38,
      cd: 2.4,
      range: 380,
      width: 20,
      status: "vuln",
      desc: "Tears a razor-straight gravity fracture across the arena."
    },
    {
      id: "rift_pull",
      name: "Rift Pull",
      school: "gravity",
      kind: "chain",
      color: "#e879f9",
      dmg: 26,
      cd: 1.75,
      bounces: 4,
      range: 250,
      status: "pull",
      desc: "Links four enemies with purple gravity tethers and snaps them together."
    },

    // ================= 7. ARCANE FAMILIARS (8) =================
    {
      id: "spectral_hound",
      name: "Spectral Hound",
      school: "familiar",
      kind: "familiar",
      role: "chaser",
      color: "#34d399",
      dmg: 22,
      cd: 0.75,
      speed: 255,
      status: "bleed",
      desc: "Summons an autonomous spirit wolf that relentlessly hunts down doodles."
    },
    {
      id: "floating_grimoire",
      name: "Floating Grimoire",
      school: "familiar",
      kind: "familiar",
      role: "turret",
      color: "#6ee7b7",
      dmg: 18,
      cd: 0.85,
      speed: 190,
      status: "vuln",
      desc: "A sentient spellbook hovers beside your shoulder, firing crisp arcane bolts."
    },
    {
      id: "astral_owl",
      name: "Astral Owl",
      school: "familiar",
      kind: "familiar",
      role: "bomber",
      color: "#60a5fa",
      dmg: 28,
      cd: 1.35,
      speed: 225,
      status: "frost",
      desc: "Circles above the arena and swoops down with explosive starlight feathers."
    },
    {
      id: "clockwork_imp",
      name: "Clockwork Imp",
      school: "familiar",
      kind: "familiar",
      role: "turret",
      color: "#fbbf24",
      dmg: 13,
      cd: 0.48,
      speed: 240,
      status: null,
      desc: "A hyperactive brass sprite that rapidly peppers nearby swarms with darts."
    },
    {
      id: "phantom_blade",
      name: "Phantom Blade",
      school: "familiar",
      kind: "familiar",
      role: "chaser",
      color: "#e2e8f0",
      dmg: 27,
      cd: 0.85,
      speed: 290,
      status: "bleed",
      desc: "An enchanted floating rapier that darts through enemies on its own."
    },
    {
      id: "cinder_wisp",
      name: "Cinder Wisp",
      school: "familiar",
      kind: "familiar",
      role: "bomber",
      color: "#fb923c",
      dmg: 24,
      cd: 1.15,
      speed: 215,
      status: "burn",
      desc: "A playful ember spirit that drops burning sparks onto enemy groups."
    },
    {
      id: "frost_sprite",
      name: "Frost Sprite",
      school: "familiar",
      kind: "familiar",
      role: "turret",
      color: "#38bdf8",
      dmg: 17,
      cd: 0.9,
      speed: 210,
      status: "frost",
      desc: "A glacial fairy that fires chilling shards to slow fast flankers."
    },
    {
      id: "storm_hawk",
      name: "Storm Hawk",
      school: "familiar",
      kind: "familiar",
      role: "chaser",
      color: "#facc15",
      dmg: 25,
      cd: 0.8,
      speed: 315,
      status: "shock",
      desc: "A crackling tempest raptor that dives across the screen shocking targets."
    }
  ],

  /* ---------------------------------------------------------
     10 OPTIONAL DUO SPELL FUSIONS (NEVER FORCED)
     Unlock in the level-up draft once you hold both ingredients
     --------------------------------------------------------- */
  fusions: [
    {
      id: "astral_cataclysm",
      name: "Astral Cataclysm",
      requires: ["aether_beam", "eclipse_orb"],
      school: "astral",
      kind: "beam",
      color: "#93c5fd",
      dmg: 96,
      cd: 2.1,
      range: 540,
      width: 38,
      explode: 95,
      status: "frost",
      desc: "FUSES Aether Beam + Eclipse Orb into a colossal frost-moon torrent that freezes and shatters entire lanes."
    },
    {
      id: "soulfire_maelstrom",
      name: "Soul-Fire Maelstrom",
      requires: ["reapers_orbit", "cinder_spiral"],
      school: "ashen",
      kind: "orbit",
      color: "#fb923c",
      dmg: 62,
      cd: 0.3,
      radius: 108,
      count: 4,
      pull: 75,
      status: "burn",
      desc: "FUSES Reaper's Orbit + Cinder Spiral into four blazing scythes that pull doodles inward and sear Max HP."
    },
    {
      id: "stormdagger_volley",
      name: "Storm-Dagger Volley",
      requires: ["celestial_phalanx", "fulmen_spear"],
      school: "tempest",
      kind: "chain",
      color: "#fde047",
      dmg: 58,
      cd: 0.95,
      bounces: 8,
      range: 340,
      status: "shock",
      desc: "FUSES Celestial Phalanx + Fulmen Spear so orbiting daggers fire rapid 8-bounce chain lightning."
    },
    {
      id: "singularity_of_blood",
      name: "Singularity of Blood",
      requires: ["crimson_swarm", "event_horizon"],
      school: "crimson",
      kind: "zone",
      color: "#f43f5e",
      dmg: 56,
      cd: 2.4,
      radius: 138,
      duration: 4.0,
      pull: 135,
      status: "bleed",
      desc: "FUSES Crimson Swarm + Event Horizon into a blood black-hole triggering continuous Hemorrhage explosions."
    },
    {
      id: "absolute_shatter",
      name: "Absolute Shatter",
      requires: ["permafrost_wave", "kinetic_crush"],
      school: "glacial",
      kind: "nova",
      color: "#67e8f9",
      dmg: 88,
      cd: 1.9,
      radius: 230,
      status: "frost",
      desc: "FUSES Permafrost Wave + Kinetic Crush into a massive screen-wide glacial implosion."
    },
    {
      id: "supernova_judgment",
      name: "Supernova Judgment",
      requires: ["meteor_slam", "pyre_surge"],
      school: "ashen",
      kind: "meteor",
      color: "#fb7185",
      dmg: 98,
      cd: 1.85,
      radius: 102,
      count: 3,
      status: "burn",
      desc: "FUSES Meteor Slam + Pyre Surge to rain triple volcanic star-meteors across enemy clusters."
    },
    {
      id: "tempest_pack",
      name: "Tempest Alpha Pack",
      requires: ["spectral_hound", "chain_tempest"],
      school: "familiar",
      kind: "familiar",
      role: "chaser",
      color: "#facc15",
      dmg: 54,
      cd: 0.45,
      speed: 350,
      status: "shock",
      desc: "FUSES Spectral Hound + Chain Tempest into a hyper-fast thunder alpha wolf arcing shockwaves."
    },
    {
      id: "scarlet_reaper",
      name: "Scarlet Reaper",
      requires: ["scarlet_lash", "ember_cleave"],
      school: "crimson",
      kind: "lash",
      color: "#fb7185",
      dmg: 84,
      cd: 1.05,
      range: 190,
      arc: 6.28,
      lifesteal: 0.1,
      status: "bleed",
      desc: "FUSES Scarlet Lash + Ember Cleave into a full 360-degree blood-flame sweep that heals on hit."
    },
    {
      id: "cryo_prism_ray",
      name: "Cryo-Prism Ray",
      requires: ["rime_lance", "singularity_lance"],
      school: "glacial",
      kind: "beam",
      color: "#67e8f9",
      dmg: 82,
      cd: 1.65,
      range: 520,
      width: 30,
      status: "frost",
      desc: "FUSES Rime Lance + Singularity Lance into twin refracting cryo-gravity lasers."
    },
    {
      id: "arcane_menagerie",
      name: "Ascended Arch-Grimoire",
      requires: ["floating_grimoire", "astral_owl"],
      school: "familiar",
      kind: "familiar",
      role: "bomber",
      color: "#c084fc",
      dmg: 60,
      cd: 0.65,
      speed: 280,
      status: "vuln",
      desc: "FUSES Floating Grimoire + Astral Owl into an ascended floating tome firing cosmic explosive salvos."
    }
  ],

  /* ---------------------------------------------------------
     12 CURSED TRADE-OFF PACTS (HIGH RISK / HIGH REWARD)
     --------------------------------------------------------- */
  pacts: [
    {
      id: "shattered_seal",
      name: "Shattered Seal",
      upside: "+28% All Stats (Power, Speed, AoE, CDR)",
      downside: "+30% Damage Taken from all sources",
      apply: (s) => {
        s.dmgMult *= 1.28;
        s.speedMult *= 1.18;
        s.aoeMult *= 1.22;
        s.cdMult *= 0.82;
        s.dmgTakenMult *= 1.3;
      }
    },
    {
      id: "hollow_prism",
      name: "Hollow Prism",
      upside: "-45% Spell Cooldowns",
      downside: "-35% Max HP",
      apply: (s) => {
        s.cdMult *= 0.55;
        s.maxHp = Math.max(40, Math.round(s.maxHp * 0.65));
        s.hp = Math.min(s.hp, s.maxHp);
      }
    },
    {
      id: "crimson_chalice",
      name: "Crimson Chalice",
      upside: "+14% Chance to Heal +6 HP on every Kill",
      downside: "Disables all passive HP regeneration",
      apply: (s) => {
        s.killHealChance += 0.14;
        s.noRegen = true;
      }
    },
    {
      id: "frenzy_crown",
      name: "Frenzy Crown",
      upside: "+80% Spell Power & automatic madness bursts",
      downside: "Periodic self-burn (-2 HP every 2.5 sec)",
      apply: (s) => {
        s.dmgMult *= 1.8;
        s.frenzyBurn = true;
      }
    },
    {
      id: "glass_monocle",
      name: "Glass Monocle",
      upside: "+65% Crit Burst Damage & +40% Projectile Speed",
      downside: "Max HP reduced by 40%",
      apply: (s) => {
        s.critMult += 0.65;
        s.projSpeedMult *= 1.4;
        s.maxHp = Math.max(35, Math.round(s.maxHp * 0.6));
        s.hp = Math.min(s.hp, s.maxHp);
      }
    },
    {
      id: "lead_greaves",
      name: "Leadened Greaves",
      upside: "+80 Max HP & +38% Spell AoE Radius",
      downside: "-20% Wizard Movement Speed",
      apply: (s) => {
        s.maxHp += 80;
        s.hp += 80;
        s.aoeMult *= 1.38;
        s.speedMult *= 0.8;
      }
    },
    {
      id: "void_hourglass",
      name: "Void Hourglass",
      upside: "+2 Bonus Projectiles to multi-shot & homing spells",
      downside: "+22% Enemy Movement Speed",
      apply: (s) => {
        s.bonusProj += 2;
        s.enemySpeedMult *= 1.22;
      }
    },
    {
      id: "blood_ink",
      name: "Blood-Stained Ink",
      upside: "+55% XP Gain from orbs",
      downside: "+25% Damage Taken",
      apply: (s) => {
        s.xpMult *= 1.55;
        s.dmgTakenMult *= 1.25;
      }
    },
    {
      id: "echo_bell",
      name: "Cracked Echo Bell",
      upside: "40% Chance for any spell to double-cast",
      downside: "+20% Base Spell Cooldowns",
      apply: (s) => {
        s.doubleCastChance += 0.4;
        s.cdMult *= 1.2;
      }
    },
    {
      id: "abyssal_magnet",
      name: "Abyssal Magnet",
      upside: "2.6x XP Magnet Radius & +22% Move Speed",
      downside: "+28% Doodle Horde Density",
      apply: (s) => {
        s.pickupRadius *= 2.6;
        s.speedMult *= 1.22;
        s.spawnRateMult *= 1.28;
      }
    },
    {
      id: "ashen_vow",
      name: "Ashen Vow",
      upside: "+110% Burn, Bleed & Frostbite status damage",
      downside: "-20% Direct Hit Damage",
      apply: (s) => {
        s.statusMult *= 2.1;
        s.dmgMult *= 0.8;
      }
    },
    {
      id: "pack_covenant",
      name: "Covenant of the Pack",
      upside: "+95% Familiar Damage & faster Familiar attacks",
      downside: "+65% Blink Dash Cooldown",
      apply: (s) => {
        s.familiarMult *= 1.95;
        s.dashCdMult *= 1.65;
      }
    }
  ]
};