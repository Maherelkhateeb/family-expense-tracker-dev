/**
 * Cloud Firestore & Family Expense Tracker
 * Home Screen Alternative Layouts Engine (v6.0.0 - 10-Layout Suite)
 *
 * Implements 10 distinct, responsive, and production-ready layouts:
 * - Layout 0: الشكل الأساسي (الأصلي) - Default catGrid in index.html
 * - Layout 1: الشكل 1: قائمة أفقية تفصيلية - Horizontal detail list with budget & spent bars
 * - Layout 2: الشكل 2: لوحة تحليلات وإحصاءات - Central donut chart + Top 3 + 2-column cards
 * - Layout 3: الشكل 3: بطاقات حديثة غير متماثلة - Modern cards with hero flow
 * - Layout 4: الشكل 4: شبكة مصغرة مدمجة (3x3) - Clean 3x3 pastel grid of 9 categories
 * - Layout 5: الشكل 5: قمرة القيادة المدارية - The Radial Orbit Cockpit
 * - Layout 6: الشكل 6: خلايا النحل السداسية - The Hexagonal Honeycomb Hive
 * - Layout 7: الشكل 7: حساسات القياس الرقمية - HUD Compact Sensor Tiles
 * - Layout 8: الشكل 8: الكريستال الماسي البلوري - The Diamond Facet Crystal Grid
 * - Layout 9: الشكل 9: مدرج التردد المالي والأعمدة الطيفية - The Financial Spectrum Equalizer
 *
 * Engine Architecture:
 * - 10-Segment SVG Dial switcher icon with 5 internal diameters
 * - Dynamic viewport measurement (availableH, visualViewport, zero-scroll guarantee)
 * - Single source of truth for expenses via openQuickCategoryExpense(catId)
 * - Permanent side flaps (Gold & Summary handles)
 * - Floating microphone FAB clearance at bottom-left (bottom: 74px; left: 14px)
 */

