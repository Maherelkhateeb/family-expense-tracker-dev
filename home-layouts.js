/**
 * Cloud Firestore & Family Expense Tracker
 * Home Screen Alternative Layouts Engine (v5.5.0)
 *
 * Implements 5 alternative layouts + original Monefy layout:
 * - Layout 1: 2-column cards with left icon badge, right name, amount & progress
 * - Layout 2: Single-column horizontal list cards with progress & % pill
 * - Layout 3: Top Donut chart + Top 3 spenders + 2-column cards below
 * - Layout 4: Asymmetric Hero cards (Daily & Food) + 2-column cards
 * - Layout 5: 3-column compact grid (3x3 + centered clothes) with exact pastel styling
 *
 * Features:
 * - 6-Segment dial switcher icon with 3 internal diameters (أقطار داخلية)
 * - Currency switcher moved to far left
 * - Dynamic layout engine measuring screen height and adjusting card heights
 * - Dynamic font scaler reacting to Settings data-font-size
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
     Dynamic Layout & Font Scaling Engine
  ------------------------------------------------------------- */
  function measureAndApplyDynamicLayout() {
    const appBody = document.getElementById('appScrollBody');
    const header = document.querySelector('.app-header');
    const tools = document.querySelector('.executive-quick-tools-strip');
    const bottomNav = document.querySelector('.app-bottom-nav') || document.querySelector('.bottom-dock-nav');
    const container = document.getElementById('homeInterfaces');
    if (!container) return;

    const viewportH = window.innerHeight || 800;
    const headerH = header ? header.offsetHeight : 54;
    const toolsH = tools ? tools.offsetHeight : 44;
    const navH = bottomNav ? bottomNav.offsetHeight : 64;

    const availableH = Math.max(340, viewportH - headerH - toolsH - navH - 80);

    let cardH = 88;
    let gap = 8;

    switch (currentLayout) {
      case 1:
        cardH = Math.floor((availableH - (4 * gap)) / 5);
        cardH = Math.max(68, Math.min(100, cardH));
        break;
      case 2:
        gap = 5;
        cardH = Math.floor((availableH - (9 * gap)) / 10);
        cardH = Math.max(42, Math.min(62, cardH));
        break;
      case 3:
        const heroH = 150;
        const remainingH = availableH - heroH - 12;
        cardH = Math.floor((remainingH - (4 * gap)) / 5);
        cardH = Math.max(64, Math.min(94, cardH));
        break;
      case 4:
        cardH = Math.floor((availableH - (4 * gap)) / 5.2);
        cardH = Math.max(68, Math.min(105, cardH));
        break;
      case 5:
        gap = 6;
        const voiceBannerH = 52;
        const gridCategoryH = availableH - voiceBannerH - (3 * gap);
        cardH = Math.floor(gridCategoryH / 3);
        cardH = Math.max(82, Math.min(115, cardH));
        container.style.setProperty('--dynamic-home-voice-height', `${voiceBannerH}px`);
        break;
      default:
        cardH = 84;
        break;
    }

    container.style.setProperty('--dynamic-home-card-height', `${cardH}px`);
    container.style.setProperty('--dynamic-home-gap', `${gap}px`);

    const docEl = document.documentElement;
    const fontMode = docEl.getAttribute('data-font-size') || localStorage.getItem('family_expense_font_size') || 'medium';
    const fontScales = {
      micro: 0.82,
      small: 0.90,
      medium: 1.00,
      large: 1.12,
      xlarge: 1.24,
      huge: 1.36
    };
    const scale = fontScales[fontMode] || 1.00;
    container.style.setProperty('--dynamic-home-font-scale', String(scale));

    const fontFamily = docEl.getAttribute('data-font-family') || localStorage.getItem('family_expense_font_family') || 'inherit';
    if (fontFamily && fontFamily !== 'inherit') {
      container.style.setProperty('--dynamic-home-font-family', fontFamily);
    }
  }

  /* -------------------------------------------------------------
     SVG 6-Segment Dial Icon with 3 Internal Diameters (أقطار داخلية)
  ------------------------------------------------------------- */
      function getDialSvgMarkup(activeSector) {
    const cx = 19;
    const cy = 19;
    const r = 17.5;
    const count = 6;
    const stepDeg = 360 / count; // 60 deg each
    const startOffsetDeg = -90; // Start at top 12 o'clock

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    // 6 Sector Paths
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

      const isActive = (i === activeSector);
      // Active sector is vivid purple; inactive sectors are soft translucent
      const fill = isActive ? '#8b5cf6' : 'rgba(124, 58, 237, 0.12)';
      const opacity = isActive ? '0.96' : '0.45';
      return `<path class="hl-dial-slice ${isActive ? 'is-active' : ''}" data-sector="${i}" d="${d}" fill="${fill}" fill-opacity="${opacity}" stroke="#7c3aed" stroke-width="0.8" />`;
    }).join("");

    // 3 full internal diameters passing through center (19, 19) from rim to rim (أقطار داخلية)
    return `
      <svg class="home-dial-icon" viewBox="0 0 38 38" width="38" height="38" aria-hidden="true" style="overflow:visible; display:block; width:100%; height:100%;">
        <circle cx="19" cy="19" r="17.5" fill="#f8fafc" stroke="#7c3aed" stroke-width="1.8" class="hl-dial-track" />
        ${paths}
        <line class="hl-dial-diameter" x1="19.00" y1="1.50" x2="19.00" y2="36.50" stroke="#7c3aed" stroke-width="1.4" stroke-linecap="round" />
        <line class="hl-dial-diameter" x1="34.16" y1="10.25" x2="3.84" y2="27.75" stroke="#7c3aed" stroke-width="1.4" stroke-linecap="round" />
        <line class="hl-dial-diameter" x1="34.16" y1="27.75" x2="3.84" y2="10.25" stroke="#7c3aed" stroke-width="1.4" stroke-linecap="round" />
        <circle cx="19" cy="19" r="2.8" class="hl-dial-center" fill="#7c3aed" />
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

  /* -------------------------------------------------------------
     Render Layout 1 (2-column cards matching Image 1)
  ------------------------------------------------------------- */
  function renderLayout1(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'bills', 'food', 'house', 'transport', 'education', 'other', 'health', 'voice', 'clothes'];

    const cardsHtml = order.map(id => {
      const pos = VISUAL_POSITIONS_L1[id] !== undefined ? VISUAL_POSITIONS_L1[id] : 0;

      if (id === 'voice') {
        return `
          <article class="reference-one-card hl-card-l1 hl-card-l1-voice" data-ref-category="voice" style="order: ${pos} !important;">
            <button type="button" data-voice class="hl-card-l1-btn" style="border:none;background:none;width:100%;height:100%;cursor:pointer;padding:8px 10px;color:inherit;font:inherit;display:flex;flex-direction:row-reverse;align-items:center;justify-content:space-between;">
              <div class="hl-card-l1-right" style="flex:1;min-width:0;text-align:right;">
                <strong class="hl-voice-title" style="display:block;color:#7c3aed;font-weight:900;line-height:1.2;font-size:calc(0.84rem * var(--dynamic-home-font-scale, 1.0));">إضافة صوتية للمصروفات</strong>
                <div style="margin-top:6px;width:100%;max-width:110px;">${getWaveHtml(16)}</div>
              </div>
              <div class="hl-card-l1-icon" style="background:linear-gradient(135deg, #a855f7, #7c3aed);color:#fff;border-radius:12px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;box-shadow:0 3px 8px rgba(124,58,237,0.3);">
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
          <div class="hl-card-l1-inner" style="display:flex;flex-direction:row-reverse;align-items:center;justify-content:space-between;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;">
            <div class="hl-card-l1-right" style="flex:1;min-width:0;text-align:right;">
              <button type="button" class="hl-cat-head-btn" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;width:100%;text-align:right;">
                <strong class="hl-card-l1-name" style="display:block;font-weight:800;font-size:calc(0.86rem * var(--dynamic-home-font-scale, 1.0));line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.cat.name}</strong>
              </button>
              <button type="button" class="hl-cat-amt-btn" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;width:100%;text-align:right;margin-top:2px;">
                <span class="hl-amount ${s.hasSpent ? 'spent' : 'zero'}" style="font-weight:800;font-size:calc(0.88rem * var(--dynamic-home-font-scale, 1.0));">
                  ${sign ? `<span class="spent-minus">${sign}</span>` : ''}<bdi class="amt-num">${s.spentStr}</bdi> <span class="curr-lbl">${currSymbol}</span>
                </span>
                <div class="hl-progress-track" style="height:3px;background:rgba(0,0,0,0.06);border-radius:2px;margin:3px 0;width:100%;">
                  <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};height:100%;border-radius:2px;"></div>
                </div>
                <small class="hl-budget-info" style="display:block;color:${s.statusColor};font-size:calc(0.64rem * var(--dynamic-home-font-scale, 1.0));font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.budgetText}</small>
              </button>
            </div>
            <button type="button" class="hl-cat-icon-btn" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;flex-shrink:0;margin-inline-start:8px;">
              <div class="hl-card-l1-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '12px'};width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;box-shadow:0 3px 8px rgba(0,0,0,0.12);">
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
            <button type="button" data-voice style="border:none;background:none;width:100%;cursor:pointer;padding:6px 12px;color:inherit;font:inherit;display:flex;align-items:center;justify-content:space-between;">
              <div class="hl-row-l2-right" style="display:flex;align-items:center;gap:10px;">
                <div class="hl-row-l2-icon" style="background:linear-gradient(135deg, #a855f7, #7c3aed);color:#fff;border-radius:12px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">
                  <i class="fa-solid fa-microphone"></i>
                </div>
                <strong style="font-weight:900;color:#7c3aed;font-size:calc(0.88rem * var(--dynamic-home-font-scale, 1.0));">إضافة صوتية للمصروفات</strong>
              </div>
              <div style="height:24px;width:1px;background:rgba(0,0,0,0.12);margin:0 8px;"></div>
              <div class="hl-row-l2-middle" style="flex:1;max-width:140px;">${getWaveHtml(14)}</div>
              <div class="hl-row-l2-chevron" style="color:#a855f7;font-size:0.85rem;"><i class="fa-solid fa-chevron-left"></i></div>
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold, 2);
      const sign = s.hasSpent ? '− ' : '';

      return `
        <article class="home-design-card hl-row-l2" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
          <div class="hl-row-l2-content" style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:6px 10px;box-sizing:border-box;">
            <div class="hl-row-l2-right" style="display:flex;align-items:center;gap:8px;flex:1.2;min-width:0;">
              <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;flex-shrink:0;">
                <div class="hl-row-l2-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:11px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
                  <i class="${s.cat.iconClass}"></i>
                </div>
              </button>
              <div style="min-width:0;">
                <strong class="hl-row-l2-name" style="display:block;font-weight:800;font-size:calc(0.85rem * var(--dynamic-home-font-scale, 1.0));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.cat.name}</strong>
                <span class="hl-amount ${s.hasSpent ? 'spent' : 'zero'}" style="font-weight:800;font-size:calc(0.86rem * var(--dynamic-home-font-scale, 1.0));">
                  ${sign ? `<span class="spent-minus">${sign}</span>` : ''}<bdi class="amt-num">${s.spentStr}</bdi> <span class="curr-lbl">${currSymbol}</span>
                </span>
              </div>
            </div>

            <div style="height:26px;width:1px;background:rgba(0,0,0,0.1);margin:0 8px;flex-shrink:0;"></div>

            <button type="button" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;flex:1.4;text-align:right;min-width:0;">
              <div style="font-size:calc(0.68rem * var(--dynamic-home-font-scale, 1.0));font-weight:700;color:#334155;">المتبقي: ${s.remValStr} ${currSymbol}</div>
              <div style="font-size:calc(0.64rem * var(--dynamic-home-font-scale, 1.0));color:#64748b;">الميزانية: ${s.budValStr} ${currSymbol}</div>
              <div class="hl-progress-track" style="height:3px;background:rgba(0,0,0,0.06);border-radius:2px;margin-top:2px;width:100%;">
                <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};height:100%;border-radius:2px;"></div>
              </div>
            </button>

            <div class="hl-row-l2-badge" style="background:${s.pct >= 100 ? '#fee2e2' : '#dcfce7'};color:${s.pct >= 100 ? '#b91c1c' : '#15803d'};border-radius:10px;padding:2px 7px;font-weight:800;font-size:calc(0.70rem * var(--dynamic-home-font-scale, 1.0));margin:0 6px;flex-shrink:0;">
              %${s.remainingPct}
            </div>

            <button type="button" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;color:#94a3b8;font-size:0.8rem;flex-shrink:0;">
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
        <div class="hl-top3-item" style="display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:calc(0.70rem * var(--dynamic-home-font-scale, 1.0));margin-bottom:3px;">
          <div style="display:flex;align-items:center;gap:4px;min-width:0;">
            <i class="${item.cat.iconClass}" style="color:${item.cat.color};font-size:0.8rem;"></i>
            <span style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.cat.name}</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;flex:1;max-width:80px;">
            <div style="flex:1;height:5px;background:rgba(0,0,0,0.06);border-radius:3px;overflow:hidden;">
              <div style="width:${pct}%;background:${item.cat.color};height:100%;border-radius:3px;"></div>
            </div>
            <strong style="color:${item.cat.color};font-size:0.68rem;">%${pct}</strong>
          </div>
        </div>
      `;
    }).join('') : '<div style="color:#94a3b8;font-size:0.75rem;text-align:center;">لا توجد مصروفات مسجلة بعد</div>';

    const order = ['daily', 'food', 'bills', 'house', 'education', 'transport', 'health', 'clothes', 'voice', 'other'];

    const cardsHtml = order.map(id => {
      const pos = VISUAL_POSITIONS_L3[id] !== undefined ? VISUAL_POSITIONS_L3[id] : 0;

      if (id === 'voice') {
        return `
          <article class="reference-one-card hl-card-l3 hl-card-l3-voice" data-ref-category="voice" style="order: ${pos} !important;">
            <button type="button" data-voice style="border:none;background:none;width:100%;height:100%;cursor:pointer;padding:8px 10px;color:inherit;font:inherit;display:flex;flex-direction:row-reverse;align-items:center;justify-content:space-between;">
              <div style="flex:1;text-align:right;">
                <strong style="display:block;color:#7c3aed;font-weight:900;font-size:calc(0.84rem * var(--dynamic-home-font-scale, 1.0));line-height:1.2;">إضافة صوتية للمصروفات</strong>
                <div style="margin-top:6px;width:100%;max-width:110px;">${getWaveHtml(14)}</div>
              </div>
              <div style="background:linear-gradient(135deg, #a855f7, #7c3aed);color:#fff;border-radius:12px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
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
          <div style="display:flex;flex-direction:row-reverse;align-items:center;justify-content:space-between;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;">
            <div style="flex:1;min-width:0;text-align:right;">
              <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;width:100%;text-align:right;">
                <strong style="display:block;font-weight:800;font-size:calc(0.86rem * var(--dynamic-home-font-scale, 1.0));line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.cat.name}</strong>
              </button>
              <button type="button" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;width:100%;text-align:right;margin-top:2px;">
                <span class="hl-amount ${s.hasSpent ? 'spent' : 'zero'}" style="font-weight:800;font-size:calc(0.88rem * var(--dynamic-home-font-scale, 1.0));">
                  ${sign ? `<span class="spent-minus">${sign}</span>` : ''}<bdi class="amt-num">${s.spentStr}</bdi> <span class="curr-lbl">${currSymbol}</span>
                </span>
                <div class="hl-progress-track" style="height:3px;background:rgba(0,0,0,0.06);border-radius:2px;margin:3px 0;width:100%;">
                  <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};height:100%;border-radius:2px;"></div>
                </div>
                <small style="display:block;color:${s.statusColor};font-size:calc(0.64rem * var(--dynamic-home-font-scale, 1.0));font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.budgetText}</small>
              </button>
            </div>
            <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;flex-shrink:0;margin-inline-start:8px;">
              <div style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '12px'};width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;box-shadow:0 3px 8px rgba(0,0,0,0.1);">
                <i class="${s.cat.iconClass}"></i>
              </div>
            </button>
          </div>
        </article>
      `;
    }).join("");

    return `
      <div class="hl-layout-3-wrapper">
        <section class="hl-hero-analytics" style="background:#ffffff;border:1.5px solid #e2e8f0;border-radius:18px;padding:12px 14px;margin-bottom:10px;box-shadow:0 3px 12px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <!-- Left: Donut Chart -->
          <div class="hl-donut-box" style="display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;width:86px;height:86px;flex-shrink:0;">
            <svg viewBox="0 0 36 36" style="width:100%;height:100%;transform:rotate(-90deg);">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" stroke-width="4"></circle>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#0284c7" stroke-width="4" stroke-dasharray="${overallPct}, 100" stroke-linecap="round"></circle>
            </svg>
            <div style="position:absolute;text-align:center;line-height:1.1;">
              <strong style="font-size:0.95rem;font-weight:900;color:#0f172a;">%${overallPct}</strong>
              <small style="display:block;font-size:0.56rem;color:#64748b;">من الموازنة</small>
            </div>
          </div>

          <!-- Center: Monthly Budget Summary -->
          <div class="hl-budget-summary" style="flex:1;text-align:right;font-size:calc(0.72rem * var(--dynamic-home-font-scale, 1.0));line-height:1.45;padding:0 6px;border-inline:1px solid #f1f5f9;">
            <div style="font-weight:800;color:#0f172a;margin-bottom:2px;"><i class="fa-solid fa-bullseye" style="color:#a855f7;margin-inline-end:4px;"></i>الميزانية الشهرية</div>
            <div>الموازنة : <strong>${totalBudget.toLocaleString()} ${currSymbol}</strong></div>
            <div style="color:#b91c1c;">المصروف : <strong>${totalExpense.toLocaleString()} ${currSymbol}</strong></div>
            <div style="color:#15803d;">المتبقي : <strong>${remainingBudget.toLocaleString()} ${currSymbol}</strong></div>
          </div>

          <!-- Right: Top 3 Spenders -->
          <div class="hl-top3-box" style="flex:1.2;min-width:0;text-align:right;">
            <div style="font-weight:800;font-size:calc(0.72rem * var(--dynamic-home-font-scale, 1.0));color:#0f172a;margin-bottom:4px;">
              <i class="fa-solid fa-chart-simple" style="color:#0284c7;margin-inline-end:4px;"></i>أعلى 3 بنود صرفاً
            </div>
            ${top3Html}
          </div>
        </section>

        <div class="reference-one-grid hl-grid-layout-3">${cardsHtml}</div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
     Render Layout 4 (Asymmetric Hero Cards + 2-col cards)
  ------------------------------------------------------------- */
  function renderLayout4(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'food', 'bills', 'house', 'transport', 'health', 'education', 'other', 'clothes', 'voice'];

    const cardsHtml = order.map(id => {
      const pos = VISUAL_POSITIONS_L4[id] !== undefined ? VISUAL_POSITIONS_L4[id] : 0;

      if (id === 'voice') {
        return `
          <article class="home-design-card hl-card-l4 hl-card-l4-voice" data-ref-category="voice" style="order: ${pos} !important; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%) !important; border: 1.5px solid #c084fc !important; color: #ffffff !important; box-shadow: 0 4px 14px rgba(124,58,237,0.3) !important;">
            <button type="button" data-voice style="border:none;background:none;width:100%;height:100%;cursor:pointer;padding:10px;color:inherit;font:inherit;display:flex;flex-direction:row-reverse;align-items:center;justify-content:space-between;">
              <div style="flex:1;text-align:right;">
                <strong style="display:block;color:#ffffff;font-weight:900;font-size:calc(0.86rem * var(--dynamic-home-font-scale, 1.0));line-height:1.2;">إضافة صوتية<br>للمصروفات</strong>
                <div style="margin-top:6px;width:100%;max-width:110px;">${getWaveHtml(16)}</div>
              </div>
              <div style="background:rgba(255,255,255,0.25);color:#fff;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;box-shadow:0 0 10px rgba(255,255,255,0.4);">
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
          <div style="display:flex;flex-direction:row-reverse;align-items:center;justify-content:space-between;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;">
            <div style="flex:1;min-width:0;text-align:right;">
              <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;width:100%;text-align:right;">
                <strong style="display:block;font-weight:800;font-size:calc(0.86rem * var(--dynamic-home-font-scale, 1.0));line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.cat.name}</strong>
              </button>
              <button type="button" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;width:100%;text-align:right;margin-top:2px;">
                <span class="hl-amount ${s.hasSpent ? 'spent' : 'zero'}" style="font-weight:800;font-size:calc(0.88rem * var(--dynamic-home-font-scale, 1.0));">
                  ${sign ? `<span class="spent-minus">${sign}</span>` : ''}<bdi class="amt-num">${s.spentStr}</bdi> <span class="curr-lbl">${currSymbol}</span>
                </span>
                <div class="hl-progress-track" style="height:3px;background:rgba(0,0,0,0.06);border-radius:2px;margin:3px 0;width:100%;">
                  <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};height:100%;border-radius:2px;"></div>
                </div>
                <small style="display:block;color:${s.statusColor};font-size:calc(0.64rem * var(--dynamic-home-font-scale, 1.0));font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.budgetText}</small>
              </button>
            </div>
            <button type="button" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;flex-shrink:0;margin-inline-start:8px;">
              <div style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '12px'};width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;box-shadow:0 3px 8px rgba(0,0,0,0.1);">
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
            <button type="button" data-voice class="hl-voice-wide-btn" style="border:none;background:none;width:100%;height:100%;cursor:pointer;padding:8px 12px;color:inherit;font:inherit;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;">
              <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                <div class="hl-voice-icon-box" style="background:linear-gradient(135deg, #a855f7, #7c3aed);color:#fff;border-radius:12px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:1.15rem;box-shadow:0 3px 8px rgba(124, 58, 237, 0.25);flex-shrink:0;">
                  <i class="fa-solid fa-microphone"></i>
                </div>
                <div style="text-align:right;min-width:0;">
                  <strong class="hl-voice-title" style="display:block;font-weight:900;font-size:calc(0.86rem * var(--dynamic-home-font-scale, 1.0));color:#7c3aed;line-height:1.2;white-space:nowrap;">إضافة صوتية للمصروفات</strong>
                  <small class="hl-voice-subtitle" style="display:block;font-size:calc(0.68rem * var(--dynamic-home-font-scale, 1.0));color:#9333ea;font-weight:700;margin-top:2px;white-space:nowrap;">اضغط وتحدث لتسجيل المصروف بالذكاء الاصطناعي</small>
                </div>
              </div>
              <div style="flex-shrink:0;margin-inline-start:8px;">
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
          <button type="button" class="hl-card-l5-top" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;text-align:center;padding:6px 4px 2px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;">
            <div class="hl-card-l5-icon" style="background: ${s.cat.iconBg}; color: ${s.cat.iconColor}; border-radius: ${s.cat.iconShape === 'circle' ? '50%' : '12px'}; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);">
              <i class="${s.cat.iconClass}"></i>
            </div>
            <strong class="hl-card-l5-name" style="font-weight: 800; font-size: calc(0.78rem * var(--dynamic-home-font-scale, 1.0)); margin-top: 3px; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${catDisplayName}</strong>
          </button>
          <button type="button" class="hl-card-l5-bottom" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;text-align:center;padding:2px 4px 6px;box-sizing:border-box;border-top:1px solid rgba(0,0,0,0.08);">
            <span class="hl-amount ${s.hasSpent ? 'spent' : 'zero'}" style="font-size: calc(0.84rem * var(--dynamic-home-font-scale, 1.0)); font-weight: 800;">
              ${sign ? `<span class="spent-minus">${sign}</span>` : ''}
              <bdi class="amt-num">${s.spentStr}</bdi>
              <span class="curr-lbl">${currSymbol}</span>
            </span>
            <div class="hl-progress-track" style="height: 2.5px; background: rgba(0,0,0,0.06); border-radius: 2px; margin: 3px 0 2px; width: 100%;">
              <div class="hl-progress-fill" style="width: ${Math.min(s.pct, 100)}%; background: ${s.statusColor}; height: 100%; border-radius: 2px;"></div>
            </div>
            <small class="hl-budget-info" style="color: ${s.statusColor}; font-size: calc(0.62rem * var(--dynamic-home-font-scale, 1.0)); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${s.budgetText}</small>
          </button>
        </article>
      `;
    }).join('');

    return `<div class="home-design-grid hl-grid-layout-5">${cardsHtml}</div>`;
  }

  /* -------------------------------------------------------------
     Master UI Sync & Render
  ------------------------------------------------------------- */
  function updateUiForActiveLayout() {
    const originalGrid = document.getElementById('catGrid');
    const container = document.getElementById('homeInterfaces');
    const expensePage = document.getElementById('viewExpenses');

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
        if (typeof root.toggleVoiceAssistantModal === 'function') {
          root.toggleVoiceAssistantModal(true);
        } else if (typeof root.toggleVoiceAssistantDrawer === 'function') {
          root.toggleVoiceAssistantDrawer(true);
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
     Initialization
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

    window.addEventListener('resize', measureAndApplyDynamicLayout, { passive: true });

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
