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
    { id: 4, name: 'الشكل 4: شبكة 3 أعمدة (المعتمد 100%)', desc: '10 كروت في 3 أعمدة مع كارت الصوت بالصف الثالث يمين وكارت ملابس بالمنتصف', icon: 'fa-grip' },
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
        cardH = Math.floor((availableH - (4 * gap) - 6) / 5);
        cardH = Math.max(64, Math.min(82, cardH));
        break;
      }
      case 4: { // 3 columns, 4 rows (10 cards: 9 categories + voice card, row 4 centered) - 100% مطابقة للمرجع
        gap = viewportH < 720 ? 4 : (viewportH < 800 ? 5 : 6);
        cardH = Math.floor((availableH - (3 * gap) - 10) / 4);
        cardH = Math.max(98, Math.min(124, cardH));
        break;
      }
      case 5: // Radial Cockpit
      case 6: // Honeycomb Hive
      case 7: // HUD Sensor Tiles
      case 8: // Diamond Crystals
      case 9: // Spectrum Equalizer
      default: {
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
    const cx = 20;
    const cy = 20;
    const r = 18.2;
    const count = 10;
    const stepDeg = 36.0;
    const startOffsetDeg = -90.0;
    const safeSector = Math.max(0, Math.min(count - 1, parseInt(activeSector, 10) || 0));
    const theme = LAYOUT_DIAL_THEMES[safeSector] || LAYOUT_DIAL_THEMES[0];
    const palette = DIAMETER_PALETTES[safeSector] || DIAMETER_PALETTES[0];
    const activeDiameter = safeSector % 5;

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
      const opacity = isActive ? '0.96' : '0.14';
      const stroke = isActive ? theme.primary : 'rgba(217, 119, 6, 0.22)';
      const strokeW = isActive ? '1.0' : '0.5';

      return `<path class="hl-dial-slice ${isActive ? 'is-active' : ''}" data-sector="${i}" d="${d}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeW}"/>`;
    }).join('');

    // 5 خطوط أقطار كاملة تتغير ألوانها ديناميكياً مع تغير كل شكل!
    const lines = [];
    const nodes = [];
    for (let dIdx = 0; dIdx < 5; dIdx++) {
      const angle1 = startOffsetDeg + (dIdx * stepDeg);
      const angle2 = angle1 + 180.0;
      const p1 = polarToCartesian(cx, cy, r, angle1);
      const p2 = polarToCartesian(cx, cy, r, angle2);
      const color = palette[dIdx] || '#ffd700';
      const isActiveD = (dIdx === activeDiameter);
      const w = isActiveD ? '2.0' : '1.15';
      const op = isActiveD ? '1.0' : '0.85';
      const filt = isActiveD ? 'filter="url(#dialEpicGlow)"' : '';

      lines.push(`<line class="hl-dial-diameter ${isActiveD ? 'is-active-diameter' : ''}" data-diameter="${dIdx}" x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" ${filt}/>`);

      if (isActiveD) {
        // خط ساطع داخلي أبيض في قلب القطر النشط
        lines.push(`<line class="hl-dial-diameter-core" x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" opacity="0.95"/>`);
        // فصوص ألماسية متوهجة عند طرفي القطر النشط
        nodes.push(`<circle cx="${p1.x.toFixed(2)}" cy="${p1.y.toFixed(2)}" r="1.6" fill="#ffffff" stroke="${color}" stroke-width="0.9" filter="url(#dialEpicGlow)"/>`);
        nodes.push(`<circle cx="${p2.x.toFixed(2)}" cy="${p2.y.toFixed(2)}" r="1.6" fill="#ffffff" stroke="${color}" stroke-width="0.9" filter="url(#dialEpicGlow)"/>`);
      }
    }

    // 10 علامات فلكية ذهبية على الإطار الخارجي
    const ticks = Array.from({ length: count }, (_, i) => {
      const deg = startOffsetDeg + (i * stepDeg);
      const tp = polarToCartesian(cx, cy, r + 0.1, deg);
      if (i === safeSector) {
        return `<circle cx="${tp.x.toFixed(2)}" cy="${tp.y.toFixed(2)}" r="1.7" fill="#ffffff" stroke="#ffd700" stroke-width="1.0" filter="url(#dialEpicGlow)"/>`;
      }
      return `<circle cx="${tp.x.toFixed(2)}" cy="${tp.y.toFixed(2)}" r="0.75" fill="#f59e0b" opacity="0.75"/>`;
    }).join('');

    return `
      <svg class="home-dial-icon" viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true" style="overflow:visible; display:block;">
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
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="#090d16"/>
        <!-- القطاعات العشرة الجوهرية -->
        ${paths}
        <!-- مدار الأسطرلاب الداخلي المنقط -->
        <circle cx="${cx}" cy="${cy}" r="${(r - 3.8).toFixed(2)}" fill="none" stroke="#d97706" stroke-width="0.6" stroke-dasharray="1.2 2" opacity="0.55"/>
        <!-- الأقطار الخمسة اللونية المتغيرة بالكامل -->
        ${lines.join('')}
        <!-- الفصوص الألماسية لطرفي القطر النشط -->
        ${nodes.join('')}
        <!-- إطار الذهب المصقول الملكي -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#dialGoldBezel)" stroke-width="1.7"/>
        <!-- العلامات الفلكية الذهبية العشر -->
        ${ticks}
        <!-- قلب الدائرة الأسطوري المرصع -->
        <circle cx="${cx}" cy="${cy}" r="4.6" fill="url(#dialGoldBezel)" stroke="#78350f" stroke-width="0.6"/>
        <circle cx="${cx}" cy="${cy}" r="3.5" fill="${theme.glow}" opacity="0.85" filter="url(#dialEpicGlow)"/>
        <circle cx="${cx}" cy="${cy}" r="2.5" fill="${theme.core}" stroke="#0f172a" stroke-width="0.7"/>
        <circle cx="${(cx - 0.7).toFixed(2)}" cy="${(cy - 0.7).toFixed(2)}" r="0.8" fill="#ffffff" opacity="0.95"/>
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
      'voice',     'other',     'health',
      'clothes'
    ];

    const cardsHtml = layoutItems.map(id => {
      if (id === 'voice') {
        // كارت المساعد الصوتي المتوهج في الصف الثالث يمين (مطابق 100% للمرجع)
        return `
          <article class="home-design-card hl-card-l4 hl-voice-card-l4" data-action="voice-record" style="--cat-color:#8b5cf6; --cat-rgb:139,92,246; --cat-pastel-bg:#ffffff; --cat-pastel-border:#c084fc;">
            <div class="hl-card-l4-body">
              <button type="button" data-action="voice-record" class="hl-card-l4-head-btn">
                <div class="hl-card-l4-icon hl-voice-l4-icon" style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:#ffffff;">
                  <i class="fa-solid fa-microphone"></i>
                </div>
                <strong class="hl-card-l4-name hl-voice-l4-name" style="color:#6d28d9;">إضافة صوتية</strong>
              </button>

              <button type="button" data-action="voice-record" class="hl-card-l4-foot-btn hl-voice-l4-waves-wrap">
                ${getAudioWaveHtml('#8b5cf6')}
              </button>
            </div>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '- ' : '';
      const catDisplayName = s.cat.name; // 'أخرى ونثريات' مطابقة للمرجع 100%
      const isCenteredClothes = (id === 'clothes');

      return `
        <article class="home-design-card hl-card-l4 ${isCenteredClothes ? 'hl-card-l4-centered' : ''}" data-ref-category="${id}" style="--cat-color: ${s.cat.color}; --cat-rgb: ${s.cat.rgb}; --cat-pastel-bg: ${s.cat.pastelBg}; --cat-pastel-border: ${s.cat.pastelBorder};">
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

    return `
      <div class="hl-layout-4-wrapper">
        <div class="home-design-grid hl-grid-layout-4">${cardsHtml}</div>
      </div>
    `;
  }

  /* =========================================================================
     الشكل 5: قمرة القيادة المدارية (The Radial Orbit Cockpit)
     Hub + 9 Satellite Capsules + Integrated Bottom Voice Bar
     ========================================================================= */
  function renderLayout5RadialCockpit(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'bills', 'transport', 'clothes', 'health', 'education', 'daily', 'house', 'other'];
    const radius = 126;
    const centerX = 195;
    const centerY = 158;

    let totalSpentAll = 0;
    catKeys.forEach(k => { totalSpentAll += (totals[k] || 0); });
    const totalBudget = Object.values(budgets).reduce((sum, val) => sum + Number(val || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - totalSpentAll);

    const satellitesHtml = catKeys.map((catId, index) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', iconClass: 'fa-solid fa-shapes' };
      const spent = totals[catId] || 0;
      const angleDeg = -90 + (index * (360 / catKeys.length));
      const angleRad = (angleDeg * Math.PI) / 180.0;
      const x = Math.round(centerX + radius * Math.cos(angleRad) - 27);
      const y = Math.round(centerY + radius * Math.sin(angleRad) - 27);

      return `
        <div class="cat-satellite hl-l5-satellite" data-action="quick-add" data-cat-id="${catId}"
             style="position:absolute; width:54px; height:54px; border-radius:50%; background:#0f172a; border:2px solid ${cat.color}; left:${x}px; top:${y}px; box-shadow:0 4px 14px rgba(0,0,0,0.5), 0 0 10px ${cat.color}66; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:5;">
          <i class="${cat.iconClass}" style="color:${cat.color}; font-size:1.05rem;"></i>
          <span style="font-size:0.58rem; font-weight:800; color:#fff; line-height:1.1;">${cat.name.split(' ')[0]}</span>
          <span style="font-size:0.58rem; font-weight:900; color:#f87171; direction:ltr;">-${formatMoney(spent)}</span>
        </div>
      `;
    }).join('');

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:8px;padding:0 8px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:40px;border-radius:12px;background:linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(124,58,237,0.3) 100%);border:1.5px solid #8b5cf6;color:#c084fc;display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:1rem;color:#a855f7;"></i>
            <span style="font-size:0.75rem;font-weight:850;color:#e9d5ff;">إضافة صوتية للمصروفات</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml('#c084fc')}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:#a855f7;"></i>
        </button>
      </div>
    `;

    return `
      <div class="hl-layout-5-wrapper" style="display:flex;flex-direction:column;">
        <div class="radial-arena hl-l5-arena" style="position:relative; width:100%; height:320px; margin:0 auto; overflow:hidden;">
          <div style="position:absolute; top:${centerY - radius}px; left:${centerX - radius}px; width:${radius * 2}px; height:${radius * 2}px; border-radius:50%; border:1.5px dashed rgba(56, 189, 248, 0.28); pointer-events:none;"></div>
          
          <div class="central-hub hl-l5-hub" style="position:absolute; top:${centerY - 55}px; left:${centerX - 55}px; width:110px; height:110px; border-radius:50%; background:radial-gradient(circle, rgba(15,23,42,0.98), rgba(30,58,138,0.55)); border:2.5px solid rgba(56, 189, 248, 0.7); box-shadow:0 0 28px rgba(56, 189, 248, 0.35); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:10;">
            <span style="font-size:0.60rem; font-weight:800; color:#38bdf8; background:rgba(56, 189, 248, 0.15); padding:1px 6px; border-radius:10px;">إجمالي المصروفات</span>
            <span style="font-size:0.95rem; font-weight:900; color:#f87171; direction:ltr;">-${formatMoney(totalSpentAll)}</span>
            <span style="font-size:0.54rem; color:#94a3b8; font-weight:700;">المتبقي بالميزانية</span>
            <span style="font-size:0.62rem; font-weight:900; color:#34d399; direction:ltr;">+${formatMoney(remainingBudget)}</span>
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
    const positions = [
      [14, 8], [138, 8], [262, 8],
      [14, 110], [138, 110], [262, 110],
      [14, 212], [138, 212], [262, 212]
    ];

    const cellsHtml = catKeys.map((catId, idx) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#10b981', iconClass: 'fa-solid fa-cube' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 25;
      const [px, py] = positions[idx];

      return `
        <div class="hex-hive-card hl-l6-card" data-action="quick-add" data-cat-id="${catId}" style="position:absolute; left:${px}px; top:${py}px; width:114px; height:100px; cursor:pointer;">
          <svg class="hex-svg" viewBox="0 0 116 104" style="position:absolute; width:100%; height:100%;">
            <polygon points="58,3 113,27 113,77 58,101 3,77 3,27" fill="rgba(15,23,42,0.92)" stroke="${cat.color}" stroke-width="1.8" style="filter: drop-shadow(0 2px 8px ${cat.color}55);" />
          </svg>
          <div style="position:relative; z-index:2; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:4px; gap:2px;">
            <div style="color:${cat.color}; font-size:1.10rem; margin-top:-2px;"><i class="${cat.iconClass}"></i></div>
            <span style="font-size:0.68rem; font-weight:800; color:#f1f5f9; white-space:nowrap; max-width:88px; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
            <span style="font-size:0.72rem; font-weight:900; color:#f43f5e; direction:ltr;">-${formatMoney(spent)}</span>
            <div style="width:32px; height:3px; background:rgba(255,255,255,0.15); border-radius:2px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:${cat.color}; border-radius:2px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 8px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:38px;border-radius:12px;background:linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(139,92,246,0.2) 100%);border:1.5px solid #10b981;color:#6ee7b7;display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:0.95rem;color:#10b981;"></i>
            <span style="font-size:0.74rem;font-weight:850;color:#d1fae5;">إضافة صوتية للمصروفات</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml('#10b981')}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:#10b981;"></i>
        </button>
      </div>
    `;

    return `
      <div class="hl-layout-6-wrapper" style="display:flex;flex-direction:column;">
        <div class="honeycomb-board hl-l6-board" style="position:relative; width:100%; height:320px; margin:0 auto;">${cellsHtml}</div>
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
      const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', iconClass: 'fa-solid fa-shapes' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 30;
      const ledColor = pct > 75 ? '#ef4444' : (pct > 40 ? '#f59e0b' : '#10b981');

      return `
        <div class="sensor-tile hl-l7-tile" data-action="quick-add" data-cat-id="${catId}" style="background:linear-gradient(160deg, rgba(24, 34, 53, 0.85) 0%, rgba(13, 22, 38, 0.95) 100%); border:1.3px solid rgba(255, 255, 255, 0.12); border-radius:14px; padding:6px 6px 7px; display:flex; flex-direction:column; align-items:center; text-align:center; position:relative; cursor:pointer; min-height:86px;">
          <div style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:0 2px 2px;">
            <span style="font-size:0.60rem; font-weight:900; color:#94a3b8;">${pct}%</span>
            <span style="width:6px; height:6px; border-radius:50%; background:${ledColor}; box-shadow:0 0 6px ${ledColor};"></span>
          </div>
          <div style="width:28px; height:28px; border-radius:50%; border:1.2px solid ${cat.color}; color:${cat.color}; display:flex; align-items:center; justify-content:center; font-size:0.88rem; margin:1px 0 2px;">
            <i class="${cat.iconClass}"></i>
          </div>
          <span style="font-size:0.66rem; font-weight:850; color:#f8fafc; white-space:nowrap; max-width:95%; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
          <span style="font-size:0.70rem; font-weight:900; color:#f43f5e; direction:ltr; margin-top:1px;">-${formatMoney(spent)}</span>
          <div style="width:36px; height:3px; background:rgba(255,255,255,0.12); border-radius:2px; overflow:hidden; margin-top:3px;">
            <div style="width:${pct}%; height:100%; background:${cat.color}; border-radius:2px;"></div>
          </div>
        </div>
      `;
    }).join('');

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 6px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:38px;border-radius:12px;background:linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(139,92,246,0.18) 100%);border:1.4px solid #38bdf8;color:#7dd3fc;display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:0.95rem;color:#38bdf8;"></i>
            <span style="font-size:0.74rem;font-weight:850;color:#e0f2fe;">إضافة صوتية للمصروفات (HUD Telemetry)</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml('#38bdf8')}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:#38bdf8;"></i>
        </button>
      </div>
    `;

    return `
      <div class="sensor-arena hl-l7-arena" style="display:flex; flex-direction:column; justify-content:center; padding:4px 6px 6px;">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; width:100%;">${tilesHtml}</div>
        ${voiceBarHtml}
      </div>
    `;
  }

  /* =========================================================================
     الشكل 8: الكريستال الماسي البلوري (The Diamond Facet Crystal Grid)
     ========================================================================= */
  function renderLayout8Diamonds(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'daily', 'bills', 'transport', 'house', 'health', 'clothes', 'education', 'other'];
    const positions = [
      [14, 12], [138, 12], [262, 12],
      [14, 118], [138, 118], [262, 118],
      [14, 224], [138, 224], [262, 224]
    ];

    const diamondsHtml = catKeys.map((catId, idx) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#ec4899', iconClass: 'fa-solid fa-gem' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 35;
      const [px, py] = positions[idx];

      return `
        <div class="diamond-wrapper hl-l8-item" data-action="quick-add" data-cat-id="${catId}" style="position:absolute; left:${px}px; top:${py}px; width:114px; height:100px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <div style="width:76px; height:76px; background:linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%); border:1.8px solid ${cat.color}; border-radius:18px; transform:rotate(45deg); box-shadow:0 6px 18px rgba(0,0,0,0.45), 0 0 12px ${cat.color}55; display:flex; align-items:center; justify-content:center;">
            <div style="transform:rotate(-45deg); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; width:95px; gap:1px;">
              <div style="color:${cat.color}; font-size:1.05rem;"><i class="${cat.iconClass}"></i></div>
              <span style="font-size:0.64rem; font-weight:800; color:#f1f5f9; white-space:nowrap; max-width:88px; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
              <span style="font-size:0.68rem; font-weight:900; color:#f43f5e; direction:ltr;">-${formatMoney(spent)}</span>
              <span style="font-size:0.55rem; font-weight:900; color:${cat.color}; background:${cat.color}25; border-radius:8px; padding:0 4px;">${pct}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 8px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:38px;border-radius:12px;background:linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.2) 100%);border:1.5px solid #ec4899;color:#f472b6;display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:0.95rem;color:#ec4899;"></i>
            <span style="font-size:0.74rem;font-weight:850;color:#fce7f3;">إضافة صوتية للمصروفات</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml('#ec4899')}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:#ec4899;"></i>
        </button>
      </div>
    `;

    return `
      <div class="hl-layout-8-wrapper" style="display:flex;flex-direction:column;">
        <div class="diamond-arena hl-l8-arena" style="position:relative; width:100%; height:330px; margin:0 auto;">${diamondsHtml}</div>
        ${voiceBarHtml}
      </div>
    `;
  }

  /* =========================================================================
     الشكل 9: مدرج التردد المالي والأعمدة الطيفية (The Financial Spectrum Equalizer)
     ========================================================================= */
  function renderLayout9Equalizer(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'daily', 'bills', 'transport', 'house', 'health', 'clothes', 'education', 'other'];

    const columnsHtml = catKeys.map(catId => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', iconClass: 'fa-solid fa-chart-simple' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 40;
      const barHeight = Math.max(18, Math.min(110, Math.round(pct * 1.10)));

      return `
        <div class="eq-column hl-l9-col" data-action="quick-add" data-cat-id="${catId}" style="display:flex; flex-direction:column; align-items:center; gap:2px; width:38px; cursor:pointer;">
          <span style="font-size:0.58rem; font-weight:900; color:#f43f5e; direction:ltr; white-space:nowrap;">-${Math.round(spent)}</span>
          <div style="width:14px; height:115px; background:rgba(30, 41, 59, 0.6); border-radius:8px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
            <div style="width:100%; height:${barHeight}px; border-radius:8px 8px 0 0; background:linear-gradient(180deg, ${cat.color} 0%, ${cat.color}44 100%); box-shadow:0 0 10px ${cat.color}88; position:relative;">
              <div style="position:absolute; top:0; left:0; right:0; height:3px; border-radius:8px 8px 0 0; background:#fff; box-shadow:0 0 6px #fff;"></div>
            </div>
          </div>
          <div style="width:24px; height:24px; border-radius:8px; background:rgba(15, 23, 42, 0.9); border:1.2px solid ${cat.color}; color:${cat.color}; display:flex; align-items:center; justify-content:center; font-size:0.80rem;">
            <i class="${cat.iconClass}"></i>
          </div>
          <span style="font-size:0.60rem; font-weight:800; color:#cbd5e1; white-space:nowrap; text-align:center;">${cat.name.split(' ')[0]}</span>
          <span style="font-size:0.56rem; font-weight:900; color:${cat.color};">${pct}%</span>
        </div>
      `;
    }).join('');

    const voiceBarHtml = `
      <div class="hl-integrated-bottom-voice" data-action="voice-record" style="margin-top:6px;padding:0 4px;">
        <button type="button" data-action="voice-record" class="hl-integrated-voice-btn" style="width:100%;height:38px;border-radius:12px;background:linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(139,92,246,0.18) 100%);border:1.4px solid #38bdf8;color:#7dd3fc;display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-microphone" style="font-size:0.95rem;color:#38bdf8;"></i>
            <span style="font-size:0.74rem;font-weight:850;color:#e0f2fe;">إضافة صوتية للمصروفات (Spectrum Audio)</span>
          </div>
          <div style="width:100px;display:flex;align-items:center;">
            ${getAudioWaveHtml('#38bdf8')}
          </div>
          <i class="fa-solid fa-chevron-left" style="font-size:0.75rem;color:#38bdf8;"></i>
        </button>
      </div>
    `;

    return `
      <div class="equalizer-arena hl-l9-arena" style="display:flex; flex-direction:column; justify-content:center; padding:4px 4px 6px; gap:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(30, 41, 59, 0.5); border:1px solid rgba(255, 255, 255, 0.08); border-radius:12px; padding:4px 10px;">
          <span style="font-size:0.72rem; font-weight:800; color:#38bdf8; display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-chart-simple"></i> مدرج التردد المالي</span>
          <span style="font-size:0.65rem; color:#94a3b8;">انقر أي عمود للإدخال السريع</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; height:210px; background:linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%); border:1px solid rgba(56, 189, 248, 0.15); border-radius:16px; padding:8px 4px 6px;">
          ${columnsHtml}
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
    CATEGORIES,
    LAYOUT_META
  };

})(typeof window !== 'undefined' ? window : this);
