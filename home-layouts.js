/**
 * Cloud Firestore & Family Expense Tracker
 * Home Screen Alternative Layouts Engine (v5.6.0)
 *
 * Implements 5 alternative layouts + original Monefy layout:
 * - Layout 1: 2-column cards (Text on Right, Icon on Left, matching Image 1)
 * - Layout 2: Single-column horizontal list cards (matching Image 2)
 * - Layout 3: Top Donut chart + Top 3 spenders + 2-column cards (matching Image 3)
 * - Layout 4: Modern cards with hero daily/food row (matching Image 4)
 * - Layout 5: 3-column compact grid (3x3 + wide bottom voice) with exact pastel styling (matching Image 5)
 *
 * Enhanced Dynamic Engine Features:
 * - True DOM Bounding Box & visualViewport measurement (zero cut-off / no hidden bottom cards)
 * - Dynamic width-responsive scaler (<365px, 375px-400px, >400px)
 * - Proportional font and icon scaling synchronized with Settings font size
 * - Harmonious text, amounts, progress bars, and badge placements
 * - Edge-to-edge 6-Segment dial switcher icon with 3 internal diameters
 * - Currency switcher moved to far left
 * - Permanent side flaps (Gold & Summary handles)
 * - Zero impact on expense recording (openQuickCategoryExpense)
 */