(function (root) {
  'use strict';

  const STORAGE_KEY = 'family_expense_home_design_v2';

  // 9 Core Categories with rich palette, pastel background & borders
  const CATEGORIES = {
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
      pastelBorder: '#f472b6',
      iconBg: 'linear-gradient(135deg, #ec4899, #db2777)',
      iconColor: '#ffffff',
      iconClass: 'fa-solid fa-shirt',
      iconShape: 'rounded'
    }
  };

  // Official Metadata for the 10 Layouts
  const LAYOUT_META = [
    { id: 0, name: 'الشكل الأساسي (الأصلي)', desc: 'شبكة كروت المصروفات التسعة الكلاسيكية الافتراضية (catGrid)', icon: 'fa-table-cells-large' },
    { id: 1, name: 'الشكل 1: قائمة أفقية تفصيلية', desc: 'شريط مالي ممتد لكل بند مع تفاصيل المتبقي والميزانية ونسبة الصرف', icon: 'fa-bars' },
    { id: 2, name: 'الشكل 2: لوحة تحليلات وإحصاءات', desc: 'مخطط كعكي دائري مع أعلى 3 بنود صرفاً وبطاقات متوازية', icon: 'fa-chart-pie' },
    { id: 3, name: 'الشكل 3: بطاقات حديثة غير متماثلة', desc: 'بطاقة رئيسية لمصروف اليوم والطعام مع تصميم عصري', icon: 'fa-layer-group' },
    { id: 4, name: 'الشكل 4: شبكة مصغرة مدمجة (3x3)', desc: 'شبكة ثلاثية الأعمدة مدمجة بألوان باستيل هادئة', icon: 'fa-grip' },
    { id: 5, name: 'الشكل 5: قمرة القيادة المدارية', desc: 'مدار كبسولات حلقي متزن حول إجمالي المصروفات ومتبقي الميزانية', icon: 'fa-compass' },
    { id: 6, name: 'الشكل 6: خلايا النحل السداسية', desc: 'مصفوفة سداسية نيونية هندسية مترابطة مع أطر توهج ومؤشرات ميكرو', icon: 'fa-cube' },
    { id: 7, name: 'الشكل 7: حساسات القياس الرقمية (HUD)', desc: 'لوحة عدادات عالية الكثافة بلمبات LED حية ومؤشرات سقف مالي', icon: 'fa-table-cells' },
    { id: 8, name: 'الشكل 8: الكريستال الماسي البلوري', desc: 'معينات ماسية مائلة 45° بتصميم بلوري زجاجي مشع ومحتوى داخلي معتدل', icon: 'fa-gem' },
    { id: 9, name: 'الشكل 9: مدرج التردد المالي والأعمدة الطيفية', desc: 'أعمدة طيفية رأسية نابضة ترتفع بنسب الصرف مع مبالغ نيونية طافية', icon: 'fa-chart-simple' }
  ];

  let currentLayout = 1;
  let cachedFiltered = null;

  function formatMoney(amt) {
    const n = Number(amt) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* -------------------------------------------------------------
     Dynamic Layout & Viewport Fitting Engine (v6.0.0)
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

    const vv = window.visualViewport;
    const viewportW = (vv ? vv.width : window.innerWidth) || document.documentElement.clientWidth || 390;
    const viewportH = (vv ? vv.height : window.innerHeight) || document.documentElement.clientHeight || 800;

    const navRect = bottomNav ? bottomNav.getBoundingClientRect() : null;
    const bottomLimit = (navRect && navRect.top > 200) ? navRect.top : (viewportH - 64);

    const viewExpenses = document.getElementById('viewExpenses');
    const scrollY = (viewExpenses ? viewExpenses.scrollTop : 0) || window.scrollY || 0;

    let containerTop = 0;
    if (container && container.offsetParent !== null) {
      containerTop = container.getBoundingClientRect().top + scrollY;
    }

    if (containerTop <= 40) {
      const hH = header ? header.offsetHeight : 52;
      const pH = period ? period.offsetHeight : 44;
      const bH = balance ? balance.offsetHeight : 84;
      const tH = tools ? tools.offsetHeight : 42;
      containerTop = hH + pH + bH + tH + 12;
    }

    const availableH = Math.max(270, Math.floor(bottomLimit - containerTop - 10));

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

    let iconSize = Math.round(36 * widthScale);
    iconSize = Math.max(28, Math.min(38, iconSize));
    container.style.setProperty('--dynamic-home-icon-size', `${iconSize}px`);

    let cardH = 78;
    let gap = 6;

    switch (currentLayout) {
      case 1: { // 1 column, 9 rows
        gap = viewportH < 720 ? 3 : 4;
        cardH = Math.floor((availableH - (8 * gap) - 10) / 9);
        cardH = Math.max(40, Math.min(52, cardH));
        break;
      }
      case 2: { // Analytics Hero + 2 columns, 5 rows
        gap = viewportH < 720 ? 4 : 5;
        const heroH = Math.max(86, Math.min(104, Math.floor(availableH * 0.23)));
        const remainingForGrid = availableH - heroH - 6 - 10;
        cardH = Math.floor((remainingForGrid - (4 * gap)) / 5);
        cardH = Math.max(56, Math.min(74, cardH));
        container.style.setProperty('--dynamic-home-hero-height', `${heroH}px`);
        break;
      }
      case 3: { // 2 columns, 5 rows
        gap = viewportH < 720 ? 5 : 7;
        cardH = Math.floor((availableH - (4 * gap) - 10) / 5);
        cardH = Math.max(62, Math.min(86, cardH));
        break;
      }
      case 4: { // 3x3 grid of 9 categories
        gap = viewportH < 720 ? 5 : 6;
        cardH = Math.floor((availableH - (2 * gap) - 10) / 3);
        cardH = Math.max(82, Math.min(108, cardH));
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
     SVG 10-Segment Dial with 5 Internal Diameters (36° per sector)
  ------------------------------------------------------------- */
  function getDialSvgMarkup(activeSector) {
    const cx = 19;
    const cy = 19;
    const r = 17.5;
    const count = LAYOUT_META.length; // 10 قطاعات متساوية
    const stepDeg = 360 / count;      // 36 درجة
    const startOffsetDeg = -90;       // الساعة 12

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

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
      const fill = isActive ? '#8b5cf6' : 'rgba(124, 58, 237, 0.12)';
      const opacity = isActive ? '0.96' : '0.35';
      return `<path class="hl-dial-slice ${isActive ? 'is-active' : ''}" data-sector="${i}" d="${d}" fill="${fill}" fill-opacity="${opacity}" stroke="#7c3aed" stroke-width="0.7" />`;
    }).join('');

    // 5 خطوط أقطار كاملة ممتدة من الحافة للحافة
    const lines = Array.from({ length: 5 }, (_, i) => {
      const angle1 = startOffsetDeg + (i * stepDeg);
      const angle2 = angle1 + 180;
      const p1 = polarToCartesian(cx, cy, r, angle1);
      const p2 = polarToCartesian(cx, cy, r, angle2);
      return `<line x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" stroke="#c084fc" stroke-width="1.1" stroke-linecap="round" opacity="0.75"/>`;
    }).join('');

    return `
      <svg class="home-dial-icon" viewBox="0 0 38 38" width="38" height="38" aria-hidden="true" style="overflow:visible; display:block; width:100%; height:100%;">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#7c3aed" stroke-width="1.6" class="hl-dial-track"/>
        ${paths}
        ${lines}
        <circle cx="${cx}" cy="${cy}" r="3.2" fill="#8b5cf6" stroke="#0f172a" stroke-width="1.2" class="hl-dial-center"/>
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

  /* =========================================================================
     الشكل 1: قائمة أفقية تفصيلية (Horizontal Detail List)
     ========================================================================= */
  function renderLayout1List(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'food', 'bills', 'house', 'education', 'transport', 'health', 'other', 'clothes'];

    const rowsHtml = order.map(id => {
      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '− ' : '';

      return `
        <article class="home-design-card hl-row-l2" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
          <div class="hl-row-l2-content">
            <div class="hl-row-l2-right">
              <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-row-icon-btn">
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

            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-row-mid-btn">
              <div class="hl-row-rem-line">المتبقي: ${s.remValStr} ${currSymbol}</div>
              <div class="hl-row-bud-line">الميزانية: ${s.budValStr} ${currSymbol}</div>
              <div class="hl-progress-track">
                <div class="hl-progress-fill" style="width:${Math.min(s.pct, 100)}%;background:${s.statusColor};"></div>
              </div>
            </button>

            <div class="hl-row-l2-badge" style="background:${s.pct >= 100 ? '#fee2e2' : '#dcfce7'};color:${s.pct >= 100 ? '#b91c1c' : '#15803d'};">
              %${s.remainingPct}
            </div>

            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-row-chevron-btn">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
          </div>
        </article>
      `;
    }).join("");

    return `<div class="home-design-list hl-grid-layout-2">${rowsHtml}</div>`;
  }

  /* =========================================================================
     الشكل 2: لوحة تحليلات وإحصاءات (Donut Chart + Top 3 + 2-col cards)
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

    const order = ['daily', 'food', 'bills', 'house', 'education', 'transport', 'health', 'clothes', 'other'];

    const cardsHtml = order.map(id => {
      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '− ' : '';

      return `
        <article class="reference-one-card hl-card-l3" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
          <div class="hl-card-l3-inner">
            <div class="hl-card-l3-right">
              <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-head-btn">
                <strong class="hl-card-l3-name">${s.cat.name}</strong>
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
    }).join("");

    return `
      <div class="hl-layout-3-wrapper">
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

        <div class="reference-one-grid hl-grid-layout-3">${cardsHtml}</div>
      </div>
    `;
  }

  /* =========================================================================
     الشكل 3: بطاقات حديثة غير متماثلة (Modern Asymmetric Cards)
     ========================================================================= */
  function renderLayout3Asymmetric(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'food', 'bills', 'house', 'transport', 'health', 'education', 'other', 'clothes'];

    const cardsHtml = order.map(id => {
      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '− ' : '';

      return `
        <article class="home-design-card hl-card-l4" data-ref-category="${id}" style="--cat-color:${s.cat.color}; --cat-rgb:${s.cat.rgb}; --cat-pastel-bg:${s.cat.pastelBg}; --cat-pastel-border:${s.cat.pastelBorder};">
          <div class="hl-card-l4-inner">
            <div class="hl-card-l4-right">
              <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-cat-head-btn">
                <strong class="hl-card-l4-name">${s.cat.name}</strong>
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

  /* =========================================================================
     الشكل 4: شبكة مصغرة مدمجة 3×3 (Compact 3x3 Grid)
     ========================================================================= */
  function renderLayout4CompactGrid(totals, budgets, currSymbol, isGold) {
    const order = [
      'bills', 'food', 'daily',
      'transport', 'education', 'house',
      'clothes', 'other', 'health'
    ];

    const cardsHtml = order.map(id => {
      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '− ' : '';
      const catDisplayName = (id === 'other' && s.cat.altName) ? s.cat.altName : s.cat.name;

      return `
        <article class="home-design-card hl-card-l5" data-ref-category="${id}" style="--cat-color: ${s.cat.color}; --cat-rgb: ${s.cat.rgb}; --cat-pastel-bg: ${s.cat.pastelBg}; --cat-pastel-border: ${s.cat.pastelBorder};">
          <div class="hl-card-l5-body">
            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-card-l5-head-btn">
              <div class="hl-card-l5-icon" style="background:${s.cat.iconBg};color:${s.cat.iconColor};border-radius:${s.cat.iconShape === 'circle' ? '50%' : '11px'};">
                <i class="${s.cat.iconClass}"></i>
              </div>
              <strong class="hl-card-l5-name">${catDisplayName}</strong>
            </button>

            <button type="button" data-action="quick-add" data-cat-id="${id}" class="hl-card-l5-foot-btn">
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

  /* =========================================================================
     الشكل 5: قمرة القيادة المدارية (The Radial Orbit Cockpit)
     ========================================================================= */
  function renderLayout5RadialCockpit(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'bills', 'transport', 'clothes', 'health', 'education', 'daily', 'house', 'other'];
    const radius = 126;
    const centerX = 195;
    const centerY = 168;

    let totalSpentAll = 0;
    catKeys.forEach(k => { totalSpentAll += (totals[k] || 0); });
    const remainingBudget = Math.max(0, 15400 - totalSpentAll);

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

    return `
      <div class="radial-arena hl-l5-arena" style="flex:1; position:relative; width:100%; height:350px; margin:0 auto; overflow:hidden;">
        <div style="position:absolute; top:${centerY - radius}px; left:${centerX - radius}px; width:${radius * 2}px; height:${radius * 2}px; border-radius:50%; border:1.5px dashed rgba(56, 189, 248, 0.28); pointer-events:none;"></div>
        
        <div class="central-hub hl-l5-hub" style="position:absolute; top:${centerY - 60}px; left:${centerX - 60}px; width:120px; height:120px; border-radius:50%; background:radial-gradient(circle, rgba(15,23,42,0.98), rgba(30,58,138,0.55)); border:2.5px solid rgba(56, 189, 248, 0.7); box-shadow:0 0 28px rgba(56, 189, 248, 0.35); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:10;">
          <span style="font-size:0.62rem; font-weight:800; color:#38bdf8; background:rgba(56, 189, 248, 0.15); padding:1px 6px; border-radius:10px;">إجمالي المصروفات</span>
          <span style="font-size:1.05rem; font-weight:900; color:#f87171; direction:ltr;">-${formatMoney(totalSpentAll)}</span>
          <span style="font-size:0.56rem; color:#94a3b8; font-weight:700;">المتبقي بالميزانية</span>
          <span style="font-size:0.65rem; font-weight:900; color:#34d399; direction:ltr;">+${formatMoney(remainingBudget)}</span>
        </div>

        ${satellitesHtml}
      </div>
    `;
  }

  /* =========================================================================
     الشكل 6: خلايا النحل السداسية (The Hexagonal Honeycomb Hive)
     ========================================================================= */
  function renderLayout6Honeycomb(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'daily', 'bills', 'transport', 'house', 'health', 'clothes', 'education', 'other'];
    const positions = [
      [14, 10], [138, 10], [262, 10],
      [14, 116], [138, 116], [262, 116],
      [14, 222], [138, 222], [262, 222]
    ];

    const cellsHtml = catKeys.map((catId, idx) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#10b981', iconClass: 'fa-solid fa-cube' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 25;
      const [px, py] = positions[idx];

      return `
        <div class="hex-hive-card hl-l6-card" data-action="quick-add" data-cat-id="${catId}" style="position:absolute; left:${px}px; top:${py}px; width:114px; height:102px; cursor:pointer;">
          <svg class="hex-svg" viewBox="0 0 116 104" style="position:absolute; width:100%; height:100%;">
            <polygon points="58,3 113,27 113,77 58,101 3,77 3,27" fill="rgba(15,23,42,0.92)" stroke="${cat.color}" stroke-width="1.8" style="filter: drop-shadow(0 2px 8px ${cat.color}55);" />
          </svg>
          <div style="position:relative; z-index:2; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:4px; gap:2px;">
            <div style="color:${cat.color}; font-size:1.15rem; margin-top:-2px;"><i class="${cat.iconClass}"></i></div>
            <span style="font-size:0.70rem; font-weight:800; color:#f1f5f9; white-space:nowrap; max-width:88px; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
            <span style="font-size:0.74rem; font-weight:900; color:#f43f5e; direction:ltr;">-${formatMoney(spent)}</span>
            <div style="width:32px; height:3px; background:rgba(255,255,255,0.15); border-radius:2px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:${cat.color}; border-radius:2px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="honeycomb-board hl-l6-board" style="flex:1; position:relative; width:100%; height:340px; margin:0 auto;">${cellsHtml}</div>`;
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
        <div class="sensor-tile hl-l7-tile" data-action="quick-add" data-cat-id="${catId}" style="background:linear-gradient(160deg, rgba(24, 34, 53, 0.85) 0%, rgba(13, 22, 38, 0.95) 100%); border:1.3px solid rgba(255, 255, 255, 0.12); border-radius:14px; padding:6px 6px 7px; display:flex; flex-direction:column; align-items:center; text-align:center; position:relative; cursor:pointer; min-height:92px;">
          <div style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:0 2px 2px;">
            <span style="font-size:0.60rem; font-weight:900; color:#94a3b8;">${pct}%</span>
            <span style="width:6px; height:6px; border-radius:50%; background:${ledColor}; box-shadow:0 0 6px ${ledColor};"></span>
          </div>
          <div style="width:30px; height:30px; border-radius:50%; border:1.2px solid ${cat.color}; color:${cat.color}; display:flex; align-items:center; justify-content:center; font-size:0.92rem; margin:1px 0 2px;">
            <i class="${cat.iconClass}"></i>
          </div>
          <span style="font-size:0.68rem; font-weight:850; color:#f8fafc; white-space:nowrap; max-width:95%; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
          <span style="font-size:0.72rem; font-weight:900; color:#f43f5e; direction:ltr; margin-top:1px;">-${formatMoney(spent)}</span>
          <div style="width:36px; height:3px; background:rgba(255,255,255,0.12); border-radius:2px; overflow:hidden; margin-top:3px;">
            <div style="width:${pct}%; height:100%; background:${cat.color}; border-radius:2px;"></div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="sensor-arena hl-l7-arena" style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:4px 6px 8px;">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; width:100%;">${tilesHtml}</div>
      </div>
    `;
  }

  /* =========================================================================
     الشكل 8: الكريستال الماسي البلوري (The Diamond Facet Crystal Grid)
     ========================================================================= */
  function renderLayout8Diamonds(totals, budgets, currSymbol, isGold) {
    const catKeys = ['food', 'daily', 'bills', 'transport', 'house', 'health', 'clothes', 'education', 'other'];
    const positions = [
      [14, 15], [138, 15], [262, 15],
      [14, 126], [138, 126], [262, 126],
      [14, 237], [138, 237], [262, 237]
    ];

    const diamondsHtml = catKeys.map((catId, idx) => {
      const cat = CATEGORIES[catId] || { name: catId, color: '#ec4899', iconClass: 'fa-solid fa-gem' };
      const spent = totals[catId] || 0;
      const budget = budgets[catId] || 1500;
      const pct = Math.min(100, Math.round((spent / budget) * 100)) || 35;
      const [px, py] = positions[idx];

      return `
        <div class="diamond-wrapper hl-l8-item" data-action="quick-add" data-cat-id="${catId}" style="position:absolute; left:${px}px; top:${py}px; width:114px; height:102px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          <div style="width:78px; height:78px; background:linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%); border:1.8px solid ${cat.color}; border-radius:18px; transform:rotate(45deg); box-shadow:0 6px 18px rgba(0,0,0,0.45), 0 0 12px ${cat.color}55; display:flex; align-items:center; justify-content:center;">
            <div style="transform:rotate(-45deg); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; width:95px; gap:1px;">
              <div style="color:${cat.color}; font-size:1.10rem;"><i class="${cat.iconClass}"></i></div>
              <span style="font-size:0.66rem; font-weight:800; color:#f1f5f9; white-space:nowrap; max-width:88px; overflow:hidden; text-overflow:ellipsis;">${cat.name}</span>
              <span style="font-size:0.70rem; font-weight:900; color:#f43f5e; direction:ltr;">-${formatMoney(spent)}</span>
              <span style="font-size:0.56rem; font-weight:900; color:${cat.color}; background:${cat.color}25; border-radius:8px; padding:0 4px;">${pct}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="diamond-arena hl-l8-arena" style="flex:1; position:relative; width:100%; height:350px; margin:0 auto;">${diamondsHtml}</div>`;
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
      const barHeight = Math.max(20, Math.min(115, Math.round(pct * 1.15)));

      return `
        <div class="eq-column hl-l9-col" data-action="quick-add" data-cat-id="${catId}" style="display:flex; flex-direction:column; align-items:center; gap:3px; width:38px; cursor:pointer;">
          <span style="font-size:0.60rem; font-weight:900; color:#f43f5e; direction:ltr; white-space:nowrap;">-${Math.round(spent)}</span>
          <div style="width:14px; height:120px; background:rgba(30, 41, 59, 0.6); border-radius:8px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
            <div style="width:100%; height:${barHeight}px; border-radius:8px 8px 0 0; background:linear-gradient(180deg, ${cat.color} 0%, ${cat.color}44 100%); box-shadow:0 0 10px ${cat.color}88; position:relative;">
              <div style="position:absolute; top:0; left:0; right:0; height:3px; border-radius:8px 8px 0 0; background:#fff; box-shadow:0 0 6px #fff;"></div>
            </div>
          </div>
          <div style="width:26px; height:26px; border-radius:8px; background:rgba(15, 23, 42, 0.9); border:1.2px solid ${cat.color}; color:${cat.color}; display:flex; align-items:center; justify-content:center; font-size:0.85rem;">
            <i class="${cat.iconClass}"></i>
          </div>
          <span style="font-size:0.62rem; font-weight:800; color:#cbd5e1; white-space:nowrap; text-align:center;">${cat.name.split(' ')[0]}</span>
          <span style="font-size:0.58rem; font-weight:900; color:${cat.color};">${pct}%</span>
        </div>
      `;
    }).join('');

    return `
      <div class="equalizer-arena hl-l9-arena" style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:4px 4px 10px; gap:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(30, 41, 59, 0.5); border:1px solid rgba(255, 255, 255, 0.08); border-radius:12px; padding:5px 10px;">
          <span style="font-size:0.75rem; font-weight:800; color:#38bdf8; display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-chart-simple"></i> مدرج التردد المالي</span>
          <span style="font-size:0.68rem; color:#94a3b8;">انقر أي عمود للإدخال</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; height:225px; background:linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%); border:1px solid rgba(56, 189, 248, 0.15); border-radius:16px; padding:10px 4px 6px;">
          ${columnsHtml}
        </div>
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
    }).join("");

    modal.innerHTML = `
      <div class="hl-picker-sheet">
        <div class="hl-picker-header">
          <h3>اختيار شكل شاشة المصروفات (10 أشكال)</h3>
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
     Event Delegation: Clean category expense registration
  ------------------------------------------------------------- */
  function setupEventDelegation() {
    const container = document.getElementById('homeInterfaces');
    if (!container || container.dataset.eventsBound === 'true') return;
    container.dataset.eventsBound = 'true';

    container.addEventListener('click', function (e) {
      const addBtn = e.target.closest('[data-action="quick-add"], [data-cat-id]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        const catId = addBtn.dataset.catId || addBtn.dataset.add;
        if (catId && typeof root.openQuickCategoryExpense === 'function') {
          root.openQuickCategoryExpense(catId);
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
        currentLayout = Math.max(0, Math.min(LAYOUT_META.length - 1, parseInt(saved, 10) || 0));
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
    meta: Object.freeze(LAYOUT_META)
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
