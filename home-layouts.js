/**
 * ============================================================================
 * Family Expense Tracker - Home Layouts Engine (v6.1.0)
 * ============================================================================
 * Re-engineered from scratch to deliver 100% visual fidelity to approved designs:
 * 
 * 1. Layout 0: Basic Default Grid (catGrid)
 * 2. Layout 1: Horizontal Detail List (10 rows, row 10 = Voice Assistant with waves)
 * 3. Layout 2: Donut Hero Analytics + 10 Cards in 2 columns (Card 10 = Voice Assistant)
 * 4. Layout 3: Elegant Modern Asymmetric (10 Cards in 2 columns, Card 10 = Voice Assistant)
 * 5. Layout 4: Compact 3x3 Grid (Row 3 = Health, Other, Clothes + Full-Width Voice Banner)
 * 6. Layout 5: Radial Orbit Cockpit Arena (Hub + 9 Satellites + Integrated Bottom Voice Bar)
 * 7. Layout 6: Hexagonal Honeycomb Hive (9 Hexagon Cells + Integrated Bottom Voice Bar)
 * 8. Layout 7: High-Density HUD Sensor Tiles (9 Telemetry Tiles + Integrated Bottom Voice Bar)
 * 9. Layout 8: Diamond Facet Crystal Grid (9 Diamond Rhombuses + Integrated Bottom Voice Bar)
 * 10. Layout 9: Financial Spectrum Equalizer (9 Spectral Columns + Integrated Bottom Voice Bar)
 *
 * Distinctive Features:
 * - 10-Segment SVG Dial switcher icon with 5 full internal diameters (fills button 100%).
 * - Embedded Voice Assistant cards/banners in ALL layouts — zero displaced floating FAB!
 * - Permanent side edge handles (#leftScreenEdgeHandle & #rightScreenEdgeHandle) protected.
 * - Strict accounting rules: Red negative expenses (- 1,880.00 ج.م), neutral zero (0.00 ج.م).
 * - Viewport-fitting responsive engine adapting cleanly to all mobile phone screens.
 * ============================================================================
 */

