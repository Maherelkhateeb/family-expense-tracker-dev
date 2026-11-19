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

  // Synchronize document attributes immediately
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-home-layout', String(currentLayout));
      if (currentLayout > 0) {
        document.documentElement.classList.add('has-alt-home-layout');
      } else {
        document.documentElement.classList.remove('has-alt-home-layout');
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
        gap = Math.max(3, Math.min(6, Math.floor((availableH - (10 * 46)) / 9)));
        cardH = Math.floor((availableH - (9 * gap) - 4) / 10);
        cardH = Math.max(44, Math.min(60, cardH));
        break;
      }
      case 2: { // Hero analytics + 2 columns, 5 rows
        gap = 5;
        const heroH = Math.max(64, Math.min(78, Math.floor(availableH * 0.17)));
        const remainingForGrid = availableH - heroH - (4 * gap) - 6;
        cardH = Math.floor(remainingForGrid / 5);
        cardH = Math.max(72, Math.min(104, cardH));
        container.style.setProperty('--dynamic-home-hero-height', `${heroH}px`);
        break;
      }
      case 3: { // 2 columns, 5 rows (10 cards)
        gap = 5;
        cardH = Math.floor((availableH - (4 * gap) - 4) / 5);
        cardH = Math.max(76, Math.min(115, cardH));
        break;
      }
      case 4: { // 3 columns, 3 rows + 1 voice banner
        gap = 5;
        const voiceStripH = Math.max(46, Math.min(52, Math.floor(availableH * 0.10)));
        const availableForCards = availableH - voiceStripH - (3 * gap) - 4;
        cardH = Math.floor(availableForCards / 3);
        cardH = Math.max(96, Math.min(155, cardH));
        container.style.setProperty('--dynamic-home-voice-height', `${voiceStripH}px`);
        break;
      }
      case 5: // Radial Cockpit
      case 6: // Honeycomb Hive
      case 7: // HUD Sensor Tiles
      case 8: // Diamond Crystals
      default: {
        const voiceBarH = 44;
        const arenaH = Math.max(300, Math.min(500, availableH - voiceBarH - gap - 4));
        container.style.setProperty('--dynamic-home-arena-h', `${arenaH}px`);
        cardH = Math.floor(availableH);
        break;
      }
      case 9: { // Spectrum Equalizer with Member Chart
        const voiceBarH = 42;
        const memberChartH = 92;
        const arenaH = Math.max(160, Math.min(240, availableH - memberChartH - voiceBarH - (gap * 2)));
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

  function isThemeLight() {
    const body = document.body;
    const doc = document.documentElement;
    if (!body) return true;
    const isDark = body.classList.contains('dark-theme') || 
                   body.classList.contains('theme-dark') || 
                   (doc && (doc.getAttribute('data-theme') === 'dark' || doc.getAttribute('data-app-theme') === 'dark'));
    return !isDark;
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
    const r = 19.8;
    const count = 10;
    const stepDeg = 36.0;
    const startOffsetDeg = -90.0;
    const safeSector = Math.max(0, Math.min(count - 1, parseInt(activeSector, 10) || 0));
    const theme = LAYOUT_DIAL_THEMES[safeSector] || LAYOUT_DIAL_THEMES[0];
    const palette = DIAMETER_PALETTES[safeSector] || DIAMETER_PALETTES[0];
    const isLight = isThemeLight();

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    // 10 قطاعات جوهرية متناسقة
    const paths = Array.from({ length: count }, (_, i) => {
      const startAngle = startOffsetDeg + (i * stepDeg);
      const endAngle = startAngle + stepDeg;
      const p1 = polarToCartesian(cx, cy, r, startAngle);
      const p2 = polarToCartesian(cx, cy, r, endAngle);

      const d = [
        'M', cx, cy,
        'L', p1.x.toFixed(2), p1.y.toFixed(2),
        'A', r, r, 0, 0, 1, p2.x.toFixed(2), p2.y.toFixed(2),
        'Z'
      ].join(' ');

      const isActive = (i === safeSector);
      const fill = isActive ? `url(#activeSectorGrad_${safeSector})` : (LAYOUT_DIAL_THEMES[i]?.primary || '#8b5cf6');
      const opacity = isActive ? '0.96' : (isLight ? '0.20' : '0.16');
      const stroke = isActive ? theme.primary : 'rgba(217, 119, 6, 0.25)';
      const strokeW = isActive ? '1.1' : '0.55';

      return `<path class="hl-dial-slice ${isActive ? 'is-active' : ''}" data-sector="${i}" d="${d}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeW}"/>`;
    }).join('');

    // 5 خطوط أقطار كاملة تتغير ألوانها ديناميكياً مع كل شكل
    const lines = [];
    for (let dIdx = 0; dIdx < 5; dIdx++) {
      const angle1 = startOffsetDeg + (dIdx * stepDeg);
      const angle2 = angle1 + 180.0;
      const p1 = polarToCartesian(cx, cy, r, angle1);
      const p2 = polarToCartesian(cx, cy, r, angle2);
      const color = palette[dIdx] || '#ffd700';

      lines.push(`<line class="hl-dial-diameter" data-diameter="${dIdx}" x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" stroke="${color}" stroke-width="1.15" stroke-linecap="round" opacity="0.85"/>`);
    }

    // سهم التغيير النشط الصريح ينطلق فقط من المركز نحو الطرف النشط (بدون أي ذيل أو فص بالجهة المقابلة!)
    const activeAngle = startOffsetDeg + (safeSector * stepDeg);
    const pActive = polarToCartesian(cx, cy, r, activeAngle);
    const pInner = polarToCartesian(cx, cy, 4.6, activeAngle);
    const pointerBeam = `
      <line class="hl-dial-pointer-beam" x1="${pInner.x.toFixed(2)}" y1="${pInner.y.toFixed(2)}" x2="${pActive.x.toFixed(2)}" y2="${pActive.y.toFixed(2)}" stroke="${theme.glow}" stroke-width="2.2" stroke-linecap="round" opacity="0.95" filter="url(#dialEpicGlow)"/>
      <line class="hl-dial-pointer-beam-core" x1="${pInner.x.toFixed(2)}" y1="${pInner.y.toFixed(2)}" x2="${pActive.x.toFixed(2)}" y2="${pActive.y.toFixed(2)}" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.98"/>
      <!-- فص ماسي مشع حصرياً عند رأس سهم التغيير النشط فقط -->
      <circle cx="${pActive.x.toFixed(2)}" cy="${pActive.y.toFixed(2)}" r="2.1" fill="#ffffff" stroke="${theme.primary}" stroke-width="1.0" filter="url(#dialEpicGlow)"/>
      <circle cx="${pActive.x.toFixed(2)}" cy="${pActive.y.toFixed(2)}" r="1.1" fill="${theme.glow}"/>
    `;

    // 10 علامات فلكية ذهبية على الإطار الخارجي
    const ticks = Array.from({ length: count }, (_, i) => {
      const deg = startOffsetDeg + (i * stepDeg);
      const tp = polarToCartesian(cx, cy, r + 0.2, deg);
      if (i === safeSector) {
        return `<circle cx="${tp.x.toFixed(2)}" cy="${tp.y.toFixed(2)}" r="1.9" fill="#ffffff" stroke="#ffd700" stroke-width="1.1" filter="url(#dialEpicGlow)"/>`;
      }
      return `<circle cx="${tp.x.toFixed(2)}" cy="${tp.y.toFixed(2)}" r="0.85" fill="#f59e0b" opacity="0.75"/>`;
    }).join('');

    const bgFill = isLight ? '#ffffff' : '#090d16';

    return `
      <svg class="home-dial-icon" viewBox="0 0 44 44" width="100%" height="100%" aria-hidden="true" style="overflow:visible; display:block;">
        <defs>
          <linearGradient id="dialGoldBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="25%" stop-color="#ffd700"/>
            <stop offset="50%" stop-color="#b45309"/>
            <stop offset="75%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#78350f"/>
          </linearGradient>
          <radialGradient id="activeSectorGrad_${safeSector}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.95"/>
            <stop offset="60%" stop-color="${theme.primary}" stop-opacity="0.90"/>
            <stop offset="100%" stop-color="${theme.secondary}" stop-opacity="0.98"/>
          </radialGradient>
          <filter id="dialEpicGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- قرص الأوبسيديان الخلفي الفخم -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bgFill}"/>
        <!-- القطاعات العشرة الجوهرية -->
        ${paths}
        <!-- مدار الأسطرلاب الداخلي المنقط -->
        <circle cx="${cx}" cy="${cy}" r="${(r - 4.2).toFixed(2)}" fill="none" stroke="#d97706" stroke-width="0.65" stroke-dasharray="1.3 2.2" opacity="0.6"/>
        <!-- الأقطار الخمسة اللونية المتكاملة -->
        ${lines.join('')}
        <!-- سهم التغيير النشط الصريح بدون ذيل في الخلف -->
        ${pointerBeam}
        <!-- إطار الذهب المصقول الملكي -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#dialGoldBezel)" stroke-width="1.8"/>
        <!-- العلامات الفلكية الذهبية العشر -->
        ${ticks}
        <!-- قلب الدائرة الأسطوري المرصع -->
        <circle cx="${cx}" cy="${cy}" r="4.9" fill="url(#dialGoldBezel)" stroke="#78350f" stroke-width="0.7"/>
        <circle cx="${cx}" cy="${cy}" r="3.7" fill="${theme.glow}" opacity="0.9" filter="url(#dialEpicGlow)"/>
        <circle cx="${cx}" cy="${cy}" r="2.6" fill="${theme.core}" stroke="#0f172a" stroke-width="0.7"/>
        <circle cx="${(cx - 0.7).toFixed(2)}" cy="${(cy - 0.7).toFixed(2)}" r="0.85" fill="#ffffff" opacity="0.95"/>
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
  const MEMBER_META = {
    'البيت':  { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.15)', icon: 'fa-house', label: 'البيت' },
    'ماهر':   { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', icon: 'fa-user-tie', label: 'ماهر' },
    'آية':    { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', icon: 'fa-user', label: 'آية' },
    'محمد':   { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: 'fa-child', label: 'محمد' },
    'مريم':   { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', icon: 'fa-child-dress', label: 'مريم' },
    'الحاجة': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: 'fa-hands-holding-child', label: 'الحاجة' },
    'النونو': { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', icon: 'fa-baby', label: 'النونو' },
    'أخرى':   { color: '#d97706', bg: 'rgba(217, 119, 6, 0.15)', icon: 'fa-asterisk', label: 'أخرى' }
  };

  function computeMemberTotals(filtered) {
    const totals = {};
    let list = Array.isArray(filtered) ? filtered : [];
    if (!list.length && Array.isArray(root.state?.expenses)) {
      list = root.state.expenses;
    }
    if (!list.length && Array.isArray(root.state?.transactions)) {
      list = root.state.transactions;
    }

    list.forEach(t => {
      if (!t) return;
      const type = t.type || 'expense';
      const cat = t.category || t.catId || t.cat;
      if (type === 'expense' && cat !== 'transfer') {
        const m = (t.member && String(t.member).trim()) || 'البيت';
        totals[m] = (totals[m] || 0) + (Number(t.amount || t.cost) || 0);
      }
    });
    return totals;
  }

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

    totals._rawFiltered = list;
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
              <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-row-icon-btn" title="تسجيل سريع في ${catDisplayName}">
                <div class="hl-row-l1-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};">
                  <i class="${s.cat.iconClass}"></i>
                </div>
              </button>
              <div class="hl-row-icon-divider" style="width:2px; height:26px; background:var(--cat-color); opacity:0.9; margin:0 6px; border-radius:2px; flex-shrink:0; display:block !important;"></div>
              <div class="hl-row-name-amt">
                <button type="button" data-action="quick-add" data-cat-id="${id}" style="background:none;border:none;padding:0;text-align:right;cursor:pointer;display:block;width:100%;max-width:100%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="تسجيل سريع في ${catDisplayName}">
                  <strong class="hl-row-l1-name" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">${catDisplayName}</strong>
                </button>
                <button type="button" data-action="view-operations" data-cat-id="${id}" style="background:none;border:none;padding:0;text-align:right;cursor:pointer;display:block;width:100%;max-width:100%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="عرض حركات ${catDisplayName}">
                  <div class="hl-amount-cluster ${s.hasSpent ? 'spent' : 'zero'}">
                    <span class="hl-amt-num" style="direction:ltr;unicode-bidi:isolate;">${sign}${s.spentStr}</span>
                    <span class="hl-amt-curr">${currSymbol}</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="hl-row-divider" style="width:1.5px;min-width:1.5px;flex-shrink:0;height:24px;background:#cbd5e1;opacity:0.7;"></div>

            <button type="button" data-action="view-operations" data-cat-id="${id}" class="hl-row-mid-btn" title="عرض حركات ${catDisplayName}" style="background:none;border:none;padding:0;cursor:pointer;flex:1.2;min-width:0;max-width:40%;overflow:hidden;text-align:right;display:flex;flex-direction:column;justify-content:center;gap:1px;">
              <div class="hl-row-rem-line" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">المتبقي: ${s.remValStr} ${currSymbol}</div>
              <div class="hl-row-bud-line" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">الميزانية: ${s.budValStr} ${currSymbol}</div>
              <div class="hl-progress-track">
                <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};"></div>
              </div>
            </button>

            <button type="button" data-action="view-operations" data-cat-id="${id}" class="hl-row-l1-badge" style="background:${s.pct >= 100 ? '#fee2e2' : '#dcfce7'};color:${s.pct >= 100 ? '#b91c1c' : '#15803d'};border:none;cursor:pointer;flex-shrink:0;" title="نسبة المتبقي - انقر لعرض العمليات">
              %${s.remainingPct}
            </button>

            <button type="button" data-action="view-operations" data-cat-id="${id}" class="hl-row-chevron-btn" aria-label="عرض العمليات" style="flex-shrink:0;">
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
            <div class="hl-row-icon-divider" style="width:2px; height:26px; background:var(--cat-color); opacity:0.9; margin:0 6px; border-radius:2px; flex-shrink:0; display:block !important;"></div>
            <div class="hl-row-name-amt">
              <strong class="hl-row-l1-name" style="color:#6d28d9;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;font-size:calc(0.68rem * var(--dynamic-home-font-scale, 1));">إضافة صوتية للمصروفات</strong>
              <small class="hl-voice-sub" style="color:#7c3aed;font-size:0.62rem;font-weight:700;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">اضغط للتحدث الذكي</small>
            </div>
          </div>

          <div class="hl-row-divider" style="width:1.5px;min-width:1.5px;flex-shrink:0;height:24px;background:#cbd5e1;opacity:0.7;"></div>

          <button type="button" data-action="voice-record" class="hl-row-mid-btn hl-voice-waves-btn" style="flex:1.2;min-width:0;max-width:40%;overflow:hidden;">
            ${getAudioWaveHtml('#8b5cf6')}
          </button>

          <button type="button" data-action="voice-record" class="hl-row-chevron-btn" aria-label="بدء التسجيل الصوتي" style="flex-shrink:0;">
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
        <div class="hl-top3-item" data-action="view-operations" data-cat-id="${item.id}" style="cursor:pointer;" title="عرض حركات ${item.cat.name}">
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

    // 10 Cards in 2 Columns matching Image (Asymmetric with Outer Icons & Dividers):
    // Row 1: Right = daily (مصروف يومي), Left = food (طعام ومشتريات)
    // Row 2: Right = bills (فواتير والتزامات), Left = house (مستلزمات منزل)
    // Row 3: Right = education (تعليم ودروس), Left = transport (مواصلات وبنزين)
    // Row 4: Right = health (صحة وعلاج), Left = clothes (ملابس وأحذية)
    // Row 5: Right = voice (إضافة صوتية), Left = other (أخرى ومشتريات)
    const pairs = [
      ['daily', 'food'],
      ['bills', 'house'],
      ['education', 'transport'],
      ['health', 'clothes'],
      ['other', 'voice']
    ];

    const cardsHtml = pairs.map(([rightId, leftId]) => {
      function renderOneCard(id, side) {
        if (id === 'voice') {
          return `
            <article class="home-design-card hl-card-l2 hl-voice-card hl-card-l2-${side}-col" data-action="voice-record" style="--cat-color:#8b5cf6; --cat-rgb:139,92,246; --cat-pastel-bg:#f5f3ff; --cat-pastel-border:#c084fc;">
              <div class="hl-card-l2-inner hl-card-l2-inner-${side}">
                <button type="button" data-action="voice-record" class="hl-cat-icon-btn">
                  <div class="hl-card-l2-icon" style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:#ffffff;border-radius:13px;">
                    <i class="fa-solid fa-microphone"></i>
                  </div>
                </button>
                <div class="hl-card-l2-divider"></div>
                <div class="hl-card-l2-right">
                  <button type="button" data-action="voice-record" class="hl-cat-head-btn">
                    <strong class="hl-card-l2-name" style="color:#6d28d9;">إضافة صوتية للمصروفات</strong>
                  </button>
                  <button type="button" data-action="voice-record" class="hl-cat-amt-btn hl-voice-waves-box">
                    ${getAudioWaveHtml('#8b5cf6')}
                  </button>
                </div>
              </div>
            </article>
          `;
        }

        const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
        const sign = s.hasSpent ? '- ' : '';
        const catDisplayName = (id === 'other' && s.cat.altName) ? s.cat.altName : s.cat.name;

        const iconBtnHtml = `
          <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-icon-btn">
            <div class="hl-card-l2-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '13px'};">
              <i class="${s.cat.iconClass}"></i>
            </div>
          </button>
        `;

        const dividerHtml = `<div class="hl-card-l2-divider"></div>`;

        const textClusterHtml = `
          <div class="hl-card-l2-right">
            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-head-btn" title="تسجيل سريع في ${catDisplayName}">
              <strong class="hl-card-l2-name">${catDisplayName}</strong>
            </button>
            <button type="button" data-action="view-operations" data-cat-id="${id}" class="hl-cat-amt-btn" title="عرض حركات ${catDisplayName}">
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
        `;

        // Side-aware layout: Outer icon, vertical divider, text towards center
        const innerContent = side === 'right'
          ? (iconBtnHtml + dividerHtml + textClusterHtml)
          : (textClusterHtml + dividerHtml + iconBtnHtml);

        return `
          <article class="home-design-card hl-card-l2 hl-card-l2-${side}-col" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
            <div class="hl-card-l2-inner hl-card-l2-inner-${side}">
              ${innerContent}
            </div>
          </article>
        `;
      }

      return renderOneCard(rightId, 'right') + renderOneCard(leftId, 'left');
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
    // 10 Cards in 2 Columns matching Image (Asymmetric with Outer Icons & Dividers):
    // Row 1: Right = daily (مصروف يومي), Left = food (طعام ومشتريات)
    // Row 2: Right = bills (فواتير والتزامات), Left = house (مستلزمات منزل)
    // Row 3: Right = education (تعليم ودروس), Left = transport (مواصلات وبنزين)
    // Row 4: Right = health (صحة وعلاج), Left = clothes (ملابس وأحذية)
    // Row 5: Right = voice (إضافة صوتية), Left = other (أخرى ومشتريات)
    const pairs = [
      ['daily', 'food'],
      ['bills', 'house'],
      ['education', 'transport'],
      ['health', 'clothes'],
      ['other', 'voice']
    ];

    const cardsHtml = pairs.map(([rightId, leftId]) => {
      function renderOneCard(id, side) {
        if (id === 'voice') {
          const isLeft = (side === 'left');
          const vIconHtml = `
            <button type="button" data-action="voice-record" class="hl-cat-icon-btn">
              <div class="hl-card-l3-icon hl-voice-l3-icon" style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:#ffffff;">
                <i class="fa-solid fa-microphone"></i>
              </div>
            </button>
          `;
          const vDividerHtml = `<div class="hl-card-l3-divider"></div>`;
          const vTextHtml = `
            <div class="hl-card-l3-text">
              <button type="button" data-action="voice-record" class="hl-cat-head-btn">
                <strong class="hl-card-l3-name" style="color:#6d28d9;">إضافة صوتية للمصروفات</strong>
              </button>
              <button type="button" data-action="voice-record" class="hl-cat-amt-btn hl-voice-waves-box">
                ${getAudioWaveHtml('#8b5cf6')}
              </button>
            </div>
          `;
          const innerContent = isLeft
            ? (vTextHtml + vDividerHtml + vIconHtml)
            : (vIconHtml + vDividerHtml + vTextHtml);

          return `
            <article class="home-design-card hl-card-l3 hl-voice-card hl-card-l3-${side}-col" data-action="voice-record" style="--cat-color:#8b5cf6; --cat-rgb:139,92,246; --cat-pastel-bg:#f5f3ff; --cat-pastel-border:#c084fc;">
              <div class="hl-card-l3-inner hl-card-l3-inner-${side}">
                ${innerContent}
              </div>
            </article>
          `;
        }

        const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
        const sign = s.hasSpent ? '- ' : '';
        const catDisplayName = (id === 'other' && s.cat.altName) ? s.cat.altName : s.cat.name;

        const iconBtnHtml = `
          <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-icon-btn">
            <div class="hl-card-l3-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};">
              <i class="${s.cat.iconClass}"></i>
            </div>
          </button>
        `;

        const dividerHtml = `<div class="hl-card-l3-divider"></div>`;

        const textClusterHtml = `
          <div class="hl-card-l3-text">
            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-head-btn" title="تسجيل سريع في ${catDisplayName}">
              <strong class="hl-card-l3-name">${catDisplayName}</strong>
            </button>
            <button type="button" data-action="view-operations" data-cat-id="${id}" class="hl-cat-amt-btn" title="عرض حركات ${catDisplayName}">
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
        `;

        // Right side: Icon on right, divider, text on left (in RTL)
        // Left side: Text on right, divider, Icon on left (in RTL)
        const innerContent = side === 'right'
          ? (iconBtnHtml + dividerHtml + textClusterHtml)
          : (textClusterHtml + dividerHtml + iconBtnHtml);

        return `
          <article class="home-design-card hl-card-l3 hl-card-l3-${side}-col" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
            <div class="hl-card-l3-inner hl-card-l3-inner-${side}">
              ${innerContent}
            </div>
          </article>
        `;
      }

      return renderOneCard(rightId, 'right') + renderOneCard(leftId, 'left');
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
            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-card-l4-head-btn" title="تسجيل سريع في ${catDisplayName}">
              <div class="hl-card-l4-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};">
                <i class="${s.cat.iconClass}"></i>
              </div>
              <strong class="hl-card-l4-name">${catDisplayName}</strong>
            </button>

            <button type="button" data-action="view-operations" data-cat-id="${id}" class="hl-card-l4-foot-btn" title="عرض حركات ${catDisplayName}">
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
    const availableH = container ? (parseInt(container.style.getPropertyValue('--dynamic-home-available-h'), 10) || 400) : 400;
    const voiceBarH = 42;
    const arenaH = Math.max(260, Math.min(460, availableH - voiceBarH - 8));
    const centerY = Math.floor(arenaH / 2);

    const satSize = 84; // قطر كبسولات البنود المدارية
    const satHalf = 42;
    const maxRadiusByH = Math.floor((arenaH - satSize - 12) / 2);
    const radius = Math.max(115, Math.min(145, maxRadiusByH));

    const isLight = isThemeLight();

    let totalSpentAll = 0;
    catKeys.forEach(k => { totalSpentAll += (totals[k] || 0); });
    const totalBudget = Object.values(budgets).reduce((sum, val) => sum + Number(val || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - totalSpentAll);

    const satellitesHtml = catKeys.map((catId, index) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', iconClass: 'fa-solid fa-shapes', rgb: '56,189,248', pastelBg: '#f0fdf4' };
      const spent = totals[catId] || 0;
      const angleDeg = -90 + (index * (360 / catKeys.length));
      const angleRad = (angleDeg * Math.PI) / 180.0;
      const offsetX = Math.round(radius * Math.cos(angleRad) - satHalf);
      const y = Math.round(centerY + radius * Math.sin(angleRad) - satHalf);

      const hasSpent = spent > 0;
      const satBg = isLight 
        ? (cat.pastelBg || '#ffffff') 
        : `linear-gradient(135deg, rgba(${cat.rgb || '56,189,248'}, 0.28) 0%, rgba(15,23,42,0.95) 55%, rgba(10,18,30,0.98) 100%)`;
      const satBorder = cat.color;
      const textColor = isLight ? '#0f172a' : '#ffffff';
      const amtColor = hasSpent ? (isLight ? '#b91c1c' : '#fca5a5') : (isLight ? '#64748b' : '#94a3b8');
      const amtText = hasSpent ? `-${formatMoney(spent)}` : '0';
      const shadow = isLight
        ? `0 3px 12px rgba(0,0,0,0.08), 0 0 8px ${cat.color}44`
        : `0 4px 16px rgba(0,0,0,0.55), 0 0 12px rgba(${cat.rgb || '56,189,248'}, 0.45)`;

      return `
        <div class="cat-satellite hl-l5-satellite"
             style="position:absolute; width:${satSize}px; height:${satSize}px; border-radius:50%; background:${satBg}; border:2.2px solid ${satBorder}; left:calc(50% + ${offsetX}px); top:${y}px; box-shadow:${shadow}; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:5; transition:transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease;">
          <button type="button" data-action="quick-add" data-cat-id="${catId}" style="background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;line-height:1;" title="تسجيل سريع في ${cat.name}">
            <i class="${cat.iconClass}" style="color:${cat.color}; font-size:1.45rem; line-height:1; margin-bottom:2px;"></i>
            <span style="font-size:0.68rem; font-weight:850; color:${textColor}; line-height:1.1; margin-bottom:1px; white-space:nowrap; max-width:68px; overflow:hidden; text-overflow:ellipsis;">${cat.name.split(' ')[0]}</span>
          </button>
          <div class="hl-sat-divider" style="width:44px; height:2px; background:${cat.color} !important; opacity:${hasSpent ? '0.95' : '0.6'}; margin:2px auto; border-radius:2px; display:block !important;"></div>
          <button type="button" data-action="view-operations" data-cat-id="${catId}" style="background:none;border:none;padding:0;cursor:pointer;" title="عرض حركات ${cat.name}">
            <span style="font-size:0.66rem; font-weight:950; color:${amtColor}; direction:ltr; unicode-bidi:isolate; letter-spacing:-0.2px;">${amtText}</span>
          </button>
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
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:4px;padding:0 4px;width:100%;max-width:440px;box-sizing:border-box;">
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
      <div class="hl-layout-5-wrapper" style="display:flex;flex-direction:column;width:100%;max-width:460px;margin:0 auto;align-items:center;">
        <div class="radial-arena hl-l5-arena" style="position:relative; width:100%; height:${arenaH}px; margin:0 auto; overflow:hidden;">
          <div style="position:absolute; top:${centerY - radius}px; left:calc(50% - ${radius}px); width:${radius * 2}px; height:${radius * 2}px; border-radius:50%; border:1.5px dashed rgba(56, 189, 248, 0.28); pointer-events:none;"></div>
          
          <div class="central-hub hl-l5-hub" style="position:absolute; top:${centerY - 56}px; left:calc(50% - 56px); width:112px; height:112px; border-radius:50%; background:${hubBg}; border:${hubBorder}; box-shadow:${hubShadow}; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:10;">
            <span style="font-size:0.60rem; font-weight:800; color:${hubTitleColor}; background:${hubTitleBg}; padding:1px 6px; border-radius:10px;">إجمالي المصروفات</span>
            <button type="button" data-action="view-operations" data-cat-id="all" style="background:none;border:none;padding:0;cursor:pointer;" title="عرض جميع العمليات">
              <span style="font-size:0.95rem; font-weight:900; color:${hubSpentColor}; direction:ltr; display:block;">-${formatMoney(totalSpentAll)}</span>
            </button>
            <span style="font-size:0.55rem; color:${hubSubColor}; font-weight:700;">المتبقي بالميزانية</span>
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
    const isLight = isThemeLight();
    const container = document.getElementById('homeInterfaces');
    const availableH = container ? (parseInt(container.style.getPropertyValue('--dynamic-home-available-h'), 10) || 400) : 400;
    const voiceBarH = 42;
    const arenaH = Math.max(340, Math.min(480, availableH - voiceBarH - 8));

    // أعمدة متموضعة بدقة حول نقطة المنتصف 50% مع تكبير الخلايا وتوسيعها لتملأ الشاشة
    // عرض الخلية 118px، الإزاحات الأفقية: يسار -183px، وسط -59px، يمين +65px
    const colOffsets = [-183, -59, 65];
    const rowTops = [8, 126, 244];

    const cellsHtml = catKeys.map((catId, idx) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#10b981', iconClass: 'fa-solid fa-cube', pastelBg: '#ecfdf5' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const hasSpent = spent > 0;
      const pct = (hasSpent && budget > 0) ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const leftOffset = colOffsets[col];
      const topPos = rowTops[row];

      const polyFill = isLight ? (cat.pastelBg || '#ffffff') : `rgba(15, 23, 42, 0.94)`;
      const polyStroke = cat.color;
      const nameColor = isLight ? '#0f172a' : '#f1f5f9';
      const amtColor = hasSpent ? (isLight ? '#b91c1c' : '#f43f5e') : (isLight ? '#64748b' : '#94a3b8');
      const amtText = hasSpent ? `-${formatMoney(spent)}` : '0';
      const trackBg = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.15)';

      return `
        <div class="hex-hive-card hl-l6-card" style="position:absolute; left:calc(50% + ${leftOffset}px); top:${topPos}px; width:118px; height:108px;">
          <svg class="hex-svg" viewBox="0 0 118 108" style="position:absolute; width:100%; height:100%; pointer-events:none;">
            <polygon points="59,3 115,29 115,79 59,105 3,79 3,29" fill="${polyFill}" stroke="${polyStroke}" stroke-width="${isLight ? 2.2 : 1.8}" style="filter: drop-shadow(0 2px 10px ${cat.color}55);" />
          </svg>
          <div style="position:relative; z-index:2; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:4px; gap:3px;">
            <button type="button" data-action="quick-add" data-cat-id="${catId}" style="background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;" title="تسجيل سريع في ${cat.name}">
              <div style="color:${cat.color}; font-size:1.25rem; margin-top:-2px;"><i class="${cat.iconClass}"></i></div>
              <span style="font-size:0.74rem; font-weight:850; color:${nameColor}; white-space:nowrap; max-width:96px; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
            </button>
            <button type="button" data-action="view-operations" data-cat-id="${catId}" style="background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;" title="عرض حركات ${cat.name}">
              <span style="font-size:0.78rem; font-weight:950; color:${amtColor}; direction:ltr;">${amtText}</span>
              <div style="width:42px; height:3.5px; background:${trackBg}; border-radius:2px; overflow:hidden;">
                <div style="width:${hasSpent ? pct : 0}%; height:100%; background:${cat.color}; border-radius:2px;"></div>
              </div>
            </button>
          </div>
        </div>
      `;
    }).join('');

    const voiceBtnBg = isLight ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(139,92,246,0.18) 100%)' : 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(139,92,246,0.2) 100%)';
    const voiceBorder = '#10b981';
    const voiceText = isLight ? '#065f46' : '#d1fae5';

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:4px;padding:0 4px;width:100%;max-width:440px;box-sizing:border-box;">
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
      <div class="hl-layout-6-wrapper" style="display:flex;flex-direction:column;width:100%;max-width:460px;margin:0 auto;align-items:center;">
        <div class="honeycomb-board hl-l6-board" style="position:relative; width:100%; height:${arenaH}px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
          <div style="position:relative; width:100%; height:360px; margin:0 auto;">${cellsHtml}</div>
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

    const tilesHtml = catKeys.map(catId => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', iconClass: 'fa-solid fa-shapes', rgb: '56,189,248', pastelBg: '#f0f9ff' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const hasSpent = spent > 0;
      const pct = (hasSpent && budget > 0) ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
      const ledColor = hasSpent ? (pct > 90 ? '#ef4444' : (pct > 65 ? '#f59e0b' : '#10b981')) : '#334155';
      const amtColor = hasSpent ? '#fca5a5' : '#64748b';
      const amtText = hasSpent ? `-${formatMoney(spent)}` : '0';
      const barFillWidth = (hasSpent && pct > 0) ? Math.min(pct, 100) : 0;

      return `
        <div class="sensor-tile hl-l7-tile" style="--tile-color: ${cat.color}; --tile-color-pastel: ${cat.pastelBg || '#ffffff'}; --cat-rgb: ${cat.rgb || '56,189,248'};">
          <!-- 1. شريط الحساس العلوي: لمبة LED + النسبة المئوية -->
          <div class="sensor-tile-top" data-action="view-operations" data-cat-id="${catId}" data-cat-name="${cat.name}" title="عرض حركات ${cat.name} (${pct}%)">
            <span class="sensor-pct" style="color:${hasSpent ? '#94a3b8' : '#64748b'};">${pct}%</span>
            <span class="sensor-dot" style="background: ${ledColor}; box-shadow: ${hasSpent ? '0 0 7px ' + ledColor : 'none'};"></span>
          </div>

          <!-- 2. موضع تسجيل المصروف: الأيقونة الدائرية المتوهجة -->
          <button type="button" class="sensor-icon-circle-btn" data-action="quick-add" data-cat-id="${catId}" title="تسجيل مصروف جديد في ${cat.name}">
            <div class="sensor-icon-circle" style="background: ${cat.color}22; color: ${cat.color}; border: 1.2px solid ${cat.color}55; box-shadow: 0 0 10px ${cat.color}33;">
              <i class="${cat.iconClass}"></i>
            </div>
          </button>

          <!-- 3. موضع استعراض العمليات: اسم البند + المبلغ الرقمي + شريط القياس -->
          <div class="sensor-tile-bottom-btn" data-action="view-operations" data-cat-id="${catId}" data-cat-name="${cat.name}" title="عرض جميع حركات ${cat.name}">
            <span class="sensor-title">${cat.name}</span>
            <div class="sensor-divider" style="width:80%; height:2.2px; background:${cat.color} !important; opacity:0.95; margin:4px auto; border-radius:2px; display:block !important;"></div>
            <span class="sensor-val" style="color:${amtColor}; direction:ltr;">${amtText}</span>
            <div class="sensor-bar">
              <div class="sensor-bar-fill" style="width: ${barFillWidth}%; background: ${cat.color}; box-shadow: ${barFillWidth > 0 ? '0 0 6px ' + cat.color + 'aa' : 'none'};"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 4px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:44px;border-radius:12px;background:linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(139,92,246,0.2) 100%);border:1.4px solid #38bdf8;color:#e0f2fe;display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:0.95rem;color:#38bdf8;"></i>
            <span style="font-size:0.75rem;font-weight:850;color:#f8fafc;">إضافة صوتية للمصروفات (HUD Telemetry)</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml('#38bdf8')}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:#38bdf8;"></i>
        </button>
      </div>
    `;

    return `
      <div class="hl-layout-7-wrapper" style="display:flex; flex-direction:column; width:100%; max-width:460px; margin:0 auto; align-items:center;">
        <div class="sensor-arena hl-l7-arena">
          <div class="sensor-grid">
            ${tilesHtml}
          </div>
        </div>
        ${voiceBarHtml}
      </div>
    `;
  }

  /* =========================================================================
     الشكل 8: الكريستال الماسي البلوري (The Diamond Facet Crystal Grid)
     ========================================================================= */
  function renderLayout8Diamonds(totals, budgets, currSymbol, isGold) {
    const catKeys = ['bills', 'daily', 'food', 'health', 'house', 'transport', 'other', 'education', 'clothes'];
    const isLight = isThemeLight();

    const diamondsHtml = catKeys.map(catId => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#ec4899', iconClass: 'fa-solid fa-gem', pastelBg: '#fdf2f8' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const hasSpent = spent > 0;
      const pct = (hasSpent && budget > 0) ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

      const diaBg = isLight
        ? `linear-gradient(135deg, ${cat.pastelBg || '#ffffff'} 0%, #ffffff 100%)`
        : `linear-gradient(135deg, rgba(${cat.rgb || '236,72,153'}, 0.28) 0%, rgba(15, 23, 42, 0.95) 55%, rgba(10, 18, 30, 0.98) 100%)`;
      const diaBorder = isLight ? `2px solid ${cat.color}` : `2px solid ${cat.color}`;
      const nameColor = isLight ? '#0f172a' : '#f1f5f9';
      const amtColor = hasSpent ? (isLight ? '#b91c1c' : '#fca5a5') : (isLight ? '#64748b' : '#94a3b8');
      const amtText = hasSpent ? `-${formatMoney(spent)}` : '0';
      const badgeBg = hasSpent ? (isLight ? (cat.pastelBg || '#f1f5f9') : `${cat.color}25`) : (isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)');
      const badgeColor = hasSpent ? cat.color : (isLight ? '#94a3b8' : '#64748b');
      const shadow = isLight
        ? `0 4px 14px rgba(0,0,0,0.08), 0 0 10px ${cat.color}44`
        : `0 6px 20px rgba(0,0,0,0.55), 0 0 14px rgba(${cat.rgb || '236,72,153'}, 0.45)`;

      return `
        <div class="diamond-wrapper hl-l8-item">
          <div class="hl-dia-card" style="width:102px; height:102px; background:${diaBg}; border:${diaBorder}; border-radius:24px; transform:rotate(45deg); box-shadow:${shadow}; display:flex; align-items:center; justify-content:center;">
            <div class="hl-dia-content" style="transform:rotate(-45deg); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; width:120px; gap:2px;">
              <button type="button" data-action="quick-add" data-cat-id="${catId}" style="background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;" title="تسجيل سريع في ${cat.name}">
                <div style="color:${cat.color}; font-size:1.30rem;"><i class="${cat.iconClass}"></i></div>
                <span style="font-size:0.70rem; font-weight:850; color:${nameColor}; white-space:nowrap; max-width:96px; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
              </button>
              <div class="hl-dia-divider" style="width:58px; height:1.6px; background:${cat.color}; opacity:${hasSpent ? '0.85' : '0.5'}; margin:3px 0; border-radius:1px;"></div>
              <button type="button" data-action="view-operations" data-cat-id="${catId}" style="background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;" title="عرض حركات ${cat.name}">
                <span style="font-size:0.72rem; font-weight:950; color:${amtColor}; direction:ltr; unicode-bidi:isolate;">${amtText}</span>
                <span style="font-size:0.58rem; font-weight:900; color:${badgeColor}; background:${badgeBg}; border:1px solid ${hasSpent ? cat.color + '55' : 'transparent'}; border-radius:8px; padding:0 4px;">${pct}%</span>
              </button>
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
      <div class="hl-layout-8-wrapper" style="display:flex; flex-direction:column; width:100%; max-width:460px; margin:0 auto; align-items:center;">
        <div class="diamond-arena hl-l8-arena" style="position:relative; width:100%; height:var(--dynamic-home-arena-h, 380px); display:flex; align-items:center; justify-content:center; overflow:hidden;">
          <div class="hl-l8-grid">${diamondsHtml}</div>
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
    const isLight = isThemeLight();

    // حساب إجمالي مصروفات الأفراد والنسب للشارت العلوي
    const memberTotals = computeMemberTotals(totals._rawFiltered || cachedFiltered);
    const totalSpentMembers = Object.values(memberTotals).reduce((a, b) => a + b, 0);
    const activeMembers = Object.keys(memberTotals)
      .filter(m => memberTotals[m] > 0)
      .sort((a, b) => memberTotals[b] - memberTotals[a]);

    let memberChartHtml = '';

    if (activeMembers.length === 0) {
      memberChartHtml = `
        <div class="hl-l9-members-empty" style="padding:10px; text-align:center; color:#94a3b8; font-size:0.72rem; display:flex; align-items:center; justify-content:center; gap:8px;">
          <i class="fa-solid fa-users-viewfinder" style="font-size:1.1rem; color:#38bdf8; opacity:0.7;"></i>
          <span>لا توجد مصروفات مسجلة لأفراد الأسرة في هذه الفترة</span>
        </div>
      `;
    } else {
      const memberPills = activeMembers.map(m => {
        const amt = memberTotals[m];
        const pct = totalSpentMembers > 0 ? Math.round((amt / totalSpentMembers) * 100) : 0;
        const meta = MEMBER_META[m] || { color: '#38bdf8', bg: '#38bdf822', icon: 'fa-user' };

        return `
          <div class="hl-l9-member-pill" data-action="view-member-operations" data-member-name="${m}" title="انقر لعرض مصروفات ${m} (-${formatMoney(amt)} ${currSymbol})">
            <div class="hl-l9-mem-top">
              <div class="hl-l9-mem-avatar" style="background:${meta.bg}; color:${meta.color}; border:1.2px solid ${meta.color}55;">
                <i class="fa-solid ${meta.icon}"></i>
              </div>
              <span class="hl-l9-mem-name">${m}</span>
              <span class="hl-l9-mem-pct" style="color:${meta.color};">%${pct}</span>
            </div>
            <div class="hl-l9-mem-val">-${formatMoney(amt)} <small>${currSymbol}</small></div>
            <div class="hl-l9-mem-bar">
              <div class="hl-l9-mem-bar-fill" style="width:${Math.max(6, pct)}%; background:${meta.color}; box-shadow:0 0 6px ${meta.color}88;"></div>
            </div>
          </div>
        `;
      }).join('');

      memberChartHtml = `
        <div class="hl-l9-member-chart-box">
          <div class="hl-l9-chart-title-strip">
            <div style="display:flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-users-viewfinder" style="color:${isLight ? '#0284c7' : '#38bdf8'}; font-size:0.85rem;"></i>
              <span style="font-size:0.74rem; font-weight:850; color:${isLight ? '#0f172a' : '#f8fafc'};">توزيع المصروفات حسب أفراد الأسرة</span>
            </div>
            <span style="font-size:0.62rem; color:${isLight ? '#0284c7' : '#38bdf8'}; font-weight:700;">انقر على أي فرد لعرض عملياته</span>
          </div>
          <div class="hl-l9-member-grid">
            ${memberPills}
          </div>
        </div>
      `;
    }

    const columnsHtml = catKeys.map(catId => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', iconClass: 'fa-solid fa-chart-simple' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const hasSpent = spent > 0;
      const pct = (hasSpent && budget > 0) ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

      const amtColor = hasSpent ? (isLight ? '#b91c1c' : '#fca5a5') : (isLight ? '#94a3b8' : '#64748b');
      const amtText = hasSpent ? `-${Math.round(spent)}` : '0';
      const trackBg = isLight ? '#e2e8f0' : 'rgba(30, 41, 59, 0.6)';
      const trackBorder = isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.05)';
      const badgeStyle = isLight
        ? `background:${hasSpent ? cat.color : '#cbd5e1'}; color:#ffffff; border:none;`
        : `background:rgba(15, 23, 42, 0.9); border:1.2px solid ${hasSpent ? cat.color : '#475569'}; color:${hasSpent ? cat.color : '#94a3b8'};`;
      const nameColor = isLight ? '#0f172a' : '#cbd5e1';

      const barFillHtml = (hasSpent && pct > 0) ? `
        <div style="width:100%; height:${Math.min(100, pct)}%; border-radius:8px 8px 0 0; background:linear-gradient(180deg, ${cat.color} 0%, ${cat.color}55 100%); box-shadow:0 0 10px ${cat.color}88; position:relative; transition:height 0.3s ease;">
          <div style="position:absolute; top:0; left:0; right:0; height:3px; border-radius:8px 8px 0 0; background:#fff; box-shadow:0 0 6px #fff;"></div>
        </div>
      ` : `
        <div style="width:100%; height:0%; display:none;"></div>
      `;

      return `
        <div class="eq-column hl-l9-col">
          <button type="button" data-action="view-operations" data-cat-id="${catId}" style="background:none;border:none;padding:0;cursor:pointer;margin-bottom:3px;" title="عرض حركات ${cat.name}">
            <span style="font-size:0.64rem; font-weight:950; color:${amtColor}; direction:ltr; unicode-bidi:isolate; white-space:nowrap; display:block;">${amtText}</span>
          </button>
          <button type="button" data-action="view-operations" data-cat-id="${catId}" class="hl-l9-track-btn" style="background:${trackBg}; border:${trackBorder};" title="عرض حركات ${cat.name} (${pct}%)">
            ${barFillHtml}
          </button>
          <button type="button" data-action="quick-add" data-cat-id="${catId}" style="background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;margin-top:3px;" title="تسجيل سريع في ${cat.name}">
            <div style="width:26px; height:26px; border-radius:8px; ${badgeStyle} display:flex; align-items:center; justify-content:center; font-size:0.80rem;">
              <i class="${cat.iconClass}"></i>
            </div>
            <span style="font-size:0.62rem; font-weight:850; color:${nameColor}; white-space:nowrap; text-align:center;">${cat.name.split(' ')[0]}</span>
            <span style="font-size:0.56rem; font-weight:900; color:${hasSpent ? cat.color : (isLight ? '#94a3b8' : '#64748b')};">${pct}%</span>
          </button>
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
      <div class="hl-layout-9-wrapper" style="display:flex; flex-direction:column; width:100%; max-width:460px; margin:0 auto; align-items:center;">
        ${memberChartHtml}
        <div class="equalizer-arena hl-l9-arena" style="background:${arenaBg}; border:${arenaBorder}; border-radius:16px; padding:6px 6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:${headerBg}; border:${headerBorder}; border-radius:12px; padding:5px 10px; margin-bottom:8px;">
            <span style="font-size:0.72rem; font-weight:800; color:${headerColor}; display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-chart-simple"></i> مدرج التردد المالي</span>
            <span style="font-size:0.65rem; color:${subColor};">انقر الأيقونة للإدخال، والعمود لعرض الحركات</span>
          </div>
          <div class="hl-l9-bars-wrap" style="background:${barsWrapBg}; border:${barsWrapBorder}; padding:8px 4px 6px; margin:0;">
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

    if (document.documentElement) {
      document.documentElement.classList.toggle('has-alt-home-layout', !isOriginal);
      document.documentElement.setAttribute('data-home-layout', String(currentLayout));
    }
    if (document.body) {
      document.body.classList.toggle('has-alt-home-layout', !isOriginal);
      document.body.dataset.homeLayout = String(currentLayout);
    }

    if (originalGrid) {
      originalGrid.hidden = !isOriginal;
      if (isOriginal) {
        originalGrid.style.removeProperty('display');
        originalGrid.style.setProperty('display', 'grid', 'important');
        originalGrid.style.removeProperty('visibility');
      } else {
        originalGrid.style.setProperty('display', 'none', 'important');
        originalGrid.style.setProperty('visibility', 'hidden', 'important');
      }
    }

    if (container) {
      container.hidden = isOriginal;
      if (isOriginal) {
        container.style.setProperty('display', 'none', 'important');
      } else {
        container.style.removeProperty('display');
      }
      container.dataset.design = String(currentLayout);
    }

    if (expensePage) {
      expensePage.classList.toggle('home-alternative-design', !isOriginal);
      expensePage.dataset.activeDesign = String(currentLayout);
    }

    updateDesignButtonDial();
    ensureSideHandlesVisible();
    measureAndApplyDynamicLayout();
  }

  function render(filtered) {
    cachedFiltered = filtered;
    updateUiForActiveLayout();

    const container = document.getElementById('homeInterfaces');
    const originalGrid = document.getElementById('catGrid');

    if (currentLayout === 0) {
      if (container) {
        container.hidden = true;
        container.style.setProperty('display', 'none', 'important');
      }
      if (originalGrid) {
        originalGrid.hidden = false;
        originalGrid.style.removeProperty('display');
        originalGrid.style.setProperty('display', 'grid', 'important');
        originalGrid.style.removeProperty('visibility');
      }
      if (typeof root.renderCategoriesGrid === 'function') {
        const txs = cachedFiltered || (typeof root.getFilteredTransactions === 'function' ? root.getFilteredTransactions() : (root.state && root.state.transactions ? root.state.transactions : []));
        root.renderCategoriesGrid(txs);
      }
      return;
    }

    if (!container) return;

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

    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('data-home-layout', String(next));
        if (next > 0) {
          document.documentElement.classList.add('has-alt-home-layout');
          if (document.body) document.body.classList.add('has-alt-home-layout');
        } else {
          document.documentElement.classList.remove('has-alt-home-layout');
          if (document.body) document.body.classList.remove('has-alt-home-layout');
        }
      }
    } catch (e) {}

    updateUiForActiveLayout();
    render(cachedFiltered);

    if (next === 0 && typeof root.renderCategoriesGrid === 'function') {
      const txs = cachedFiltered || (typeof root.getFilteredTransactions === 'function' ? root.getFilteredTransactions() : (root.state && root.state.transactions ? root.state.transactions : []));
      root.renderCategoriesGrid(txs);
    }

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

      // View category operations in operations log (Dual-Action Architecture)
      const viewOpsTrigger = e.target.closest('[data-action="view-operations"]');
      if (viewOpsTrigger) {
        const catId = viewOpsTrigger.getAttribute('data-cat-id');
        if (catId) {
          e.preventDefault();
          e.stopPropagation();
          const catMeta = CATEGORIES[catId] || {};
          const catName = catMeta.name || catId;
          if (typeof root.openOperationsFiltered === 'function') {
            root.openOperationsFiltered({
              category: (catId === 'all' ? null : catId),
              categoryName: (catId === 'all' ? null : catName),
              type: 'expense'
            });
          } else if (typeof root.switchTab === 'function') {
            if (root.state && catId !== 'all') root.state.activeCategoryFilter = catId;
            root.switchTab('operations');
          }
        }
        return;
      }

      // View member operations in operations log (Dual-Action Family Member Chart)
      const memberTrigger = e.target.closest('[data-action="view-member-operations"]');
      if (memberTrigger) {
        const memberName = memberTrigger.getAttribute('data-member-name');
        if (memberName && typeof root.openOperationsFiltered === 'function') {
          e.preventDefault();
          e.stopPropagation();
          root.openOperationsFiltered({
            member: memberName,
            type: 'expense'
          });
        }
        return;
      }

      // Fallback for card background click
      const cardRef = e.target.closest('[data-ref-category]');
      if (cardRef && !e.target.closest('button')) {
        const catId = cardRef.getAttribute('data-ref-category');
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