(function (root) {
  'use strict';

  const STORAGE_KEY = 'family_expense_home_design_v2';

  // 10 Core categories with rich color palettes & pastel styling
  const CATEGORIES = {
    daily: {
      name: 'مصروف يومي',
      color: '#f59e0b',
      rgb: '245, 158, 11',
      pastelBg: '#fffbeb',
      pastelBorder: '#fde68a',
      iconBg: 'linear-gradient(135deg, #d97706, #b45309)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-mug-saucer',
      iconShape: 'circle'
    },
    bills: {
      name: 'فواتير والتزامات',
      color: '#f97316',
      rgb: '249, 115, 22',
      pastelBg: '#fff7ed',
      pastelBorder: '#fdba74',
      iconBg: 'linear-gradient(135deg, #f97316, #ea580c)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-bolt',
      iconShape: 'rounded'
    },
    food: {
      name: 'طعام ومشتريات',
      color: '#10b981',
      rgb: '16, 185, 129',
      pastelBg: '#f0fdf4',
      pastelBorder: '#86efac',
      iconBg: 'linear-gradient(135deg, #22c55e, #16a34a)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-cart-shopping',
      iconShape: 'rounded'
    },
    house: {
      name: 'مستلزمات منزل',
      color: '#a855f7',
      rgb: '168, 85, 247',
      pastelBg: '#faf5ff',
      pastelBorder: '#d8b4fe',
      iconBg: 'linear-gradient(135deg, #a855f7, #7c3aed)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-couch',
      iconShape: 'rounded'
    },
    transport: {
      name: 'مواصلات وبنزين',
      color: '#0284c7',
      rgb: '2, 132, 199',
      pastelBg: '#f0f9ff',
      pastelBorder: '#93c5fd',
      iconBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-car',
      iconShape: 'rounded'
    },
    education: {
      name: 'تعليم ودروس',
      color: '#06b6d4',
      rgb: '6, 182, 212',
      pastelBg: '#f0fdfa',
      pastelBorder: '#67e8f9',
      iconBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-book-open',
      iconShape: 'rounded'
    },
    health: {
      name: 'صحة وعلاج',
      color: '#ef4444',
      rgb: '239, 68, 68',
      pastelBg: '#fff1f2',
      pastelBorder: '#fca5a5',
      iconBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-capsules',
      iconShape: 'rounded'
    },
    other: {
      name: 'أخرى ومشتريات',
      altName5: 'أخرى ونثريات',
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
      pastelBorder: '#f472b6',
      iconBg: 'linear-gradient(135deg, #ec4899, #db2777)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-shirt',
      iconShape: 'rounded'
    },
    voice: {
      name: 'إضافة صوتية للمصروفات',
      color: '#7c3aed',
      rgb: '124, 58, 237',
      pastelBg: '#faf5ff',
      pastelBorder: '#c084fc',
      iconBg: 'linear-gradient(135deg, #a855f7, #7c3aed)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-microphone',
      iconShape: 'rounded'
    }
  };

  // Exact positions matching reference screenshots in RTL
  const VISUAL_POSITIONS_L1 = {
    daily: 0, bills: 1,
    food: 2, house: 3,
    transport: 4, education: 5,
    other: 6, health: 7,
    voice: 8, clothes: 9
  };

  const VISUAL_POSITIONS_L3 = {
    daily: 0, food: 1,
    bills: 2, house: 3,
    education: 4, transport: 5,
    health: 6, clothes: 7,
    voice: 8, other: 9
  };

  const VISUAL_POSITIONS_L4 = {
    daily: 0, food: 1,
    bills: 2, house: 3,
    transport: 4, health: 5,
    education: 6, other: 7,
    clothes: 8, voice: 9
  };

  const VISUAL_POSITIONS_L5 = {
    bills: 0, food: 1, daily: 2,
    transport: 3, education: 4, house: 5,
    clothes: 6, other: 7, health: 8,
    voice: 9
  };

  const LAYOUT_META = [
    { id: 0, name: 'الشكل الأصلي (الدائري)', desc: 'شاشة المصروفات الدائرية الافتراضية مع المخطط المركزي', icon: 'fa-circle-dot' },
    { id: 1, name: 'الشكل 1: بطاقات مدمجة متوازية', desc: 'بطاقات أفقية أنيقة مع أيقونة جانبية ومؤشرات تقدم', icon: 'fa-table-columns' },
    { id: 2, name: 'الشكل 2: قائمة أفقية تفصيلية', desc: 'شريط مالي ممتد لكل بند مع تفاصيل المتبقي والميزانية ونسبة الصرف', icon: 'fa-bars' },
    { id: 3, name: 'الشكل 3: لوحة تحليلات وإحصاءات', desc: 'مخطط كعكي دائري مع أعلى 3 بنود صرفاً وبطاقات متوازية', icon: 'fa-chart-pie' },
    { id: 4, name: 'الشكل 4: بطاقات حديثة غير متماثلة', desc: 'بطاقة رئيسية لمصروف اليوم والطعام مع تصميم عصري وبطاقات مميزة', icon: 'fa-layer-group' },
    { id: 5, name: 'الشكل 5: شبكة مصغرة مدمجة (3x3)', desc: 'شبكة ثلاثية الأعمدة مدمجة بألوان باستيل هادئة تتسع لجميع البنود', icon: 'fa-grip' }
  ];

  let currentLayout = 1;
  let cachedFiltered = null;

  /* -------------------------------------------------------------
     Dynamic Layout & Font Scaling Engine (v5.6.0)
     Accurately measures screen geometry and adapts cards & typography
  ------------------------------------------------------------- */
  function measureAndApplyDynamicLayout() {
    const container = document.getElementById('homeInterfaces');
    if (!container) return;

    const bottomNav = document.getElementById('appBottomNav') ||
                      document.querySelector('.app-bottom-nav') ||
                      document.querySelector('.bottom-dock-nav');
    const tools = document.querySelector('.executive-quick-tools-strip');
    const header = document.querySelector('.app-header');
    const period = document.querySelector('.period-selector-top-strip') || document.querySelector('.period-filter-container');
    const balance = document.getElementById('topKpiThreeStrip') || document.getElementById('mainBalanceCard');

    // 1. Precise Viewport Measurements (visualViewport handles mobile URL bar / keyboard)
    const vv = window.visualViewport;
    const viewportW = (vv ? vv.width : window.innerWidth) || document.documentElement.clientWidth || 390;
    const viewportH = (vv ? vv.height : window.innerHeight) || document.documentElement.clientHeight || 800;

    // 2. Measure Bottom Boundary (top edge of bottom dock nav)
    const navRect = bottomNav ? bottomNav.getBoundingClientRect() : null;
    const bottomLimit = (navRect && navRect.top > 200) ? navRect.top : (viewportH - 64);

    // 3. Measure Top Boundary (where homeInterfaces begins without scrolling)
    const viewExpenses = document.getElementById('viewExpenses');
    const scrollY = (viewExpenses ? viewExpenses.scrollTop : 0) || window.scrollY || 0;

    let containerTop = 0;
    if (container && container.offsetParent !== null) {
      containerTop = container.getBoundingClientRect().top + scrollY;
    }

    // Fallback calculation if container is not yet rendered in layout tree
    if (containerTop <= 40) {
      const hH = header ? header.offsetHeight : 52;
      const pH = period ? period.offsetHeight : 44;
      const bH = balance ? balance.offsetHeight : 84;
      const tH = tools ? tools.offsetHeight : 42;
      containerTop = hH + pH + bH + tH + 12;
    }

    // 4. Calculate True Available Height for the Home Layouts Grid
    // Subtract safe container padding and bottom margin (10px)
    const availableH = Math.max(270, Math.floor(bottomLimit - containerTop - 10));

    // 5. Width-Responsive Scale Factor for Mobile Screens (<365, 375-400, >400)
    let widthScale = 1.0;
    if (viewportW < 365) {
      widthScale = 0.84;
    } else if (viewportW < 385) {
      widthScale = 0.92;
    } else if (viewportW < 415) {
      widthScale = 0.97;
    } else {
      widthScale = 1.00;
    }

    // Dynamic icon size adaptation
    let iconSize = Math.round(36 * widthScale);
    iconSize = Math.max(28, Math.min(38, iconSize));
    container.style.setProperty('--dynamic-home-icon-size', `${iconSize}px`);

    // 6. Layout-Specific Exact Sizing & Spacing
    let cardH = 78;
    let gap = 6;

    switch (currentLayout) {
      case 1: { // 2 Columns, 5 Rows
        gap = viewportH < 720 ? 5 : 7;
        const totalGaps = 4 * gap;
        const paddingY = 10;
        cardH = Math.floor((availableH - totalGaps - paddingY) / 5);
        cardH = Math.max(62, Math.min(86, cardH));
        break;
      }
      case 2: { // Single Column List, 10 Rows
        gap = viewportH < 720 ? 3 : 4;
        const totalGaps = 9 * gap;
        const paddingY = 10;
        cardH = Math.floor((availableH - totalGaps - paddingY) / 10);
        cardH = Math.max(40, Math.min(50, cardH));
        break;
      }
      case 3: { // Analytics Hero + 2 Columns, 5 Rows
        gap = viewportH < 720 ? 4 : 5;
        const heroH = Math.max(86, Math.min(104, Math.floor(availableH * 0.23)));
        const remainingForGrid = availableH - heroH - 6 - 10;
        cardH = Math.floor((remainingForGrid - (4 * gap)) / 5);
        cardH = Math.max(56, Math.min(74, cardH));
        container.style.setProperty('--dynamic-home-hero-height', `${heroH}px`);
        break;
      }
      case 4: { // Asymmetric Modern Cards, 2 Columns, 5 Rows
        gap = viewportH < 720 ? 5 : 7;
        const totalGaps = 4 * gap;
        const paddingY = 10;
        cardH = Math.floor((availableH - totalGaps - paddingY) / 5);
        cardH = Math.max(62, Math.min(86, cardH));
        break;
      }
      case 5: { // 3x3 Grid + Full-Width Voice Banner
        gap = viewportH < 720 ? 5 : 6;
        const voiceH = Math.max(42, Math.min(48, Math.floor(availableH * 0.11)));
        const remainingForGrid = availableH - voiceH - (3 * gap) - 10;
        cardH = Math.floor(remainingForGrid / 3);
        cardH = Math.max(80, Math.min(100, cardH));
        container.style.setProperty('--dynamic-home-voice-height', `${voiceH}px`);
        break;
      }
      default: {
        cardH = 78;
        break;
      }
    }

    container.style.setProperty('--dynamic-home-card-height', `${cardH}px`);
    container.style.setProperty('--dynamic-home-gap', `${gap}px`);

    // 7. Combined Font Scaling (Settings Font Mode * Width Adaptation)
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
     SVG 6-Segment Dial Icon with 3 Internal Diameters (أقطار داخلية)
     Edge-to-Edge: The circle matches the full button frame
  ------------------------------------------------------------- */
  function getDialSvgMarkup(activeSector) {
    const cx = 19, cy = 19, R = 17.5;
    const sectors = [
      'M 19 19 L 19.00 1.50 A 17.5 17.5 0 0 1 34.16 10.25 Z',
      'M 19 19 L 34.16 10.25 A 17.5 17.5 0 0 1 34.16 27.75 Z',
      'M 19 19 L 34.16 27.75 A 17.5 17.5 0 0 1 19.00 36.50 Z',
      'M 19 19 L 19.00 36.50 A 17.5 17.5 0 0 1 3.84 27.75 Z',
      'M 19 19 L 3.84 27.75 A 17.5 17.5 0 0 1 3.84 10.25 Z',
      'M 19 19 L 3.84 10.25 A 17.5 17.5 0 0 1 19.00 1.50 Z'
    ];

    const paths = sectors.map((d, i) => {
      const isActive = i === activeSector;
      const opacity = isActive ? '0.96' : '0.12';
      return `<path class="hl-dial-slice ${isActive ? 'is-active' : ''}" data-sector="${i}" d="${d}" fill="currentColor" fill-opacity="${opacity}" stroke="currentColor" stroke-width="0.8" />`;
    }).join("");

    // 3 full internal diameters passing through center (19, 19) from rim to rim (أقطار داخلية)
    return `
      <svg class="home-dial-icon" viewBox="0 0 38 38" width="38" height="38" aria-hidden="true" style="overflow:visible; display:block; width:100%; height:100%;">
        <circle cx="19" cy="19" r="17.5" fill="none" stroke="currentColor" stroke-width="1.6" class="hl-dial-track" />
        ${paths}
        <line class="hl-dial-diameter" x1="19.00" y1="1.50" x2="19.00" y2="36.50" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.85" />
        <line class="hl-dial-diameter" x1="34.16" y1="10.25" x2="3.84" y2="27.75" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.85" />
        <line class="hl-dial-diameter" x1="34.16" y1="27.75" x2="3.84" y2="10.25" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.85" />
        <circle cx="19" cy="19" r="2.8" class="hl-dial-center" fill="currentColor" />
      </svg>
    `.trim();
  }

  function updateDesignButtonDial() {
    const btn = document.getElementById('btnHomeDesign');
    if (!btn) return;

    btn.title = `تبديل شكل الشاشة (الحالي: ${LAYOUT_META[currentLayout]?.name || ''})`;
    btn.setAttribute('aria-label', btn.title);

    let iconContainer = btn.querySelector('.home-dial-wrapper');
    if (!iconContainer) {
      btn.innerHTML = `<span class="home-dial-wrapper" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"></span>`;
      iconContainer = btn.querySelector('.home-dial-wrapper');
    }

    iconContainer.innerHTML = getDialSvgMarkup(currentLayout);
  }

  /* -------------------------------------------------------------
     Sound Wave Audio Animation HTML Helper
  ------------------------------------------------------------- */
  function getWaveHtml(count = 14) {
    const bars = [];
    for (let i = 0; i < count; i++) {
      const delay = (i * 0.08).toFixed(2);
      const h = 4 + (Math.sin(i * 0.7) * 9 + 9);
      bars.push(`<span class="hl-wave-bar" style="height: ${h.toFixed(1)}px; animation-delay: -${delay}s;"></span>`);
    }
    return `<div class="hl-wave-container">${bars.join('')}</div>`;
  }

  /* -------------------------------------------------------------
     Data Aggregation & Ceiling Calculation
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

  function getCategoryStats(catId, totals, budgets, currSymbol, isGold, layoutNum = 1) {
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
      budgetText = `تجاوز: ${remainingPct}% • ${remValStr} ${currSymbol}`;
    } else {
      budgetText = `متبقي: ${remainingPct}% • ${remValStr} ${currSymbol}`;
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

  /* -------------------------------------------------------------
     Render Layout 1 (2-column cards matching Image 1: Text Right, Icon Left)
  ------------------------------------------------------------- */
  function renderLayout1(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'bills', 'food', 'house', 'transport', 'education', 'other', 'health', 'voice', 'clothes'];

    const cardsHtml = order.map(id => {
      const pos = VISUAL_POSITIONS_L1[id] !== undefined ? VISUAL_POSITIONS_L1[id] : 0;

      if (id === 'voice') {
        return `
          <article class="reference-one-card hl-card-l1 hl-card-l1-voice" data-ref-category="voice" style="order: ${pos} !important;">
            <button type="button" data-voice class="hl-card-l1-btn">
              <div class="hl-card-l1-right">
                <strong class="hl-voice-title">إضافة صوتية للمصروفات</strong>
                <div class="hl-voice-wave-wrap">${getWaveHtml(16)}</div>
              </div>
              <div class="hl-card-l1-icon hl-voice-icon-box">
                <i class="fa-solid fa-microphone"></i>
              </div>
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold, 1);
      const sign = s.hasSpent ? '− ' : '';

      return `
        <article class="reference-one-card hl-card-l1" data-ref-category="${id}" data-spent="${s.hasSpent}" style="--cat-color: ${s.cat.color}; --cat-rgb: ${s.cat.rgb}; --cat-pastel-bg: ${s.cat.pastelBg}; --cat-pastel-border: ${s.cat.pastelBorder}; order: ${pos} !important;">
          <div class="hl-card-l1-inner">
            <div class="hl-card-l1-right">
              <button type="button" class="hl-cat-head-btn" data-add="${id}" data-action="quick-add" data-cat-id="${id}">
                <strong class="hl-card-l1-name">${s.cat.name}</strong>
              </button>
              <button type="button" class="hl-cat-amt-btn" data-details="${id}" data-action="view-operations" data-cat-id="${id}">
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
            <button type="button" class="hl-cat-icon-btn" data-add="${id}" data-action="quick-add" data-cat-id="${id}">
              <div class="hl-card-l1-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '12px'};">
                <i class="${s.cat.iconClass}"></i>
              </div>
            </button>
          </div>
        </article>
      `;
    }).join("");

    return `<div class="reference-one-grid hl-grid-layout-1">${cardsHtml}</div>`;
  }

  /* -------------------------------------------------------------
     Render Layout 2 (Single-column list matching Image 2)
  ------------------------------------------------------------- */
  function renderLayout2(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'food', 'bills', 'house', 'education', 'transport', 'health', 'other', 'clothes', 'voice'];

    const rowsHtml = order.map(id => {
      if (id === 'voice') {
        return `
          <article class="home-design-card hl-row-l2 hl-row-l2-voice" data-ref-category="voice">
            <button type="button" data-voice class="hl-row-l2-btn">
              <div class="hl-row-l2-right">
                <div class="hl-row-l2-icon hl-row-voice-icon">
                  <i class="fa-solid fa-microphone"></i>
                </div>
                <strong class="hl-row-voice-title">إضافة صوتية للمصروفات</strong>
              </div>
              <div class="hl-row-divider"></div>
              <div class="hl-row-l2-middle">${getWaveHtml(14)}</div>
              <div class="hl-row-l2-chevron"><i class="fa-solid fa-chevron-left"></i></div>
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold, 2);
      const sign = s.hasSpent ? '− ' : '';

      return `
        <article class="home-design-card hl-row-l2" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
          <div class="hl-row-l2-content">
            <div class="hl-row-l2-right">
              <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" class="hl-row-icon-btn">
                <div class="hl-row-l2-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};">
                  <i class="${s.cat.iconClass}"></i>
                </div>
              </button>
              <div class="hl-row-name-amt">
                <strong class="hl-row-l2-name">${s.cat.name}</strong>
                <div class="hl-amount-cluster ${s.hasSpent ? 'spent' : 'zero'}">
                  <span class="hl-amt-num" style="direction:ltr;unicode-bidi:isolate;">${sign}${s.spentStr}</span>
                  <span class="hl-amt-curr">${currSymbol}</span>
                </div>
              </div>
            </div>

            <div class="hl-row-divider"></div>

            <button type="button" data-details="${id}" data-action="view-operations" data-cat-id="${id}" class="hl-row-mid-btn">
              <div class="hl-row-rem-line">المتبقي: ${s.remValStr} ${currSymbol}</div>
              <div class="hl-row-bud-line">الميزانية: ${s.budValStr} ${currSymbol}</div>
              <div class="hl-progress-track">
                <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};"></div>
              </div>
            </button>

            <div class="hl-row-l2-badge" style="background:${s.pct >= 100 ? '#fee2e2' : '#dcfce7'};color:${s.pct >= 100 ? '#b91c1c' : '#15803d'};">
              %${s.remainingPct}
            </div>

            <button type="button" data-details="${id}" data-action="view-operations" data-cat-id="${id}" class="hl-row-chevron-btn">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
          </div>
        </article>
      `;
    }).join("");

    return `<div class="home-design-list hl-grid-layout-2">${rowsHtml}</div>`;
  }

  /* -------------------------------------------------------------
     Render Layout 3 (Top Donut Chart + Top 3 Spenders + 2-col cards)
  ------------------------------------------------------------- */
  function renderLayout3(totals, budgets, currSymbol, isGold) {
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

    const order = ['daily', 'food', 'bills', 'house', 'education', 'transport', 'health', 'clothes', 'voice', 'other'];

    const cardsHtml = order.map(id => {
      const pos = VISUAL_POSITIONS_L3[id] !== undefined ? VISUAL_POSITIONS_L3[id] : 0;

      if (id === 'voice') {
        return `
          <article class="reference-one-card hl-card-l3 hl-card-l3-voice" data-ref-category="voice" style="order: ${pos} !important;">
            <button type="button" data-voice class="hl-card-l3-btn">
              <div class="hl-card-l3-right">
                <strong class="hl-voice-title">إضافة صوتية للمصروفات</strong>
                <div class="hl-voice-wave-wrap">${getWaveHtml(14)}</div>
              </div>
              <div class="hl-card-l3-icon hl-voice-icon-box">
                <i class="fa-solid fa-microphone"></i>
              </div>
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold, 3);
      const sign = s.hasSpent ? '− ' : '';

      return `
        <article class="reference-one-card hl-card-l3" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder}; order: ${pos} !important;">
          <div class="hl-card-l3-inner">
            <div class="hl-card-l3-right">
              <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" class="hl-cat-head-btn">
                <strong class="hl-card-l3-name">${s.cat.name}</strong>
              </button>
              <button type="button" data-details="${id}" data-action="view-operations" data-cat-id="${id}" class="hl-cat-amt-btn">
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
            <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" class="hl-cat-icon-btn">
              <div class="hl-card-l3-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '12px'};">
                <i class="${s.cat.iconClass}"></i>
              </div>
            </button>
          </div>
        </article>
      `;
    }).join("");

    return `
      <div class="hl-layout-3-wrapper">
        <section class="hl-hero-analytics">
          <!-- Left: Donut Chart -->
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

          <!-- Center: Monthly Budget Summary -->
          <div class="hl-budget-summary">
            <div class="hl-budget-summary-title"><i class="fa-solid fa-bullseye"></i>الميزانية الشهرية</div>
            <div>الموازنة : <strong>${totalBudget.toLocaleString()} ${currSymbol}</strong></div>
            <div style="color:#b91c1c;">المصروف : <strong>${totalExpense.toLocaleString()} ${currSymbol}</strong></div>
            <div style="color:#15803d;">المتبقي : <strong>${remainingBudget.toLocaleString()} ${currSymbol}</strong></div>
          </div>

          <!-- Right: Top 3 Spenders -->
          <div class="hl-top3-box">
            <div class="hl-top3-title"><i class="fa-solid fa-chart-simple"></i>أعلى 3 بنود صرفاً</div>
            ${top3Html}
          </div>
        </section>

        <div class="reference-one-grid hl-grid-layout-3">${cardsHtml}</div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
     Render Layout 4 (Asymmetric Modern Cards matching Image 4)
  ------------------------------------------------------------- */
  function renderLayout4(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'food', 'bills', 'house', 'transport', 'health', 'education', 'other', 'clothes', 'voice'];

    const cardsHtml = order.map(id => {
      const pos = VISUAL_POSITIONS_L4[id] !== undefined ? VISUAL_POSITIONS_L4[id] : 0;

      if (id === 'voice') {
        return `
          <article class="home-design-card hl-card-l4 hl-card-l4-voice" data-ref-category="voice" style="order: ${pos} !important;">
            <button type="button" data-voice class="hl-card-l4-btn">
              <div class="hl-card-l4-right">
                <strong class="hl-voice-title" style="color:#ffffff;">إضافة صوتية<br>للمصروفات</strong>
                <div class="hl-voice-wave-wrap" style="margin-top:4px;">${getWaveHtml(16)}</div>
              </div>
              <div class="hl-card-l4-icon hl-voice-icon-box" style="background:rgba(255,255,255,0.25);color:#fff;border-radius:50%;">
                <i class="fa-solid fa-microphone"></i>
              </div>
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold, 4);
      const sign = s.hasSpent ? '− ' : '';

      return `
        <article class="home-design-card hl-card-l4" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder}; order: ${pos} !important;">
          <div class="hl-card-l4-inner">
            <div class="hl-card-l4-right">
              <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" class="hl-cat-head-btn">
                <strong class="hl-card-l4-name">${s.cat.name}</strong>
              </button>
              <button type="button" data-details="${id}" data-action="view-operations" data-cat-id="${id}" class="hl-cat-amt-btn">
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
            <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" class="hl-cat-icon-btn">
              <div class="hl-card-l4-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '12px'};">
                <i class="${s.cat.iconClass}"></i>
              </div>
            </button>
          </div>
        </article>
      `;
    }).join("");

    return `<div class="home-design-grid hl-grid-layout-4">${cardsHtml}</div>`;
  }

  /* -------------------------------------------------------------
     Render Layout 5 (3-column compact grid matching Image 5)
  ------------------------------------------------------------- */
  function renderLayout5(totals, budgets, currSymbol, isGold) {
    const order = [
      'bills', 'food', 'daily',
      'transport', 'education', 'house',
      'clothes', 'other', 'health',
      'voice'
    ];

    const cardsHtml = order.map(id => {
      const pos = VISUAL_POSITIONS_L5[id] !== undefined ? VISUAL_POSITIONS_L5[id] : 0;

      if (id === 'voice') {
        return `
          <article class="home-design-card hl-card-l5-voice-wide" data-ref-category="voice" style="order: ${pos} !important; grid-column: 1 / -1 !important;">
            <button type="button" data-voice class="hl-voice-wide-btn">
              <div class="hl-voice-wide-right">
                <div class="hl-voice-icon-box">
                  <i class="fa-solid fa-microphone"></i>
                </div>
                <div class="hl-voice-wide-titles">
                  <strong class="hl-voice-title">إضافة صوتية للمصروفات</strong>
                  <small class="hl-voice-subtitle">اضغط وتحدث لتسجيل المصروف بالذكاء الاصطناعي</small>
                </div>
              </div>
              <div class="hl-voice-wide-wave">
                ${getWaveHtml(18)}
              </div>
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold, 5);
      const sign = s.hasSpent ? '− ' : '';
      const catDisplayName = (id === 'other' && s.cat.altName5) ? s.cat.altName5 : s.cat.name;

      return `
        <article class="home-design-card hl-card-l5" data-ref-category="${id}" style="--cat-color: ${s.cat.color}; --cat-rgb: ${s.cat.rgb}; --cat-pastel-bg: ${s.cat.pastelBg}; --cat-pastel-border: ${s.cat.pastelBorder}; order: ${pos} !important;">
          <div class="hl-card-l5-body">
            <button type="button" class="hl-card-l5-head-btn" data-add="${id}" data-action="quick-add" data-cat-id="${id}">
              <div class="hl-card-l5-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '11px'};">
                <i class="${s.cat.iconClass}"></i>
              </div>
              <strong class="hl-card-l5-name">${catDisplayName}</strong>
            </button>

            <button type="button" class="hl-card-l5-foot-btn" data-details="${id}" data-action="view-operations" data-cat-id="${id}">
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

    return `<div class="home-design-grid hl-grid-layout-5">${cardsHtml}</div>`;
  }

  /* -------------------------------------------------------------
     Master UI Sync & Render
  ------------------------------------------------------------- */
  function updateUiForActiveLayout() {
    let originalGrid = document.getElementById('catGrid');
    let container = document.getElementById('homeInterfaces');
    const expensePage = document.getElementById('viewExpenses');

    // Self-healing: if container does not exist yet, inject it right after catGrid
    if (!container && originalGrid && originalGrid.parentNode) {
      container = document.createElement('div');
      container.id = 'homeInterfaces';
      container.hidden = true;
      originalGrid.parentNode.insertBefore(container, originalGrid.nextSibling);
    }

    // Self-healing: if btnHomeDesign does not exist yet, inject it in tools strip
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
      expensePage.classList.toggle('home-reference-one', currentLayout === 1);
      expensePage.classList.toggle('home-alternative-design', currentLayout > 0);
      expensePage.dataset.activeDesign = String(currentLayout);
    }

    document.body.classList.toggle('has-alt-home-layout', !isOriginal);

    updateDesignButtonDial();
    measureAndApplyDynamicLayout();
  }

  function render(filtered) {
    cachedFiltered = filtered;
    const container = document.getElementById('homeInterfaces');
    if (!container) return;

    if (currentLayout === 0) {
      container.hidden = true;
      updateUiForActiveLayout();
      return;
    }

    container.hidden = false;
    updateUiForActiveLayout();

    const totals = computeTotals(filtered);
    const budgets = getBudgets();
    const currSymbol = (root.state && root.state.currentCurrency) ? root.state.currentCurrency : 'ج.م';
    const isGold = (root.state && root.state.currentCurrency === 'عيار 21');

    let html = '';
    switch (currentLayout) {
      case 1:
        html = renderLayout1(totals, budgets, currSymbol, isGold);
        break;
      case 2:
        html = renderLayout2(totals, budgets, currSymbol, isGold);
        break;
      case 3:
        html = renderLayout3(totals, budgets, currSymbol, isGold);
        break;
      case 4:
        html = renderLayout4(totals, budgets, currSymbol, isGold);
        break;
      case 5:
        html = renderLayout5(totals, budgets, currSymbol, isGold);
        break;
      default:
        html = renderLayout1(totals, budgets, currSymbol, isGold);
        break;
    }

    container.innerHTML = html;
    measureAndApplyDynamicLayout();
  }

  function getLayout() {
    return currentLayout;
  }

  function setLayout(layoutId) {
    const next = Math.max(0, Math.min(5, parseInt(layoutId, 10) || 0));
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
    const next = (currentLayout + 1) % 6;
    setLayout(next);
  }

  /* -------------------------------------------------------------
     Layout Picker Modal Drawer
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
    }).join("");

    modal.innerHTML = `
      <div class="hl-picker-sheet">
        <div class="hl-picker-header">
          <h3>اختيار شكل شاشة المصروفات</h3>
          <button type="button" class="hl-picker-close" onclick="window.HomeLayouts.closePicker()">&times;</button>
        </div>
        <div class="hl-picker-list">${itemsHtml}</div>
      </div>
    `;

    requestAnimationFrame(() => modal.classList.add('is-open'));
  }

  function closePicker() {
    const modal = document.getElementById('homeLayoutPickerModal');
    if (modal) {
      modal.classList.remove('is-open');
      setTimeout(() => {
        if (modal && !modal.classList.contains('is-open')) {
          modal.remove();
        }
      }, 250);
    }
  }

  function chooseFromPicker(layoutId) {
    setLayout(layoutId);
    closePicker();
  }

  /* -------------------------------------------------------------
     Event Delegation for Safe Expense Handling
  ------------------------------------------------------------- */
  function setupEventDelegation() {
    const container = document.getElementById('homeInterfaces');
    if (!container || container.dataset.eventsBound === 'true') return;
    container.dataset.eventsBound = 'true';

    container.addEventListener('click', function (e) {
      const voiceBtn = e.target.closest('[data-voice]');
      if (voiceBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (root.VoiceAssistantEngine && typeof root.VoiceAssistantEngine.toggleListening === 'function') {
          root.VoiceAssistantEngine.toggleListening();
        } else {
          const fab = document.getElementById('btnVoiceAssistantFab');
          if (fab) {
            fab.click();
          } else if (typeof root.toggleVoiceAssistantModal === 'function') {
            root.toggleVoiceAssistantModal(true);
          } else if (typeof root.toggleVoiceAssistantDrawer === 'function') {
            root.toggleVoiceAssistantDrawer(true);
          }
        }
        return;
      }

      const addBtn = e.target.closest('[data-action="quick-add"], [data-add]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        const catId = addBtn.dataset.catId || addBtn.dataset.add;
        if (catId && typeof root.openQuickCategoryExpense === 'function') {
          root.openQuickCategoryExpense(catId);
        }
        return;
      }

      const detBtn = e.target.closest('[data-action="view-operations"], [data-details]');
      if (detBtn) {
        e.preventDefault();
        e.stopPropagation();
        const catId = detBtn.dataset.catId || detBtn.dataset.details;
        if (catId && typeof root.openCategoryDetailsModal === 'function') {
          root.openCategoryDetailsModal(catId);
        }
        return;
      }
    });
  }

  /* -------------------------------------------------------------
     Initialization & Dynamic Listeners
  ------------------------------------------------------------- */
  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null && saved !== undefined) {
        currentLayout = Math.max(0, Math.min(5, parseInt(saved, 10) || 0));
      }
    } catch (e) {}

    const btn = document.getElementById('btnHomeDesign');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        cycleLayout();
      });
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openPicker();
      });
    }

    setupEventDelegation();
    updateDesignButtonDial();

    // Responsive and dynamic layout listeners
    window.addEventListener('resize', measureAndApplyDynamicLayout, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', measureAndApplyDynamicLayout, { passive: true });
    }
    window.addEventListener('orientationchange', () => {
      setTimeout(measureAndApplyDynamicLayout, 150);
    }, { passive: true });

    const fontObserver = new MutationObserver(() => {
      measureAndApplyDynamicLayout();
    });
    fontObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-font-size', 'data-font-family', 'data-color-mode', 'data-app-theme']
    });

    if (root.state && root.state.expenses) {
      render(root.state.expenses);
    }
  }

  root.HomeLayouts = Object.freeze({
    init,
    getLayout,
    setLayout,
    cycleLayout,
    render,
    openPicker,
    closePicker,
    chooseFromPicker,
    refreshDynamicEngine: measureAndApplyDynamicLayout,
    profiles: Object.freeze({
      1: { columns: 2, rows: 5 },
      2: { columns: 1, rows: 10 },
      3: { columns: 2, rows: 5 },
      4: { columns: 2, rows: 5 },
      5: { columns: 3, rows: 4 }
    })
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
