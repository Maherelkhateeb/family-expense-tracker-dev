/**
 * ============================================================================
 * Home Screen Layouts Engine - Production JavaScript (v5.4.17)
 * High-performance, clean, modular layout engine for Family Expense Tracker.
 * Supports 5 distinct alternative layouts + original layout (6 layouts total).
 * ============================================================================
 */
(function (root) {
  'use strict';

  const STORAGE_KEY = 'family_monefy_expense_home_layout';

  const CATEGORIES = {
    daily: { id: 'daily', name: 'مصروف يومي', emoji: '☕', icon: 'fa-mug-hot', color: '#f59e0b', rgb: '245, 158, 11' },
    food: { id: 'food', name: 'طعام ومشتريات', emoji: '🛒', icon: 'fa-cart-shopping', color: '#10b981', rgb: '16, 185, 129' },
    bills: { id: 'bills', name: 'فواتير والتزامات', emoji: '⚡', icon: 'fa-bolt-lightning', color: '#f97316', rgb: '249, 115, 22' },
    house: { id: 'house', name: 'مستلزمات منزل', emoji: '🛋️', icon: 'fa-couch', color: '#8b5cf6', rgb: '139, 92, 246' },
    education: { id: 'education', name: 'تعليم ودروس', emoji: '📚', icon: 'fa-book-open-reader', color: '#3b82f6', rgb: '59, 130, 246' },
    transport: { id: 'transport', name: 'مواصلات وبنزين', emoji: '🚗', icon: 'fa-car', color: '#0284c7', rgb: '2, 132, 199' },
    health: { id: 'health', name: 'صحة وعلاج', emoji: '💊', icon: 'fa-capsules', color: '#ef4444', rgb: '239, 68, 68' },
    other: { id: 'other', name: 'أخرى ومشتريات', emoji: '🎁', icon: 'fa-gift', color: '#14b8a6', rgb: '20, 184, 166' },
    clothes: { id: 'clothes', name: 'ملابس وأحذية', emoji: '👔', icon: 'fa-shirt', color: '#ec4899', rgb: '236, 72, 153' }
  };

  const LAYOUT_META = [
    { id: 0, name: 'الشكل الأصلي', desc: 'الشبكة الكلاسيكية الافتراضية', icon: 'fa-table-cells-large' },
    { id: 1, name: 'الشكل 1: بطاقات ناعمة', desc: 'عمودين بتدرجات هادئة وأيقونات واضحة', icon: 'fa-border-all' },
    { id: 2, name: 'الشكل 2: قائمة ممتدة', desc: 'صفوف أفقية كاملة العرض لسهولة القراءة', icon: 'fa-list-ul' },
    { id: 3, name: 'الشكل 3: لوحة المؤشرات', desc: 'أعلى 3 بنود ومخطط الميزانية الدائري', icon: 'fa-chart-pie' },
    { id: 4, name: 'الشكل 4: بطاقات عصرية', desc: 'أيقونات ثلاثية الأبعاد بأسلوب حديث', icon: 'fa-shapes' },
    { id: 5, name: 'الشكل 5: شبكة مدمجة', desc: '3 أعمدة مدمجة لعرض كل البنود بدون تمرير', icon: 'fa-grip' }
  ];

  const DESIGN_FONTS = {
    1: "'Tajawal', sans-serif",
    2: "'Cairo', sans-serif",
    3: "'Almarai', sans-serif",
    4: "'IBM Plex Sans Arabic', sans-serif",
    5: "'Readex Pro', sans-serif"
  };

  const FONT_MAP = {
    tajawal: "'Tajawal', sans-serif",
    cairo: "'Cairo', sans-serif",
    almarai: "'Almarai', sans-serif",
    ibm: "'IBM Plex Sans Arabic', sans-serif",
    readex: "'Readex Pro', sans-serif",
    noto: "'Noto Kufi Arabic', sans-serif"
  };

  const FONT_SIZE_SCALES = {
    micro: 0.80, small: 0.90, medium: 1.0, large: 1.12, xlarge: 1.24, huge: 1.36
  };

  const SPRITE_ART = {
    daily: [0, 0], bills: [25, 0], food: [50, 0], house: [75, 0], transport: [100, 0],
    education: [0, 100], other: [25, 100], health: [50, 100], voice: [75, 100], clothes: [100, 100]
  };

  const VISUAL_POSITIONS_L1 = {
    daily: 0, bills: 1,
    food: 2, house: 3,
    transport: 4, education: 5,
    other: 6, health: 7,
    voice: 8, clothes: 9
  };

  let currentLayout = 0;
  let cachedFiltered = null;

  function init() {
    try {
      const urlParam = new URLSearchParams(root.location.search).get('homeLayout');
      if (urlParam === 'reference-1' || urlParam === '1') {
        currentLayout = 1;
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          currentLayout = Math.max(0, Math.min(5, parseInt(saved, 10) || 0));
        }
      }
    } catch (e) {
      currentLayout = 0;
    }

    ensureDomElements();
    updateUiForActiveLayout();

    // Listen to theme or font attribute changes on documentElement
    const observer = new MutationObserver(() => {
      const container = document.getElementById('homeInterfaces');
      if (container && currentLayout > 0) {
        updateTypographyStyles(container, currentLayout);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-font-size', 'data-font-family', 'data-app-theme', 'class']
    });
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
      root.showToast(`تم التبديل إلى: ${meta.name}`, 'info', 2500);
    }
  }

  function cycleLayout() {
    setLayout((currentLayout + 1) % 6);
  }

  function ensureDomElements() {
    const originalGrid = document.getElementById('catGrid');
    if (!originalGrid) return;

    let container = document.getElementById('homeInterfaces');
    if (!container) {
      container = document.createElement('section');
      container.id = 'homeInterfaces';
      originalGrid.after(container);
      container.addEventListener('click', handleContainerClick);
    }

    const goldBtn = document.getElementById('btnOpenGold');
    if (goldBtn && !document.getElementById('btnHomeDesign')) {
      const btn = document.createElement('button');
      btn.id = 'btnHomeDesign';
      btn.type = 'button';
      btn.className = 'tool-pill-action design-pill';
      btn.title = 'تغيير شكل الشاشة الرئيسية للمصروفات';
      btn.setAttribute('aria-label', 'اختيار تصميم شاشة المصروفات');
      btn.innerHTML = '<i class="fa-solid fa-table-cells-large"></i><span>الأشكال</span>';
      btn.onclick = cycleLayout;

      let pressTimer = null;
      btn.addEventListener('touchstart', () => {
        pressTimer = setTimeout(() => {
          openPicker();
          pressTimer = null;
        }, 600);
      }, { passive: true });
      btn.addEventListener('touchend', () => {
        if (pressTimer) clearTimeout(pressTimer);
      });
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openPicker();
      });

      goldBtn.before(btn);
    }

    reconcileQuickToolsOrder();
  }

  function reconcileQuickToolsOrder() {
    const gold = document.getElementById('btnOpenGold');
    if (!gold || !gold.parentElement) return;
    const parent = gold.parentElement;
    const desired = ['btnHomeDesign', 'btnOpenGold', 'walletSelectCluster', 'btnToggleCurrency', 'btnOpenSummaryQuick'];
    desired.forEach((id, index) => {
      const el = document.getElementById(id);
      if (el && el.parentElement === parent) {
        el.style.setProperty('order', String(index), 'important');
      }
    });
  }

  function updateTypographyStyles(container, design) {
    if (!container || design === 0) return;
    const fontChoice = document.documentElement.getAttribute('data-font-family') || 'tajawal';
    const sizeChoice = document.documentElement.getAttribute('data-font-size') || 'medium';
    const scale = FONT_SIZE_SCALES[sizeChoice] || 1.0;
    const family = fontChoice !== 'tajawal'
      ? (FONT_MAP[fontChoice] || document.documentElement.style.getPropertyValue('--font-family') || 'sans-serif')
      : (DESIGN_FONTS[design] || 'sans-serif');

    const min = Math.ceil((design === 1 ? 68 : 76) + Math.max(0, scale - 1) * 60);

    container.style.setProperty('--dynamic-home-font-family', family);
    container.style.setProperty('--dynamic-home-font-scale', String(scale));
    container.style.setProperty('--dynamic-home-content-min', min + 'px');
    container.dataset.dynamicHomeMeasured = 'true';
  }

  function updateUiForActiveLayout() {
    const originalGrid = document.getElementById('catGrid');
    const container = document.getElementById('homeInterfaces');
    const switcher = document.getElementById('btnHomeDesign');
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
      updateTypographyStyles(container, currentLayout);
    }

    if (expensePage) {
      expensePage.classList.toggle('home-reference-one', currentLayout === 1);
      expensePage.classList.toggle('home-alternative-design', currentLayout > 1);
    }

    document.body.classList.toggle('has-alt-home-layout', !isOriginal);

    if (switcher) {
      const meta = LAYOUT_META[currentLayout];
      switcher.title = `${meta.name} — اضغط للتبديل`;
      switcher.setAttribute('aria-label', `تغيير شكل الشاشة، ${meta.name}`);
      const icon = switcher.querySelector('i');
      if (icon) {
        icon.className = `fa-solid ${meta.icon}`;
      }
    }
  }

  function handleContainerClick(e) {
    const button = e.target.closest('button, [data-action]');
    if (!button) return;

    if (button.hasAttribute('data-voice') || button.getAttribute('data-action') === 'voice-action') {
      if (root.VoiceAssistantEngine && typeof root.VoiceAssistantEngine.toggleListening === 'function') {
        root.VoiceAssistantEngine.toggleListening();
      }
      return;
    }

    const addCat = button.dataset.add || (button.getAttribute('data-action') === 'quick-add' ? button.getAttribute('data-cat-id') : null);
    if (addCat) {
      if (typeof root.openQuickCategoryExpense === 'function') {
        root.openQuickCategoryExpense(addCat);
      }
      return;
    }

    const detailsCat = button.dataset.details || (button.getAttribute('data-action') === 'view-operations' ? button.getAttribute('data-cat-id') : null);
    if (detailsCat) {
      const cat = CATEGORIES[detailsCat];
      if (typeof root.openOperationsFiltered === 'function') {
        root.openOperationsFiltered({
          category: detailsCat,
          categoryName: cat ? cat.name : detailsCat,
          type: 'expense'
        });
      }
    }
  }

  function getWaveHtml(count = 18) {
    const bars = [];
    for (let i = 0; i < count; i++) {
      bars.push('<span class="hl-wave-bar"></span>');
    }
    return `<div class="hl-wave-container reference-one-wave" aria-hidden="true">${bars.join('')}</div>`;
  }

  function computeTotals(filtered) {
    const totals = {};
    (filtered || []).forEach(t => {
      if (t.type === 'expense' && t.category !== 'transfer') {
        let c = t.category;
        if (c === 'shopping' || c === 'supermarket') c = 'food';
        if (c === 'kids' || c === 'gifts' || c === 'entertainment' || c === 'others') c = 'other';
        totals[c] = (totals[c] || 0) + (Number(t.amount) || 0);
      }
    });
    return totals;
  }

  function formatMoney(amount, isGold) {
    const converted = typeof root.convertAmount === 'function' ? root.convertAmount(amount) : amount;
    return (converted || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: isGold ? 3 : 2
    });
  }

  function getCategoryStats(catId, totals, budgets, currSymbol, isGold) {
    const cat = CATEGORIES[catId] || { name: catId, color: '#38bdf8', rgb: '56, 189, 248', emoji: '📦' };
    const spent = totals[catId] || 0;
    const ceiling = budgets[catId] || 0;
    const remaining = ceiling - spent;
    const isOver = remaining < 0;

    const spentStr = formatMoney(spent, isGold);
    const hasSpent = spent > 0;

    let pct = 0;
    let remainingPct = 100;
    let budgetText = 'لم تُحدَّد موازنة';
    let statusColor = '#10b981';
    let pillClass = 'ok';

    if (ceiling > 0) {
      pct = Math.round((spent / ceiling) * 100);
      if (isOver) {
        remainingPct = Math.round((Math.abs(remaining) / ceiling) * 100);
        statusColor = '#ef4444';
        pillClass = 'over';
        const remStr = formatMoney(Math.abs(remaining), isGold);
        budgetText = `تجاوز: ${remainingPct}% • -${remStr} ${currSymbol}`;
      } else {
        remainingPct = Math.max(0, 100 - pct);
        statusColor = pct < 70 ? '#10b981' : (pct <= 90 ? '#f59e0b' : '#ef4444');
        pillClass = pct < 70 ? 'ok' : (pct <= 90 ? 'warn' : 'over');
        const remStr = formatMoney(remaining, isGold);
        budgetText = `متبقي: ${remainingPct}% • ${remStr} ${currSymbol}`;
      }
    }

    return {
      cat,
      spent,
      spentStr,
      hasSpent,
      ceiling,
      remaining,
      isOver,
      pct,
      remainingPct,
      budgetText,
      statusColor,
      pillClass
    };
  }

  // ==========================================================================
  // Layout 1: 2-Column Pastel Cards (Matches Image 1)
  // ==========================================================================
  function renderLayout1(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'food', 'bills', 'house', 'education', 'transport', 'health', 'other', 'voice', 'clothes'];

    const cardsHtml = order.map(id => {
      const art = SPRITE_ART[id] || [0, 0];
      const pos = VISUAL_POSITIONS_L1[id] !== undefined ? VISUAL_POSITIONS_L1[id] : 0;

      if (id === 'voice') {
        return `
          <article class="reference-one-card hl-card-l1 hl-card-l1-voice" data-ref-category="voice" style="order: ${pos} !important;">
            <button type="button" data-voice class="hl-voice-btn" style="border:none;background:none;width:100%;cursor:pointer;padding:0;color:inherit;font:inherit;">
              <i class="reference-one-icon hl-card-l1-icon" aria-hidden="true" style="--icon-x: ${art[0]}%; --icon-y: ${art[1]}%; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-style: normal;">
                <i class="fa-solid fa-microphone"></i>
              </i>
              <strong class="hl-voice-title" style="display:block;margin-top:4px;">إضافة صوتية<br>للمصروفات</strong>
              ${getWaveHtml(16)}
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '−' : '';

      return `
        <article class="reference-one-card hl-card-l1" data-ref-category="${id}" data-spent="${s.hasSpent}" style="--cat-color: ${s.cat.color}; --cat-rgb: ${s.cat.rgb}; order: ${pos} !important;">
          <button type="button" class="reference-one-add hl-card-l1-top" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;text-align:right;">
            <i class="reference-one-icon hl-card-l1-icon" aria-hidden="true" style="--icon-x: ${art[0]}%; --icon-y: ${art[1]}%; background: linear-gradient(135deg, ${s.cat.color}25, ${s.cat.color}10); color: ${s.cat.color}; font-style: normal;">
              <span>${s.cat.emoji}</span>
            </i>
            <strong class="hl-card-l1-name">${s.cat.name}</strong>
          </button>
          <button type="button" class="reference-one-details hl-card-l1-bottom" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;" aria-label="عرض عمليات ${s.cat.name}">
            <span class="reference-one-amount hl-amount ${s.hasSpent ? 'spent' : 'zero'}" dir="rtl">
              ${sign ? `<span class="spent-minus">${sign}</span>` : ''}
              <bdi class="amt-num" dir="ltr">${s.spentStr}</bdi>
              <span class="curr-lbl">${currSymbol}</span>
            </span>
            <div class="hl-progress-track">
              <div class="hl-progress-fill" style="width: ${Math.min(s.pct, 100)}%; background: ${s.statusColor};"></div>
            </div>
            <small class="hl-budget-info" style="color: ${s.statusColor};">${s.budgetText}</small>
          </button>
        </article>
      `;
    }).join('');

    return `<div class="reference-one-grid hl-grid-layout-1">${cardsHtml}</div>`;
  }

  // ==========================================================================
  // Layout 2: Full-Width List (Matches Image 2)
  // ==========================================================================
  function renderLayout2(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'food', 'bills', 'house', 'education', 'transport', 'health', 'other', 'clothes', 'voice'];

    const rowsHtml = order.map(id => {
      if (id === 'voice') {
        return `
          <article class="home-design-card hl-row-l2 hl-row-l2-voice" data-ref-category="voice">
            <button type="button" data-voice style="border:none;background:none;width:100%;cursor:pointer;padding:0;color:inherit;font:inherit;display:flex;align-items:center;justify-content:space-between;">
              <div class="hl-row-l2-right">
                <div class="home-design-icon hl-row-l2-icon" style="background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff;">
                  <i class="fa-solid fa-microphone"></i>
                </div>
                <strong class="hl-voice-title">إضافة صوتية للمصروفات</strong>
              </div>
              <div style="flex: 1; padding: 0 10px;">${getWaveHtml(22)}</div>
              <div class="hl-row-l2-chevron"><i class="fa-solid fa-chevron-left"></i></div>
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '−' : '';
      const remValStr = formatMoney(Math.abs(s.remaining), isGold);
      const ceilStr = formatMoney(s.ceiling, isGold);

      return `
        <article class="home-design-card hl-row-l2" data-ref-category="${id}" style="--cat-rgb: ${s.cat.rgb};">
          <button type="button" class="home-design-head hl-row-l2-right" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;font:inherit;color:inherit;text-align:right;">
            <div class="home-design-icon hl-row-l2-icon" style="background: linear-gradient(135deg, ${s.cat.color}22, ${s.cat.color}10); color: ${s.cat.color};">
              <span>${s.cat.emoji}</span>
            </div>
            <strong class="hl-row-l2-name">${s.cat.name}</strong>
          </button>

          <button type="button" class="home-design-value hl-row-l2-amount-wrap" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;font:inherit;color:inherit;">
            <span class="hl-amount ${s.hasSpent ? 'spent' : 'zero'}" style="font-size: 0.95rem;">
              ${sign ? `<span class="spent-minus">${sign}</span>` : ''}
              <bdi class="amt-num">${s.spentStr}</bdi>
              <span class="curr-lbl">${currSymbol}</span>
            </span>
          </button>

          <div class="hl-row-l2-divider"></div>

          <div class="hl-row-l2-budget-wrap" data-details="${id}" data-action="view-operations" data-cat-id="${id}">
            <div class="hl-row-l2-budget-text">${s.isOver ? 'تجاوز:' : 'المتبقي:'} ${remValStr} ${currSymbol}</div>
            <div class="hl-row-l2-budget-text">الميزانية: ${s.ceiling > 0 ? ceilStr + ' ' + currSymbol : 'غير محددة'}</div>
            <div class="hl-progress-track" style="height: 3px; margin: 2px 0 0;">
              <div class="hl-progress-fill" style="width: ${Math.min(s.pct, 100)}%; background: ${s.statusColor};"></div>
            </div>
          </div>

          <div class="hl-row-l2-left" data-details="${id}" data-action="view-operations" data-cat-id="${id}">
            <div class="hl-row-l2-pill ${s.pillClass}">%${s.remainingPct}</div>
            <div class="hl-row-l2-chevron"><i class="fa-solid fa-chevron-left"></i></div>
          </div>
        </article>
      `;
    }).join('');

    return `<div class="home-design-grid hl-list-layout-2">${rowsHtml}</div>`;
  }

  // ==========================================================================
  // Layout 3: Dashboard Grid with Mini-Charts (Matches Image 3)
  // ==========================================================================
  function renderLayout3(totals, budgets, currSymbol, isGold) {
    const spentCategories = Object.keys(CATEGORIES).map(id => ({
      id,
      spent: totals[id] || 0,
      cat: CATEGORIES[id]
    })).filter(item => item.spent > 0).sort((a, b) => b.spent - a.spent);

    const totalExpense = spentCategories.reduce((sum, item) => sum + item.spent, 0);

    const top3 = spentCategories.slice(0, 3);
    const top3Html = top3.length > 0 ? top3.map(item => {
      const pct = totalExpense > 0 ? Math.round((item.spent / totalExpense) * 100) : 0;
      return `
        <div class="hl-top3-item">
          <span class="hl-top3-pct">%${pct}</span>
          <div class="hl-top3-bar-wrap">
            <div class="hl-top3-bar-fill" style="width: ${pct}%; background: ${item.cat.color};"></div>
          </div>
          <div class="hl-top3-label">
            <span>${item.cat.name}</span>
            <span>${item.cat.emoji}</span>
          </div>
        </div>
      `;
    }).join('') : '<div style="font-size:0.7rem; color:#94a3b8; text-align:center; padding:10px 0;">لا توجد مصروفات مسجلة بعد</div>';

    let totalBudget = 0;
    Object.keys(budgets).forEach(id => { totalBudget += (budgets[id] || 0); });
    const overallPct = totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;
    const remainingBudget = totalBudget - totalExpense;

    const circumference = 138.2;
    const strokeDash = (overallPct / 100) * circumference;

    const miniDashHtml = `
      <div class="hl-mini-dash-wrap">
        <div class="hl-dash-card">
          <div class="hl-dash-card-header">
            <span>أعلى 3 بنود صرفاً</span>
            <i class="fa-solid fa-chart-simple" style="color: #38bdf8;"></i>
          </div>
          <div class="hl-top3-list">${top3Html}</div>
        </div>

        <div class="hl-dash-card">
          <div class="hl-dash-card-header">
            <span>الميزانية الشهرية</span>
            <i class="fa-solid fa-bullseye" style="color: #a855f7;"></i>
          </div>
          <div class="hl-donut-body">
            <div class="hl-donut-chart-wrap">
              <svg class="hl-donut-svg" viewBox="0 0 54 54">
                <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(148, 163, 184, 0.2)" stroke-width="5" />
                <circle cx="27" cy="27" r="22" fill="none" stroke="${overallPct > 90 ? '#ef4444' : (overallPct > 70 ? '#f59e0b' : '#10b981')}" stroke-width="5"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${circumference - strokeDash}" stroke-linecap="round" />
              </svg>
              <div class="hl-donut-center-text">
                <span class="hl-donut-pct">%${overallPct}</span>
                <span class="hl-donut-sub">من الموازنة</span>
              </div>
            </div>
            <div class="hl-donut-stats">
              <div class="hl-donut-stat-row">
                <span>الموازنة :</span>
                <span>${formatMoney(totalBudget, isGold)}</span>
              </div>
              <div class="hl-donut-stat-row">
                <span>المصروف :</span>
                <span style="color: ${totalExpense > 0 ? '#b91c1c' : 'inherit'};">${formatMoney(totalExpense, isGold)}</span>
              </div>
              <div class="hl-donut-stat-row">
                <span>المتبقي :</span>
                <span style="color: ${remainingBudget < 0 ? '#ef4444' : '#10b981'};">${formatMoney(Math.abs(remainingBudget), isGold)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const order = ['daily', 'food', 'bills', 'house', 'education', 'transport', 'health', 'other', 'clothes', 'voice'];

    const cardsHtml = order.map(id => {
      if (id === 'voice') {
        return `
          <article class="home-design-card hl-card-l1 hl-card-l1-voice" data-ref-category="voice">
            <button type="button" data-voice style="border:none;background:none;width:100%;cursor:pointer;padding:0;color:inherit;font:inherit;">
              <div class="home-design-icon hl-card-l1-icon" style="background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; margin: 0 auto;">
                <i class="fa-solid fa-microphone"></i>
              </div>
              <strong class="hl-voice-title" style="display:block;margin-top:4px;">إضافة صوتية<br>للمصروفات</strong>
              ${getWaveHtml(16)}
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '−' : '';

      return `
        <article class="home-design-card hl-card-l1" data-ref-category="${id}" style="--cat-color: ${s.cat.color}; --cat-rgb: ${s.cat.rgb};">
          <button type="button" class="home-design-head hl-card-l1-top" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;text-align:right;">
            <div class="home-design-icon hl-card-l1-icon" style="background: linear-gradient(135deg, ${s.cat.color}25, ${s.cat.color}10); color: ${s.cat.color};">
              <span>${s.cat.emoji}</span>
            </div>
            <strong class="hl-card-l1-name">${s.cat.name}</strong>
          </button>
          <button type="button" class="home-design-value hl-card-l1-bottom" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;">
            <span class="hl-amount ${s.hasSpent ? 'spent' : 'zero'}">
              ${sign ? `<span class="spent-minus">${sign}</span>` : ''}
              <bdi class="amt-num">${s.spentStr}</bdi>
              <span class="curr-lbl">${currSymbol}</span>
            </span>
            <div class="hl-progress-track">
              <div class="hl-progress-fill" style="width: ${Math.min(s.pct, 100)}%; background: ${s.statusColor};"></div>
            </div>
            <small class="hl-budget-info" style="color: ${s.statusColor};">${s.budgetText}</small>
          </button>
        </article>
      `;
    }).join('');

    return `
      <div class="hl-dashboard-l3">
        ${miniDashHtml}
        <div class="home-design-grid hl-grid-layout-1">${cardsHtml}</div>
      </div>
    `;
  }

  // ==========================================================================
  // Layout 4: Modern Illustrated 3D Cards (Matches Image 4)
  // ==========================================================================
  function renderLayout4(totals, budgets, currSymbol, isGold) {
    const order = ['daily', 'food', 'bills', 'house', 'transport', 'health', 'education', 'other', 'clothes', 'voice'];

    const cardsHtml = order.map(id => {
      if (id === 'voice') {
        return `
          <article class="home-design-card hl-card-l4 hl-card-l4-voice" data-ref-category="voice">
            <button type="button" data-voice style="border:none;background:none;width:100%;cursor:pointer;padding:0;color:inherit;font:inherit;">
              <div class="home-design-icon hl-card-l4-art" style="background: linear-gradient(135deg, #a855f7, #6b21a8); color: #fff; margin: 0 auto;">
                <i class="fa-solid fa-microphone"></i>
              </div>
              <strong class="hl-voice-title" style="display:block;margin-top:4px;">إضافة صوتية للمصروفات</strong>
              ${getWaveHtml(18)}
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '−' : '';

      return `
        <article class="home-design-card hl-card-l4" data-ref-category="${id}" style="--cat-color: ${s.cat.color}; --cat-rgb: ${s.cat.rgb};">
          <button type="button" class="home-design-head hl-card-l4-top" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;text-align:right;">
            <div class="home-design-icon hl-card-l4-art" style="background: linear-gradient(145deg, ${s.cat.color}35, ${s.cat.color}15); color: ${s.cat.color};">
              <span>${s.cat.emoji}</span>
            </div>
            <div class="hl-card-l4-info">
              <strong class="hl-card-l4-name">${s.cat.name}</strong>
              <div class="hl-amount ${s.hasSpent ? 'spent' : 'zero'}" style="font-size: 0.95rem;">
                ${sign ? `<span class="spent-minus">${sign}</span>` : ''}
                <bdi class="amt-num">${s.spentStr}</bdi>
                <span class="curr-lbl" style="font-size: 0.75rem;">${currSymbol}</span>
              </div>
            </div>
          </button>
          <button type="button" class="home-design-value hl-card-l4-bottom" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;">
            <div class="hl-progress-track">
              <div class="hl-progress-fill" style="width: ${Math.min(s.pct, 100)}%; background: ${s.statusColor};"></div>
            </div>
            <small class="hl-budget-info" style="color: ${s.statusColor};">${s.budgetText}</small>
          </button>
        </article>
      `;
    }).join('');

    return `<div class="home-design-grid hl-grid-layout-4">${cardsHtml}</div>`;
  }

  // ==========================================================================
  // Layout 5: 3-Column Compact Grid (Matches Image 5)
  // ==========================================================================
  function renderLayout5(totals, budgets, currSymbol, isGold) {
    const order = [
      'daily', 'food', 'bills',
      'house', 'education', 'transport',
      'health', 'other', 'clothes', 'voice'
    ];

    const cardsHtml = order.map(id => {
      if (id === 'voice') {
        return `
          <article class="home-design-card hl-card-l5-voice-full" data-ref-category="voice" style="grid-column: 1 / -1;">
            <button type="button" data-voice style="border:none;background:none;width:100%;cursor:pointer;padding:0;color:inherit;font:inherit;display:flex;align-items:center;justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="home-design-icon" style="width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#a855f7,#7c3aed); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1rem;">
                  <i class="fa-solid fa-microphone"></i>
                </div>
                <strong class="hl-voice-title">إضافة صوتية للمصروفات</strong>
              </div>
              <div style="flex:1; max-width:180px; padding:0 8px;">${getWaveHtml(18)}</div>
              <i class="fa-solid fa-chevron-left" style="color:#a855f7; font-size:0.85rem;"></i>
            </button>
          </article>
        `;
      }

      const s = getCategoryStats(id, totals, budgets, currSymbol, isGold);
      const sign = s.hasSpent ? '−' : '';

      return `
        <article class="home-design-card hl-card-l5" data-ref-category="${id}" style="--cat-color: ${s.cat.color}; --cat-rgb: ${s.cat.rgb};">
          <button type="button" class="home-design-head hl-card-l5-top" data-add="${id}" data-action="quick-add" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;">
            <div class="home-design-icon hl-card-l5-icon" style="background: linear-gradient(135deg, ${s.cat.color}25, ${s.cat.color}10); color: ${s.cat.color};">
              <span>${s.cat.emoji}</span>
            </div>
            <strong class="hl-card-l5-name">${s.cat.name}</strong>
          </button>
          <button type="button" class="home-design-value hl-card-l5-bottom" data-details="${id}" data-action="view-operations" data-cat-id="${id}" style="border:none;background:none;cursor:pointer;width:100%;font:inherit;color:inherit;">
            <span class="hl-amount ${s.hasSpent ? 'spent' : 'zero'}" style="font-size: 0.8rem;">
              ${sign ? `<span class="spent-minus">${sign}</span>` : ''}
              <bdi class="amt-num">${s.spentStr}</bdi>
            </span>
            <div class="hl-progress-track" style="height: 3px; margin: 2px 0 1px;">
              <div class="hl-progress-fill" style="width: ${Math.min(s.pct, 100)}%; background: ${s.statusColor};"></div>
            </div>
            <small class="hl-budget-info" style="color: ${s.statusColor}; font-size: 0.58rem;">%${s.remainingPct} متبقي</small>
          </button>
        </article>
      `;
    }).join('');

    return `<div class="home-design-grid hl-grid-layout-5">${cardsHtml}</div>`;
  }

  // ==========================================================================
  // Master Render Function
  // ==========================================================================
  function render(filtered) {
    if (filtered) cachedFiltered = filtered;
    ensureDomElements();

    if (currentLayout === 0) {
      updateUiForActiveLayout();
      return;
    }

    const container = document.getElementById('homeInterfaces');
    if (!container) return;

    updateUiForActiveLayout();

    const totals = computeTotals(cachedFiltered || (typeof root.getFilteredTransactions === 'function' ? root.getFilteredTransactions() : []));
    const budgets = typeof root.getCategoryBudgetCeilings === 'function' ? root.getCategoryBudgetCeilings() : {};
    const currSymbol = typeof root.getCurrencySymbol === 'function' ? root.getCurrencySymbol() : 'ج.م';
    const isGold = root.state?.currency === 'GOLD21';

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
        html = '';
        break;
    }

    container.innerHTML = html;
  }

  // ==========================================================================
  // Layout Picker Modal
  // ==========================================================================
  function openPicker() {
    let modal = document.getElementById('homeLayoutPickerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'homeLayoutPickerModal';
      modal.onclick = (e) => {
        if (e.target === modal) closePicker();
      };
      document.body.appendChild(modal);
    }

    const optionsHtml = LAYOUT_META.map(item => `
      <div class="hl-picker-option ${item.id === currentLayout ? 'selected' : ''}" onclick="HomeLayouts.chooseFromPicker(${item.id})">
        <i class="fa-solid ${item.icon} hl-picker-opt-icon"></i>
        <div class="hl-picker-opt-name">${item.name}</div>
        <div class="hl-picker-opt-desc">${item.desc}</div>
      </div>
    `).join('');

    modal.innerHTML = `
      <div class="hl-picker-sheet">
        <div class="hl-picker-handle"></div>
        <div class="hl-picker-title">
          <i class="fa-solid fa-table-cells-large" style="color: #8b5cf6;"></i>
          <span>اختر مظهر شاشة المصروفات الرئيسية</span>
        </div>
        <div class="hl-picker-grid">${optionsHtml}</div>
      </div>
    `;

    requestAnimationFrame(() => modal.classList.add('active'));
  }

  function closePicker() {
    const modal = document.getElementById('homeLayoutPickerModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function chooseFromPicker(layoutId) {
    setLayout(layoutId);
    closePicker();
  }

  // Export to global window object
  root.HomeLayouts = {
    init,
    getLayout,
    setLayout,
    cycleLayout,
    render,
    openPicker,
    closePicker,
    chooseFromPicker
  };

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

})(window);
