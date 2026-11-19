// =========================================================================
// Family Expense Tracker Next - Early Initialization & Visual Harmony Engine
// =========================================================================

    // دوال مساعدة عامة أساسية
    
    // =========================================================================
    // محرك الموازنة البصرية الذكية للألوان والتباين (Visual Harmony Engine)
    // يوازن لون المصروف والبنود مع خلفية الكارت والوضع الليلي/النهاري لضمان تباين فائق
    // =========================================================================
    function getHarmonizedCategoryColor(colorStr, isLight) {
      let hex = (colorStr || '#38bdf8').trim();
      if (hex.startsWith('rgb')) {
        const nums = hex.match(/\d+/g);
        if (nums && nums.length >= 3) {
          hex = '#' + ((1 << 24) + (parseInt(nums[0]) << 16) + (parseInt(nums[1]) << 8) + parseInt(nums[2])).toString(16).slice(1);
        } else {
          hex = '#38bdf8';
        }
      }
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }

      let r = parseInt(hex.substring(1, 3), 16) || 56;
      let g = parseInt(hex.substring(3, 5), 16) || 189;
      let b = parseInt(hex.substring(5, 7), 16) || 248;

      let rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
      let max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
          case gNorm: h = (bNorm - rNorm) / d + 2; break;
          case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
      }

      // ضبط السطوع تلقائياً وفقاً للوضع (فاتح أم داكن) لتحقيق نسبة تباين WCAG AAA
      let tunedL = isLight ? Math.min(0.36, Math.max(0.24, l * 0.52)) : Math.max(0.64, Math.min(0.78, l * 1.15));
      let tunedS = Math.min(0.95, Math.max(0.65, s));

      function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
          r = g = b = l;
        } else {
          function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          }
          let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          let p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
      }

      const [tX, tY, tZ] = hslToRgb(h, tunedS, tunedL);
      const colorHex = '#' + ((1 << 24) + (tX << 16) + (tY << 8) + tZ).toString(16).slice(1);

      return {
        color: colorHex,
        bg: isLight ? `rgba(${tX}, ${tY}, ${tZ}, 0.12)` : `rgba(${tX}, ${tY}, ${tZ}, 0.16)`,
        border: isLight ? `rgba(${tX}, ${tY}, ${tZ}, 0.35)` : `rgba(${tX}, ${tY}, ${tZ}, 0.45)`,
        badgeBorder: isLight ? `rgba(${tX}, ${tY}, ${tZ}, 0.28)` : `rgba(${tX}, ${tY}, ${tZ}, 0.38)`
      };
    }
    window.getHarmonizedCategoryColor = getHarmonizedCategoryColor;

    function escapeHtml(t) {
      if (t === null || t === undefined) return '';
      const d = document.createElement('div');
      d.textContent = String(t);
      return d.innerHTML;
    }

    function initDonutChart() {
      // تم استبدال الشارت الدائري ببنود الرصيد والتحليلات الفاخرة
    }

    let currentActivityTab = 'all';
    let currentSelectedActivityItem = null;
    let archiveRenderLimit = 50;

    function saveActivityLog() {
      try {
        localStorage.setItem('family_monefy_activity_log', JSON.stringify(state.activityLog || []));
      } catch(e) {}
    }

    function logActivity(entry) {
      if (!state.activityLog) state.activityLog = [];
      const newEntry = {
        id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        timestamp: new Date().toISOString(),
        date: entry.date || new Date().toISOString().split('T')[0],
        time: entry.time || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        author: state.currentUser || 'ماهر',
        ...entry
      };
      state.activityLog.unshift(newEntry);
      if (state.activityLog.length > 600) state.activityLog.pop();
      saveActivityLog();
      try {
        if (typeof syncChannel !== 'undefined' && syncChannel) {
          syncChannel.postMessage({ type: 'SYNC_ACTIVITY', activity: newEntry });
        }
      } catch(e) {}
    }

    function initActivityLog() {
      const stored = localStorage.getItem('family_monefy_activity_log');
      if (stored) {
        try {
          state.activityLog = JSON.parse(stored);
        } catch(e) {
          state.activityLog = [];
        }
      }
      if (!Array.isArray(state.activityLog)) state.activityLog = [];

      // دمج وتحديث كامل لكافة حركات المعاملات حتى لا يخلو الأرشيف من أي عملية أبداً
      if (Array.isArray(state.transactions) && state.transactions.length > 0) {
        const existingTxIds = new Set(state.activityLog.map(a => a.txId || a.id));
        let addedCount = 0;
        state.transactions.forEach(t => {
          if (!t || t.deleted) return;
          const actId = 'act-tx-' + (t.id || (t.date + '-' + t.amount));
          if (!existingTxIds.has(actId) && !existingTxIds.has(t.id)) {
            const isInc = t.type === 'income';
            const amt = parseFloat(t.amount) || 0;
            state.activityLog.push({
              id: actId,
              txId: t.id,
              timestamp: t.date ? (t.date + 'T12:00:00.000Z') : (t.createdAt || new Date().toISOString()),
              date: t.date || (t.createdAt ? t.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
              time: t.time || '12:00 م',
              action: isInc ? 'إضافة دخل جديد' : 'تسجيل مصروف جديد',
              type: isInc ? 'add_income' : 'add_expense',
              label: t.label || (isInc ? 'دخل' : 'مصروف'),
              amount: amt,
              member: t.member || 'ماهر',
              author: t.member || 'ماهر',
              category: t.category || 'other',
              sign: isInc ? '+' : '-',
              wallet: t.walletId || t.wallet || 'cash'
            });
            existingTxIds.add(actId);
            addedCount++;
          }
        });
        if (addedCount > 0 || state.activityLog.length > 0) {
          state.activityLog.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
          saveActivityLog();
        }
      }
    }

    let activeModalsStack = [];

    function pushModalState(id) {
      if (!activeModalsStack.includes(id)) {
        activeModalsStack.push(id);
        try { window.history.pushState({ modalId: id }, ''); } catch(e){}
      }
    }

    function popModalState(id) {
      const idx = activeModalsStack.indexOf(id);
      if (idx !== -1) {
        activeModalsStack.splice(idx, 1);
      }
    }

    function closeSpecificModalOrDrawer(id, fromPopState = false) {
      popModalState(id);
      if (id === 'goldDrawer' || id === 'tradingviewDrawer') {
        if (typeof closeGoldDrawer === 'function') closeGoldDrawer(true);
      } else if (id === 'summaryDrawer' || id === 'summaryLeftDrawer') {
        if (typeof closeSummaryLeftDrawer === 'function') closeSummaryLeftDrawer(true);
      } else {
        const modal = document.getElementById(id);
        if (modal) {
          modal.classList.remove('open');
          modal.classList.remove('active');
          if (modal.style.display !== 'none' && modal.classList.contains('modal-overlay-custom')) {
            modal.style.display = 'none';
          }
        }
      }
      if (!fromPopState) {
        try {
          if (window.history.state && window.history.state.modalId === id) {
            window.history.back();
          }
        } catch(e) {}
      }

      // الرجوع التلقائي إلى نافذة التنبيهات إذا تم الفتح منها
      if (id === 'editTxModal' || id === 'editCommitmentModal' || id === 'tasksFullScreenModal' || id === 'taskModal') {
        if (window._returnToNotificationsOnClose) {
          window._returnToNotificationsOnClose = false;
          setTimeout(() => {
            if (typeof familyAlerts !== 'undefined' && typeof familyAlerts.open === 'function') {
              familyAlerts.open();
            } else if (typeof openNotificationsModal === 'function') {
              openNotificationsModal();
            }
          }, 60);
        }
      }
    }

    function openModal(id) {
      const el = document.getElementById(id);
      if (el) {
        pushModalState(id);
        const stackIdx = activeModalsStack.indexOf(id);
        const baseZ = 1000050;
        const dynamicZ = baseZ + ((stackIdx >= 0 ? stackIdx : activeModalsStack.length) * 100);
        el.classList.add('open');
        el.classList.add('active');
        el.style.setProperty('display', 'flex', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('z-index', String(dynamicZ), 'important');
      }
    }

    function closeModal(id) {
      closeSpecificModalOrDrawer(id, false);
    }

    function showToast(msg) {
      const t = document.getElementById('toastMsg');
      const txt = document.getElementById('toastTxt');
      if (txt) txt.textContent = msg;
      if (t) {
        t.classList.add('show');
        clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => t.classList.remove('show'), 3500);
      }
    }

    var currentEditTxReceiptDataUri = null;
    var APP_VERSION = 'v6.8.6';
    var APP_BUILD_ID = 202611191620;
    window.APP_VERSION = APP_VERSION;
    window.APP_BUILD_ID = APP_BUILD_ID;
    (function() {
      try {
        // 1. Color Mode & Theme (Light vs Dark) - Zero Theme FOUC
        var savedTheme = localStorage.getItem('family_monefy_theme') || 'navy';
        var savedMode = localStorage.getItem('family_monefy_color_mode') || localStorage.getItem('app_theme');
        if (!savedMode) {
          savedMode = (['light', 'facebook'].includes(savedTheme)) ? 'light' : 'dark';
        }
        document.documentElement.setAttribute('data-color-mode', savedMode);
        document.documentElement.setAttribute('data-app-theme', savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedMode === 'light') {
          document.documentElement.classList.add('light-theme');
        } else {
          document.documentElement.classList.remove('light-theme');
        }

        // Apply theme variables immediately to prevent color flash
        var palettes = {
          navy: { dark: '#7dd3fc', light: '#075985', swatch: '#0f2d55' },
          emerald: { dark: '#6ee7b7', light: '#047857', swatch: '#047857' },
          purple: { dark: '#d8b4fe', light: '#6b21a8', swatch: '#7e22ce' },
          rose: { dark: '#fda4af', light: '#9f1239', swatch: '#be123c' },
          ocean: { dark: '#67e8f9', light: '#0e7490', swatch: '#0e7490' },
          gold: { dark: '#fcd34d', light: '#854d0e', swatch: '#a16207' },
          slate: { dark: '#cbd5e1', light: '#475569', swatch: '#475569' },
          midnight: { dark: '#a5b4fc', light: '#3730a3', swatch: '#4338ca' },
          facebook: { dark: '#1877f2', light: '#1877f2', swatch: '#1877f2' }
        };
        var pal = palettes[savedTheme] || palettes.navy;
        var acc = (savedMode === 'light') ? pal.light : pal.dark;
        document.documentElement.style.setProperty('--primary', acc);
        document.documentElement.style.setProperty('--primary-color', acc);
        document.documentElement.style.setProperty('--accent', acc);
        document.documentElement.style.setProperty('--primary-glow', pal.swatch + '66');
        document.documentElement.style.setProperty('--theme-accent', acc);
        document.documentElement.style.setProperty('--theme-swatch', pal.swatch);

        // 2. Saved Home Layout (0 to 9) - Zero Layout FOUC
        var savedLayout = localStorage.getItem('family_expense_home_design_v2');
        var layoutNum = (savedLayout !== null && savedLayout !== '') ? parseInt(savedLayout, 10) : 1;
        if (isNaN(layoutNum) || layoutNum < 0 || layoutNum > 9) layoutNum = 1;
        document.documentElement.setAttribute('data-home-layout', String(layoutNum));
        if (layoutNum > 0) {
          document.documentElement.classList.add('has-alt-home-layout');
        } else {
          document.documentElement.classList.remove('has-alt-home-layout');
        }

        // 3. Icons, Fonts & Styles
        var it = localStorage.getItem('family_monefy_icon_theme') || 'vibrant';
        document.documentElement.setAttribute('data-icon-theme', it);
        var fs = localStorage.getItem('family_expense_font_size') || 'medium';
        var validSizes = ['micro', 'small', 'medium', 'large', 'xlarge', 'huge'];
        if (!validSizes.includes(fs)) fs = 'medium';
        document.documentElement.setAttribute('data-font-size', fs);
        var cs = localStorage.getItem('family_monefy_design_style') || 'glass';
        document.documentElement.setAttribute('data-card-style', cs);
        var fk = localStorage.getItem('family_expense_app_font') || 'tajawal';
        document.documentElement.setAttribute('data-font-family', fk);
        var fontMap = {
          tajawal: "'Tajawal', -apple-system, sans-serif",
          cairo: "'Cairo', 'Tajawal', sans-serif",
          ibm: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif",
          almarai: "'Almarai', 'Tajawal', sans-serif",
          readex: "'Readex Pro', 'Tajawal', sans-serif",
          alexandria: "'Alexandria', 'Tajawal', sans-serif",
          changa: "'Changa', 'Tajawal', sans-serif",
          noto: "'Noto Sans Arabic', 'Tajawal', sans-serif",
          rubik: "'Rubik', 'Tajawal', sans-serif"
        };
        if (fontMap[fk]) {
          document.documentElement.style.setProperty('--font-family', fontMap[fk], 'important');
          document.documentElement.style.setProperty('--font-numbers', fontMap[fk], 'important');
        }
      } catch(e) {}
    })();


// =========================================================================
// Service Worker Registration for Offline PWA
// =========================================================================
    // تسجيل Service Worker للعمل أوفلاين وتحديث الكاش تلقائياً بصيغة PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js').then(function(reg) {
          console.log('[SW] PWA ServiceWorker active with scope:', reg.scope);
          reg.update().catch(err => console.warn('[SW] Update check failed:', err));
        }).catch(function(err) {
          console.warn('[SW] Registration failed:', err);
        });
      });
    }