(function (root) {
  'use strict';

  const STORAGE_KEY = 'family_expense_home_design_v2';

  // 9 Core Categories Definition (SSOT)
  const CATEGORIES = {
    daily: {
      name: 'مصروف يومي',
      color: '#d97706',
      rgb: '217, 119, 6',
      pastelBg: '#fffbeb',
      pastelBorder: '#fde68a',
      iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-mug-saucer',
      iconShape: 'circle'
    },
    food: {
      name: 'طعام ومشتريات',
      color: '#10b981',
      rgb: '16, 185, 129',
      pastelBg: '#ecfdf5',
      pastelBorder: '#a7f3d0',
      iconBg: 'linear-gradient(135deg, #10b981, #059669)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-cart-shopping',
      iconShape: 'rounded'
    },
    bills: {
      name: 'فواتير والتزامات',
      color: '#f97316',
      rgb: '249, 115, 22',
      pastelBg: '#fff7ed',
      pastelBorder: '#fed7aa',
      iconBg: 'linear-gradient(135deg, #f97316, #ea580c)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-bolt',
      iconShape: 'rounded'
    },
    house: {
      name: 'مستلزمات منزل',
      color: '#8b5cf6',
      rgb: '139, 92, 246',
      pastelBg: '#f5f3ff',
      pastelBorder: '#ddd6fe',
      iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-couch',
      iconShape: 'rounded'
    },
    transport: {
      name: 'مواصلات وبنزين',
      color: '#0284c7',
      rgb: '2, 132, 199',
      pastelBg: '#eff6ff',
      pastelBorder: '#bfdbfe',
      iconBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-car-side',
      iconShape: 'rounded'
    },
    education: {
      name: 'تعليم ودروس',
      color: '#0284c7',
      rgb: '2, 132, 199',
      pastelBg: '#f0f9ff',
      pastelBorder: '#bae6fd',
      iconBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-book-open',
      iconShape: 'rounded'
    },
    health: {
      name: 'صحة وعلاج',
      color: '#ef4444',
      rgb: '239, 68, 68',
      pastelBg: '#fef2f2',
      pastelBorder: '#fecaca',
      iconBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-capsules',
      iconShape: 'rounded'
    },
    other: {
      name: 'أخرى ونثريات',
      altName: 'أخرى ومشتريات',
      color: '#10b981',
      rgb: '16, 185, 129',
      pastelBg: '#f0fdf4',
      pastelBorder: '#86efac',
      iconBg: 'linear-gradient(135deg, #10b981, #059669)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-gift',
      iconShape: 'rounded'
    },
    clothes: {
      name: 'ملابس وأحذية',
      color: '#ec4899',
      rgb: '236, 72, 153',
      pastelBg: '#fdf2f8',
      pastelBorder: '#fbcfe8',
      iconBg: 'linear-gradient(135deg, #ec4899, #db2777)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-shirt',
      iconShape: 'rounded'
    }
  };

  // 10 Official Layouts Metadata
  const LAYOUT_META = [
    { id: 0, name: 'الشكل الأساسي (الأصلي)', desc: 'شبكة كروت المصروفات التسعة الكلاسيكية الافتراضية (catGrid) مع زر الميكروفون العائم', icon: 'fa-table-cells-large' },
    { id: 1, name: 'الشكل 1: قائمة أفقية تفصيلية', desc: '10 صفوف كاملة تمتد بعرض الشاشة مع كارت المساعد الصوتي في الصف العاشر', icon: 'fa-bars' },
    { id: 2, name: 'الشكل 2: لوحة تحليلات وإحصاءات', desc: 'مخطط كعكي دائري مع أعلى 3 بنود صرفاً و10 بطاقات في عمودين تشمل الصوت', icon: 'fa-chart-pie' },
    { id: 3, name: 'الشكل 3: بطاقات حديثة أنيقة', desc: '10 بطاقات متباينة في عمودين مع كارت المساعد الصوتي ومؤشرات المتبقي', icon: 'fa-layer-group' },
    { id: 4, name: 'الشكل 4: شبكة 3 أعمدة وشريط صوتي عريض', desc: '9 فئات في شبكة منتظمة 3×3 مع ملابس وأحذية بالصف الثالث يمين وشريط إدخال صوتي عريض بعرض الشاشة بالأسفل', icon: 'fa-grip' },
    { id: 5, name: 'الشكل 5: قمرة القيادة المدارية', desc: 'مدار كبسولات حلقي متزن حول إجمالي المصروفات مع شريط صوتي سفلي', icon: 'fa-compass' },
    { id: 6, name: 'الشكل 6: خلايا النحل السداسية', desc: 'مصفوفة سداسية هندسية مترابطة مع أطر توهج وشريط صوتي سفلي', icon: 'fa-cube' },
    { id: 7, name: 'الشكل 7: حساسات القياس الرقمية (HUD)', desc: 'لوحة عدادات عالية الكثافة بلمبات LED وشريط قياس صوتي', icon: 'fa-table-cells' },
    { id: 8, name: 'الشكل 8: الكريستال الماسي البلوري', desc: 'معينات ماسية مائلة 45° بتصميم بلوري زجاجي مع إدخال صوتي', icon: 'fa-gem' },
    { id: 9, name: 'الشكل 9: مدرج التردد المالي والأعمدة الطيفية', desc: 'أعمدة طيفية رأسية نابضة ترتفع بنسب الصرف مع شريط تردد صوتي', icon: 'fa-chart-simple' }
  ];

  let currentLayout = 1;
  let cachedFiltered = null;

  // Initialize stored layout preference
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < LAYOUT_META.length) {
        currentLayout = parsed;
      }
    }
  } catch (e) {}

  function formatMoney(amt) {
    const n = Number(amt) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* -------------------------------------------------------------
     Side Screen Edge Handles Protection (Zero Disappearance)
  ------------------------------------------------------------- */
  function ensureSideHandlesVisible() {
    const lh = document.getElementById('leftScreenEdgeHandle');
    const rh = document.getElementById('rightScreenEdgeHandle');
    if (lh) {
      lh.style.setProperty('display', 'flex', 'important');
      lh.style.setProperty('visibility', 'visible', 'important');
      lh.style.setProperty('opacity', '0.92', 'important');
      lh.style.setProperty('z-index', '100035', 'important');
      lh.style.setProperty('pointer-events', 'auto', 'important');
      if (!lh.parentElement || lh.parentElement !== document.body) {
        document.body.appendChild(lh);
      }
    }
    if (rh) {
      rh.style.setProperty('display', 'flex', 'important');
      rh.style.setProperty('visibility', 'visible', 'important');
      rh.style.setProperty('opacity', '0.92', 'important');
      rh.style.setProperty('z-index', '100035', 'important');
      rh.style.setProperty('pointer-events', 'auto', 'important');
      if (!rh.parentElement || rh.parentElement !== document.body) {
        document.body.appendChild(rh);
      }
    }

    // الزر العائم للميكروفون: يظهر حصرياً فقط في الشاشة الأصلية (Layout 0) ويختفي تماماً في الأشكال التسعة الأخرى
    const vFab = document.getElementById('btnVoiceAssistantFab');
    if (vFab) {
      if (currentLayout === 0) {
        vFab.style.removeProperty('display');
        vFab.style.setProperty('display', 'flex', 'important');
        vFab.style.setProperty('visibility', 'visible', 'important');
        vFab.style.setProperty('pointer-events', 'auto', 'important');
      } else {
        vFab.style.setProperty('display', 'none', 'important');
        vFab.style.setProperty('visibility', 'hidden', 'important');
        vFab.style.setProperty('pointer-events', 'none', 'important');
      }
    }
  }

  /* -------------------------------------------------------------
     Dynamic Viewport Fitting Engine (Zero Overflow on Mobile)
  ------------------------------------------------------------- */
  function measureAndApplyDynamicLayout() {
    ensureSideHandlesVisible();

    const container = document.getElementById('homeInterfaces');
    if (!container) return;

    const bottomNav = document.getElementById('appBottomNav') ||
                      document.querySelector('.app-bottom-nav') ||
                      document.querySelector('.bottom-dock-nav');
    const tools = document.querySelector('.executive-quick-tools-strip');
    const header = document.querySelector('.app-header');
    const period = document.querySelector('.period-selector-top-strip') || document.querySelector('.period-filter-container');
    const balance = document.getElementById('topKpiThreeStrip') || document.getElementById('mainBalanceCard');

    const vv = window.visualViewport;
    const viewportW = (vv ? vv.width : window.innerWidth) || document.documentElement.clientWidth || 390;
    const viewportH = (vv ? vv.height : window.innerHeight) || document.documentElement.clientHeight || 800;

    const navRect = bottomNav ? bottomNav.getBoundingClientRect() : null;
    const bottomLimit = (navRect && navRect.top > 200) ? navRect.top : (viewportH - 64);

    let containerTop = 0;
    if (container && container.offsetParent !== null) {
      containerTop = container.getBoundingClientRect().top;
    }

    if (containerTop <= 40 || containerTop > 320) {
      const hH = header ? header.offsetHeight : 52;
      const pH = period ? period.offsetHeight : 44;
      const bH = balance ? balance.offsetHeight : 84;
      const tH = tools ? tools.offsetHeight : 42;
      containerTop = hH + pH + bH + tH + 6;
    }

    const availableH = Math.max(340, Math.floor(bottomLimit - containerTop - 6));

    let widthScale = 1.0;
    if (viewportW < 365) {
      widthScale = 0.88;
    } else if (viewportW < 385) {
      widthScale = 0.94;
    } else if (viewportW < 415) {
      widthScale = 0.98;
    } else {
      widthScale = 1.00;
    }

    let iconSize = Math.round(36 * widthScale);
    iconSize = Math.max(30, Math.min(38, iconSize));
    container.style.setProperty('--dynamic-home-icon-size', `${iconSize}px`);

    let cardH = 72;
    let gap = 6;

    if (viewportH < 720) {
      gap = 4;
    } else if (viewportH < 800) {
      gap = 5;
    } else {
      gap = 6;
    }

    switch (currentLayout) {
      case 1: { // 1 column, 10 rows (9 categories + voice)
        gap = viewportH < 720 ? 3 : 4;
        cardH = Math.floor((availableH - (9 * gap) - 6) / 10);
        cardH = Math.max(44, Math.min(54, cardH));
        break;
      }
      case 2: { // Hero analytics + 2 columns, 5 rows
        gap = viewportH < 720 ? 4 : 5;
        const heroH = Math.max(80, Math.min(98, Math.floor(availableH * 0.22)));
        const remainingForGrid = availableH - heroH - 6 - gap;
        cardH = Math.floor((remainingForGrid - (4 * gap)) / 5);
        cardH = Math.max(58, Math.min(74, cardH));
        container.style.setProperty('--dynamic-home-hero-height', `${heroH}px`);
        break;
      }
      case 3: { // 2 columns, 5 rows (10 cards)
        gap = viewportH < 720 ? 4 : 6;
        cardH = Math.floor((availableH - (4 * gap) - 8) / 5);
        cardH = Math.max(68, Math.min(104, cardH));
        break;
      }
      case 4: { // 3 columns, 3 rows (9 category cards) + 1 bottom full-width voice banner
        gap = viewportH < 720 ? 4 : (viewportH < 800 ? 5 : 6);
        const voiceStripH = 44;
        const availableForCards = availableH - voiceStripH - gap - 4;
        cardH = Math.floor((availableForCards - (2 * gap)) / 3);
        cardH = Math.max(98, Math.min(156, cardH));
        break;
      }
      case 5: // Radial Cockpit
      case 6: // Honeycomb Hive
      case 7: // HUD Sensor Tiles
      case 8: // Diamond Crystals
      case 9: // Spectrum Equalizer
      default: {
        const voiceBarH = 44;
        const arenaH = Math.max(340, Math.min(520, availableH - voiceBarH - gap));
        container.style.setProperty('--dynamic-home-arena-h', `${arenaH}px`);
        cardH = Math.floor(availableH);
        break;
      }
    }

    container.style.setProperty('--dynamic-home-card-height', `${cardH}px`);
    container.style.setProperty('--dynamic-home-gap', `${gap}px`);
    container.style.setProperty('--dynamic-home-available-h', `${availableH}px`);

    const docEl = document.documentElement;
    const fontMode = docEl.getAttribute('data-font-size') || localStorage.getItem('family_expense_font_size') || 'medium';
    const fontScales = {
      micro: 0.82,
      small: 0.90,
      medium: 1.00,
      large: 1.10,
      xlarge: 1.20,
      huge: 1.30
    };
    const baseScale = fontScales[fontMode] || 1.00;
    const finalFontScale = (baseScale * widthScale).toFixed(3);
    container.style.setProperty('--dynamic-home-font-scale', String(finalFontScale));

    const fontFamily = docEl.getAttribute('data-font-family') || localStorage.getItem('family_expense_font_family') || 'inherit';
    if (fontFamily && fontFamily !== 'inherit') {
      container.style.setProperty('--dynamic-home-font-family', fontFamily);
    }
  }

  /* -------------------------------------------------------------
     Legendary Chromatic Astrolabe Dial (v6.2.0)
     10 Distinctive Mythic Theme Color Schemes (One for each Layout)
     Dynamic Diameter Color Matrix: Each diameter changes color per layout!
  ------------------------------------------------------------- */
  const LAYOUT_DIAL_THEMES = [
    { name: 'solarGold',   primary: '#f59e0b', secondary: '#d97706', glow: '#fef08a', core: '#b45309' }, // الشكل 0
    { name: 'emerald',     primary: '#10b981', secondary: '#059669', glow: '#6ee7b7', core: '#047857' }, // الشكل 1
    { name: 'sapphire',    primary: '#0ea5e9', secondary: '#0284c7', glow: '#7dd3fc', core: '#0369a1' }, // الشكل 2
    { name: 'amethyst',    primary: '#a855f7', secondary: '#7c3aed', glow: '#d8b4fe', core: '#6d28d9' }, // الشكل 3
    { name: 'ruby',        primary: '#f43f5e', secondary: '#e11d48', glow: '#fda4af', core: '#be123c' }, // الشكل 4
    { name: 'turquoise',   primary: '#14b8a6', secondary: '#0d9488', glow: '#5eead4', core: '#0f766e' }, // الشكل 5
    { name: 'topaz',       primary: '#eab308', secondary: '#ca8a04', glow: '#fef08a', core: '#a16207' }, // الشكل 6
    { name: 'hyperion',    primary: '#84cc16', secondary: '#65a30d', glow: '#bef264', core: '#4d7c0f' }, // الشكل 7
    { name: 'tourmaline',  primary: '#ec4899', secondary: '#db2777', glow: '#fbcfe8', core: '#be185d' }, // الشكل 8
    { name: 'aurora',      primary: '#6366f1', secondary: '#4f46e5', glow: '#a5b4fc', core: '#4338ca' }  // الشكل 9
  ];

  // Dynamic Diameter Color Matrix (5 internal full diameters for each of the 10 shapes)
  // Each single diameter line shifts its chromatic color upon layout change!
  const DIAMETER_PALETTES = [
    ['#ffd700', '#10b981', '#38bdf8', '#c084fc', '#f43f5e'], // الشكل 0: ذهب شمسي
    ['#38bdf8', '#34d399', '#facc15', '#f472b6', '#a78bfa'], // الشكل 1: زمرد ملكي
    ['#ec4899', '#f59e0b', '#38bdf8', '#10b981', '#c084fc'], // الشكل 2: ياقوت أزرق
    ['#10b981', '#f43f5e', '#ffd700', '#c084fc', '#38bdf8'], // الشكل 3: جمشت بنفسجي
    ['#38bdf8', '#c084fc', '#10b981', '#ffd700', '#fb7185'], // الشكل 4: ياقوت أحمر
    ['#2dd4bf', '#ffd700', '#f472b6', '#818cf8', '#34d399'], // الشكل 5: فيروز أسطوري
    ['#f43f5e', '#fde047', '#38bdf8', '#c084fc', '#10b981'], // الشكل 6: توباز شمسي
    ['#c084fc', '#38bdf8', '#a3e635', '#ffd700', '#f43f5e'], // الشكل 7: نيون زمرّدي
    ['#34d399', '#ffd700', '#38bdf8', '#f472b6', '#c084fc'], // الشكل 8: تورمالين وردي
    ['#ffd700', '#f43f5e', '#10b981', '#38bdf8', '#818cf8']  // الشكل 9: أورورا كونية
  ];

  function getDialSvgMarkup(activeSector) {
    const cx = 22.0;
    const cy = 22.0;
    const outerR = 19.8;
    const orbitR = 15.6;
    const medallionR = 10.2;
    const count = 10;
    const stepDeg = 36.0;
    const startOffsetDeg = -90.0;
    const safeSector = Math.max(0, Math.min(count - 1, parseInt(activeSector, 10) || 0));
    const theme = LAYOUT_DIAL_THEMES[safeSector] || LAYOUT_DIAL_THEMES[0];
    const isLight = document.body && document.body.classList.contains('light-theme');

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    // 10 فصوص بلورية مدارية تمثل الأنماط العشرة
    const facets = Array.from({ length: count }, (_, i) => {
      const deg = startOffsetDeg + (i * stepDeg);
      const p = polarToCartesian(cx, cy, orbitR, deg);
      const isActive = (i === safeSector);
      const fTheme = LAYOUT_DIAL_THEMES[i] || LAYOUT_DIAL_THEMES[0];

      if (isActive) {
        return `
          <circle class="hl-dial-facet is-active" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="3.6" fill="${theme.glow}" opacity="0.65" filter="url(#facetBloom_${safeSector})"/>
          <circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="2.3" fill="url(#heroTileGrad_${safeSector})" stroke="#ffffff" stroke-width="0.8"/>
          <circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="0.95" fill="#ffffff"/>
        `;
      }

      const dotFill = isLight ? fTheme.secondary : fTheme.primary;
      const dotOpacity = isLight ? '0.55' : '0.45';
      return `<circle class="hl-dial-facet" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="1.2" fill="${dotFill}" opacity="${dotOpacity}"/>`;
    }).join('');

    // مؤشر ليزري بلوري نشط ينبثق من قلب القرص إلى الفص المحدد
    const activeDeg = startOffsetDeg + (safeSector * stepDeg);
    const pStart = polarToCartesian(cx, cy, medallionR + 0.8, activeDeg);
    const pEnd = polarToCartesian(cx, cy, orbitR - 2.8, activeDeg);
    const needle = `
      <line class="hl-dial-needle" x1="${pStart.x.toFixed(2)}" y1="${pStart.y.toFixed(2)}" x2="${pEnd.x.toFixed(2)}" y2="${pEnd.y.toFixed(2)}" stroke="${theme.glow}" stroke-width="1.6" stroke-linecap="round" opacity="0.9" filter="url(#facetBloom_${safeSector})"/>
      <line x1="${pStart.x.toFixed(2)}" y1="${pStart.y.toFixed(2)}" x2="${pEnd.x.toFixed(2)}" y2="${pEnd.y.toFixed(2)}" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" opacity="0.95"/>
    `;

    const bgGradId = isLight ? 'dialBg_light' : 'dialBg_dark';

    return `
      <svg class="home-dial-icon" viewBox="0 0 44 44" width="100%" height="100%" aria-hidden="true" style="overflow:visible; display:block;">
        <defs>
          <radialGradient id="dialBg_dark" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="60%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
          <radialGradient id="dialBg_light" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="65%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </radialGradient>
          <linearGradient id="goldBezelGrad" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="28%" stop-color="#ffd700"/>
            <stop offset="60%" stop-color="#d97706"/>
            <stop offset="85%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#92400e"/>
          </linearGradient>
          <linearGradient id="innerRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffd700" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#b45309" stop-opacity="0.45"/>
          </linearGradient>
          <radialGradient id="heroTileGrad_${safeSector}" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="${theme.glow}"/>
            <stop offset="50%" stop-color="${theme.primary}"/>
            <stop offset="100%" stop-color="${theme.core}"/>
          </radialGradient>
          <filter id="facetBloom_${safeSector}" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.0" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="heroTileGlow_${safeSector}" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.2" flood-color="${theme.glow}" flood-opacity="0.75"/>
          </filter>
        </defs>

        <!-- الخلفية البلورية المعتمة الفخمة -->
        <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="url(#${bgGradId})"/>

        <!-- المدار الدائري المنقط الأنيق للأنماط -->
        <circle cx="${cx}" cy="${cy}" r="${orbitR}" fill="none" stroke="${isLight ? 'rgba(217, 119, 6, 0.25)' : 'rgba(245, 158, 11, 0.22)'}" stroke-width="0.7" stroke-dasharray="1.2 2.2"/>

        <!-- الفصوص البلورية المدارية العشرة -->
        ${facets}

        <!-- إبرة التحديد الليزرية الأنيقة -->
        ${needle}

        <!-- القرص المركزي العائم ثلاثي الأبعاد -->
        <circle cx="${cx}" cy="${cy}" r="${medallionR}" fill="url(#${bgGradId})" stroke="url(#innerRimGrad)" stroke-width="1.1" filter="url(#facetBloom_${safeSector})"/>
        <circle cx="${cx}" cy="${cy}" r="${(medallionR - 0.9).toFixed(2)}" fill="${isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.65)'}"/>

        <!-- مصفوفة شبكة الأنماط الحديثة (2x2 Layout Grid) فائقة الوضوح والجمال -->
        <!-- المربع الرئيسي المتوهج باللون المميز للشكل النشط -->
        <rect class="hl-hero-tile" x="22.7" y="16.5" width="4.4" height="4.4" rx="1.1" fill="url(#heroTileGrad_${safeSector})" stroke="#ffffff" stroke-width="0.65" filter="url(#heroTileGlow_${safeSector})"/>
        
        <!-- المربعات المصاحبة الزجاجية الأنيقة -->
        <rect x="16.9" y="16.5" width="4.4" height="4.4" rx="1.1" fill="${isLight ? 'rgba(15, 23, 42, 0.18)' : 'rgba(255, 255, 255, 0.22)'}" stroke="${isLight ? 'rgba(15, 23, 42, 0.28)' : 'rgba(255, 255, 255, 0.45)'}" stroke-width="0.6"/>
        <rect x="16.9" y="22.3" width="4.4" height="4.4" rx="1.1" fill="${isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.16)'}" stroke="${isLight ? 'rgba(15, 23, 42, 0.22)' : 'rgba(255, 255, 255, 0.35)'}" stroke-width="0.6"/>
        <rect x="22.7" y="22.3" width="4.4" height="4.4" rx="1.1" fill="${isLight ? 'rgba(15, 23, 42, 0.22)' : 'rgba(255, 255, 255, 0.28)'}" stroke="${isLight ? 'rgba(15, 23, 42, 0.32)' : 'rgba(255, 255, 255, 0.5)'}" stroke-width="0.6"/>

        <!-- الإطار الخارجي الذهبي الملكي المصقول -->
        <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="url(#goldBezelGrad)" stroke-width="1.8"/>
      </svg>
    `.trim();
  }

  function updateDesignButtonDial() {
    const btn = document.getElementById('btnHomeDesign');
    if (!btn) return;

    const theme = LAYOUT_DIAL_THEMES[currentLayout] || LAYOUT_DIAL_THEMES[0];
    btn.style.setProperty('--dial-active-glow', theme.glow);
    btn.style.setProperty('--dial-active-primary', theme.primary);

    btn.title = `تبديل شكل الشاشة (الشكل الحالي: ${LAYOUT_META[currentLayout]?.name || ''}) - نقر مطول لاختيار شكل محدد`;
    btn.setAttribute('aria-label', btn.title);

    let iconContainer = btn.querySelector('.home-dial-wrapper');
    if (!iconContainer) {
      btn.innerHTML = `<span class="home-dial-wrapper" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"></span>`;
      iconContainer = btn.querySelector('.home-dial-wrapper');
    }

    iconContainer.innerHTML = getDialSvgMarkup(currentLayout);
  }

  /* -------------------------------------------------------------
     Data Aggregation & Budgets
  ------------------------------------------------------------- */
  function computeTotals(filtered) {
    const totals = {};
    Object.keys(CATEGORIES).forEach(k => { totals[k] = 0; });

    let list = Array.isArray(filtered) ? filtered : [];
    if (!list.length && Array.isArray(root.state?.expenses)) {
      list = root.state.expenses;
    }

    list.forEach(tx => {
      if (!tx) return;
      const cat = tx.category || tx.catId || tx.cat;
      const amt = Number(tx.amount || tx.cost || 0);
      if (cat && totals[cat] !== undefined) {
        totals[cat] += amt;
      }
    });

    return totals;
  }

  function getBudgets() {
    const b = root.state?.budgets || root.state?.categoryBudgets || {};
    const defaultBudgets = {
      daily: 5000,
      bills: 8500,
      food: 22000,
      house: 6000,
      transport: 6500,
      education: 15000,
      health: 5500,
      other: 5500,
      clothes: 6000
    };
    return Object.assign({}, defaultBudgets, b);
  }

  function getCategoryStats(catId, totals, budgets, currSymbol, isGold) {
    const cat = CATEGORIES[catId] || CATEGORIES.other;
    const spent = Number(totals[catId] || 0);
    const budget = Number(budgets[catId] || 0);

    const hasSpent = spent > 0;
    const remaining = budget - spent;
    const isExceeded = remaining < 0;

    let pct = 100;
    if (budget > 0) {
      pct = Math.round((remaining / budget) * 100);
    } else if (hasSpent) {
      pct = 0;
    }

    let statusColor = '#10b981'; // Green
    if (isExceeded) {
      statusColor = '#ef4444'; // Red
    } else if (pct < 25) {
      statusColor = '#f59e0b'; // Amber
    }

    const spentStr = isGold ? spent.toFixed(2) : spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const remVal = Math.abs(remaining);
    const remValStr = isGold ? remVal.toFixed(2) : remVal.toLocaleString('en-US', { maximumFractionDigits: 0 });
    const budValStr = isGold ? budget.toFixed(2) : budget.toLocaleString('en-US', { maximumFractionDigits: 0 });

    const remainingPct = Math.max(0, Math.min(100, Math.abs(pct)));
    let budgetText = '';
    if (isExceeded) {
      budgetText = `تجاوز: ${remainingPct}% - ${remValStr} ${currSymbol}`;
    } else {
      budgetText = `متبقي: ${remainingPct}% - ${remValStr} ${currSymbol}`;
    }

    return {
      cat,
      spent,
      budget,
      hasSpent,
      remaining,
      isExceeded,
      pct,
      remainingPct,
      statusColor,
      spentStr,
      remValStr,
      budValStr,
      budgetText
    };
  }

  // Audio wave bars markup helper
  function getAudioWaveHtml(color = '#8b5cf6') {
    return `
      <div class="hl-audio-waves" aria-hidden="true" style="--wave-color:${color};">
        <span class="hl-wave-bar" style="height:35%;"></span>
        <span class="hl-wave-bar" style="height:70%;"></span>
        <span class="hl-wave-bar" style="height:100%;"></span>
        <span class="hl-wave-bar" style="height:55%;"></span>
        <span class="hl-wave-bar" style="height:85%;"></span>
        <span class="hl-wave-bar" style="height:40%;"></span>
        <span class="hl-wave-bar" style="height:90%;"></span>
        <span class="hl-wave-bar" style="height:65%;"></span>
        <span class="hl-wave-bar" style="height:35%;"></span>
        <span class="hl-wave-bar" style="height:80%;"></span>
        <span class="hl-wave-bar" style="height:50%;"></span>
        <span class="hl-wave-bar" style="height:25%;"></span>
      </div>
    `;
  }

  /* =========================================================================
     الشكل 1: قائمة أفقية تفصيلية (10 صفوف كاملة - مطابقة لصورة المرجع 3)
     Row 10 = إضافة صوتية للمصروفات مع الأيقونة والاسم وموجات الصوت وسهم التنقل
     ========================================================================= */
  function renderLayout1List(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'food', 'bills', 'house', 'education', 'transport', 'health', 'other', 'clothes'];

    const rowsHtml = order.map(id => {
      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '- ' : '';
      const catDisplayName = (id === 'other' && s.cat.altName) ? s.cat.altName : s.cat.name;

      return `
        <article class="home-design-card hl-row-l1" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
          <div class="hl-row-l1-content">
            <div class="hl-row-l1-right">
              <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-row-icon-btn">
                <div class="hl-row-l1-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};">
                  <i class="${s.cat.iconClass}"></i>
                </div>
              </button>
              <div class="hl-row-name-amt">
                <strong class="hl-row-l1-name">${catDisplayName}</strong>
                <div class="hl-amount-cluster ${s.hasSpent ? 'spent' : 'zero'}">
                  <span class="hl-amt-num" style="direction:ltr;unicode-bidi:isolate;">${sign}${s.spentStr}</span>
                  <span class="hl-amt-curr">${currSymbol}</span>
                </div>
              </div>
            </div>

            <div class="hl-row-divider"></div>

            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-row-mid-btn">
              <div class="hl-row-rem-line">المتبقي: ${s.remValStr} ${currSymbol}</div>
              <div class="hl-row-bud-line">الميزانية: ${s.budValStr} ${currSymbol}</div>
              <div class="hl-progress-track">
                <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};"></div>
              </div>
            </button>

            <div class="hl-row-l1-badge" style="background:${s.pct >= 100 ? '#fee2e2' : '#dcfce7'};color:${s.pct >= 100 ? '#b91c1c' : '#15803d'};">
              %${s.remainingPct}
            </div>

            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-row-chevron-btn" aria-label="تسجيل سريع">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Row 10: إضافة صوتية للمصروفات (Official Voice Row)
    const voiceRowHtml = `
      <article class="home-design-card hl-row-l1 hl-voice-row" data-action="voice-record" style="--cat-color:#8b5cf6; --cat-rgb:139,92,246; --cat-pastel-bg:#f5f3ff; --cat-pastel-border:#c084fc;">
        <div class="hl-row-l1-content">
          <div class="hl-row-l1-right">
            <button type="button" data-action="voice-record" class="hl-row-icon-btn">
              <div class="hl-row-l1-icon" style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:#ffffff;">
                <i class="fa-solid fa-microphone"></i>
              </div>
            </button>
            <div class="hl-row-name-amt">
              <strong class="hl-row-l1-name" style="color:#6d28d9;">إضافة صوتية للمصروفات</strong>
              <small class="hl-voice-sub" style="color:#7c3aed;font-size:0.65rem;font-weight:700;">اضغط للتحدث الذكي</small>
            </div>
          </div>

          <div class="hl-row-divider"></div>

          <button type="button" data-action="voice-record" class="hl-row-mid-btn hl-voice-waves-btn">
            ${getAudioWaveHtml('#8b5cf6')}
          </button>

          <button type="button" data-action="voice-record" class="hl-row-chevron-btn" aria-label="بدء التسجيل الصوتي">
            <i class="fa-solid fa-chevron-left" style="color:#7c3aed;"></i>
          </button>
        </div>
      </article>
    `;

    return `<div class="home-design-list hl-grid-layout-1">${rowsHtml}${voiceRowHtml}</div>`;
  }

  /* =========================================================================
     الشكل 2: لوحة تحليلات وإحصاءات (Donut Hero + 10 بطاقات في عمودين - صورة المرجع 2)
     Card 10 (Row 5, Right) = إضافة صوتية للمصروفات
     ========================================================================= */
  function renderLayout2Analytics(totals, budgets, currSymbol, isGold) {
    const spentCategories = Object.keys(CATEGORIES).map(id => ({
      id,
      spent: totals[id] || 0,
      cat: CATEGORIES[id]
    })).filter(item => item.spent > 0).sort((a, b) => b.spent - a.spent);

    const totalExpense = spentCategories.reduce((sum, item) => sum + item.spent, 0);
    const totalBudget = Object.values(budgets).reduce((sum, val) => sum + Number(val || 0), 0);
    const overallPct = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;
    const remainingBudget = Math.max(0, totalBudget - totalExpense);

    const top3 = spentCategories.slice(0, 3);
    const top3Html = top3.length > 0 ? top3.map(item => {
      const pct = totalExpense > 0 ? Math.round((item.spent / totalExpense) * 100) : 0;
      return `
        <div class="hl-top3-item">
          <div class="hl-top3-cat">
            <i class="${item.cat.iconClass}" style="color:${item.cat.color};"></i>
            <span>${item.cat.name}</span>
          </div>
          <div class="hl-top3-bar-wrap">
            <div class="hl-top3-bar-track">
              <div class="hl-top3-bar-fill" style="width:${pct}%;background:${item.cat.color};"></div>
            </div>
            <strong style="color:${item.cat.color};">%${pct}</strong>
          </div>
        </div>
      `;
    }).join('') : '<div style="color:#94a3b8;font-size:0.72rem;text-align:center;">لا توجد مصروفات مسجلة بعد</div>';

    // 10 Cards in 2 Columns:
    // Row 1: Right = daily, Left = food
    // Row 2: Right = bills, Left = house
    // Row 3: Right = education, Left = transport
    // Row 4: Right = health, Left = clothes
    // Row 5: Right = voice (إضافة صوتية), Left = other (أخرى ومشتريات)
    const pairs = [
      ['daily', 'food'],
      ['bills', 'house'],
      ['education', 'transport'],
      ['health', 'clothes'],
      ['voice', 'other']
    ];

    const cardsHtml = pairs.map(([rightId, leftId]) => {
      function renderOneCard(id) {
        if (id === 'voice') {
          return `
            <article class="home-design-card hl-card-l2 hl-voice-card" data-action="voice-record" style="--cat-color:#8b5cf6; --cat-rgb:139,92,246; --cat-pastel-bg:#f5f3ff; --cat-pastel-border:#c084fc;">
              <div class="hl-card-l2-inner">
                <div class="hl-card-l2-right">
                  <button type="button" data-action="voice-record" class="hl-cat-head-btn">
                    <strong class="hl-card-l2-name" style="color:#6d28d9;">إضافة صوتية للمصروفات</strong>
                  </button>
                  <button type="button" data-action="voice-record" class="hl-cat-amt-btn hl-voice-waves-box">
                    ${getAudioWaveHtml('#8b5cf6')}
                  </button>
                </div>
                <button type="button" data-action="voice-record" class="hl-cat-icon-btn">
                  <div class="hl-card-l2-icon" style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:#ffffff;border-radius:12px;">
                    <i class="fa-solid fa-microphone"></i>
                  </div>
                </button>
              </div>
            </article>
          `;
        }

        const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
        const sign = s.hasSpent ? '- ' : '';
        const catDisplayName = (id === 'other' && s.cat.altName) ? s.cat.altName : s.cat.name;

        return `
          <article class="home-design-card hl-card-l2" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
            <div class="hl-card-l2-inner">
              <div class="hl-card-l2-right">
                <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-head-btn">
                  <strong class="hl-card-l2-name">${catDisplayName}</strong>
                </button>
                <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-amt-btn">
                  <div class="hl-amount-cluster ${s.hasSpent ? 'spent' : 'zero'}">
                    <span class="hl-amt-num" style="direction:ltr;unicode-bidi:isolate;">${sign}${s.spentStr}</span>
                    <span class="hl-amt-curr">${currSymbol}</span>
                  </div>
                  <div class="hl-progress-track">
                    <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};"></div>
                  </div>
                  <small class="hl-budget-info" style="color:${s.statusColor};">${s.budgetText}</small>
                </button>
              </div>
              <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-icon-btn">
                <div class="hl-card-l2-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '12px'};">
                  <i class="${s.cat.iconClass}"></i>
                </div>
              </button>
            </div>
          </article>
        `;
      }

      return renderOneCard(rightId) + renderOneCard(leftId);
    }).join('');

    return `
      <div class="hl-layout-2-wrapper">
        <section class="hl-hero-analytics">
          <div class="hl-donut-box">
            <svg viewBox="0 0 36 36" class="hl-donut-svg">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" stroke-width="4"></circle>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#0284c7" stroke-width="4" stroke-dasharray="${overallPct}, 100" stroke-linecap="round"></circle>
            </svg>
            <div class="hl-donut-text">
              <strong>%${overallPct}</strong>
              <small>من الموازنة</small>
            </div>
          </div>

          <div class="hl-budget-summary">
            <div class="hl-budget-summary-title"><i class="fa-solid fa-bullseye"></i>الميزانية الشهرية</div>
            <div>الموازنة : <strong>${totalBudget.toLocaleString()} ${currSymbol}</strong></div>
            <div style="color:#b91c1c;">المصروف : <strong>${totalExpense.toLocaleString()} ${currSymbol}</strong></div>
            <div style="color:#15803d;">المتبقي : <strong>${remainingBudget.toLocaleString()} ${currSymbol}</strong></div>
          </div>

          <div class="hl-top3-box">
            <div class="hl-top3-title"><i class="fa-solid fa-chart-simple"></i>أعلى 3 بنود صرفاً</div>
            ${top3Html}
          </div>
        </section>

        <div class="home-design-grid hl-grid-layout-2">${cardsHtml}</div>
      </div>
    `;
  }

  /* =========================================================================
     الشكل 3: بطاقات حديثة أنيقة (10 بطاقات في عمودين - صورة المرجع 1)
     Card 10 (Row 5, Right) = إضافة صوتية للمصروفات
     ========================================================================= */
  function renderLayout3Asymmetric(totals, budgets, currSymbol, isGold) {
    // 10 Cards in 2 Columns matching Image 1:
    // Row 1: Right = daily, Left = bills
    // Row 2: Right = food, Left = house
    // Row 3: Right = transport, Left = education
    // Row 4: Right = other, Left = health
    // Row 5: Right = voice (إضافة صوتية), Left = clothes
    const pairs = [
      ['daily', 'bills'],
      ['food', 'house'],
      ['transport', 'education'],
      ['other', 'health'],
      ['voice', 'clothes']
    ];

    const cardsHtml = pairs.map(([rightId, leftId]) => {
      function renderOneCard(id) {
        if (id === 'voice') {
          return `
            <article class="home-design-card hl-card-l3 hl-voice-card" data-action="voice-record" style="--cat-color:#8b5cf6; --cat-rgb:139,92,246; --cat-pastel-bg:#f5f3ff; --cat-pastel-border:#c084fc;">
              <div class="hl-card-l3-inner">
                <div class="hl-card-l3-right">
                  <button type="button" data-action="voice-record" class="hl-cat-head-btn">
                    <strong class="hl-card-l3-name" style="color:#6d28d9;">إضافة صوتية للمصروفات</strong>
                  </button>
                  <button type="button" data-action="voice-record" class="hl-cat-amt-btn hl-voice-waves-box">
                    ${getAudioWaveHtml('#8b5cf6')}
                  </button>
                </div>
                <button type="button" data-action="voice-record" class="hl-cat-icon-btn">
                  <div class="hl-card-l3-icon" style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:#ffffff;border-radius:12px;">
                    <i class="fa-solid fa-microphone"></i>
                  </div>
                </button>
              </div>
            </article>
          `;
        }

        const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
        const sign = s.hasSpent ? '- ' : '';
        const catDisplayName = (id === 'other' && s.cat.altName) ? s.cat.altName : s.cat.name;

        return `
          <article class="home-design-card hl-card-l3" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
            <div class="hl-card-l3-inner">
              <div class="hl-card-l3-right">
                <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-head-btn">
                  <strong class="hl-card-l3-name">${catDisplayName}</strong>
                </button>
                <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-amt-btn">
                  <div class="hl-amount-cluster ${s.hasSpent ? 'spent' : 'zero'}">
                    <span class="hl-amt-num" style="direction:ltr;unicode-bidi:isolate;">${sign}${s.spentStr}</span>
                    <span class="hl-amt-curr">${currSymbol}</span>
                  </div>
                  <div class="hl-progress-track">
                    <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};"></div>
                  </div>
                  <small class="hl-budget-info" style="color:${s.statusColor};">${s.budgetText}</small>
                </button>
              </div>
              <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-icon-btn">
                <div class="hl-card-l3-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '12px'};">
                  <i class="${s.cat.iconClass}"></i>
                </div>
              </button>
            </div>
          </article>
        `;
      }

      return renderOneCard(rightId) + renderOneCard(leftId);
    }).join('');

    return `<div class="home-design-grid hl-grid-layout-3">${cardsHtml}</div>`;
  }

  /* =========================================================================
     الشكل 4: شبكة 3 أعمدة (مطابقة 100% لصور المرجع المعتمدة Dark & Light)
     10 كروت موزعة على 3 أعمدة:
     الصف 1: فواتير والتزامات (يمين) | طعام ومشتريات (وسط) | مصروف يومي (يسار)
     الصف 2: مواصلات وبنزين (يمين) | تعليم ودروس (وسط) | مستلزمات منزل (يسار)
     الصف 3: إضافة صوتية للمصروفات (يمين) | أخرى ونثريات (وسط) | صحة وعلاج (يسار)
     الصف 4: ملابس وأحذية (بالمنتصف - grid-column: 2)
     ========================================================================= */
  function renderLayout4CompactGrid(totals, budgets, currSymbol, isGold) {
    const layoutItems = [
      'bills',     'food',      'daily',
      'transport', 'education', 'house',
      'clothes',   'other',     'health'
    ];

    const cardsHtml = layoutItems.map(id => {
      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '- ' : '';
      const catDisplayName = s.cat.name;

      return `
        <article class="home-design-card hl-card-l4" data-ref-category="${id}" style="--cat-color: ${s.cat.color}; --cat-rgb: ${s.cat.rgb}; --cat-pastel-bg: ${s.cat.pastelBg}; --cat-pastel-border: ${s.cat.pastelBorder};">
          <div class="hl-card-l4-body">
            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-card-l4-head-btn">
              <div class="hl-card-l4-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};">
                <i class="${s.cat.iconClass}"></i>
              </div>
              <strong class="hl-card-l4-name">${catDisplayName}</strong>
            </button>

            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-card-l4-foot-btn">
              <div class="hl-amount-cluster ${s.hasSpent ? 'spent' : 'zero'}">
                <span class="hl-amt-num" style="direction:ltr;unicode-bidi:isolate;">${sign}${s.spentStr}</span>
                <span class="hl-amt-curr">${currSymbol}</span>
              </div>
              <div class="hl-progress-track">
                <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};"></div>
              </div>
              <small class="hl-budget-info" style="color:${s.statusColor};">${s.budgetText}</small>
            </button>
          </div>
        </article>
      `;
    }).join('');

    const voiceStripHtml = `
      <div class="hl-layout4-voice-strip" data-action="voice-record">
        <button type="button" data-action="voice-record" class="hl-l4-voice-btn">
          <div class="hl-l4-voice-content-start">
            <div class="hl-l4-voice-icon-pill">
              <i class="fa-solid fa-microphone"></i>
            </div>
            <div class="hl-l4-voice-text-cluster">
              <span class="hl-l4-voice-title">إضافة صوتية للمصروفات</span>
              <span class="hl-l4-voice-sub">تسجيل فوري بالذكاء الاصطناعي</span>
            </div>
          </div>
          <div class="hl-l4-voice-wave-wrap">
            ${getAudioWaveHtml('#8b5cf6')}
          </div>
        </button>
      </div>
    `;

    return `
      <div class="hl-layout-4-wrapper">
        <div class="home-design-grid hl-grid-layout-4">${cardsHtml}</div>
        ${voiceStripHtml}
      </div>
    `;
  }

  /* =========================================================================
     الشكل 5: قمرة القيادة المدارية (The Radial Orbit Cockpit)
     Hub + 9 Satellite Capsules + Integrated Bottom Voice Bar
     ========================================================================= */
  function renderLayout5RadialCockpit(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'bills', 'transport', 'clothes', 'health', 'education', 'daily', 'house', 'other'];
    const container = document.getElementById('homeInterfaces');
    const availableH = container ? (parseInt(container.style.getPropertyValue('--dynamic-home-available-h'), 10) || 440) : 440;
    const arenaH = Math.max(340, Math.min(500, availableH - 52));
    const centerY = Math.floor(arenaH / 2);
    const centerX = 195;
    const radius = Math.min(136, Math.floor(centerY - 32));

    const isLight = document.body.classList.contains('light-theme');

    let totalSpentAll = 0;
    catKeys.forEach(k => { totalSpentAll += (totals[k] || 0); });
    const totalBudget = Object.values(budgets).reduce((sum, val) => sum + Number(val || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - totalSpentAll);

    const satellitesHtml = catKeys.map((catId, index) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', iconClass: 'fa-solid fa-shapes', pastelBg: '#f0fdf4' };
      const spent = totals[catId] || 0;
      const angleDeg = -90 + (index * (360 / catKeys.length));
      const angleRad = (angleDeg * Math.PI) / 180.0;
      const x = Math.round(centerX + radius * Math.cos(angleRad) - 27);
      const y = Math.round(centerY + radius * Math.sin(angleRad) - 27);

      const satBg = isLight ? (cat.pastelBg || '#ffffff') : '#0f172a';
      const satBorder = cat.color;
      const textColor = isLight ? '#0f172a' : '#ffffff';
      const amtColor = isLight ? '#b91c1c' : '#f87171';
      const shadow = isLight ? `0 3px 10px rgba(0,0,0,0.08), 0 0 8px ${cat.color}33` : `0 4px 14px rgba(0,0,0,0.5), 0 0 10px ${cat.color}66`;

      return `
        <div class="cat-satellite hl-l5-satellite" data-action="quick-add" data-cat-id="${catId}"
             style="position:absolute; width:54px; height:54px; border-radius:50%; background:${satBg}; border:2.2px solid ${satBorder}; left:${x}px; top:${y}px; box-shadow:${shadow}; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:5;">
          <i class="${cat.iconClass}" style="color:${cat.color}; font-size:1.05rem;"></i>
          <span style="font-size:0.58rem; font-weight:850; color:${textColor}; line-height:1.1;">${cat.name.split(' ')[0]}</span>
          <span style="font-size:0.58rem; font-weight:900; color:${amtColor}; direction:ltr;">-${formatMoney(spent)}</span>
        </div>
      `;
    }).join('');

    const hubBg = isLight ? 'radial-gradient(circle, #ffffff 0%, #f0fdf4 100%)' : 'radial-gradient(circle, rgba(15,23,42,0.98), rgba(30,58,138,0.55))';
    const hubBorder = isLight ? '2.5px solid #10b981' : '2.5px solid rgba(56, 189, 248, 0.7)';
    const hubShadow = isLight ? '0 4px 18px rgba(16, 185, 129, 0.25)' : '0 0 28px rgba(56, 189, 248, 0.35)';
    const hubTitleBg = isLight ? '#d1fae5' : 'rgba(56, 189, 248, 0.15)';
    const hubTitleColor = isLight ? '#047857' : '#38bdf8';
    const hubSpentColor = isLight ? '#b91c1c' : '#f87171';
    const hubSubColor = isLight ? '#475569' : '#94a3b8';
    const hubRemainColor = isLight ? '#059669' : '#34d399';

    const voiceBtnBg = isLight ? 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(124,58,237,0.20) 100%)' : 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(124,58,237,0.3) 100%)';
    const voiceBorder = '#8b5cf6';
    const voiceText = isLight ? '#6d28d9' : '#e9d5ff';
    const voiceWaveColor = isLight ? '#8b5cf6' : '#c084fc';

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 8px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:42px;border-radius:12px;background:${voiceBtnBg};border:1.6px solid ${voiceBorder};color:${voiceText};display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:1rem;color:${voiceBorder};"></i>
            <span style="font-size:0.75rem;font-weight:850;color:${voiceText};">إضافة صوتية للمصروفات</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml(voiceWaveColor)}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:${voiceBorder};"></i>
        </button>
      </div>
    `;

    return `
      <div class="hl-layout-5-wrapper" style="display:flex;flex-direction:column;width:100%;">
        <div class="radial-arena hl-l5-arena" style="position:relative; width:100%; height:${arenaH}px; margin:0 auto; overflow:hidden;">
          <div style="position:absolute; top:${centerY - radius}px; left:${centerX - radius}px; width:${radius * 2}px; height:${radius * 2}px; border-radius:50%; border:1.5px dashed rgba(56, 189, 248, 0.28); pointer-events:none;"></div>
          
          <div class="central-hub hl-l5-hub" style="position:absolute; top:${centerY - 55}px; left:${centerX - 55}px; width:110px; height:110px; border-radius:50%; background:${hubBg}; border:${hubBorder}; box-shadow:${hubShadow}; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:10;">
            <span style="font-size:0.60rem; font-weight:800; color:${hubTitleColor}; background:${hubTitleBg}; padding:1px 6px; border-radius:10px;">إجمالي المصروفات</span>
            <span style="font-size:0.95rem; font-weight:900; color:${hubSpentColor}; direction:ltr;">-${formatMoney(totalSpentAll)}</span>
            <span style="font-size:0.54rem; color:${hubSubColor}; font-weight:700;">المتبقي بالميزانية</span>
            <span style="font-size:0.62rem; font-weight:900; color:${hubRemainColor}; direction:ltr;">+${formatMoney(remainingBudget)}</span>
          </div>

          ${satellitesHtml}
        </div>
        ${voiceBarHtml}
      </div>
    `;
  }

  /* =========================================================================
     الشكل 6: خلايا النحل السداسية (The Hexagonal Honeycomb Hive)
     ========================================================================= */
  function renderLayout6Honeycomb(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'daily', 'bills', 'transport', 'house', 'health', 'clothes', 'education', 'other'];
    const isLight = document.body.classList.contains('light-theme');

    const positions = [
      [14, 8], [138, 8], [262, 8],
      [14, 110], [138, 110], [262, 110],
      [14, 212], [138, 212], [262, 212]
    ];

    const cellsHtml = catKeys.map((catId, idx) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#10b981', iconClass: 'fa-solid fa-cube', pastelBg: '#ecfdf5' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 25;
      const [px, py] = positions[idx];

      const polyFill = isLight ? (cat.pastelBg || '#ffffff') : 'rgba(15, 23, 42, 0.92)';
      const polyStroke = cat.color;
      const nameColor = isLight ? '#0f172a' : '#f1f5f9';
      const amtColor = isLight ? '#b91c1c' : '#f43f5e';
      const trackBg = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.15)';

      return `
        <div class="hex-hive-card hl-l6-card" data-action="quick-add" data-cat-id="${catId}" style="position:absolute; left:${px}px; top:${py}px; width:114px; height:100px; cursor:pointer;">
          <svg class="hex-svg" viewBox="0 0 116 104" style="position:absolute; width:100%; height:100%;">
            <polygon points="58,3 113,27 113,77 58,101 3,77 3,27" fill="${polyFill}" stroke="${polyStroke}" stroke-width="${isLight ? 2.2 : 1.8}" style="filter: drop-shadow(0 2px 8px ${cat.color}55);" />
          </svg>
          <div style="position:relative; z-index:2; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:4px; gap:2px;">
            <div style="color:${cat.color}; font-size:1.10rem; margin-top:-2px;"><i class="${cat.iconClass}"></i></div>
            <span style="font-size:0.68rem; font-weight:850; color:${nameColor}; white-space:nowrap; max-width:88px; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
            <span style="font-size:0.72rem; font-weight:900; color:${amtColor}; direction:ltr;">-${formatMoney(spent)}</span>
            <div style="width:34px; height:3px; background:${trackBg}; border-radius:2px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:${cat.color}; border-radius:2px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const voiceBtnBg = isLight ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(139,92,246,0.18) 100%)' : 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(139,92,246,0.2) 100%)';
    const voiceBorder = '#10b981';
    const voiceText = isLight ? '#065f46' : '#d1fae5';

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 8px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:42px;border-radius:12px;background:${voiceBtnBg};border:1.6px solid ${voiceBorder};color:${voiceText};display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:0.95rem;color:${voiceBorder};"></i>
            <span style="font-size:0.74rem;font-weight:850;color:${voiceText};">إضافة صوتية للمصروفات</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml(voiceBorder)}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:${voiceBorder};"></i>
        </button>
      </div>
    `;

    return `
      <div class="hl-layout-6-wrapper" style="display:flex;flex-direction:column;width:100%;">
        <div class="honeycomb-board hl-l6-board" style="position:relative; width:100%; height:var(--dynamic-home-arena-h, 360px); display:flex; align-items:center; justify-content:center; overflow:hidden;">
          <div style="position:relative; width:390px; height:320px;">${cellsHtml}</div>
        </div>
        ${voiceBarHtml}
      </div>
    `;
  }

  /* =========================================================================
     الشكل 7: حساسات القياس الرقمية (HUD Compact Sensor Tiles)
     ========================================================================= */
  function renderLayout7SensorTiles(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'daily', 'bills', 'transport', 'house', 'health', 'clothes', 'education', 'other'];
    const isLight = document.body.classList.contains('light-theme');

    const tilesHtml = catKeys.map(catId => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', iconClass: 'fa-solid fa-shapes', pastelBg: '#f0fdf4' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 30;
      const ledColor = pct > 75 ? '#ef4444' : (pct > 40 ? '#f59e0b' : '#10b981');

      const tileBg = isLight ? `linear-gradient(145deg, ${cat.pastelBg || '#f8fafc'} 0%, #ffffff 100%)` : 'linear-gradient(160deg, rgba(24, 34, 53, 0.85) 0%, rgba(13, 22, 38, 0.95) 100%)';
      const tileBorder = isLight ? `1.8px solid ${cat.color}` : `1.3px solid ${cat.color}`;
      const nameColor = isLight ? '#0f172a' : '#f8fafc';
      const amtColor = isLight ? '#b91c1c' : '#f43f5e';
      const iconWrap = isLight
        ? `<div style="width:28px; height:28px; border-radius:50%; background:${cat.iconBg || cat.color}; color:#ffffff; display:flex; align-items:center; justify-content:center; font-size:0.88rem; margin:1px 0 2px; box-shadow:0 2px 6px ${cat.color}44;"><i class="${cat.iconClass}"></i></div>`
        : `<div style="width:28px; height:28px; border-radius:50%; border:1.2px solid ${cat.color}; color:${cat.color}; display:flex; align-items:center; justify-content:center; font-size:0.88rem; margin:1px 0 2px;"><i class="${cat.iconClass}"></i></div>`;
      const trackBg = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.12)';

      return `
        <div class="sensor-tile hl-l7-tile" data-action="quick-add" data-cat-id="${catId}" style="background:${tileBg}; border:${tileBorder}; border-radius:14px; padding:6px 6px 7px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center; position:relative; cursor:pointer; height:100%; box-sizing:border-box;">
          <div style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:0 2px 2px;">
            <span style="font-size:0.60rem; font-weight:900; color:${isLight ? '#475569' : '#94a3b8'};">${pct}%</span>
            <span style="width:6px; height:6px; border-radius:50%; background:${ledColor}; box-shadow:0 0 6px ${ledColor};"></span>
          </div>
          ${iconWrap}
          <span style="font-size:0.66rem; font-weight:850; color:${nameColor}; white-space:nowrap; max-width:95%; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
          <span style="font-size:0.70rem; font-weight:900; color:${amtColor}; direction:ltr; margin-top:1px;">-${formatMoney(spent)}</span>
          <div style="width:36px; height:3px; background:${trackBg}; border-radius:2px; overflow:hidden; margin-top:3px;">
            <div style="width:${pct}%; height:100%; background:${cat.color}; border-radius:2px;"></div>
          </div>
        </div>
      `;
    }).join('');

    const voiceBtnBg = isLight ? 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(139,92,246,0.18) 100%)' : 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(139,92,246,0.18) 100%)';
    const voiceBorder = '#38bdf8';
    const voiceText = isLight ? '#0369a1' : '#e0f2fe';

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 4px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:42px;border-radius:12px;background:${voiceBtnBg};border:1.4px solid ${voiceBorder};color:${voiceText};display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:0.95rem;color:${voiceBorder};"></i>
            <span style="font-size:0.74rem;font-weight:850;color:${voiceText};">إضافة صوتية للمصروفات (HUD Telemetry)</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml(voiceBorder)}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:${voiceBorder};"></i>
        </button>
      </div>
    `;

    return `
      <div class="hl-layout-7-wrapper" style="display:flex; flex-direction:column; width:100%;">
        <div class="sensor-arena hl-l7-arena" style="height:var(--dynamic-home-arena-h, 360px); padding:4px 6px; box-sizing:border-box; width:100%;">
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); grid-template-rows:repeat(3, 1fr); gap:6px; width:100%; height:100%;">${tilesHtml}</div>
        </div>
        ${voiceBarHtml}
      </div>
    `;
  }

  /* =========================================================================
     الشكل 8: الكريستال الماسي البلوري (The Diamond Facet Crystal Grid)
     ========================================================================= */
  function renderLayout8Diamonds(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'daily', 'bills', 'transport', 'house', 'health', 'clothes', 'education', 'other'];
    const isLight = document.body.classList.contains('light-theme');

    const positions = [
      [14, 12], [138, 12], [262, 12],
      [14, 118], [138, 118], [262, 118],
      [14, 224], [138, 224], [262, 224]
    ];

    const diamondsHtml = catKeys.map((catId, idx) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#ec4899', iconClass: 'fa-solid fa-gem', pastelBg: '#fdf2f8' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 35;
      const [px, py] = positions[idx];

      const diaBg = isLight ? `linear-gradient(135deg, ${cat.pastelBg || '#ffffff'} 0%, #ffffff 100%)` : 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)';
      const diaBorder = isLight ? `2px solid ${cat.color}` : `1.8px solid ${cat.color}`;
      const nameColor = isLight ? '#0f172a' : '#f1f5f9';
      const amtColor = isLight ? '#b91c1c' : '#f43f5e';
      const badgeBg = isLight ? (cat.pastelBg || '#f1f5f9') : `${cat.color}25`;
      const shadow = isLight ? `0 4px 12px rgba(0,0,0,0.08), 0 0 8px ${cat.color}33` : `0 6px 18px rgba(0,0,0,0.45), 0 0 12px ${cat.color}55`;

      return `
        <div class="diamond-wrapper hl-l8-item" data-action="quick-add" data-cat-id="${catId}" style="position:absolute; left:${px}px; top:${py}px; width:114px; height:100px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <div style="width:76px; height:76px; background:${diaBg}; border:${diaBorder}; border-radius:18px; transform:rotate(45deg); box-shadow:${shadow}; display:flex; align-items:center; justify-content:center;">
            <div style="transform:rotate(-45deg); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; width:95px; gap:1px;">
              <div style="color:${cat.color}; font-size:1.05rem;"><i class="${cat.iconClass}"></i></div>
              <span style="font-size:0.64rem; font-weight:850; color:${nameColor}; white-space:nowrap; max-width:88px; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
              <span style="font-size:0.68rem; font-weight:900; color:${amtColor}; direction:ltr;">-${formatMoney(spent)}</span>
              <span style="font-size:0.55rem; font-weight:900; color:${cat.color}; background:${badgeBg}; border:1px solid ${cat.color}55; border-radius:8px; padding:0 4px;">${pct}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const voiceBtnBg = isLight ? 'linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(139,92,246,0.18) 100%)' : 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.2) 100%)';
    const voiceBorder = '#ec4899';
    const voiceText = isLight ? '#9d174d' : '#fbcfe8';

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 6px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:42px;border-radius:12px;background:${voiceBtnBg};border:1.5px solid ${voiceBorder};color:${voiceText};display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:0.95rem;color:${voiceBorder};"></i>
            <span style="font-size:0.74rem;font-weight:850;color:${voiceText};">إضافة صوتية للمصروفات (Crystal Voice)</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml(voiceBorder)}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:${voiceBorder};"></i>
        </button>
      </div>
    `;

    return `
      <div class="hl-layout-8-wrapper" style="display:flex; flex-direction:column; width:100%;">
        <div class="diamond-arena hl-l8-arena" style="position:relative; width:100%; height:var(--dynamic-home-arena-h, 360px); display:flex; align-items:center; justify-content:center; overflow:hidden;">
          <div style="position:relative; width:390px; height:330px; margin:0 auto;">${diamondsHtml}</div>
        </div>
        ${voiceBarHtml}
      </div>
    `;
  }

  /* =========================================================================
     الشكل 9: مدرج التردد المالي والأعمدة الطيفية (The Financial Spectrum Equalizer)
     ========================================================================= */
  function renderLayout9Equalizer(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'daily', 'bills', 'transport', 'house', 'health', 'clothes', 'education', 'other'];
    const isLight = document.body.classList.contains('light-theme');

    const columnsHtml = catKeys.map(catId => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', iconClass: 'fa-solid fa-chart-simple' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 40;
      const barHeight = Math.max(22, Math.min(130, Math.round(pct * 1.30)));

      const amtColor = isLight ? '#b91c1c' : '#f43f5e';
      const trackBg = isLight ? '#e2e8f0' : 'rgba(30, 41, 59, 0.6)';
      const trackBorder = isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.05)';
      const badgeStyle = isLight
        ? `background:${cat.color}; color:#ffffff; border:none;`
        : `background:rgba(15, 23, 42, 0.9); border:1.2px solid ${cat.color}; color:${cat.color};`;
      const nameColor = isLight ? '#0f172a' : '#cbd5e1';

      return `
        <div class="eq-column hl-l9-col" data-action="quick-add" data-cat-id="${catId}" style="display:flex; flex-direction:column; align-items:center; gap:2px; width:38px; cursor:pointer;">
          <span style="font-size:0.58rem; font-weight:900; color:${amtColor}; direction:ltr; white-space:nowrap;">-${Math.round(spent)}</span>
          <div style="width:14px; height:135px; background:${trackBg}; border-radius:8px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; overflow:hidden; border:${trackBorder};">
            <div style="width:100%; height:${barHeight}px; border-radius:8px 8px 0 0; background:linear-gradient(180deg, ${cat.color} 0%, ${cat.color}44 100%); box-shadow:0 0 10px ${cat.color}88; position:relative;">
              <div style="position:absolute; top:0; left:0; right:0; height:3px; border-radius:8px 8px 0 0; background:#fff; box-shadow:0 0 6px #fff;"></div>
            </div>
          </div>
          <div style="width:24px; height:24px; border-radius:8px; ${badgeStyle} display:flex; align-items:center; justify-content:center; font-size:0.80rem;">
            <i class="${cat.iconClass}"></i>
          </div>
          <span style="font-size:0.60rem; font-weight:850; color:${nameColor}; white-space:nowrap; text-align:center;">${cat.name.split(' ')[0]}</span>
          <span style="font-size:0.56rem; font-weight:900; color:${cat.color};">${pct}%</span>
        </div>
      `;
    }).join('');

    const voiceBtnBg = isLight ? 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(139,92,246,0.18) 100%)' : 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(139,92,246,0.18) 100%)';
    const voiceBorder = '#38bdf8';
    const voiceText = isLight ? '#0369a1' : '#e0f2fe';

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 4px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:42px;border-radius:12px;background:${voiceBtnBg};border:1.4px solid ${voiceBorder};color:${voiceText};display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:0.95rem;color:${voiceBorder};"></i>
            <span style="font-size:0.74rem;font-weight:850;color:${voiceText};">إضافة صوتية للمصروفات (Spectrum Audio)</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml(voiceBorder)}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:${voiceBorder};"></i>
        </button>
      </div>
    `;

    const arenaBg = isLight ? '#ffffff' : 'transparent';
    const arenaBorder = isLight ? '1px solid #e2e8f0' : 'none';
    const headerBg = isLight ? '#f8fafc' : 'rgba(30, 41, 59, 0.5)';
    const headerBorder = isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)';
    const headerColor = isLight ? '#0284c7' : '#38bdf8';
    const subColor = isLight ? '#64748b' : '#94a3b8';
    const barsWrapBg = isLight ? '#f8fafc' : 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)';
    const barsWrapBorder = isLight ? '1px solid #e2e8f0' : '1px solid rgba(56, 189, 248, 0.15)';

    return `
      <div class="hl-layout-9-wrapper" style="display:flex; flex-direction:column; width:100%;">
        <div class="equalizer-arena hl-l9-arena" style="display:flex; flex-direction:column; justify-content:space-between; height:var(--dynamic-home-arena-h, 360px); background:${arenaBg}; border:${arenaBorder}; border-radius:16px; padding:6px 6px; box-sizing:border-box;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:${headerBg}; border:${headerBorder}; border-radius:12px; padding:4px 10px;">
            <span style="font-size:0.72rem; font-weight:800; color:${headerColor}; display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-chart-simple"></i> مدرج التردد المالي</span>
            <span style="font-size:0.65rem; color:${subColor};">انقر أي عمود للإدخال السريع</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:flex-end; flex:1; min-height:180px; background:${barsWrapBg}; border:${barsWrapBorder}; border-radius:16px; padding:8px 4px 6px; margin:4px 0;">
            ${columnsHtml}
          </div>
        </div>
        ${voiceBarHtml}
      </div>
    `;
  }

  /* -------------------------------------------------------------
     Master UI Sync & Render
  ------------------------------------------------------------- */
  function updateUiForActiveLayout() {
    let originalGrid = document.getElementById('catGrid');
    let container = document.getElementById('homeInterfaces');
    const expensePage = document.getElementById('viewExpenses');

    if (!container && originalGrid && originalGrid.parentNode) {
      container = document.createElement('div');
      container.id = 'homeInterfaces';
      container.hidden = true;
      originalGrid.parentNode.insertBefore(container, originalGrid.nextSibling);
    }

    let btn = document.getElementById('btnHomeDesign');
    if (!btn) {
      const tools = document.querySelector('.executive-quick-tools-strip');
      if (tools) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tool-pill-action';
        btn.id = 'btnHomeDesign';
        btn.title = 'تبديل شكل الشاشة';
        btn.innerHTML = `<span class="home-dial-wrapper" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"></span>`;
        tools.insertBefore(btn, tools.firstChild);
      }
    }

    const isOriginal = currentLayout === 0;

    if (originalGrid) {
      originalGrid.hidden = !isOriginal;
      if (isOriginal) {
        originalGrid.style.removeProperty('display');
      } else {
        originalGrid.style.setProperty('display', 'none', 'important');
      }
    }

    if (container) {
      container.hidden = isOriginal;
      container.dataset.design = String(currentLayout);
    }

    if (expensePage) {
      expensePage.classList.toggle('home-alternative-design', currentLayout > 0);
      expensePage.dataset.activeDesign = String(currentLayout);
    }

    document.body.classList.toggle('has-alt-home-layout', !isOriginal);
    document.body.dataset.homeLayout = String(currentLayout);

    updateDesignButtonDial();
    ensureSideHandlesVisible();
    measureAndApplyDynamicLayout();
  }

  function render(filtered) {
    cachedFiltered = filtered;
    updateUiForActiveLayout();

    const container = document.getElementById('homeInterfaces');
    if (!container) return;

    if (currentLayout === 0) {
      container.hidden = true;
      return;
    }

    container.hidden = false;

    const totals = computeTotals(filtered);
    const budgets = getBudgets();
    const currSymbol = (root.state && root.state.currentCurrency) ? root.state.currentCurrency : 'ج.م';
    const isGold = (root.state && root.state.currentCurrency === 'عيار 21');

    let html = '';
    switch (currentLayout) {
      case 1:
        html = renderLayout1List(totals, budgets, currSymbol, isGold);
        break;
      case 2:
        html = renderLayout2Analytics(totals, budgets, currSymbol, isGold);
        break;
      case 3:
        html = renderLayout3Asymmetric(totals, budgets, currSymbol, isGold);
        break;
      case 4:
        html = renderLayout4CompactGrid(totals, budgets, currSymbol, isGold);
        break;
      case 5:
        html = renderLayout5RadialCockpit(totals, budgets, currSymbol, isGold);
        break;
      case 6:
        html = renderLayout6Honeycomb(totals, budgets, currSymbol, isGold);
        break;
      case 7:
        html = renderLayout7SensorTiles(totals, budgets, currSymbol, isGold);
        break;
      case 8:
        html = renderLayout8Diamonds(totals, budgets, currSymbol, isGold);
        break;
      case 9:
        html = renderLayout9Equalizer(totals, budgets, currSymbol, isGold);
        break;
      default:
        html = renderLayout1List(totals, budgets, currSymbol, isGold);
        break;
    }

    container.innerHTML = html;
    ensureSideHandlesVisible();
    measureAndApplyDynamicLayout();
  }

  function getLayout() {
    return currentLayout;
  }

  function setLayout(layoutId) {
    const maxId = LAYOUT_META.length - 1; // 9
    const next = Math.max(0, Math.min(maxId, parseInt(layoutId, 10) || 0));
    currentLayout = next;
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch (e) {}

    updateUiForActiveLayout();
    render(cachedFiltered);

    const meta = LAYOUT_META[next];
    if (typeof root.showToast === 'function') {
      root.showToast(`✨ تم التبديل إلى: ${meta.name}`);
    }
  }

  function cycleLayout() {
    const next = (currentLayout + 1) % LAYOUT_META.length; // 0 to 9
    setLayout(next);
  }

  /* -------------------------------------------------------------
     Layout Picker Modal Drawer (All 10 Layouts)
  ------------------------------------------------------------- */
  function openPicker() {
    let modal = document.getElementById('homeLayoutPickerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'homeLayoutPickerModal';
      modal.className = 'hl-picker-overlay';
      modal.onclick = (e) => {
        if (e.target === modal) closePicker();
      };
      document.body.appendChild(modal);
    }

    const itemsHtml = LAYOUT_META.map(item => {
      const active = item.id === currentLayout;
      return `
        <div class="hl-picker-item ${active ? 'is-active' : ''}" onclick="window.HomeLayouts.chooseFromPicker(${item.id})">
          <div class="hl-picker-icon"><i class="fa-solid ${item.icon}"></i></div>
          <div class="hl-picker-text">
            <strong>${item.name}</strong>
            <small>${item.desc}</small>
          </div>
          ${active ? '<i class="fa-solid fa-circle-check hl-picker-check"></i>' : ''}
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="hl-picker-sheet">
        <div class="hl-picker-header">
          <div class="hl-picker-title">
            <i class="fa-solid fa-shapes"></i>
            <span>اختر نمط واجهة المصروفات (10 أشكال حصرية)</span>
          </div>
          <button type="button" class="hl-picker-close" onclick="window.HomeLayouts.closePicker()">&times;</button>
        </div>
        <div class="hl-picker-list">${itemsHtml}</div>
      </div>
    `;

    requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });
  }

  function closePicker() {
    const modal = document.getElementById('homeLayoutPickerModal');
    if (modal) {
      modal.classList.remove('is-open');
      setTimeout(() => {
        if (!modal.classList.contains('is-open') && modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 260);
    }
  }

  function chooseFromPicker(layoutId) {
    setLayout(layoutId);
    closePicker();
  }

  /* -------------------------------------------------------------
     Global Event Delegation Setup
  ------------------------------------------------------------- */
  function setupEventDelegation() {
    // 1. Delegated clicks inside #homeInterfaces
    document.addEventListener('click', function (e) {
      // Voice recording trigger
      const voiceTrigger = e.target.closest('[data-action="voice-record"]');
      if (voiceTrigger) {
        e.preventDefault();
        e.stopPropagation();
        if (root.VoiceAssistantEngine && typeof root.VoiceAssistantEngine.toggleListening === 'function') {
          root.VoiceAssistantEngine.toggleListening();
        } else if (typeof root.toggleVoiceAssistant === 'function') {
          root.toggleVoiceAssistant();
        } else {
          console.warn('Voice assistant engine not ready');
        }
        return;
      }

      // Quick category expense entry
      const addTrigger = e.target.closest('[data-action="quick-add"]');
      if (addTrigger) {
        const catId = addTrigger.getAttribute('data-cat-id');
        if (catId && typeof root.openQuickCategoryExpense === 'function') {
          e.preventDefault();
          e.stopPropagation();
          root.openQuickCategoryExpense(catId);
        }
        return;
      }

      // Switcher button clicks
      const designBtn = e.target.closest('#btnHomeDesign');
      if (designBtn) {
        e.preventDefault();
        e.stopPropagation();
        cycleLayout();
      }
    }, true);

    // 2. Long press on #btnHomeDesign opens Picker
    let pressTimer = null;
    document.addEventListener('pointerdown', function (e) {
      const designBtn = e.target.closest('#btnHomeDesign');
      if (designBtn) {
        pressTimer = setTimeout(() => {
          openPicker();
          pressTimer = null;
        }, 550);
      }
    }, { passive: true });

    const clearPress = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    document.addEventListener('pointerup', clearPress, { passive: true });
    document.addEventListener('pointercancel', clearPress, { passive: true });

    // 3. Viewport and orientation change listeners
    window.addEventListener('resize', () => {
      measureAndApplyDynamicLayout();
    }, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        measureAndApplyDynamicLayout();
      }, { passive: true });
    }

    // 4. Body theme observer to update dial when theme switches
    if (typeof MutationObserver !== 'undefined' && document.body) {
      const themeObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.attributeName === 'class' || m.attributeName === 'data-color-mode') {
            updateDesignButtonDial();
            break;
          }
        }
      });
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-color-mode'] });
    }
  }

  // Setup delegation on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventDelegation);
  } else {
    setupEventDelegation();
  }

  // Export HomeLayouts to root (window)
  root.HomeLayouts = {
    render,
    getLayout,
    setLayout,
    cycleLayout,
    openPicker,
    closePicker,
    chooseFromPicker,
    measureAndApplyDynamicLayout,
    ensureSideHandlesVisible,
    getDialSvgMarkup,
    updateDial: updateDesignButtonDial,
    CATEGORIES,
    LAYOUT_META
  };

})(typeof window !== 'undefined' ? window : this);
