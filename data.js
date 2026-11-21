/* =========================================================
   PORTFOLIO V0.6.1 — CENTRAL DATA & BILINGUAL CONTENT
   Clean Copy • All 5 Archival Building Photos • Coin-Op Arcade
   ========================================================= */

window.PORTFOLIO_DATA = {
  // Drop your half-body portrait inside assets/ (e.g. "assets/portrait.jpg") when ready
  portraitImage: "",

  contact: {
    outlook: "fauzakaizakusetiawan@student.telkomuniversity.ac.id",
    gmail: "kaizaku.telkomuniv@gmail.com",
    whatsappUrl: "https://wa.me/6280000000000", // Replace with your active WA number
    github: "https://github.com/kaimiongmiong012",
    linkedin: "https://www.linkedin.com/in/fauza-kaizaku-439338327",
    instagram: "https://www.instagram.com/kaieaych"
  },

  /* ---------------------------------------------------------
     HERO 3D MONOLITH PILLARS
     --------------------------------------------------------- */
  heroPillars: [
    {
      badge: "01 // UI/UX ARCHITECTURE",
      caption: {
        en: "HCI-DRIVEN INTERFACE SYSTEMS & PRODUCT ARCHITECTURE",
        id: "SISTEM ANTARMUKA HCI & ARSITEKTUR PRODUK"
      },
      shape: "monolith"
    },
    {
      badge: "02 // FULL-STACK & WEBGL",
      caption: {
        en: "LARAVEL, MARIADB, PIXEL CANVAS & THREE.JS 3D",
        id: "LARAVEL, MARIADB, PIXEL CANVAS & THREE.JS 3D"
      },
      shape: "octa"
    },
    {
      badge: "03 // GAME DEV & QOL",
      caption: {
        en: "UNITY, UNREAL ENGINE & PLAYABLE BROWSER CABINETS",
        id: "UNITY, UNREAL ENGINE & GAME ARCADE BROWSER"
      },
      shape: "torus"
    }
  ],

  /* ---------------------------------------------------------
     ABOUT INTERACTIVE FOCUS MODES (CLEAN & AIRY)
     --------------------------------------------------------- */
  aboutFocus: {
    hci: {
      en: {
        lead: "ORGANIZING CONCEPTS INTO CLEAN INTERFACES BEFORE HEAVY CODE BEGINS.",
        body: "Human-Computer Interaction focus. Minimal hierarchies, practical Quality of Life flows."
      },
      id: {
        lead: "MENYUSUN KONSEP MENJADI ANTARMUKA BERSIH SEBELUM KODE BERAT DIMULAI.",
        body: "Fokus Human-Computer Interaction. Hierarki minimalis dan alur kerja yang nyaman."
      }
    },
    web: {
      en: {
        lead: "BRIDGING FIGMA PROTOTYPES WITH REAL PRODUCTION CODE & DATABASES.",
        body: "Laravel & MariaDB internal dashboards, custom WordPress storefronts, and Three.js / Canvas engines."
      },
      id: {
        lead: "MENGHUBUNGKAN PROTOTIPE FIGMA DENGAN KODE PRODUKSI & DATABASE.",
        body: "Dashboard internal Laravel & MariaDB, WordPress kustom, serta engine Three.js dan Canvas."
      }
    },
    english: {
      en: {
        lead: "INTERACTIVE GAME PROTOTYPING & PRACTICAL ENGLISH COACHING.",
        body: "Building playable Unity, Unreal, and browser mechanics while helping peers sharpen technical English."
      },
      id: {
        lead: "PROTOTIPE GAME INTERAKTIF & COACHING BAHASA INGGRIS PRAKTIS.",
        body: "Membangun mekanik Unity, Unreal, dan game browser sekaligus melatih komunikasi teknis bahasa Inggris."
      }
    }
  },

  /* ---------------------------------------------------------
     EDUCATION & TRACK (5 STOPS — UNBOXED VERTICAL ROULETTE)
     --------------------------------------------------------- */
  educationTrack: [
    {
      id: "tup",
      type: "academic",
      stage: { en: "HIGHER EDUCATION", id: "PERGURUAN TINGGI" },
      badge: { en: "5TH SEMESTER", id: "SEMESTER 5" },
      name: "TELKOM UNIVERSITY PURWOKERTO",
      role: {
        en: "B.Sc. Informatics Engineering — HCI & QOL Focus",
        id: "S1 Teknik Informatika — Fokus HCI & QOL"
      },
      city: "CENTRAL JAVA, INDONESIA",
      zoom: 17,
      mapQuery: "Telkom+University+Purwokerto",
      image: "assets/telkomuniversitypurwokerto.jpg",
      imageCaption: "ARCHIVE // 01"
    },
    {
      id: "telkom-reg4",
      type: "industry",
      stage: { en: "INDUSTRIAL INTERNSHIP", id: "MAGANG INDUSTRI" },
      badge: { en: "WEB & UI/UX", id: "WEB & UI/UX" },
      name: "PT. TELKOM INDONESIA REGIONAL IV",
      role: {
        en: "Web Developer & UI/UX Intern — Networking Division",
        id: "Magang Web Developer & UI/UX — Divisi Networking"
      },
      city: "SEMARANG, INDONESIA",
      zoom: 17,
      mapQuery: "Telkom+Regional+IV+Semarang",
      image: "assets/telkomreg4.jpg",
      imageCaption: "ARCHIVE // 02"
    },
    {
      id: "smkn1-pwt",
      type: "academic",
      stage: { en: "VOCATIONAL HIGH SCHOOL", id: "SMK" },
      badge: { en: "ACADEMIC", id: "AKADEMIK" },
      name: "SMKN 1 PURWOKERTO",
      role: {
        en: "Software & Web Fundamentals Track",
        id: "Dasar Perangkat Lunak & Web"
      },
      city: "CENTRAL JAVA, INDONESIA",
      zoom: 17,
      mapQuery: "SMK+Negeri+1+Purwokerto",
      image: "assets/smkn1purwokerto.jpg",
      imageCaption: "ARCHIVE // 03"
    },
    {
      id: "smpn24-smg",
      type: "academic",
      stage: { en: "JUNIOR HIGH SCHOOL", id: "SMP" },
      badge: { en: "ACADEMIC", id: "AKADEMIK" },
      name: "SMPN 24 SEMARANG",
      role: {
        en: "General Academic & STEM Foundation",
        id: "Pendidikan Akademik & Fondasi STEM"
      },
      city: "SEMARANG, INDONESIA",
      zoom: 17,
      mapQuery: "SMP+Negeri+24+Semarang",
      image: "assets/smpn24semarang.webp",
      imageCaption: "ARCHIVE // 04"
    },
    {
      id: "sd-sapen",
      type: "academic",
      stage: { en: "ELEMENTARY SCHOOL", id: "SD" },
      badge: { en: "ACADEMIC", id: "AKADEMIK" },
      name: "SD MUHAMMADIYAH SAPEN YOGYAKARTA",
      role: {
        en: "Early Academic Foundation",
        id: "Pendidikan Dasar"
      },
      city: "YOGYAKARTA, INDONESIA",
      zoom: 17,
      mapQuery: "SD+Muhammadiyah+Sapen+Yogyakarta",
      image: "assets/sdmuhsapenyogya.webp",
      imageCaption: "ARCHIVE // 05"
    }
  ],

  /* ---------------------------------------------------------
     PROJECTS (INLINE WALKTHROUGH + TETRIS COLLAGE — ZERO FLUFF)
     --------------------------------------------------------- */
  projects: {
    isim: {
      tag: { en: "PT. TELKOM INDONESIA REG IV", id: "PT. TELKOM INDONESIA REG IV" },
      stamp: "",
      title: "ISIM — INVENTORY MANAGEMENT",
      body: {
        en: "Internal inventory dashboard built for PT. Telkom Indonesia Regional IV Networking Division.",
        id: "Dashboard inventaris internal untuk Divisi Networking PT. Telkom Indonesia Regional IV."
      },
      media: [
        {
          id: "video",
          label: { en: "▶ WALKTHROUGH", id: "▶ DEMO VIDEO" },
          type: "youtube",
          videoId: "9BANlAc9Ir8",
          caption: {
            en: "ISIM Live Walkthrough Demo",
            id: "Video Demo Langsung ISIM"
          }
        },
        {
          id: "ui",
          label: { en: "DASHBOARD UI", id: "UI DASHBOARD" },
          type: "image",
          src: "assets/isim-ui.jpg",
          caption: {
            en: "DASHBOARD UI",
            id: "UI DASHBOARD"
          }
        },
        {
          id: "desk",
          label: { en: "WORKSPACE", id: "MEJA KERJA" },
          type: "image",
          src: "assets/isim-desk.jpg",
          caption: {
            en: "ON-SITE DESK",
            id: "MEJA KERJA"
          }
        },
        {
          id: "team",
          label: { en: "REG IV TEAM", id: "TIM REG IV" },
          type: "image",
          src: "assets/telkom-team.jpg",
          caption: {
            en: "REG IV TEAM",
            id: "TIM REG IV"
          }
        }
      ],
      archSteps: [
        { step: "01", label: "FLOW & WIREFRAME" },
        { step: "02", label: "MARIADB & AUTH" },
        { step: "03", label: "LARAVEL CRUD" },
        { step: "04", label: "STAFF HANDOVER" }
      ],
      specs: [
        { label: "STACK", text: "Laravel (PHP), Python utilities, MariaDB, HTML/CSS/JS." },
        { label: "SECURITY", text: "Role permissions, CAPTCHA login, email verification." },
        { label: "MODULES", text: "Master registry, categories, stock logs, summary charts." },
        { label: "DELIVERY", text: "Deployed internally for PT. Telkom Indonesia Regional IV staff." }
      ]
    },
    ecommerce: {
      tag: { en: "RETAIL WEB ARCHITECTURE", id: "ARSITEKTUR WEB RITEL" },
      stamp: "",
      title: "APPAREL E-COMMERCE PLATFORM",
      body: {
        en: "Minimalist apparel storefront with Indonesian payment gateways and live courier tracking.",
        id: "Toko ritel pakaian minimalis dengan payment gateway Indonesia dan pelacakan pengiriman."
      },
      media: [],
      archSteps: [
        { step: "01", label: "CATALOG GRID" },
        { step: "02", label: "CUSTOM FRONT-END" },
        { step: "03", label: "MIDTRANS / XENDIT" },
        { step: "04", label: "LIVE TRACKING" }
      ],
      specs: [
        { label: "PLATFORM", text: "WordPress core + custom HTML, CSS, JavaScript." },
        { label: "PAYMENTS", text: "Midtrans, Xendit, virtual accounts, e-wallets, bank transfer." },
        { label: "UX", text: "Mobile-first catalog grid, size selector, clean cart drawer." },
        { label: "FULFILLMENT", text: "Automated courier rates & live order status tracking." }
      ]
    }
  },

  /* ---------------------------------------------------------
     CREDENTIALS DECK (5 VERIFIED ASSETS — CLEAN COPY)
     --------------------------------------------------------- */
  credentials: [
    {
      num: "01",
      accent: true,
      orientation: "landscape",
      issuer: "PT. TELKOM INDONESIA REGIONAL IV",
      title: "INDUSTRIAL INTERNSHIP — WEB & UI/UX",
      meta: "NETWORKING DIVISION",
      image: "assets/cert-telkom.jpg",
      fallbackLabel: "CERT-TELKOM.JPG",
      desc: {
        en: "Completed Web Development and UI/UX internship, designing and delivering the internal ISIM inventory platform.",
        id: "Menyelesaikan magang Web Development dan UI/UX dengan membangun platform inventaris internal ISIM."
      }
    },
    {
      num: "02",
      accent: false,
      orientation: "portrait",
      issuer: "EDUCATIONAL TESTING SERVICE (ETS)",
      title: "OFFICIAL TOEIC SCORE CERTIFICATE",
      meta: "SCORE 905 • L 490 / R 415",
      image: "assets/cert-toeic.jpg",
      fallbackLabel: "CERT-TOEIC.JPG",
      desc: {
        en: "International Professional Proficiency in English communication and technical presentation.",
        id: "Kemahiran bahasa Inggris tingkat profesional internasional."
      }
    },
    {
      num: "03",
      accent: false,
      orientation: "portrait",
      issuer: "HUAWEI ICT ACADEMY",
      title: "HCIE-OPENGAUSS V1.0 COURSE",
      meta: "2026-04-07 • ICT20260407000024",
      image: "assets/cert-huawei-opengauss.png",
      fallbackLabel: "CERT-HUAWEI-OPENGAUSS.PNG",
      desc: {
        en: "Enterprise openGauss database architecture, high availability, SQL tuning, and security.",
        id: "Arsitektur database enterprise openGauss, optimasi SQL, dan keamanan data."
      }
    },
    {
      num: "04",
      accent: false,
      orientation: "portrait",
      issuer: "HUAWEI ICT ACADEMY",
      title: "DATA MANAGEMENT AND ANALYTICS",
      meta: "2026-04-09 • ICT20260409000123",
      image: "assets/cert-huawei-data.png",
      fallbackLabel: "CERT-HUAWEI-DATA.PNG",
      desc: {
        en: "Structured data lifecycle management, analytical querying, and warehouse modeling.",
        id: "Pengelolaan siklus data terstruktur, kueri analitik, dan pemodelan gudang data."
      }
    },
    {
      num: "05",
      accent: false,
      orientation: "landscape",
      issuer: "INTERVOL — TELKOM UNIVERSITY",
      title: "INTERNATIONAL VOLUNTEER & LOGISTICS",
      meta: "THE INDEX • EVENT ORGANIZER",
      image: "assets/cert-intervol.jpg",
      fallbackLabel: "CERT-INTERVOL.JPG",
      desc: {
        en: "Event Organizer & Logistics team handling international guest welcoming, inventory, and RAB.",
        id: "Divisi Event Organizer & Logistik untuk penyambutan tamu internasional dan RAB."
      }
    }
  ],

  /* ---------------------------------------------------------
     COIN-OP ARCADE — 4 PLAYABLE CABINETS
     --------------------------------------------------------- */
  cartridges: {
    runner: {
      id: "runner",
      slot: "CABINET 01",
      channel: "CAB-01",
      title: "GRAVITY FLIP RUNNER",
      genre: "SYNTH PARKOUR & BLASTER",
      desc: "Flip between neon floor and ceiling rails, blast drone squadrons, and stack overdrive multipliers.",
      tags: ["SPACE / W: FLIP", "F / CLICK: BLAST", "COMBO CHAINS"],
      bgGradient: "radial-gradient(circle at 50% 42%, #0c3554 0%, #050a14 78%)",
      accent: "#38bdf8",
      motif: [261.63, 329.63, 392.0, 523.25]
    },
    grimoire: {
      id: "grimoire",
      slot: "CABINET 02",
      channel: "CAB-02",
      title: "GRIMOIRE: ABYSS",
      genre: "16-BIT PIXEL WIZARD ROGUELIKE",
      desc: "Dash across torch-lit stone dungeons hurling fireballs, lightning arcs, frost shields, and Duo Fusions.",
      tags: ["WASD: MOVE", "SPACE: DASH", "50 PIXEL SPELLS"],
      bgGradient: "radial-gradient(circle at 50% 42%, #3b1361 0%, #090512 78%)",
      accent: "#c084fc",
      motif: [220.0, 261.63, 311.13, 440.0]
    },
    campus: {
      id: "campus",
      slot: "CABINET 03",
      channel: "CAB-03",
      title: "CAMPUS COMBAT",
      genre: "RETRO ARCADE FIGHTER",
      desc: "6 pixel fighters with punches, kicks, uppercuts, energy waves, throws, and 3-bar Super Arts.",
      tags: ["A/D: MOVE", "W/S: JUMP/CROUCH", "J/K/L: ATTACK", "U: SUPER"],
      bgGradient: "radial-gradient(circle at 50% 42%, #5c1f0e 0%, #100706 78%)",
      accent: "#fb923c",
      motif: [196.0, 246.94, 293.66, 392.0]
    },
    monolith: {
      id: "monolith",
      slot: "CABINET 04",
      channel: "CAB-04",
      title: "VEIL OF THE MONOLITH",
      genre: "PS1/PS2 3D COLOSSUS CLIMBER",
      desc: "Confront three towering 3D Monoliths with Twin Chain-Blades, Shield parries, and vertical climbing.",
      tags: ["WASD: MOVE", "LMB: BLADES", "RMB: PARRY", "E: CLIMB"],
      bgGradient: "radial-gradient(circle at 50% 42%, #0a3c30 0%, #060a0d 78%)",
      accent: "#34d399",
      motif: [146.83, 220.0, 261.63, 329.63]
    }
  },

  /* ---------------------------------------------------------
     BILINGUAL UI STRINGS (EN / ID)
     --------------------------------------------------------- */
  i18n: {
    en: {
      nav_about: "ABOUT",
      nav_education: "EDUCATION",
      nav_projects: "PROJECTS",
      nav_lounge: "ARCADE",
      nav_credentials: "CREDENTIALS",
      nav_contact: "CONTACT",
      hero_role: "UI/UX DESIGNER & PRODUCT IDEATOR",
      hero_sub:
        "INFORMATICS ENGINEERING STUDENT. STRUCTURING IDEAS INTO CLEAR INTERFACES AND USABLE DIGITAL PRODUCTS.",
      hero_cta_projects: "VIEW PROJECTS",
      hero_cta_arcade: "ENTER ARCADE",
      hero_cta_contact: "CONTACT",
      about_title: "ABOUT",
      portrait_hint: "HALF-BODY SLOT",
      edu_title: "EDUCATION & TRACK",
      legend_industry: "INTERNSHIP",
      open_maps: "MAPS ↗",
      tile_map: "PINNED MAP",
      see_photos: "PHOTOS ↗",
      projects_title: "PROJECTS",
      read_specs: "TECH SPECS",
      read_brief: "DETAILS",
      cred_title: "CREDENTIALS",
      inspect_cert: "360° INSPECT",
      footer_nav: "NAVIGATION",
      footer_contact: "DIRECT CONTACT",
      footer_socials: "SOCIALS",
      wa_cta: "DIRECT MESSAGE ↗"
    },
    id: {
      nav_about: "TENTANG",
      nav_education: "PENDIDIKAN",
      nav_projects: "PROYEK",
      nav_lounge: "ARCADE",
      nav_credentials: "SERTIFIKASI",
      nav_contact: "KONTAK",
      hero_role: "DESAINER UI/UX & IDEATOR PRODUK",
      hero_sub:
        "MAHASISWA TEKNIK INFORMATIKA. MENYUSUN IDE MENJADI ANTARMUKA JELAS DAN PRODUK DIGITAL YANG NYAMAN.",
      hero_cta_projects: "LIHAT PROYEK",
      hero_cta_arcade: "MASUK ARCADE",
      hero_cta_contact: "KONTAK",
      about_title: "TENTANG",
      portrait_hint: "SLOT FOTO",
      edu_title: "PENDIDIKAN & REKAM JEJAK",
      legend_industry: "MAGANG",
      open_maps: "PETA ↗",
      tile_map: "LOKASI",
      see_photos: "FOTO ↗",
      projects_title: "PROYEK",
      read_specs: "SPESIFIKASI",
      read_brief: "DETAIL",
      cred_title: "SERTIFIKASI",
      inspect_cert: "INSPEKSI 360°",
      footer_nav: "NAVIGASI",
      footer_contact: "KONTAK LANGSUNG",
      footer_socials: "SOSIAL MEDIA",
      wa_cta: "PESAN LANGSUNG ↗"
    }
  }
};