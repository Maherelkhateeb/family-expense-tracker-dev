function renderCategoriesGrid(filtered) {
      const grid = document.getElementById('catGrid');
      if (!grid) return;
      grid.innerHTML = '';

      const catTotals = {};
      (filtered || []).forEach(t => {
        if (t.type === 'expense') {
          let c = t.category;
          if (c === 'shopping' || c === 'supermarket') c = 'food';
          if (c === 'kids' || c === 'gifts' || c === 'entertainment') c = 'other';
          if (c === 'others') c = 'other';
          catTotals[c] = (catTotals[c] || 0) + (Number(t.amount) || 0);
        }
      });

      // باليت ألوان وصور مجسمة ثلاثية الأبعاد واضحة وفائقة الدقة والجمال لكل بند
      const HIGH_CONTRAST_THEMES = {
        food: {
          name: 'طعام ومشتريات',
          emoji: '🛒',
          accent: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          bg: 'linear-gradient(160deg, rgba(16, 185, 129, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#10b981'
        },
        daily: {
          name: 'مصروف يومي',
          emoji: '☕',
          accent: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          bg: 'linear-gradient(160deg, rgba(245, 158, 11, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#f59e0b'
        },
        bills: {
          name: 'فواتير والتزامات',
          emoji: '⚡',
          accent: '#f97316',
          gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
          bg: 'linear-gradient(160deg, rgba(249, 115, 22, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#f97316'
        },
        transport: {
          name: 'مواصلات وبنزين',
          emoji: '🚗',
          accent: '#0284c7',
          gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          bg: 'linear-gradient(160deg, rgba(2, 132, 199, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#0284c7'
        },
        house: {
          name: 'مستلزمات منزل',
          emoji: '🛋️',
          accent: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          bg: 'linear-gradient(160deg, rgba(139, 92, 246, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#8b5cf6'
        },
        health: {
          name: 'صحة وعلاج',
          emoji: '💊',
          accent: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          bg: 'linear-gradient(160deg, rgba(239, 68, 68, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#ef4444'
        },
        clothes: {
          name: 'ملابس وأحذية',
          emoji: '👔',
          accent: '#ec4899',
          gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          bg: 'linear-gradient(160deg, rgba(236, 72, 153, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#ec4899'
        },
        education: {
          name: 'تعليم ودروس',
          emoji: '🎓',
          accent: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          bg: 'linear-gradient(160deg, rgba(59, 130, 246, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#3b82f6'
        },
        other: {
          name: 'أخرى ونثريات',
          emoji: '🎁',
          accent: '#14b8a6',
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          bg: 'linear-gradient(160deg, rgba(20, 184, 166, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#14b8a6'
        },
        entertainment: {
          name: 'أخرى ونثريات',
          emoji: '🎁',
          accent: '#14b8a6',
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          bg: 'linear-gradient(160deg, rgba(20, 184, 166, 0.22) 0%, rgba(15, 23, 42, 0.95) 80%)',
          border: '#14b8a6'
        }
      };

      const activeTheme = state.appTheme || localStorage.getItem('family_monefy_theme') || 'navy';
      const isLight = (activeTheme === 'light') || document.body.classList.contains('light-theme');
      const activeIconTheme = state.iconTheme || localStorage.getItem('family_monefy_icon_theme') || 'vibrant';

      // باليت خلفيات الكروت الداخلية الفاخرة المنسجمة 100% مع كل سمة من سمات التطبيق الـ 9
      const THEME_CARD_STYLES = {
        navy: {
          bg: 'linear-gradient(150deg, rgba(20, 52, 98, 0.88) 0%, rgba(10, 28, 54, 0.97) 100%)',
          border: 'rgba(56, 189, 248, 0.40)',
          shadow: '0 4px 18px rgba(7, 18, 36, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
          labelColor: '#f8fafc'
        },
        black: {
          bg: 'linear-gradient(150deg, #18181b 0%, #09090b 100%)',
          border: 'rgba(255, 255, 255, 0.16)',
          shadow: '0 4px 18px rgba(0, 0, 0, 0.90), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          labelColor: '#f8fafc'
        },
        emerald: {
          bg: 'linear-gradient(150deg, rgba(6, 78, 59, 0.88) 0%, rgba(2, 44, 34, 0.97) 100%)',
          border: 'rgba(16, 185, 129, 0.45)',
          shadow: '0 4px 18px rgba(2, 44, 34, 0.65), inset 0 1px 0 rgba(52, 211, 153, 0.15)',
          labelColor: '#ecfdf5'
        },
        purple: {
          bg: 'linear-gradient(150deg, rgba(59, 7, 100, 0.88) 0%, rgba(30, 7, 52, 0.97) 100%)',
          border: 'rgba(168, 85, 247, 0.45)',
          shadow: '0 4px 18px rgba(30, 7, 52, 0.65), inset 0 1px 0 rgba(192, 132, 252, 0.15)',
          labelColor: '#faf5ff'
        },
        gold: {
          bg: 'linear-gradient(150deg, rgba(69, 36, 15, 0.90) 0%, rgba(33, 17, 7, 0.97) 100%)',
          border: 'rgba(245, 158, 11, 0.45)',
          shadow: '0 4px 18px rgba(33, 17, 7, 0.65), inset 0 1px 0 rgba(251, 191, 36, 0.15)',
          labelColor: '#fffbeb'
        },
        ocean: {
          bg: 'linear-gradient(150deg, rgba(14, 52, 82, 0.90) 0%, rgba(6, 28, 46, 0.97) 100%)',
          border: 'rgba(6, 182, 212, 0.45)',
          shadow: '0 4px 18px rgba(6, 28, 46, 0.65), inset 0 1px 0 rgba(34, 211, 238, 0.15)',
          labelColor: '#f0fdfa'
        },
        rose: {
          bg: 'linear-gradient(150deg, rgba(76, 12, 30, 0.90) 0%, rgba(35, 6, 14, 0.97) 100%)',
          border: 'rgba(244, 63, 94, 0.45)',
          shadow: '0 4px 18px rgba(35, 6, 14, 0.65), inset 0 1px 0 rgba(251, 113, 133, 0.15)',
          labelColor: '#fff1f2'
        },
        slate: {
          bg: 'linear-gradient(150deg, rgba(51, 65, 85, 0.90) 0%, rgba(20, 27, 39, 0.97) 100%)',
          border: 'rgba(148, 163, 184, 0.45)',
          shadow: '0 4px 18px rgba(15, 23, 42, 0.65), inset 0 1px 0 rgba(203, 213, 225, 0.15)',
          labelColor: '#f8fafc'
        },
        light: {
          bg: '#ffffff',
          border: '#cbd5e1',
          shadow: '0 4px 14px rgba(0, 0, 0, 0.08), inset 0 1px 0 #ffffff',
          labelColor: '#0f172a'
        }
      };

      const curThemeStyle = THEME_CARD_STYLES[activeTheme] || THEME_CARD_STYLES.navy;

      // تدرجات ألوان الأيقونات الموحدة
      const ICON_THEME_GRADIENTS = {
        gold: { grad: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', glow: 'rgba(245, 158, 11, 0.50)' },
        emerald: { grad: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', glow: 'rgba(16, 185, 129, 0.50)' },
        ocean: { grad: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', glow: 'rgba(2, 132, 199, 0.50)' },
        purple: { grad: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', glow: 'rgba(139, 92, 246, 0.50)' },
        silver: { grad: 'linear-gradient(135deg, #64748b 0%, #1e293b 100%)', glow: 'rgba(148, 163, 184, 0.50)' }
      };

      EXPENSE_CATEGORIES.forEach(cat => {
        const spent = catTotals[cat.id] || (cat.id === 'other' ? (catTotals['entertainment'] || 0) : 0);
        const theme = HIGH_CONTRAST_THEMES[cat.id] || {
          name: cat.name,
          emoji: '📦',
          accent: cat.color || '#38bdf8',
          gradient: `linear-gradient(135deg, ${cat.color}, #334155)`,
          bg: 'rgba(15, 23, 42, 0.9)',
          border: cat.color
        };

        const currentCardStyle = document.documentElement.getAttribute('data-card-style') || localStorage.getItem('family_monefy_design_style') || 'glass';

        let cardBg = curThemeStyle.bg;
        let cardBorder = isLight ? theme.border : (theme.border || curThemeStyle.border);
        let cardRadius = '18px';
        let cardBackdrop = 'blur(16px)';
        let cardShadow = curThemeStyle.shadow;

        if (currentCardStyle === 'minimal') {
          cardBg = isLight ? '#ffffff' : '#0f172a';
          cardBorder = `1.5px solid ${theme.accent}77`;
          cardRadius = '8px';
          cardBackdrop = 'none';
          cardShadow = isLight ? '0 2px 4px rgba(0, 0, 0, 0.08)' : '0 2px 5px rgba(0, 0, 0, 0.5)';
        } else if (currentCardStyle === 'neumorphic') {
          cardBg = isLight ? '#f1f5f9' : 'linear-gradient(145deg, #1e293b, #0f172a)';
          cardBorder = isLight ? '1.5px solid rgba(255, 255, 255, 0.08)' : '1.5px solid rgba(255, 255, 255, 0.08)';
          cardRadius = '14px';
          cardBackdrop = 'none';
          cardShadow = isLight 
            ? '5px 5px 12px #cbd5e1, -4px -4px 10px #ffffff, inset 1px 1px 1px rgba(255, 255, 255, 0.8)' 
            : '5px 5px 12px #070b12, -4px -4px 10px rgba(255, 255, 255, 0.05), inset 1px 1px 1px rgba(255, 255, 255, 0.1)';
        } else if (currentCardStyle === 'neon') {
          cardBg = isLight ? '#f8fafc' : '#050b14';
          cardBorder = `2px solid ${theme.accent}`;
          cardRadius = '14px';
          cardBackdrop = 'none';
          cardShadow = `0 0 14px ${theme.accent}80, inset 0 0 8px ${theme.accent}33`;
        } else {
          // glass (default)
          cardBg = isLight ? 'rgba(255, 255, 255, 0.80)' : curThemeStyle.bg;
          cardBorder = isLight ? '1.5px solid rgba(0, 0, 0, 0.12)' : `1.5px solid ${theme.border || curThemeStyle.border}`;
          cardRadius = '18px';
          cardBackdrop = 'blur(16px)';
          cardShadow = isLight ? '0 8px 24px rgba(0, 0, 0, 0.08)' : (curThemeStyle.shadow || '0 8px 24px rgba(0, 0, 0, 0.45)');
        }

        const catLabelColor = curThemeStyle.labelColor;

        // اختيار تدرج فقاعة الأيقونة بناءً على نمط الأيقونات المختار
        let bubbleGradient = theme.gradient;
        let bubbleGlow = `${theme.accent}50`;
        if (activeIconTheme !== 'vibrant' && ICON_THEME_GRADIENTS[activeIconTheme]) {
          bubbleGradient = ICON_THEME_GRADIENTS[activeIconTheme].grad;
          bubbleGlow = ICON_THEME_GRADIENTS[activeIconTheme].glow;
        }

        const card = document.createElement('div');
        card.className = `cat-card cat-theme-${cat.id}`;
        card.setAttribute('data-cat-id', cat.id);

        card.style.cssText = `
          background: ${cardBg} !important;
          border: ${cardBorder} !important;
          border-radius: ${cardRadius} !important;
          backdrop-filter: ${cardBackdrop} !important;
          -webkit-backdrop-filter: ${cardBackdrop} !important;
          padding: var(--app-card-padding, 7px 4px 6px) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 3px !important;
          height: 100% !important;
          max-height: var(--app-card-max-h, 126px) !important;
          min-height: 0 !important;
          cursor: pointer !important;
          box-shadow: ${cardShadow} !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        `;

        card.onclick = () => {
          openQuickCategoryExpense(cat.id);
        };

        let amtDisplay = '0.00 ' + getCurrencySymbol();
        if (state.currency === 'USD') amtDisplay = '$0.00';
        if (spent > 0) {
          amtDisplay = '- ' + formatMoney(spent, true);
        }

        // تحجيم خط المبلغ بالكبسولة تلقائياً حتى لا يتجاوز حدود البطاقة إطلاقاً
        let pillFontSize = 'clamp(0.80rem, 2.3vw, 0.90rem)';
        let pillLetterSpacing = '0px';
        if (amtDisplay.length > 15) {
          pillFontSize = 'clamp(0.60rem, 1.7vw, 0.68rem)';
          pillLetterSpacing = '-0.4px';
        } else if (amtDisplay.length > 12) {
          pillFontSize = 'clamp(0.66rem, 1.9vw, 0.74rem)';
          pillLetterSpacing = '-0.3px';
        } else if (amtDisplay.length > 9) {
          pillFontSize = 'clamp(0.72rem, 2.1vw, 0.80rem)';
          pillLetterSpacing = '-0.1px';
        }

        const pillBg = spent > 0 
          ? (isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(244, 63, 94, 0.22)') 
          : (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)');
        const pillBorder = spent > 0 
          ? (isLight ? 'rgba(239, 68, 68, 0.5)' : 'rgba(244, 63, 94, 0.7)') 
          : (isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.12)');
        const pillTextColor = spent > 0 
          ? (isLight ? '#b91c1c' : '#ff4d6d') 
          : (isLight ? '#475569' : '#94a3b8');

        card.innerHTML = `
          <!-- 1. صورة/أيقونة التصنيف ثلاثية الأبعاد الفاخرة بإطار داخلي بارز - النقر عليها يفتح تسجيل جديد -->
          <div class="cat-icon-bubble" 
               onclick="event.stopPropagation(); openQuickCategoryExpense('${cat.id}');"
               title="انقر على الرمز لتسجيل مصروف جديد في ${theme.name}"
               style="background: ${bubbleGradient}; width: var(--app-cat-bubble-size, clamp(42px, 11vw, 48px)); height: var(--app-cat-bubble-size, clamp(42px, 11vw, 48px)); min-width: 38px; min-height: 38px; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), inset 0 0 6px rgba(255, 255, 255, 0.35), 0 0 14px ${bubbleGlow}; border: 2.2px solid rgba(255, 255, 255, 0.6); outline: 1.5px solid ${theme.accent}; margin-top: 2px; flex-shrink: 0; cursor: pointer; transition: transform 0.15s ease;">
            <span style="font-size: var(--app-cat-emoji-size, clamp(1.70rem, 4.4vw, 2.05rem)); line-height: 1; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45)); transform: translateZ(0);">${theme.emoji}</span>
          </div>

          <!-- 2. اسم التصنيف بخط عربي فخم وواضح متناسق بين الفاتح والداكن -->
          <div class="cat-label-text" 
               style="font-family: var(--font-family); font-size: var(--app-card-title-size, clamp(0.72rem, 2.2vw, 0.84rem)); font-weight: 800; color: ${catLabelColor} !important; text-align: center; margin: 2px 0 1px; width: 100%; max-width: 100%; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px; box-sizing: border-box;">
            ${theme.name}
          </div>

          <!-- 3. كبسولة المبلغ المصروف بإطار داخلي بارز - النقر عليها يفتح كشف العمليات والتفاصيل -->
          <div class="cat-amount-pill ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
               onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
               title="انقر على الرقم لعرض كشف وتفاصيل حركات ${theme.name}" 
               style="cursor: pointer; background: ${pillBg}; border: 1.8px solid ${pillBorder}; color: ${pillTextColor}; padding: 3px 4px; border-radius: 9px; width: 98%; max-width: 98%; text-align: center; direction: rtl; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 3px; overflow: hidden; box-shadow: inset 0 0 8px ${spent > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; transition: all 0.15s ease;">
            <i class="fa-solid fa-list-ul" style="font-size: 0.58rem; opacity: 0.8; flex-shrink: 0;"></i>
            <span style="font-family: var(--font-numbers); font-size: var(--app-card-amt-size, ${pillFontSize}); letter-spacing: ${pillLetterSpacing}; font-weight: 900; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; font-variant-numeric: tabular-nums;">${amtDisplay}</span>
          </div>
        `;

        grid.appendChild(card);
      });
    }

    function openQuickCategoryExpense(catId) {
      // فتح نافذة المصروف وتحديد البند تلقائياً
      openTxModal('expense', catId);
    }

    function openCategoryAnalysis(catId) {
      state.activeCategoryFilter = catId;
      const cat = getCategoryObj(catId, 'expense');
      
      // 1. الانتقال فوراً إلى صفحة التحليلات
      switchAppPage('analytics');

      // 2. تفعيل قسم التصنيفات داخل صفحة التحليلات
      switchAnalyticsSection('categories');

      // 3. بناء وعرض كارت التقرير التفصيلي لبند المصروف
      showCategoryDetailBanner(catId);

      showToast(`📊 تحليل مصروفات: ${cat.name} للفترة المحددة`);
    }

    function showCategoryDetailBanner(catId) {
      const cat = getCategoryObj(catId, 'expense');
      const filtered = getFilteredTransactions().filter(t => t.type === 'expense' && (t.category === catId || (catId === 'food' && (t.category === 'shopping' || t.category === 'supermarket')) || (catId === 'others' && t.category === 'other')));
      
      const totalSpent = filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      let banner = document.getElementById('categoryAnalyticsDetailBanner');
      if (!banner) {
        const pane = document.getElementById('paneCategories');
        if (pane) {
          banner = document.createElement('div');
          banner.id = 'categoryAnalyticsDetailBanner';
          pane.insertBefore(banner, pane.firstChild);
        }
      }
      
      if (banner) {
        const periodNames = {
          'today': 'اليوم',
          'day': 'اليوم',
          'week': 'الأسبوع الحالي',
          'month': 'الشهر الحالي',
          'all': 'كافة الفترات',
          'custom': 'فترة مخصصة'
        };
        const pName = periodNames[state.period] || state.period;

        banner.innerHTML = `
          <div style="background: rgba(15, 23, 42, 0.88); border: 1.5px solid ${cat.color}; border-radius: 16px; padding: 14px 16px; margin-bottom: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.35);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 42px; height: 42px; border-radius: 12px; background: ${cat.color}25; color: ${cat.color}; border: 1px solid ${cat.color}60; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                  <i class="fa-solid ${cat.icon}"></i>
                </div>
                <div>
                  <div style="font-size: 0.95rem; font-weight: 800; color: #f8fafc;">تحليل مصروفات: ${cat.name}</div>
                  <div style="font-size: 0.74rem; color: #94a3b8;">الفترة: <strong style="color: #38bdf8;">${pName}</strong> • عدد الحركات: <strong>${filtered.length}</strong></div>
                </div>
              </div>
              <button onclick="clearCategoryAnalyticsFilter()" class="btn-item-action btn-item-delete" style="font-size: 0.74rem; padding: 5px 10px;">
                <i class="fa-solid fa-xmark"></i> عرض الكل
              </button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(10, 16, 26, 0.75); border-radius: 12px; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.06);">
              <span style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1;">إجمالي المنصرف في هذا البند:</span>
              <span style="font-size: 1.25rem; font-weight: 900; color: #ef4444; direction: ltr;">- ${formatMoney(totalSpent)}</span>
            </div>
            
            <!-- قائمة الحركات المفصلة لبند المصروف المختار -->
            <div style="margin-top: 12px; max-height: 240px; overflow-y: auto; padding-right: 2px;">
              ${filtered.length > 0 ? filtered.map(t => {
                const avatar = MEMBER_AVATARS[t.member] || null;
                const avHtml = avatar ? `<img src="${avatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover; margin-left: 4px;">` : `<i class="fa-solid fa-user" style="font-size: 0.7rem; color: #38bdf8; margin-left: 4px;"></i>`;
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 6px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.78rem;">
                    <div style="display: flex; align-items: center;">
                      ${avHtml}
                      <span style="color: #f1f5f9; font-weight: 700;">${escapeHtml(t.label)}</span>
                      <span style="color: #64748b; font-size: 0.7rem; margin-right: 6px;">(${t.date})</span>
                    </div>
                    <span style="color: #ef4444; font-weight: 800; direction: ltr;">- ${formatMoney(t.amount)}</span>
                  </div>
                `;
              }).join('') : '<div style="font-size: 0.78rem; color: #94a3b8; text-align: center; padding: 14px;">لا توجد حركات مسجلة لهذا البند في الفترة المحددة</div>'}
            </div>
          </div>
        `;
        banner.style.display = 'block';
      }
    }

    function clearCategoryAnalyticsFilter() {
      state.activeCategoryFilter = null;
      const banner = document.getElementById('categoryAnalyticsDetailBanner');
      if (banner) banner.style.display = 'none';
      try { updateAnalyticsChart(); } catch(e) {}
      showToast('🔄 تم الرجوع لعرض كافة التصنيفات');
    }

    // =========================================================================
    // قائمة العمليات المسجلة (Registered Transactions List)
    // =========================================================================
    let opsRenderLimit = 99999;
    let opsTypeFilterState = 'all'; // 'all' | 'expense' | 'income'

    
    // =========================================================================
    // الانتقال للعمليات مع فلترة حية دقيقة للمؤشر أو العمود أو البند المضغوط
    // =========================================================================
    function getChartClickedElement(chartInstance, event, elements) {
      if (!chartInstance) return null;
      let active = elements;
      const nativeEv = (event && event.native) ? event.native : event;
      if ((!active || active.length === 0) && nativeEv && typeof chartInstance.getElementsAtEventForMode === 'function') {
        try {
          active = chartInstance.getElementsAtEventForMode(nativeEv, 'nearest', { intersect: false }, true);
        } catch(e) {}
      }
      if ((!active || active.length === 0) && nativeEv && typeof chartInstance.getElementsAtEventForMode === 'function') {
        try {
          active = chartInstance.getElementsAtEventForMode(nativeEv, 'index', { intersect: false }, true);
        } catch(e) {}
      }
      return (active && active.length > 0) ? active[0] : null;
    }

    function openOperationsFiltered({ category = null, categoryName = null, member = null, type = 'all', date = null, month = null, walletId = null } = {}) {
      // 1. الانتقال الفوري لشاشة العمليات
      switchAppPage('operations', false);

      // 2. تفعيل تبويب العمليات المسجلة
      switchOperationsSubTab('registered');

      // 3. ضبط نوع العملية (مصروفات / إيداعات / الكل)
      opsTypeFilterState = type || 'all';
      const pillBox = document.getElementById('opsTypeFilterPills');
      if (pillBox) {
        pillBox.querySelectorAll('.btn-export-tool').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
        });
        const activeBtnId = (opsTypeFilterState === 'expense') ? 'btnOpsFilterExpenses' : ((opsTypeFilterState === 'income') ? 'btnOpsFilterIncome' : 'btnOpsFilterAll');
        const activeBtn = document.getElementById(activeBtnId);
        if (activeBtn) {
          activeBtn.classList.add('active');
          activeBtn.style.background = (opsTypeFilterState === 'expense') ? 'rgba(244, 63, 94, 0.25)' : ((opsTypeFilterState === 'income') ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.25)');
          activeBtn.style.color = (opsTypeFilterState === 'expense') ? '#f43f5e' : ((opsTypeFilterState === 'income') ? '#10b981' : '#38bdf8');
        }
      }

      // 4. ضبط قائمة تصفية التصنيف (Category Filter)
      const catSelect = document.getElementById('opsFilterCategory');
      let targetCatId = 'all';
      if (category) {
        let cId = String(category).toLowerCase();
        if (cId === 'shopping' || cId === 'supermarket') cId = 'food';
        else if (cId === 'cafe') cId = 'daily';
        else if (cId === 'fuel') cId = 'transport';
        else if (cId === 'utilities') cId = 'bills';
        else if (cId === 'home') cId = 'house';
        else if (cId === 'pharmacy' || cId === 'medical') cId = 'health';
        else if (cId === 'school') cId = 'education';
        else if (cId === 'others' || cId === 'gifts' || cId === 'charity' || cId === 'entertainment') cId = 'other';
        targetCatId = cId;
      }
      if (catSelect) {
        const optionExists = Array.from(catSelect.options).some(o => o.value === targetCatId);
        catSelect.value = optionExists ? targetCatId : 'all';
      }

      // 5. ضبط قائمة تصفية العضو (Member Filter)
      const memSelect = document.getElementById('opsFilterMember');
      let targetMember = (member && member !== 'الكل' && member !== 'العائلة') ? member : 'all';
      if (memSelect) {
        memSelect.value = targetMember;
      }
      if (targetMember !== 'all') {
        state.currentMemberFilter = targetMember;
        state.selectedMember = targetMember;
        document.querySelectorAll('.avatar-card').forEach(c => {
          if (c.getAttribute('data-member') === targetMember) c.classList.add('active');
          else c.classList.remove('active');
        });
      } else {
        state.currentMemberFilter = 'الكل';
        state.selectedMember = 'الكل';
        document.querySelectorAll('.avatar-card').forEach(c => {
          if (c.getAttribute('data-member') === 'الكل') c.classList.add('active');
          else c.classList.remove('active');
        });
      }

      // 6. ضبط المحفظة
      if (walletId) {
        state.currentWalletId = walletId;
        const wSelect = document.getElementById('activeWalletSelect');
        if (wSelect) wSelect.value = walletId;
      }

      // 7. ضبط حقل البحث وتوسيع الفترة الزمنية إذا كان البحث مرتبطاً بتاريخ محدد
      const searchInp = document.getElementById('opsSearchInput');
      let queryVal = '';
      if (date) {
        queryVal = date;
        state.period = 'all';
      } else if (month) {
        queryVal = month;
        state.period = 'all';
      } else if (category && (!catSelect || catSelect.value === 'all')) {
        queryVal = categoryName || category;
      }
      if (searchInp) {
        searchInp.value = queryVal;
      }

      // 8. تحديث شريط الفترات الزمنية
      document.querySelectorAll('.period-filter-pill').forEach(p => p.classList.remove('active'));
      const activePeriodPill = document.getElementById(
        state.period === 'today' ? 'pillPeriodToday' : 
        (state.period === 'week' ? 'pillPeriodWeek' : 
        (state.period === 'month' ? 'pillPeriodMonth' : 'pillPeriodAll'))
      );
      if (activePeriodPill) activePeriodPill.classList.add('active');

      // 9. تنفيذ الفلترة وتحديث قائمة العمليات وسجل النشاط
      filterOperationsList();
      if (typeof renderActivityLogUI === 'function') renderActivityLogUI();

      // 10. التمرير السلس إلى قائمة العمليات المفلترة
      const targetScroll = document.getElementById('opsSubViewRegistered') || document.getElementById('txOperationsList');
      if (targetScroll) {
        targetScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // 11. إشعار فوري توضيحي لطيف
      let labelParts = [];
      if (categoryName || (targetCatId !== 'all')) {
        const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(targetCatId, type) : null;
        labelParts.push(categoryName || (catObj ? catObj.name : targetCatId));
      }
      if (targetMember !== 'all') labelParts.push(targetMember);
      if (type === 'expense') labelParts.push('مصروفات');
      else if (type === 'income') labelParts.push('إيداعات');
      if (date) labelParts.push(date);
      else if (month) labelParts.push(month);

      const labelTxt = labelParts.length > 0 ? labelParts.join(' | ') : 'كافة العمليات';
      showToast(`🔍 تم فتح العمليات المفلترة: ${labelTxt}`);
    }

    function clearOpsFilter() {
      const searchInp = document.getElementById('opsSearchInput');
      if (searchInp) searchInp.value = '';
      const catSel = document.getElementById('opsFilterCategory');
      if (catSel) catSel.value = 'all';
      const memSel = document.getElementById('opsFilterMember');
      if (memSel) memSel.value = 'all';
      setOpsTypeFilter('all');
      filterOperationsList();
      if (typeof renderActivityLogUI === 'function') renderActivityLogUI();
      showToast('تمت إعادة ضبط فلاتر العمليات بالكامل');
    }

    function setOpsTypeFilter(type, btn) {
      opsTypeFilterState = type;
      const pillBox = document.getElementById('opsTypeFilterPills');
      if (pillBox) {
        pillBox.querySelectorAll('.btn-export-tool').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
        });
      }
      if (btn) {
        btn.classList.add('active');
        btn.style.background = (type === 'expense') ? 'rgba(244, 63, 94, 0.2)' : ((type === 'income') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)');
      }
      filterOperationsList();
      if (typeof renderActivityLogUI === 'function') renderActivityLogUI();
    }

    function renderOperationsList(filtered, appendMore = false) {
      const container = document.getElementById('txOperationsList');
      if (!container) return;

      if (!appendMore) {
        container.innerHTML = '';
        opsRenderLimit = 99999;
      }

      // تطبيق تصفية النوع على العمليات
      let list = filtered || [];
      if (opsTypeFilterState === 'expense') {
        list = list.filter(t => t.type === 'expense');
      } else if (opsTypeFilterState === 'income') {
        list = list.filter(t => t.type === 'income');
      }

      // تطبيق فلترة التصنيف في صفحة العمليات (Category Filter)
      const catFilter = document.getElementById('opsFilterCategory')?.value || 'all';
      if (catFilter && catFilter !== 'all') {
        list = list.filter(t => {
          const c = (t.category || '').toLowerCase();
          if (catFilter === 'food') return c === 'food' || c === 'supermarket';
          if (catFilter === 'daily') return c === 'daily' || c === 'cafe';
          if (catFilter === 'bills') return c === 'bills' || c === 'utilities';
          if (catFilter === 'transport') return c === 'transport' || c === 'fuel';
          if (catFilter === 'house') return c === 'house' || c === 'home';
          if (catFilter === 'health') return c === 'health' || c === 'medical' || c === 'pharmacy';
          if (catFilter === 'clothes') return c === 'clothes' || c === 'shopping';
          if (catFilter === 'education') return c === 'education' || c === 'school';
          if (catFilter === 'other') return c === 'other' || c === 'others' || c === 'gifts';
          return c === catFilter;
        });
      }

      // تطبيق فلترة العضو في صفحة العمليات (Member Filter)
      const memFilter = document.getElementById('opsFilterMember')?.value || 'all';
      if (memFilter && memFilter !== 'all') {
        list = list.filter(t => {
          if (memFilter === 'البيت') return t.member === 'البيت' || t.member === 'العائلة' || !t.member;
          if (memFilter === 'آية' || memFilter === 'أية') return t.member === 'آية' || t.member === 'أية';
          return t.member === memFilter;
        });
      }

      // تطبيق نص البحث إذا وجد
      const searchInp = document.getElementById('opsSearchInput');
      const q = searchInp ? searchInp.value.trim().toLowerCase() : '';
      if (q) {
        list = list.filter(t => {
          const l = (t.label || '').toLowerCase();
          const c = (t.category || '').toLowerCase();
          const cName = (typeof getCategoryName === 'function' ? (getCategoryName(t.category, t.type) || '') : '').toLowerCase();
          const m = (t.member || '').toLowerCase();
          const a = String(t.amount || '');
          const w = (typeof getWalletName === 'function' ? getWalletName(t.walletId) : '').toLowerCase();
          const d = (t.date || '').toLowerCase();
          return l.includes(q) || c.includes(q) || cName.includes(q) || m.includes(q) || a.includes(q) || w.includes(q) || d.includes(q);
        });
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 30px 10px;">
            <i class="fa-solid fa-receipt" style="color: #64748b; font-size: 2.2rem; margin-bottom: 10px;"></i>
            <div class="empty-title" style="color: #cbd5e1; font-weight: 800;">لا توجد عمليات مطابقة</div>
            <div class="empty-desc" style="color: #64748b; font-size: 0.8rem;">جرّب تغيير كلمات البحث أو تصفية العمليات</div>
          </div>
        `;
        return;
      }

      const totalCount = list.length;
      const todayIso = getLocalDateStr(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayIso = getLocalDateStr(yesterdayDate);

      // تجميع العمليات بحسب التاريخ
      const groupedByDate = {};
      const itemsToRender = list.slice(0, opsRenderLimit);

      itemsToRender.forEach(tx => {
        const d = tx.date || todayIso;
        if (!groupedByDate[d]) groupedByDate[d] = [];
        groupedByDate[d].push(tx);
      });

      // إزالة زر عرض المزيد السابق إن وجد
      const prevBtn = document.getElementById('btnLoadMoreOps');
      if (prevBtn) prevBtn.remove();

      // رسم الحركات مجمعة حسب التواريخ
      for (const [dateStr, txs] of Object.entries(groupedByDate)) {
        let groupTitle = dateStr;
        if (dateStr === todayIso) groupTitle = 'اليوم (Today) - ' + dateStr;
        else if (dateStr === yesterdayIso) groupTitle = 'الأمس (Yesterday) - ' + dateStr;

        let dayExpSum = 0, dayIncSum = 0;
        txs.forEach(t => {
          const amt = Number(t.amount) || 0;
          if (t.type === 'expense') dayExpSum += amt;
          else dayIncSum += amt;
        });

        // رأس قسم التاريخ
        const headerEl = document.createElement('div');
        headerEl.className = 'ops-date-group-header';
        let subtotalBadge = '';
        if (dayExpSum > 0 && dayIncSum > 0) {
          subtotalBadge = `<span class="ops-date-subtotal exp">- ${formatMoney(dayExpSum)}</span> <span class="ops-date-subtotal inc">+ ${formatMoney(dayIncSum)}</span>`;
        } else if (dayExpSum > 0) {
          subtotalBadge = `<span class="ops-date-subtotal exp">إجمالي المنصرف: - ${formatMoney(dayExpSum)}</span>`;
        } else {
          subtotalBadge = `<span class="ops-date-subtotal inc">إجمالي الدخل: + ${formatMoney(dayIncSum)}</span>`;
        }

        headerEl.innerHTML = `
          <div class="ops-date-title"><i class="fa-regular fa-calendar"></i> ${groupTitle}</div>
          <div>${subtotalBadge}</div>
        `;
        container.appendChild(headerEl);

        // كروت الحركات
        txs.forEach(tx => {
          const cat = getCategoryObj(tx.category, tx.type);
          const isExp = tx.type === 'expense';
          const amt = Number(tx.amount) || 0;
          const sign = isExp ? '- ' : '+ ';
          const color = isExp ? '#f43f5e' : '#10b981';
          const memberAvatar = MEMBER_AVATARS[tx.member] || null;

          let avatarHtml = memberAvatar
            ? `<img src="${memberAvatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">`
            : `<i class="fa-solid fa-user" style="font-size: 0.7rem; color: #38bdf8;"></i>`;

          let receiptBadge = '';
          if (tx.receipt) {
            receiptBadge = `
              <span class="ops-tx-chip" onclick="openReceiptLightbox('${tx.id}')" style="background: rgba(236, 72, 153, 0.18); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.35); cursor: pointer;" title="عرض الفاتورة المرفقة">
                <i class="fa-solid fa-file-invoice"></i> فاتورة
              </span>
            `;
          }

          const card = document.createElement('div');
          card.className = 'ops-tx-card-lux';
          card.setAttribute('data-tx-id', tx.id);
          card.title = 'اضغط مرتين لعرض التفاصيل وتعديل العملية';
          card.ondblclick = (e) => {
            e.stopPropagation();
            openEditTxModal(tx.id);
          };
          let lastTouchOps = 0;
          card.addEventListener('touchend', (e) => {
            if (e.target.closest('.ops-tx-del-btn') || e.target.closest('.ops-tx-edit-btn') || e.target.closest('[onclick*="openReceiptLightbox"]')) return;
            const now = Date.now();
            if (now - lastTouchOps < 350) {
              e.preventDefault();
              openEditTxModal(tx.id);
            }
            lastTouchOps = now;
          });
          card.innerHTML = `
            <div class="ops-tx-right-cluster">
              <div class="ops-tx-icon-bubble" style="background: linear-gradient(135deg, ${cat.color}, ${cat.color}99); color: #ffffff;">
                <i class="fa-solid ${cat.icon}"></i>
              </div>
              <div class="ops-tx-info-block">
                <div class="ops-tx-label-text" title="${escapeHtml(tx.label || cat.name)}">
                  ${escapeHtml(tx.label || cat.name)}
                </div>
                <div class="ops-tx-meta-chips">
                  <span class="ops-tx-chip" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25);">
                    ${avatarHtml}
                    <span>${tx.member || 'العائلة'}</span>
                  </span>
                  <span class="ops-tx-chip" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);">
                    <i class="fa-solid fa-vault"></i>
                    <span>${getWalletName(tx.walletId)}</span>
                  </span>
                  ${receiptBadge}
                </div>
              </div>
            </div>
            <div class="ops-tx-left-cluster">
              <span class="ops-tx-amount-text" style="color: ${color};">
                ${sign}${formatMoney(amt)}
              </span>
              <button class="ops-tx-edit-btn" onclick="openEditTxModal('${tx.id}')" title="تعديل وتفاصيل الحركة" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 4px; transition: all 0.2s;">
                <i class="fa-solid fa-pen-to-square" style="font-size: 0.76rem;"></i>
              </button>
              <button class="ops-tx-del-btn" onclick="deleteTx('${tx.id}')" title="حذف الحركة">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          `;
          container.appendChild(card);
        });
      }

      // زر عرض المزيد إن وجد حركات إضافية
      if (totalCount > opsRenderLimit) {
        const remaining = totalCount - opsRenderLimit;
        const loadMoreBox = document.createElement('div');
        loadMoreBox.id = 'btnLoadMoreOps';
        loadMoreBox.style.cssText = 'text-align: center; margin: 16px 0 24px;';
        loadMoreBox.innerHTML = `
          <button type="button" class="btn-export-tool" onclick="loadMoreOperations()" style="padding: 10px 24px; font-size: 0.82rem; font-weight: 800; background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
            <i class="fa-solid fa-angles-down"></i> عرض 50 حركة إضافية (المتبقي: ${remaining.toLocaleString()} عملية)
          </button>
        `;
        container.appendChild(loadMoreBox);
      }
    }

        function loadMoreOperations() {
      opsRenderLimit = (opsRenderLimit || 50) + 50;
      const filtered = getFilteredTransactions();
      filterOperationsList();
    }

function filterOperationsList() {
      const inp = document.getElementById('opsSearchInput');
      state.searchQuery = inp ? inp.value.trim() : '';
      // نمرر دائماً كافة العمليات من state.transactions حتى تظهر العمليات الجديدة فوراً دون حجب
      renderOperationsList(state.transactions || []);
    }

    // =========================================================================
    // اختيار أفراد العائلة (Persistent Filter Across All Pages)
    // =========================================================================
    function selectMember(member) {
      state.currentMemberFilter = member;
      state.selectedMember = member;

      // تنبيه: اختيار فرد من الشريط العلوي هو فلترة بصرية فقط ولا يغير حساب المستخدم المسجل دخوله
      // منفذ العملية يظل دائماً صاحب الحساب المسجل به الدخول حالياً (state.currentUser)

      // تحديث تمييز الأفاتار المختار في الشريط العلوي الثابت بحلقة ذهبية متوهجة وتأثير بارز
      const cards = document.querySelectorAll('.avatar-card');
      cards.forEach(c => {
        if (c.getAttribute('data-member') === member) c.classList.add('active');
        else c.classList.remove('active');
      });

      if (typeof updateUserAndDefaultDisplay === 'function') {
        updateUserAndDefaultDisplay();
      }

      // إعادة رسم وتحديث كافة صفحات البرنامج فوراً
      renderUI();

      let memberDisplayName = member;
      if (member === 'الكل') memberDisplayName = 'كافة المصروفات (إجمالي عام)';
      else if (member === 'البيت') memberDisplayName = 'مصروفات وتكاليف البيت';
      showToast(`👤 تم تصفية العرض على: ${memberDisplayName}`);
    }

    // =========================================================================
    // نافذة تسجيل حركة جديدة (Tx Modal with Inline Calc, Default Family & Receipt)
    // =========================================================================
    function openTxModal(type = 'expense', preCat = null) {
      currentModalType = type;
      const titleEl = document.getElementById('txModalTitleText');
      const iconEl = document.getElementById('txModalTitleIcon');
      const bannerEl = document.getElementById('txNatureBanner');
      const bannerTxt = document.getElementById('txNatureText');
      const btnSaveTxt = document.getElementById('btnSaveTxText');
      const memberSel = document.getElementById('inpTxMember');
      const catSel = document.getElementById('inpTxCategory');
      const amountInp = document.getElementById('inpTxAmount');
      const labelInp = document.getElementById('inpTxLabel');
      const dateInp = document.getElementById('inpTxDate');

      if (amountInp) amountInp.value = '';
      if (labelInp) labelInp.value = '';
      if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];
      clearReceiptUpload();

      if (catSel) {
        catSel.innerHTML = '';
        const list = (type === 'income') ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        list.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = `${c.name}`;
          catSel.appendChild(opt);
        });
        if (preCat) catSel.value = preCat;
      }

      // الديفولت الأوتوماتيكي:
      // عند فتح تسجيل مصروف جديد في حالة عدم اختيار شخص يكون الافتراضي هو "البيت"
      if (memberSel) {
        let defMember = 'البيت';
        if (type === 'expense') {
          if (state.currentMemberFilter && state.currentMemberFilter !== 'الكل') {
            defMember = state.currentMemberFilter;
          } else {
            defMember = 'البيت';
          }
        } else {
          defMember = (state.currentMemberFilter && state.currentMemberFilter !== 'الكل') ? state.currentMemberFilter : 'ماهر';
        }
        memberSel.value = defMember;
        if (typeof selectTxMemberPicker === 'function') {
          selectTxMemberPicker(defMember);
        }
      }

      const execBadge = document.getElementById('txModalExecutorBadge');
      if (execBadge) execBadge.textContent = state.currentUser || 'ماهر';

      if (type === 'income') {
        if (titleEl) titleEl.textContent = 'تسجيل دخل جديد';
        if (iconEl) { iconEl.className = 'fa-solid fa-circle-plus'; iconEl.style.color = '#10b981'; }
        if (bannerEl) bannerEl.className = 'tx-nature-banner income-nature';
        if (bannerTxt) bannerTxt.textContent = 'أنت الآن تسجل (دخل / إيداع وارد) - يضاف إلى الرصيد والمحفظة';
        if (btnSaveTxt) btnSaveTxt.textContent = 'حفظ الدخل فوراً';
      } else {
        if (titleEl) titleEl.textContent = 'تسجيل مصروف جديد';
        if (iconEl) { iconEl.className = 'fa-solid fa-circle-minus'; iconEl.style.color = '#ef4444'; }
        if (bannerEl) bannerEl.className = 'tx-nature-banner expense-nature';
        if (bannerTxt) bannerTxt.textContent = 'أنت الآن تسجل (مصروف / خصم خارج) - يخصم من الرصيد والمحفظة';
        if (btnSaveTxt) btnSaveTxt.textContent = 'حفظ المصروف فوراً';
      }

      openModal('txModal');
    }

    function handleSaveTx() {
      const amountInp = document.getElementById('inpTxAmount');
      const labelInp = document.getElementById('inpTxLabel');
      const catInp = document.getElementById('inpTxCategory');
      const memberInp = document.getElementById('inpTxMember');
      const walletInp = document.getElementById('inpTxWallet');
      const dateInp = document.getElementById('inpTxDate');
      const errHint = document.getElementById('txLabelError');

      const amount = parseFloat(amountInp ? amountInp.value : 0);
      const label = labelInp ? labelInp.value.trim() : '';

      if (isNaN(amount) || amount <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ صحيح أكبر من الصفر');
        if (amountInp) amountInp.focus();
        return;
      }

      if (!label) {
        if (errHint) errHint.style.display = 'block';
        if (labelInp) {
          labelInp.focus();
          labelInp.classList.add('error');
        }
        showToast('⚠️ بيان الحركة إلزامي لتسجيل المصروف أو الدخل!');
        return;
      }
      if (errHint) errHint.style.display = 'none';

      const localToday = typeof getLocalDateStr === 'function' ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0];
      const newTx = {
        id: 'tx-' + Date.now(),
        type: currentModalType,
        amount: amount,
        label: label,
        category: catInp ? catInp.value : 'other',
        member: (memberInp && memberInp.value) ? memberInp.value : (state.selectedMember !== 'الكل' ? state.selectedMember : 'البيت'),
        walletId: walletInp && walletInp.value ? walletInp.value : (state.currentWalletId !== 'all' ? state.currentWalletId : 'wallet-cash-safe'),
        date: dateInp && dateInp.value ? dateInp.value : localToday,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        author: state.currentUser || 'ماهر',
        receipt: state.pendingReceiptDataUri || null
      };

      // إضافة إشعار ذكي مرتبط بالحركة فوراً
      if (typeof addSystemNotification === 'function') {
        addSystemNotification({
          type: currentModalType,
          title: currentModalType === 'income' ? 'إيداع جديد تم تسجيله' : 'مصروف جديد تم تسجيله',
          body: `${label} بمبلغ ${formatMoney(amount)} (${newTx.member})`,
          txId: newTx.id
        });
      }

      state.transactions.unshift(newTx);
      saveTx();
      // ضمان ظهور الحركة الجديدة فوراً في صفحة العمليات المسجلة بإزالة أي حجب مؤقت
      try {
        const opsSearch = document.getElementById('opsSearchInput');
        if (opsSearch) opsSearch.value = '';
        state.searchQuery = '';
        opsTypeFilterState = 'all';
        const typeChips = document.querySelectorAll('.ops-type-chip');
        typeChips.forEach(c => {
          if (c.getAttribute('data-type') === 'all') c.classList.add('active');
          else c.classList.remove('active');
        });
        const catFilter = document.getElementById('opsFilterCategory');
        if (catFilter) catFilter.value = 'all';
        const memFilter = document.getElementById('opsFilterMember');
        if (memFilter) memFilter.value = 'all';
      } catch(e) {}

      logActivity({
        type: currentModalType === 'income' ? 'add_income' : 'add_expense',
        action: currentModalType === 'income' ? 'إضافة دخل' : 'تسجيل مصروف',
        label: `${label} (${getCategoryName(newTx.category)})`,
        amount: amount,
        sign: currentModalType === 'income' ? '+' : '-',
        member: newTx.member,
        author: state.currentUser || 'ماهر',
        wallet: (typeof getWalletName === 'function' ? getWalletName(newTx.walletId) : newTx.walletId),
        category: (typeof getCategoryName === 'function' ? getCategoryName(newTx.category) : newTx.category),
        receipt: newTx.receipt,
        notes: `مسجل في محفظة: ${(typeof getWalletName === 'function' ? getWalletName(newTx.walletId) : newTx.walletId)}`
      });

      playNotificationChime();
      closeModal('txModal');
      renderUI();
      
      addSystemNotification({
        type: currentModalType,
        title: currentModalType === 'income' ? 'إيداع / دخل جديد' : 'تسجيل مصروف جديد',
        body: `${label} بمبلغ ${amount} ج.م (${getCategoryName(newTx.category)}) بواسطة ${newTx.author || 'ماهر'}`,
        txId: newTx.id
      });
      filterOperationsList();
      showToast(`✅ تم حفظ ${currentModalType === 'income' ? 'الدخل' : 'المصروف'} بنجاح: ${amount} ج.م`);
    }

    function deleteTx(id) {
      const tx = state.transactions.find(t => t.id === id);
      if (!tx) return;
      if (confirm(`هل أنت متأكد من حذف حركة: "${tx.label}" بمبلغ (${tx.amount} ج.م)؟`)) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveTx();

        logActivity({
          type: 'delete_tx',
          action: 'حذف حركة',
          label: `حذف: ${tx.label} (${tx.type === 'income' ? 'دخل' : 'مصروف'})`,
          amount: tx.amount,
          member: tx.member,
          author: state.currentUser || 'ماهر'
        });

        renderUI();
        showToast('🗑️ تم حذف الحركة بنجاح');
      }
    }

        // دالة توحيد وترقية معرفات المحافظ للعمليات التاريخية
    function normalizeWalletId(wId) {
      if (!wId) return 'wallet-cash-safe';
      if (wId === 'wallet-cash-safe' || wId === 'wallet-default' || wId === 'wallet-home-cash') return 'wallet-cash-safe';
      if (wId === 'wallet-vodafone') return 'wallet-vodafone';
      if (wId === 'wallet-reserve' || wId === 'wallet-bank-misr') return 'wallet-reserve';
      if (wId === 'wallet-other' || wId === 'wallet-instapay' || wId === 'wallet-cib-credit') return 'wallet-other';
      if (wId === 'wallet-ahly') return 'wallet-cash-safe';
      return 'wallet-cash-safe';
    }

    function saveTx() {
      if (typeof triggerDriveAutoSync === "function") triggerDriveAutoSync();

      try {
        localStorage.setItem('family_monefy_v2_tx', JSON.stringify(state.transactions));
      } catch(e) {
        console.warn('LocalStorage limit exceeded, data retained in active memory state:', e);
      }
      try {
        syncChannel.postMessage({
          type: 'SYNC_TRANSACTIONS',
          transactions: state.transactions.slice(0, 500),
          sender: state.currentUser
        });
      } catch(e) {}
    }

    // =========================================================================
    // إدارة رفع وتصوير الفواتير (Receipt Camera / Upload)
    // =========================================================================
    function handleReceiptUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let w = img.width;
          let h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUri = canvas.toDataURL('image/jpeg', 0.82);
          state.pendingReceiptDataUri = compressedDataUri;

          const previewImg = document.getElementById('receiptPreviewImg');
          const previewCont = document.getElementById('receiptPreviewContainer');
          const clearBtn = document.getElementById('btnClearReceipt');
          if (previewImg) previewImg.src = compressedDataUri;
          if (previewCont) previewCont.style.display = 'block';
          if (clearBtn) clearBtn.style.display = 'inline-flex';
          const badge = document.getElementById('txPhotoAttachedBadge'); if (badge) badge.style.display = 'inline-flex';
          showToast('📷 تم تحميل صورة الفاتورة بنجاح');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function clearReceiptUpload() {
      state.pendingReceiptDataUri = null;
      const inp = document.getElementById('inpTxReceipt');
      if (inp) inp.value = '';
      const previewCont = document.getElementById('receiptPreviewContainer');
      const clearBtn = document.getElementById('btnClearReceipt');
      if (previewCont) previewCont.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
      const badge = document.getElementById('txPhotoAttachedBadge'); if (badge) badge.style.display = 'none';
    }

    function openReceiptLightbox(source, optionalTitle = '') {
      const lbl = document.getElementById('lightboxTxLabel');
      const img = document.getElementById('lightboxImg');
      const header = document.getElementById('lightboxHeaderTitle');
      if (!img) return;

      if (typeof source === 'string' && (source.startsWith('data:image') || source.startsWith('http') || source.startsWith('blob:'))) {
        if (header) header.textContent = 'معاينة الصورة المرفقة';
        if (lbl) lbl.textContent = optionalTitle || 'مرفق مصور بالملاحظة';
        img.src = source;
        openModal('receiptLightboxModal');
        return;
      }

      const tx = (state.transactions || []).find(t => t.id === source);
      if (!tx || !tx.receipt) {
        showToast('عفواً، لا توجد صورة مرفقة لعرضها');
        return;
      }
      if (header) header.textContent = 'معاينة الفاتورة المرفقة';
      if (lbl) lbl.textContent = `${tx.label} (${formatMoney(tx.amount)})`;
      img.src = tx.receipt;
      openModal('receiptLightboxModal');
    }

    // =========================================================================
    // الآلة الحاسبة المدمجة بجانب خانة المبلغ (Inline Calc Integration)
    // =========================================================================
    
    // =========================================================================
    // محرك الآلة الحاسبة المدمجة والذكية لتسجيل المصاريف والإيرادات
    // =========================================================================
    let txCalcExpr = '0';
    let txCalcCurrentResult = 0;
    let txCalcJustEvaluated = false;

    function toggleTxCalcPad(force) {
      const pad = document.getElementById('txInlineCalcPad');
      if (!pad) return;
      const isOpen = pad.style.display !== 'none';
      const willOpen = force !== undefined ? force : !isOpen;

      if (willOpen) {
        pad.style.display = 'flex';
        const currentAmt = document.getElementById('inpTxAmount')?.value;
        if (currentAmt && !isNaN(parseFloat(currentAmt)) && parseFloat(currentAmt) > 0) {
          txCalcExpr = currentAmt;
          txCalcCurrentResult = parseFloat(currentAmt);
        } else {
          txCalcExpr = '0';
          txCalcCurrentResult = 0;
        }
        txCalcJustEvaluated = false;
        updateTxCalcScreen();
      } else {
        pad.style.display = 'none';
      }
    }

    function updateTxCalcScreen() {
      const formulaEl = document.getElementById('txCalcFormula');
      const resEl = document.getElementById('txCalcResult');
      const badgeEl = document.getElementById('txCalcBadgeVal');

      if (formulaEl) formulaEl.textContent = txCalcExpr;
      const formatted = Number(txCalcCurrentResult || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (resEl) resEl.textContent = formatted;
      if (badgeEl) badgeEl.textContent = formatted;
    }

    function evaluateTxExpr(expr) {
      try {
        const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/%/g, '/100');
        if (!/^[0-9+\-*/. ()]+$/.test(sanitized)) return 0;
        const val = Function(`'use strict'; return (${sanitized});`)();
        return isNaN(val) || !isFinite(val) ? 0 : val;
      } catch (e) {
        return 0;
      }
    }

    function txCalcNum(num) {
      if (txCalcJustEvaluated || txCalcExpr === '0') {
        txCalcExpr = (num === '.') ? '0.' : num;
        txCalcJustEvaluated = false;
      } else {
        if (num === '.' && txCalcExpr.endsWith('.')) return;
        txCalcExpr += num;
      }
      txCalcCurrentResult = evaluateTxExpr(txCalcExpr);
      updateTxCalcScreen();
    }

    function txCalcOp(op) {
      txCalcJustEvaluated = false;
      const lastChar = txCalcExpr.slice(-1);
      if (['+', '-', '*', '/', '%'].includes(lastChar)) {
        txCalcExpr = txCalcExpr.slice(0, -1) + op;
      } else {
        txCalcExpr += op;
      }
      updateTxCalcScreen();
    }

    function txCalcClear() {
      txCalcExpr = '0';
      txCalcCurrentResult = 0;
      txCalcJustEvaluated = false;
      updateTxCalcScreen();
    }

    function txCalcBackspace() {
      if (txCalcExpr.length > 1) {
        txCalcExpr = txCalcExpr.slice(0, -1);
      } else {
        txCalcExpr = '0';
      }
      txCalcCurrentResult = evaluateTxExpr(txCalcExpr);
      updateTxCalcScreen();
    }

    function txCalcEquals() {
      txCalcCurrentResult = evaluateTxExpr(txCalcExpr);
      txCalcExpr = Number(txCalcCurrentResult).toFixed(2);
      txCalcJustEvaluated = true;
      updateTxCalcScreen();
    }

    function applyTxCalcResult() {
      txCalcEquals();
      const num = txCalcCurrentResult;
      if (num > 0) {
        const inp = document.getElementById('inpTxAmount');
        if (inp) {
          inp.value = num.toFixed(2);
          inp.focus();
        }
        toggleTxCalcPad(false);
        const labelInp = document.getElementById('inpTxLabel');
        if (labelInp) labelInp.focus();
        showToast(`🔢 تم إدراج المبلغ (${num.toFixed(2)} ج.م) في خانة المبلغ`);
      } else {
        showToast('⚠️ الرجاء حساب أو كتابة مبلغ صحيح أكبر من الصفر أولاً');
      }
    }

    function openInlineCalcForTx() {
      toggleTxCalcPad(true);
    }


    // =========================================================================
    // نظام التوزيع والتخصيص المتعدد لطلبات المصروف (Multi-Allocation Builder)
    // =========================================================================
    let currentRequestAllocations = [
      { amount: 0, category: 'daily', member: 'أية' }
    ];

    // مزامنة مؤشر السلايدر التفاعلي للمبلغ المطلوب (100 ج.م لكل خطوة)
    function syncReqAmountFromRange(val) {
      const inp = document.getElementById('inpReqAmount');
      const lbl = document.getElementById('lblReqSliderVal');
      const num = parseFloat(val) || 0;
      if (inp) {
        inp.value = num > 0 ? num : '';
      }
      if (lbl) {
        lbl.textContent = (typeof formatMoney === 'function') ? formatMoney(num) : num + ' ج.م';
      }
      initRequestAllocations();
    }

    // تعديل المبلغ بمقدار 100 جنيه لكل ضغطة على المؤشر أو الأزرار
    function adjustReqAmount(delta) {
      const inp = document.getElementById('inpReqAmount');
      const rng = document.getElementById('rngReqAmount');
      const lbl = document.getElementById('lblReqSliderVal');
      if (!inp) return;
      let cur = parseFloat(inp.value) || 0;
      let next = Math.max(0, Math.round((cur + delta) / 100) * 100);
      inp.value = next > 0 ? next : '';
      if (rng) rng.value = Math.min(25000, next);
      if (lbl) lbl.textContent = (typeof formatMoney === 'function') ? formatMoney(next) : next + ' ج.م';
      initRequestAllocations();
    }

    // تعديل تخصيص كل سطر بمقدار 100 جنيه
    function adjustAllocRowAmount(idx, delta) {
      if (!currentRequestAllocations[idx]) return;
      let cur = parseFloat(currentRequestAllocations[idx].amount) || 0;
      let next = Math.max(0, Math.round((cur + delta) / 100) * 100);
      currentRequestAllocations[idx].amount = next;
      renderRequestAllocations();
    }

    function initRequestAllocations() {
      const amtInp = document.getElementById('inpReqAmount');
      const rng = document.getElementById('rngReqAmount');
      const lbl = document.getElementById('lblReqSliderVal');
      const val = parseFloat(amtInp ? amtInp.value : 0) || 0;
      if (rng && document.activeElement !== rng) {
        rng.value = Math.min(25000, val);
      }
      if (lbl) {
        lbl.textContent = (typeof formatMoney === 'function') ? formatMoney(val) : val + ' ج.م';
      }
      const currentMember = document.getElementById('inpReqMember')?.value || 'أية';
      if (currentRequestAllocations.length === 0) {
        currentRequestAllocations = [{ amount: val, category: 'daily', member: currentMember }];
      } else if (currentRequestAllocations.length === 1) {
        currentRequestAllocations[0].amount = val;
        currentRequestAllocations[0].member = currentMember;
      }
      renderRequestAllocations();
    }

    function addRequestAllocationRow(amount = 0, category = 'daily', member = 'أية') {
      const totalRequested = parseFloat(document.getElementById('inpReqAmount')?.value || 0) || 0;
      let alreadyAllocated = 0;
      currentRequestAllocations.forEach(a => alreadyAllocated += (parseFloat(a.amount) || 0));
      const remaining = Math.max(0, totalRequested - alreadyAllocated);
      const initAmt = amount > 0 ? amount : remaining;

      currentRequestAllocations.push({
        amount: initAmt,
        category: category,
        member: member
      });
      renderRequestAllocations();
    }

    function removeRequestAllocationRow(idx) {
      if (currentRequestAllocations.length <= 1) {
        showToast('⚠️ يجب الإبقاء على سطر توزيع واحد على الأقل');
        return;
      }
      currentRequestAllocations.splice(idx, 1);
      renderRequestAllocations();
    }

    function updateRequestAllocationRow(idx, field, value) {
      if (!currentRequestAllocations[idx]) return;
      if (field === 'amount') {
        currentRequestAllocations[idx].amount = parseFloat(value) || 0;
      } else {
        currentRequestAllocations[idx][field] = value;
      }
      updateRequestAllocationBalances();
    }

    function updateRequestAllocationBalances() {
      const totalRequested = parseFloat(document.getElementById('inpReqAmount')?.value || 0) || 0;
      let allocatedSum = 0;
      (currentRequestAllocations || []).forEach(a => allocatedSum += (parseFloat(a.amount) || 0));
      const remaining = totalRequested - allocatedSum;

      const statusBadge = document.getElementById('allocMatchStatus');
      const summaryEl = document.getElementById('reqAllocSummaryTxt');
      const progressEl = document.getElementById('reqAllocProgressBar');

      const pct = totalRequested > 0 ? ((allocatedSum / totalRequested) * 100).toFixed(0) : 0;

      if (statusBadge) {
        if (totalRequested <= 0) {
          statusBadge.innerHTML = '<span style="color: #94a3b8;"><i class="fa-solid fa-pen"></i> حدد المبلغ أولاً</span>';
          statusBadge.style.background = 'rgba(255,255,255,0.06)';
          statusBadge.style.borderColor = 'rgba(255,255,255,0.15)';
        } else if (Math.abs(remaining) < 0.01) {
          statusBadge.innerHTML = `<span style="color: #10b981;"><i class="fa-solid fa-circle-check"></i> ✔ متطابق 100% (${formatMoney(totalRequested)})</span>`;
          statusBadge.style.background = 'rgba(16, 185, 129, 0.16)';
          statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.45)';
        } else if (remaining > 0) {
          statusBadge.innerHTML = `<span style="color: #fbbf24;"><i class="fa-solid fa-triangle-exclamation"></i> ⚠️ متبقي غير موزع: ${formatMoney(remaining)} (${pct}% / 100%)</span>`;
          statusBadge.style.background = 'rgba(245, 158, 11, 0.16)';
          statusBadge.style.borderColor = 'rgba(245, 158, 11, 0.45)';
        } else {
          statusBadge.innerHTML = `<span style="color: #f43f5e;"><i class="fa-solid fa-circle-xmark"></i> ❌ تجاوز للمطلوب بـ: ${formatMoney(Math.abs(remaining))} (${pct}% / 100%)</span>`;
          statusBadge.style.background = 'rgba(244, 63, 94, 0.16)';
          statusBadge.style.borderColor = 'rgba(244, 63, 94, 0.45)';
        }
      }

      if (summaryEl) {
        summaryEl.innerHTML = `المبلغ المطلوب: <strong>${formatMoney(totalRequested)}</strong> | الموزع: <strong>${formatMoney(allocatedSum)}</strong> (${pct}%)`;
      }

      if (progressEl) {
        const barPct = totalRequested > 0 ? Math.min(100, Math.max(0, (allocatedSum / totalRequested) * 100)) : 0;
        progressEl.style.width = barPct + '%';
        progressEl.style.background = (remaining < -0.01) ? '#f43f5e' : (Math.abs(remaining) < 0.01 ? '#10b981' : '#fbbf24');
      }
    }

    // إدارة التقاط ورفع صور وفواتير طلب المصروف
    function handleRequestPhotoUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        if (file.type && file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxDim = 600;
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);

            state.pendingRequestPhotoDataUri = compressed;

            const previewImg = document.getElementById('reqPhotoPreviewImg');
            const previewCont = document.getElementById('reqPhotoPreviewContainer');
            const badge = document.getElementById('reqPhotoStatusBadge');
            const fileNameEl = document.getElementById('reqPhotoFileName');

            if (previewImg) previewImg.src = compressed;
            if (previewCont) previewCont.style.display = 'flex';
            if (badge) badge.style.display = 'inline-flex';
            if (fileNameEl) fileNameEl.textContent = file.name || 'صورة ملتقطة بالكاميرا';
            showToast('📸 تم تجهيز صورة المستند للطلب بنجاح');
          };
          img.src = e.target.result;
        } else {
          // ملف مستند PDF أو غيره
          state.pendingRequestPhotoDataUri = e.target.result;
          const previewCont = document.getElementById('reqPhotoPreviewContainer');
          const badge = document.getElementById('reqPhotoStatusBadge');
          const fileNameEl = document.getElementById('reqPhotoFileName');
          if (previewCont) previewCont.style.display = 'flex';
          if (badge) badge.style.display = 'inline-flex';
          if (fileNameEl) fileNameEl.textContent = file.name || 'مستند مرفق';
          showToast('📄 تم إرفاق المستند بنجاح');
        }
      };
      reader.readAsDataURL(file);
    }

    function removeRequestPhoto() {
      state.pendingRequestPhotoDataUri = null;
      const previewCont = document.getElementById('reqPhotoPreviewContainer');
      const badge = document.getElementById('reqPhotoStatusBadge');
      const camInp = document.getElementById('inpReqCameraPhoto');
      const docInp = document.getElementById('inpReqDocFile');
      if (previewCont) previewCont.style.display = 'none';
      if (badge) badge.style.display = 'none';
      if (camInp) camInp.value = '';
      if (docInp) docInp.value = '';
    }

    function renderRequestAllocations() {
      const container = document.getElementById('reqAllocationsRowsContainer');
      if (!container) return;
      container.innerHTML = '';

      const catOptions = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).map(c => 
        `<option value="${c.id}">${c.name}</option>`
      ).join('');

      const memberOptions = ['البيت', 'ماهر', 'أية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'أخرى'].map(m => 
        `<option value="${m}">${m}</option>`
      ).join('');

      currentRequestAllocations.forEach((alloc, idx) => {
        const card = document.createElement('div');
        card.className = 'req-alloc-card-item';
        card.style.cssText = 'background: rgba(30, 41, 59, 0.65); border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 10px; padding: 7px 9px; display: flex; flex-direction: column; gap: 5px;';
        
        card.innerHTML = `
          <!-- السطر الأول: التصنيف والمستفيد -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>
              <div style="font-size: 0.64rem; color: #94a3b8; font-weight: 700; margin-bottom: 1px;">التصنيف:</div>
              <select class="form-select-custom" style="height: 32px; font-size: 0.75rem; padding: 2px 6px; border-radius: 7px; width: 100%; box-sizing: border-box;" onchange="updateRequestAllocationRow(${idx}, 'category', this.value)">
                ${catOptions}
              </select>
            </div>
            <div>
              <div style="font-size: 0.64rem; color: #94a3b8; font-weight: 700; margin-bottom: 1px;">يخص من:</div>
              <select class="form-select-custom" style="height: 32px; font-size: 0.75rem; padding: 2px 6px; border-radius: 7px; width: 100%; box-sizing: border-box;" onchange="updateRequestAllocationRow(${idx}, 'member', this.value)">
                ${memberOptions}
              </select>
            </div>
          </div>
          <!-- السطر الثاني: المبلغ المخصص مع مؤشر التدريج وزر الحذف -->
          <div style="display: flex; gap: 6px; align-items: flex-end;">
            <div style="flex: 1;">
              <div style="font-size: 0.64rem; color: #94a3b8; font-weight: 700; margin-bottom: 1px;">المبلغ المخصص (ج.م) [±100]:</div>
              <div style="display: flex; align-items: center; gap: 3px;">
                <button type="button" onclick="adjustAllocRowAmount(${idx}, -100)" class="btn-item-action" style="height: 32px; width: 28px; min-width: 28px; padding: 0; font-size: 0.95rem; font-weight: 900; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="إنقاص 100 ج.م">-</button>
                <input type="number" step="100" min="0" class="form-input-custom" value="${alloc.amount > 0 ? alloc.amount : ''}" placeholder="0.00 ج.م" style="height: 32px; font-size: 0.95rem; font-weight: 900; text-align: center; padding: 2px 6px; border-radius: 7px; color: #38bdf8; flex: 1; min-width: 0; box-sizing: border-box;" oninput="updateRequestAllocationRow(${idx}, 'amount', this.value)">
                <button type="button" onclick="adjustAllocRowAmount(${idx}, 100)" class="btn-item-action" style="height: 32px; width: 28px; min-width: 28px; padding: 0; font-size: 0.95rem; font-weight: 900; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="زيادة 100 ج.م">+</button>
              </div>
            </div>
            <button type="button" onclick="removeRequestAllocationRow(${idx})" class="btn-item-action btn-item-reject" style="height: 32px; padding: 0 10px; font-size: 0.72rem; border-radius: 7px; flex: 0 0 auto; gap: 4px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;" title="حذف هذا التخصيص">
              <i class="fa-solid fa-trash-can"></i> حذف
            </button>
          </div>
        `;

        const selects = card.querySelectorAll('select');
        if (selects[0]) selects[0].value = alloc.category || 'daily';
        if (selects[1]) selects[1].value = alloc.member || 'أية';

        container.appendChild(card);
      });

      updateRequestAllocationBalances();
    }

    
    // =========================================================================
    // إدارة تبويبات طلبات المصروف والالتزامات المتوقعة (Two-Button Switchers)
    // =========================================================================
    function switchRequestTab(tab) {
      const pNew = document.getElementById('panelNewRequest');
      const pList = document.getElementById('panelListRequests');
      const bNew = document.getElementById('btnTabNewRequest');
      const bList = document.getElementById('btnTabListRequests');

      if (tab === 'new') {
        if (pNew) pNew.style.display = 'block';
        if (pList) pList.style.display = 'none';
        if (bNew) {
          bNew.style.background = 'linear-gradient(135deg, #ec4899, #be185d)';
          bNew.style.color = '#fff';
          bNew.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.35)';
        }
        if (bList) {
          bList.style.background = 'transparent';
          bList.style.color = '#94a3b8';
          bList.style.boxShadow = 'none';
        }
      } else {
        if (pNew) pNew.style.display = 'none';
        if (pList) pList.style.display = 'block';
        if (bList) {
          bList.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bList.style.color = '#fff';
          bList.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
        }
        if (bNew) {
          bNew.style.background = 'transparent';
          bNew.style.color = '#94a3b8';
          bNew.style.boxShadow = 'none';
        }
        if (typeof renderRequestsList === 'function') {
          renderRequestsList();
        }
      }
    }

    function switchExpectedTab(tab) {
      const pNew = document.getElementById('panelNewExpected');
      const pList = document.getElementById('panelListExpected');
      const bNew = document.getElementById('btnTabNewExpected');
      const bList = document.getElementById('btnTabListExpected');

      if (tab === 'new') {
        if (pNew) pNew.style.display = 'block';
        if (pList) pList.style.display = 'none';
        if (bNew) {
          bNew.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bNew.style.color = '#fff';
          bNew.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
        }
        if (bList) {
          bList.style.background = 'transparent';
          bList.style.color = '#94a3b8';
          bList.style.boxShadow = 'none';
        }
        if (typeof renderMemberPhotoPickers === 'function') {
          renderMemberPhotoPickers();
        }
      } else {
        if (pNew) pNew.style.display = 'none';
        if (pList) pList.style.display = 'block';
        if (bList) {
          bList.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bList.style.color = '#fff';
          bList.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
        }
        if (bNew) {
          bNew.style.background = 'transparent';
          bNew.style.color = '#94a3b8';
          bNew.style.boxShadow = 'none';
        }
        renderExpectedList();
      }
    }

    function submitMoneyRequest() {
      const memSel = document.getElementById('inpReqMember');
      const amtInp = document.getElementById('inpReqAmount');
      const rsnInp = document.getElementById('inpReqReason');
      const dateInp = document.getElementById('inpReqDate');

      const member = memSel ? memSel.value : 'أية';
      const amount = parseFloat(amtInp ? amtInp.value : 0);
      const reason = rsnInp ? rsnInp.value.trim() : '';
      const reqDate = dateInp && dateInp.value ? dateInp.value : new Date().toISOString().split('T')[0];

      if (isNaN(amount) || amount <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ صحيح للطلب');
        if (amtInp) amtInp.focus();
        return;
      }
      if (!reason) {
        showToast('⚠️ الرجاء توضيح سبب وتفاصيل الطلب');
        if (rsnInp) rsnInp.focus();
        return;
      }

      // التدقيق الحسابي الإلزامي الصارم: التحقق من توزيع كامل المبلغ المطلوب بنسبة 100% على البنود
      let allocatedSum = 0;
      const validAllocations = (currentRequestAllocations || []).map(a => {
        const amt = parseFloat(a.amount) || 0;
        allocatedSum += amt;
        return {
          amount: amt,
          category: a.category || 'daily',
          member: a.member || member
        };
      }).filter(a => a.amount > 0);

      const diff = Math.round((amount - allocatedSum) * 100) / 100;
      if (Math.abs(diff) >= 0.01) {
        if (diff > 0) {
          showToast(`❌ لا يمكن إرسال الطلب: لم يتم توزيع كامل المبلغ! متبقي غير موزع (${formatMoney(diff)}) يجب توزيعه بالكامل على البنود.`);
        } else {
          showToast(`❌ لا يمكن إرسال الطلب: مجموع البنود الموزعة يتجاوز المبلغ المطلوب بـ (${formatMoney(Math.abs(diff))}).`);
        }
        const badge = document.getElementById('allocMatchStatus');
        if (badge) {
          badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      if (validAllocations.length === 0) {
        showToast('⚠️ الرجاء إضافة بند توزيع واحد على الأقل بالمبلغ المطلوب');
        return;
      }

      const newReq = {
        id: 'req-' + Date.now(),
        member: member,
        amount: amount,
        reason: reason,
        date: reqDate,
        category: validAllocations[0] ? validAllocations[0].category : 'others',
        allocations: validAllocations,
        photo: state.pendingRequestPhotoDataUri || null,
        status: 'pending',
        createdBy: member,
        timestamp: new Date().toLocaleString('ar-EG')
      };

      state.moneyRequests.unshift(newReq);
      try {
        localStorage.setItem('family_monefy_requests', JSON.stringify(state.moneyRequests));
      } catch(e) {}

      if (amtInp) amtInp.value = '';
      if (rsnInp) rsnInp.value = '';
      removeRequestPhoto();
      const rngEl = document.getElementById('rngReqAmount'); if (rngEl) rngEl.value = 0;
      const lblEl = document.getElementById('lblReqSliderVal'); if (lblEl) lblEl.textContent = '0 ج.م';
      currentRequestAllocations = [{ amount: 0, category: 'daily', member: 'أية' }];
      renderRequestAllocations();

      logActivity({
        type: 'request_created',
        action: 'طلب مصروف جديد',
        label: `طلب ${member} مبلغ ${amount} ج.م لـ: ${reason}`,
        amount: amount,
        member: member,
        author: member
      });

      playNotificationChime();
      logActivity({
        type: 'submit_request',
        action: 'تقديم طلب مصروف',
        label: `طلب مصروف: ${reason}`,
        amount: amount,
        member: member,
        author: state.currentUser || 'ماهر',
        receipt: (typeof currentRequestPhotoDataUri !== 'undefined' ? currentRequestPhotoDataUri : null),
        notes: `تاريخ الطلب: ${reqDate}`
      });

      renderRequestsList();
      showToast(`💌 تم إرسال طلب المصروف بنجاح (${formatMoney(amount)}) وتوزيعه بالكامل!`);
      triggerDriveAutoSync();
    }

    function renderRequestsList() {
      const container = document.getElementById('requestsListContainer');
      const badge = document.getElementById('reqPendingCountBadge');
      if (!container) return;

      let list = state.moneyRequests || [];
      if (state.currentMemberFilter && state.currentMemberFilter !== 'الكل') {
        list = list.filter(r => r.member === state.currentMemberFilter || (state.currentMemberFilter === 'البيت' && (r.member === 'البيت' || r.member === 'العائلة')));
      }

      const pendingCount = list.filter(r => r.status === 'pending').length;
      if (badge) badge.textContent = `${pendingCount} معلق`;
      const tabBadge = document.getElementById('reqPendingBadgeTab');
      if (tabBadge) tabBadge.textContent = `${pendingCount}`;

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 20px 10px;">
            <i class="fa-solid fa-hand-holding-dollar" style="color: #ec4899;"></i>
            <div class="empty-title">لا توجد طلبات مصروف حالية</div>
            <div class="empty-desc">يمكن لأية أو أي فرد في العائلة تقديم طلب مصروف مع تحديد التوزيع التقديري</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      list.forEach(req => {
        const card = document.createElement('div');
        card.className = 'item-entry-card';

        let statusBadge = '';
        if (req.status === 'pending') {
          statusBadge = `<span class="status-badge-pending"><i class="fa-solid fa-hourglass-half"></i> قيد الانتظار</span>`;
        } else if (req.status === 'approved') {
          statusBadge = `<span class="status-badge-approved"><i class="fa-solid fa-circle-check"></i> تم الصرف والموافقة</span>`;
        } else {
          statusBadge = `<span class="status-badge-rejected"><i class="fa-solid fa-circle-xmark"></i> مرفوض</span>`;
        }

        // شارات التوزيعات المتعددة
        let allocChipsHtml = '';
        if (req.allocations && Array.isArray(req.allocations) && req.allocations.length > 0) {
          allocChipsHtml = req.allocations.map(a => {
            const cObj = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).find(c => c.id === a.category) || { name: 'مصروف', icon: 'fa-tag', color: '#38bdf8' };
            return `
              <span style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.28); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid ${cObj.icon}"></i> ${cObj.name} (${a.member}): <strong>${formatMoney(a.amount)}</strong>
              </span>
            `;
          }).join('');
        }

        card.innerHTML = `
          <div class="item-entry-header">
            <div class="item-entry-title">
              <span class="item-member-tag">👤 ${escapeHtml(req.member || 'العائلة')}</span>
              <strong>${Number(req.amount || 0).toLocaleString('en-US')} ج.م</strong>
            </div>
            ${statusBadge}
          </div>

          <div class="item-entry-reason">
            ${escapeHtml(req.reason)}
          </div>

          <!-- شارات بنود التوزيع التقديرية المدمجة -->
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px;">
            ${allocChipsHtml}
            <span style="background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); padding: 2px 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 700;">
              <i class="fa-regular fa-calendar-check"></i> تاريخ الحاجة: ${req.date || 'اليوم'}
            </span>
          </div>

          ${req.photo ? `
            <div style="margin: 5px 0 2px;">
              <a href="${req.photo}" target="_blank" download="request-doc-${req.id}" style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 7px; background: rgba(56, 189, 248, 0.16); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.72rem; font-weight: 800; text-decoration: none;">
                <i class="fa-solid fa-paperclip"></i> عرض المستند / الفاتورة المرفقة
              </a>
            </div>
          ` : ''}

          <div class="item-entry-meta">
            <span><i class="fa-regular fa-clock"></i> تم الطلب: ${req.timestamp || ''}</span>
          </div>
        `;

        if (req.status === 'pending') {
          const actions = document.createElement('div');
          actions.className = 'item-entry-actions';
          actions.innerHTML = `
            <button class="btn-item-action btn-item-approve" onclick="approveRequest('${req.id}')" title="موافقة وصرف وتقسيم الحركات فوراً">
              <i class="fa-solid fa-check"></i> موافقة وصرف فوراً
            </button>
            <button class="btn-item-action btn-item-reject" onclick="rejectRequest('${req.id}')" title="رفض الطلب">
              <i class="fa-solid fa-xmark"></i> رفض
            </button>
          `;
          card.appendChild(actions);
        } else {
          const actions = document.createElement('div');
          actions.className = 'item-entry-actions';
          actions.innerHTML = `
            <button class="btn-item-action btn-item-delete" onclick="deleteRequest('${req.id}')" title="حذف من السجل">
              <i class="fa-solid fa-trash-can"></i> حذف
            </button>
          `;
          card.appendChild(actions);
        }

        container.appendChild(card);
      });
    }

    function approveRequest(reqId) {
      const req = (state.moneyRequests || []).find(r => r.id === reqId);
      if (!req) return;

      const walletId = state.currentWalletId && state.currentWalletId !== 'all' ? state.currentWalletId : (state.wallets[0] ? state.wallets[0].id : 'wallet-ahly');
      const reqDate = req.date || new Date().toISOString().split('T')[0];

      // تسجيل الطلب وبياناته كالتزام فوري في صفحة الالتزامات المتوقعة (بناءً على طلب المستخدم)
      if (!state.expectedExpenses || !Array.isArray(state.expectedExpenses)) {
        state.expectedExpenses = [];
      }

      const commitmentFromReq = {
        id: 'exp-req-' + req.id,
        type: 'upcoming_bill',
        title: `طلب معتمد: ${req.reason || 'طلب مصروف عائلي'}`,
        amount: Number(req.amount) || 0,
        dueDate: reqDate,
        member: req.member || 'أية',
        status: 'upcoming',
        photo: req.receipt || null,
        allocations: req.allocations || [],
        notes: `تم اعتماد الطلب بواسطة (${state.currentUser || 'ماهر'}) - مسجل كالتزام متوقع`
      };

      state.expectedExpenses.unshift(commitmentFromReq);
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      req.status = 'approved';
      req.approvedAt = new Date().toISOString();
      req.approvedBy = state.currentUser || 'ماهر';
      localStorage.setItem('family_monefy_requests', JSON.stringify(state.moneyRequests));

      logActivity({
        type: 'approve_request',
        action: 'اعتماد طلب مصروف',
        label: `اعتماد وصرف طلب: ${req.reason || 'طلب عائلي'}`,
        amount: Number(req.amount) || 0,
        member: req.member || 'أية',
        author: state.currentUser || 'ماهر',
        receipt: req.photo || null,
        notes: 'تم اعتماد الطلب وتثبيته كالتزام فوري'
      });

      renderRequestsList();
      renderUI();
      saveEmailVault();
      showToast(`✅ تمت الموافقة وصرف (${req.amount} ج.م) وتسجيل الحركات بالبند بنجاح`);
    }

    function rejectRequest(reqId) {
      const req = (state.moneyRequests || []).find(r => r.id === reqId);
      if (!req) return;
      req.status = 'rejected';
      localStorage.setItem('family_monefy_requests', JSON.stringify(state.moneyRequests));

      logActivity({
        type: 'reject_request',
        action: 'رفض طلب مصروف',
        label: `رفض طلب: ${req.reason || 'طلب عائلي'}`,
        amount: Number(req.amount) || 0,
        member: req.member || 'أية',
        author: state.currentUser || 'ماهر',
        notes: 'تم رفض هذا الطلب'
      });

      renderRequestsList();
      showToast('❌ تم رفض الطلب');
    }

    function deleteRequest(reqId) {
      state.moneyRequests = (state.moneyRequests || []).filter(r => r.id !== reqId);
      localStorage.setItem('family_monefy_requests', JSON.stringify(state.moneyRequests));
      renderRequestsList();
      showToast('🗑️ تم حذف الطلب من السجل');
    }

    // =========================================================================
    // إدارة المصروفات المتوقعة والديون (Expected Expenses & Debts)
    // =========================================================================
    // =========================================================================
    // إدارة المصروفات والالتزامات والديون (Commitments & Debts Engine)
    // =========================================================================

    function onExpectedTypeChange(type) {
      const lbl = document.getElementById('lblExpTitle');
      const inp = document.getElementById('inpExpTitle');
      if (!lbl || !inp) return;
      if (type === 'debt_on_us') {
        lbl.innerHTML = 'البيان / المستحق له <span class="req">*</span>';
        inp.placeholder = 'مثال: دين لمحمد';
      } else if (type === 'debt_for_us') {
        lbl.innerHTML = 'البيان / المدين لنا <span class="req">*</span>';
        inp.placeholder = 'مثال: سلفة لخالد';
      } else {
        lbl.innerHTML = 'البيان / الوصف <span class="req">*</span>';
        inp.placeholder = 'مثال: قسط مدرسة';
      }
    }

    function submitExpectedExpense() {
      const typeSel = document.getElementById('inpExpType');
      const titleInp = document.getElementById('inpExpTitle');
      const amtInp = document.getElementById('inpExpAmount');
      const dateInp = document.getElementById('inpExpDueDate');
      const memSel = document.getElementById('inpExpMember');
      const prioSel = document.getElementById('inpExpPriority');

      const type = typeSel ? typeSel.value : 'upcoming_bill';
      const title = titleInp ? titleInp.value.trim() : '';
      const amount = parseFloat(amtInp ? amtInp.value : 0);
      const dueDate = dateInp && dateInp.value ? dateInp.value : '';
      const member = memSel ? memSel.value : 'البيت';
      const priority = prioSel ? prioSel.value : 'normal';

      if (isNaN(amount) || amount <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ صحيح للالتزام');
        if (amtInp) amtInp.focus();
        return;
      }
      if (!title) {
        showToast('⚠️ الرجاء إدخال بيان الالتزام أو اسم الشخص / الجهة');
        if (titleInp) titleInp.focus();
        return;
      }

      if (!state.expectedExpenses || !Array.isArray(state.expectedExpenses)) {
        state.expectedExpenses = [];
      }

      const newExp = {
        id: 'exp-' + Date.now(),
        type: type, // 'upcoming_bill', 'debt_on_us', 'debt_for_us'
        title: title,
        amount: amount,
        dueDate: dueDate,
        priority: priority,
        member: member,
        status: 'upcoming',
        photo: state.pendingExpectedPhotoDataUri || null,
        createdAt: new Date().toISOString()
      };

      state.expectedExpenses.unshift(newExp);
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      if (titleInp) titleInp.value = '';
      if (amtInp) amtInp.value = '';
      if (dateInp) dateInp.value = '';
      removeExpectedPhoto();

      logActivity({
        type: 'expected_created',
        action: 'تسجيل التزام مالي',
        label: `تسجيل ${title} [${type === 'debt_on_us' ? 'دين علينا' : (type === 'debt_for_us' ? 'دين لنا' : 'فاتورة قادمة')}]`,
        amount: amount,
        sign: type === 'debt_for_us' ? '+' : '-',
        member: member,
        author: state.currentUser || 'ماهر',
        receipt: newExp.photo,
        notes: `تاريخ الاستحقاق: ${dueDate || 'غير محدد'} | الأولوية: ${priority}`
      });

      playNotificationChime();
      renderExpectedList();
      switchExpectedTab('list');
      showToast(`📌 تم تسجيل الالتزام (${formatMoney(amount)}) بنجاح! ✨`);
      triggerDriveAutoSync();
    }

    function setExpectedPillFilter(filter) {
      state.expectedTypeFilter = filter;
      document.querySelectorAll('.exp-filter-pill').forEach(btn => btn.classList.remove('active'));
      const pillMap = {
        'all': 'btnFilterExpAll',
        'upcoming_bill': 'btnFilterExpUpcoming',
        'debt_on_us': 'btnFilterExpDebtsOnUs',
        'debt_for_us': 'btnFilterExpDebtsForUs',
        'paid': 'btnFilterExpPaid'
      };
      const activeBtn = document.getElementById(pillMap[filter]);
      if (activeBtn) activeBtn.classList.add('active');
      renderExpectedList();
    }

    function toggleExpectedFilter(type) {
      if (state.expectedTypeFilter === type) {
        setExpectedPillFilter('all');
      } else {
        setExpectedPillFilter(type);
      }
      switchExpectedTab('list');
    }

    function renderExpectedList() {
      const container = document.getElementById('expectedListContainer');
      const elUp = document.getElementById('expectedTotalUpcoming');
      const elDebOnUs = document.getElementById('expectedTotalDebtsOnUs');
      const elDebForUs = document.getElementById('expectedTotalDebtsForUs');
      const elPaid = document.getElementById('expectedTotalPaid');

      const cntUp = document.getElementById('expectedCountUpcoming');
      const cntDebOnUs = document.getElementById('expectedCountDebtsOnUs');
      const cntDebForUs = document.getElementById('expectedCountDebtsForUs');
      const cntPaid = document.getElementById('expectedCountPaid');

      const pillCntAll = document.getElementById('pillCountAll');
      const pillCntUp = document.getElementById('pillCountUpcoming');
      const pillCntDebOnUs = document.getElementById('pillCountDebtsOnUs');
      const pillCntDebForUs = document.getElementById('pillCountDebtsForUs');
      const pillCntPaid = document.getElementById('pillCountPaid');

      const badgeTab = document.getElementById('expectedPendingBadgeTab');
      const netLabel = document.getElementById('expectedNetPositionLabel');
      const netVal = document.getElementById('expectedNetPositionVal');

      if (!container) return;

      if (!state.expectedExpenses) state.expectedExpenses = [];

      // تنظيف وترقية البيانات القديمة إن وُجدت
      state.expectedExpenses.forEach(e => {
        if (e.type === 'debt') e.type = 'debt_on_us';
        if (!e.status) e.status = 'upcoming';
      });

      const memberFilter = document.getElementById('selExpectedMemberFilter')?.value || 'all';

      // 1. حساب الإجماليات بدقة محاسبية صارمة 0.00 ج.م
      let totUpcoming = 0, countUpcoming = 0;
      let totDebtsOnUs = 0, countDebtsOnUs = 0;
      let totDebtsForUs = 0, countDebtsForUs = 0;
      let totPaid = 0, countPaid = 0;

      state.expectedExpenses.forEach(e => {
        const amt = Number(e.amount) || 0;
        if (e.status === 'paid') {
          totPaid += amt;
          countPaid++;
        } else if (e.type === 'upcoming_bill') {
          totUpcoming += amt;
          countUpcoming++;
        } else if (e.type === 'debt_on_us') {
          totDebtsOnUs += amt;
          countDebtsOnUs++;
        } else if (e.type === 'debt_for_us') {
          totDebtsForUs += amt;
          countDebtsForUs++;
        }
      });

      if (elUp) elUp.textContent = formatMoney(totUpcoming);
      if (elDebOnUs) elDebOnUs.textContent = '- ' + formatMoney(totDebtsOnUs);
      if (elDebForUs) elDebForUs.textContent = '+ ' + formatMoney(totDebtsForUs);
      if (elPaid) elPaid.textContent = formatMoney(totPaid);

      const autoScaleKpi = (el) => {
        if (!el) return;
        const l = (el.textContent || '').length;
        if (l > 15) {
          el.style.fontSize = '0.70rem';
          el.style.letterSpacing = '-0.4px';
        } else if (l > 12) {
          el.style.fontSize = '0.78rem';
          el.style.letterSpacing = '-0.2px';
        } else {
          el.style.fontSize = '0.88rem';
          el.style.letterSpacing = '-0.1px';
        }
      };
      autoScaleKpi(elUp);
      autoScaleKpi(elDebOnUs);
      autoScaleKpi(elDebForUs);
      autoScaleKpi(elPaid);

      if (cntUp) cntUp.textContent = `${countUpcoming} بند`;
      if (cntDebOnUs) cntDebOnUs.textContent = `${countDebtsOnUs} بند`;
      if (cntDebForUs) cntDebForUs.textContent = `${countDebtsForUs} بند`;
      if (cntPaid) cntPaid.textContent = `${countPaid} مكتمل`;

      if (pillCntAll) pillCntAll.textContent = state.expectedExpenses.length;
      if (pillCntUp) pillCntUp.textContent = countUpcoming;
      if (pillCntDebOnUs) pillCntDebOnUs.textContent = countDebtsOnUs;
      if (pillCntDebForUs) pillCntDebForUs.textContent = countDebtsForUs;
      if (pillCntPaid) pillCntPaid.textContent = countPaid;

      const totalPendingCount = countUpcoming + countDebtsOnUs + countDebtsForUs;
      if (badgeTab) badgeTab.textContent = totalPendingCount;

      // صافي المركز المالي المستقبلي: (مصاريف قادمة + ديون علينا) - ديون لنا
      const netDue = (totUpcoming + totDebtsOnUs) - totDebtsForUs;
      if (netVal) {
        if (netDue > 0) {
          if (netLabel) netLabel.textContent = 'صافي الالتزامات المستقبلية المطلوب تدبيرها:';
          netVal.textContent = '- ' + formatMoney(netDue);
          netVal.style.color = '#f87171';
        } else if (netDue < 0) {
          if (netLabel) netLabel.textContent = 'صافي المركز إيجابي (فائض مستحق للتحصيل):';
          netVal.textContent = '+ ' + formatMoney(Math.abs(netDue));
          netVal.style.color = '#34d399';
        } else {
          if (netLabel) netLabel.textContent = 'صافي الالتزامات متوازن بالكامل:';
          netVal.textContent = '0.00 ج.م';
          netVal.style.color = '#38bdf8';
        }
      }

      // تحديث حالة كروت الـ KPI النشطة
      const cardUp = document.getElementById('cardExpUpcoming');
      const cardDebOnUs = document.getElementById('cardExpDebtsOnUs');
      const cardDebForUs = document.getElementById('cardExpDebtsForUs');
      const cardPaid = document.getElementById('cardExpPaid');

      if (cardUp) cardUp.classList.toggle('active-filter', state.expectedTypeFilter === 'upcoming_bill');
      if (cardDebOnUs) cardDebOnUs.classList.toggle('active-filter', state.expectedTypeFilter === 'debt_on_us');
      if (cardDebForUs) cardDebForUs.classList.toggle('active-filter', state.expectedTypeFilter === 'debt_for_us');
      if (cardPaid) cardPaid.classList.toggle('active-filter', state.expectedTypeFilter === 'paid');

      // 2. تطبيق التصفية الدقيقة على القائمة المعروضة
      let list = state.expectedExpenses.slice();

      // فلترة النوع
      const activeFilter = state.expectedTypeFilter || 'all';
      if (activeFilter === 'upcoming_bill') {
        list = list.filter(e => e.status !== 'paid' && e.type === 'upcoming_bill');
      } else if (activeFilter === 'debt_on_us') {
        list = list.filter(e => e.status !== 'paid' && e.type === 'debt_on_us');
      } else if (activeFilter === 'debt_for_us') {
        list = list.filter(e => e.status !== 'paid' && e.type === 'debt_for_us');
      } else if (activeFilter === 'paid') {
        list = list.filter(e => e.status === 'paid');
      }

      // فلترة الشخص
      if (memberFilter !== 'all') {
        list = list.filter(e => e.member === memberFilter || (memberFilter === 'البيت' && (e.member === 'البيت' || e.member === 'العائلة')));
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 24px 10px; text-align: center;">
            <i class="fa-solid fa-calendar-check" style="color: #38bdf8; font-size: 2rem; margin-bottom: 8px; opacity: 0.6;"></i>
            <div class="empty-title" style="font-weight: 800; color: #cbd5e1;">لا توجد التزامات مطابقة للتصفية الحالية</div>
            <div class="empty-desc" style="font-size: 0.76rem; color: #64748b; margin-top: 4px;">يمكنك إضافة التزام جديد أو تغيير خيارات الفلترة لعرض باقي البنود</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-entry-card';

        let typeBadge = '';
        let amountHtml = '';
        if (item.type === 'upcoming_bill') {
          typeBadge = `<span class="period-active-pill" style="color: #fbbf24; background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.35);"><i class="fa-solid fa-receipt"></i> مصروف قادم</span>`;
          amountHtml = `<span style="color: #fbbf24; font-weight: 900; font-size: 1.05rem; direction: ltr; display: inline-block;">- ${formatMoney(item.amount)}</span>`;
        } else if (item.type === 'debt_on_us') {
          typeBadge = `<span class="period-active-pill" style="color: #f87171; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.35);"><i class="fa-solid fa-arrow-down-long"></i> دين علينا</span>`;
          amountHtml = `<span style="color: #f87171; font-weight: 900; font-size: 1.05rem; direction: ltr; display: inline-block;">- ${formatMoney(item.amount)}</span>`;
        } else {
          typeBadge = `<span class="period-active-pill" style="color: #34d399; background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.35);"><i class="fa-solid fa-arrow-up-long"></i> دين لنا (تحصيل)</span>`;
          amountHtml = `<span style="color: #34d399; font-weight: 900; font-size: 1.05rem; direction: ltr; display: inline-block;">+ ${formatMoney(item.amount)}</span>`;
        }

        let priorityBadge = '';
        if (item.priority === 'urgent') {
          priorityBadge = `<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 800;"><i class="fa-solid fa-triangle-exclamation"></i> عاجل</span>`;
        }

        let statusBadge = '';
        if (item.status === 'paid') {
          statusBadge = `<span class="status-badge-approved"><i class="fa-solid fa-check-double"></i> مكتمل ومسدد</span>`;
        } else {
          statusBadge = `<span class="status-badge-pending"><i class="fa-solid fa-clock"></i> مستحق: ${item.dueDate || 'قريباً'}</span>`;
        }

        let photoBadge = '';
        if (item.photo) {
          photoBadge = `<button type="button" class="btn-item-action" onclick="openReceiptLightbox('${item.photo}', 'مستند: ${escapeHtml(item.title)}')" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 2px 7px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="عرض المستند أو الفاتورة المرفقة"><i class="fa-solid fa-paperclip"></i> مستند مرفق 📷</button>`;
        }

        let actionBtns = '';
        if (item.status !== 'paid') {
          if (item.type === 'debt_for_us') {
            actionBtns = `
              <div class="item-entry-actions">
                <button class="btn-item-action btn-item-approve" onclick="openPayExpectedModal('${item.id}')" title="تسجيل تحصيل المبلغ وإيداعه في المحفظة" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border-color: rgba(16, 185, 129, 0.4);">
                  <i class="fa-solid fa-hand-holding-dollar"></i> تحصيل وإيداع بالمحفظة
                </button>
                <button class="btn-item-action btn-item-delete" onclick="deleteExpected('${item.id}')" title="حذف الالتزام">
                  <i class="fa-solid fa-trash-can"></i> حذف
                </button>
              </div>
            `;
          } else {
            actionBtns = `
              <div class="item-entry-actions">
                <button class="btn-item-action btn-item-approve" onclick="openPayExpectedModal('${item.id}')" title="تسجيل سداد الالتزام وخصمه من المحفظة">
                  <i class="fa-solid fa-circle-check"></i> سداد وصرف من المحفظة
                </button>
                <button class="btn-item-action btn-item-delete" onclick="deleteExpected('${item.id}')" title="حذف الالتزام">
                  <i class="fa-solid fa-trash-can"></i> حذف
                </button>
              </div>
            `;
          }
        } else {
          actionBtns = `
            <div class="item-entry-actions">
              <button class="btn-item-action btn-item-delete" onclick="deleteExpected('${item.id}')" title="حذف من السجل">
                <i class="fa-solid fa-trash-can"></i> حذف من السجل
              </button>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="item-entry-head" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              ${typeBadge}
              ${priorityBadge}
              <span style="font-weight: 800; font-size: 0.88rem; color: #f8fafc;">${escapeHtml(item.title)}</span>
            </div>
            ${statusBadge}
          </div>
          <div class="item-entry-body" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 0.74rem; color: #94a3b8; display: flex; align-items: center; gap: 8px;">
              <span>👤 يخص: <strong style="color: #cbd5e1;">${escapeHtml(item.member || 'البيت')}</strong></span>
              ${item.dueDate ? `<span>• 📅 الاستحقاق: <strong style="color: #38bdf8;">${item.dueDate}</strong></span>` : ''}
            </div>
            ${amountHtml}
          </div>
          ${(item.settleReceipt || item.photo) ? `
            <div style="margin: 4px 0 8px; display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn-item-action" onclick="openReceiptLightbox('${item.settleReceipt || item.photo}', 'إيصال/مستند: ${escapeHtml(item.title)}')" style="background: rgba(56, 189, 248, 0.18); color: #38bdf8; border: 1.2px solid rgba(56, 189, 248, 0.45); border-radius: 7px; padding: 4px 10px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;" title="عرض إيصال أو مستند السداد المرفق">
                <i class="fa-solid fa-file-invoice"></i> إيصال ومستند السداد 📷
              </button>
            </div>
          ` : ''}
          ${actionBtns}
        `;
        container.appendChild(card);
      });
    }

    
    function handlePayExpectedPhotoUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        if (file.type && file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            state.pendingPayExpectedReceiptDataUri = compressed;
            showPayExpectedPhotoPreview(compressed);
          };
          img.src = e.target.result;
        } else {
          state.pendingPayExpectedReceiptDataUri = e.target.result;
          showPayExpectedPhotoPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }

    function showPayExpectedPhotoPreview(dataUri) {
      const previewImg = document.getElementById('payExpPhotoPreviewImg');
      const previewCont = document.getElementById('payExpPhotoPreviewContainer');
      const badge = document.getElementById('payExpPhotoAttachedBadge');
      if (previewImg) previewImg.src = dataUri;
      if (previewCont) previewCont.style.display = 'block';
      if (badge) badge.style.display = 'inline-flex';
    }

    function removePayExpectedPhoto() {
      state.pendingPayExpectedReceiptDataUri = null;
      const previewImg = document.getElementById('payExpPhotoPreviewImg');
      const previewCont = document.getElementById('payExpPhotoPreviewContainer');
      const badge = document.getElementById('payExpPhotoAttachedBadge');
      const inpFile = document.getElementById('inpPayExpReceipt');
      const inpCam = document.getElementById('inpPayExpReceiptCamera');
      if (previewImg) previewImg.src = '';
      if (previewCont) previewCont.style.display = 'none';
      if (badge) badge.style.display = 'none';
      if (inpFile) inpFile.value = '';
      if (inpCam) inpCam.value = '';
    }

    function openPayExpectedModal(expId) {
      const exp = (state.expectedExpenses || []).find(e => e.id === expId);
      if (!exp) return;

      const targetIdInp = document.getElementById('payExpTargetId');
      const targetTypeInp = document.getElementById('payExpTargetType');
      const titleEl = document.getElementById('payExpItemTitle');
      const memEl = document.getElementById('payExpItemMember');
      const amtEl = document.getElementById('payExpItemAmount');
      const walletSel = document.getElementById('payExpWalletSelect');
      const dateInp = document.getElementById('payExpDateInput');
      const catSel = document.getElementById('payExpCategorySelect');
      const noteInp = document.getElementById('payExpNoteInput');
      const headTitle = document.getElementById('payExpHeaderTitle');
      const headIcon = document.getElementById('payExpHeaderIcon');
      const walletLbl = document.getElementById('payExpWalletLabel');
      const confirmBtn = document.getElementById('btnConfirmPayExpected');

      if (targetIdInp) targetIdInp.value = exp.id;
      if (targetTypeInp) targetTypeInp.value = exp.type;
      if (titleEl) titleEl.textContent = exp.title;
      if (memEl) memEl.textContent = `يخص: ${exp.member || 'البيت'}`;
      if (amtEl) {
        amtEl.textContent = (exp.type === 'debt_for_us' ? '+ ' : '- ') + formatMoney(exp.amount);
        amtEl.style.color = (exp.type === 'debt_for_us' ? '#34d399' : '#f87171');
      }

      if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];
      if (noteInp) noteInp.value = '';
      removePayExpectedPhoto();
      if (exp.photo) {
        state.pendingPayExpectedReceiptDataUri = exp.photo;
        showPayExpectedPhotoPreview(exp.photo);
      }

      // ضبط العناوين حسب نوع الحركة (سداد أم تحصيل)
      if (exp.type === 'debt_for_us') {
        if (headTitle) headTitle.textContent = 'تحصيل وإيداع مستحق مالي';
        if (headIcon) headIcon.className = 'fa-solid fa-hand-holding-dollar';
        if (walletLbl) walletLbl.textContent = 'إيداع المبلغ المحصّل في محفظة:';
        if (catSel) catSel.value = 'income';
        if (confirmBtn) {
          confirmBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> تأكيد التحصيل والإيداع بالمحفظة';
          confirmBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        }
      } else {
        if (headTitle) headTitle.textContent = 'سداد وصرف التزام مالي';
        if (headIcon) headIcon.className = 'fa-solid fa-receipt';
        if (walletLbl) walletLbl.textContent = 'خصم المبلغ المسدد من محفظة:';
        if (catSel) catSel.value = exp.type === 'upcoming_bill' ? 'bills' : 'other';
        if (confirmBtn) {
          confirmBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> تأكيد السداد والخصم من المحفظة';
          confirmBtn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
        }
      }

      // ملء خيارات المحافظ مع الأرصدة الحقيقية
      if (walletSel) {
        walletSel.innerHTML = (state.wallets || []).map(w => {
          return `<option value="${w.id}">${escapeHtml(w.name)} (الرصيد: ${formatMoney(w.balance)})</option>`;
        }).join('');
        if (state.currentWalletId && state.currentWalletId !== 'all') {
          walletSel.value = state.currentWalletId;
        }
      }

      openModal('payExpectedModal');
    }

    function confirmPayExpectedTransaction() {
      const targetId = document.getElementById('payExpTargetId')?.value;
      const exp = (state.expectedExpenses || []).find(e => e.id === targetId);
      if (!exp) return;

      const walletSel = document.getElementById('payExpWalletSelect');
      const dateInp = document.getElementById('payExpDateInput');
      const catSel = document.getElementById('payExpCategorySelect');
      const noteInp = document.getElementById('payExpNoteInput');

      const walletId = walletSel ? walletSel.value : (state.wallets[0] ? state.wallets[0].id : 'wallet-default');
      const txDate = dateInp && dateInp.value ? dateInp.value : new Date().toISOString().split('T')[0];
      const category = catSel ? catSel.value : (exp.type === 'upcoming_bill' ? 'bills' : 'other');
      const note = noteInp ? noteInp.value.trim() : '';

      const targetWallet = (state.wallets || []).find(w => w.id === walletId);
      const isCollection = exp.type === 'debt_for_us';

      const finalReceipt = state.pendingPayExpectedReceiptDataUri || exp.photo || null;
      const newTx = {
        id: 'tx-exp-' + Date.now(),
        type: isCollection ? 'income' : 'expense',
        amount: Number(exp.amount),
        label: isCollection ? `تحصيل مستحق: ${exp.title}${note ? ' (' + note + ')' : ''}` : `سداد التزام: ${exp.title}${note ? ' (' + note + ')' : ''}`,
        category: isCollection ? 'income' : category,
        member: exp.member || 'البيت',
        walletId: walletId,
        date: txDate,
        receipt: finalReceipt
      };

      if (state.pendingPayExpectedReceiptDataUri) {
        exp.settleReceipt = state.pendingPayExpectedReceiptDataUri;
        exp.photo = state.pendingPayExpectedReceiptDataUri;
      }

      if (!state.transactions) state.transactions = [];
      state.transactions.unshift(newTx);
      saveTx();

      exp.status = 'paid';
      exp.paidAt = new Date().toISOString();
      exp.paidWalletId = walletId;
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      logActivity({
        type: isCollection ? 'debt_collected' : 'expected_paid',
        action: isCollection ? 'تحصيل دين' : 'سداد التزام',
        label: isCollection ? `تم تحصيل ${exp.title} وإيداعه في ${targetWallet ? targetWallet.name : 'المحفظة'}` : `تم سداد ${exp.title} وخصمه من ${targetWallet ? targetWallet.name : 'المحفظة'}`,
        amount: Number(exp.amount),
        sign: isCollection ? '+' : '-',
        member: exp.member || 'البيت',
        author: state.currentUser || 'ماهر',
        wallet: targetWallet ? targetWallet.name : 'المحفظة',
        category: category,
        receipt: finalReceipt,
        notes: note || 'سداد معتمد بالكامل'
      });

      closeModal('payExpectedModal');
      playNotificationChime();
      renderExpectedList();
      renderUI();
      triggerDriveAutoSync();

      const successMsg = isCollection 
        ? `🎉 تم تحصيل (${formatMoney(exp.amount)}) وإيداعها في (${targetWallet ? targetWallet.name : 'المحفظة'}) بنجاح!`
        : `🎉 تم سداد (${formatMoney(exp.amount)}) وخصمها من (${targetWallet ? targetWallet.name : 'المحفظة'}) بنجاح!`;
      showToast(successMsg);
    }

    function deleteExpected(expId) {
      if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الالتزام؟')) return;
      const targetExp = (state.expectedExpenses || []).find(e => e.id === expId);
      if (targetExp) {
        logActivity({
          type: 'delete_expected',
          action: 'حذف التزام مالي',
          label: `حذف التزام: ${targetExp.title}`,
          amount: targetExp.amount || 0,
          member: targetExp.member || 'البيت',
          author: state.currentUser || 'ماهر',
          notes: 'تم حذف هذا الالتزام من جدول الالتزامات'
        });
      }
      state.expectedExpenses = (state.expectedExpenses || []).filter(e => e.id !== expId);
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}
      renderExpectedList();
      showToast('🗑️ تم حذف الالتزام بنجاح');
      triggerDriveAutoSync();
    }

    function switchSettingsTab(tabKey) {
      document.querySelectorAll('.settings-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabKey) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      const panes = ['sync', 'appearance', 'data'];
      panes.forEach(p => {
        const pane = document.getElementById('settingsPane_' + p);
        if (pane) pane.style.display = (p === tabKey) ? 'block' : 'none';
      });
    }

function openSettingsModal(targetSection = '') {
      updateSettingsModalDisplay();
      openModal('settingsModal');
      if (targetSection === 'users') {
        setTimeout(() => {
          const sec = document.getElementById('settingsSec_users');
          if (sec) {
            sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            sec.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.6)';
            setTimeout(() => sec.style.boxShadow = '', 1500);
          }
        }, 150);
      }
    }

        // =========================================================================
    // محرك تبديل واختيار شعار ورمز عائلة ماهر وأية الملكي (Family Emblem Engine)
    // =========================================================================
    const FAMILY_EMBLEMS = {
      1: { name: 'الدرع الملكي المذهب', src: 'assets/family_option1_gold_crest.jpg', color: '#fbbf24' },
      2: { name: 'الموزاييك الهندسي الراقي', src: 'assets/family_option2_mosaic.jpg', color: '#38bdf8' },
      3: { name: 'المدار الزجاجي السماوي', src: 'assets/family_option3_rosette.jpg', color: '#818cf8' },
      4: { name: 'الزمرد والنيون العصري', src: 'assets/family_option4_emerald.jpg', color: '#34d399' }
    };

    function switchFamilyEmblem(num, persist = true) {
      num = parseInt(num) || 1;
      if (!FAMILY_EMBLEMS[num]) num = 1;
      const emblem = FAMILY_EMBLEMS[num];

      state.familyEmblem = num;
      if (persist) {
        try { localStorage.setItem('family_monefy_emblem', num); } catch(e) {}
      }

      // 1. تحديث شعار العائلة في الهيدر الرئيسي فورياً
      const headerLogo = document.getElementById('headerBrandFamilyLogo');
      if (headerLogo) headerLogo.src = emblem.src;

      // 2. تحديث صورة الأيقونة لكل العائلة في شريط الأفراد
      const avatarAll = document.getElementById('avatarImgAllFamily');
      if (avatarAll) avatarAll.src = emblem.src;

      // 3. تحديث مظهر الأزرار الأربعة وحالة التحديد والوهج
      for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById('btnEmblemOpt' + i);
        if (!btn) continue;
        if (i === num) {
          btn.classList.add('active');
          btn.style.border = `2.2px solid ${emblem.color}`;
          btn.style.boxShadow = `0 0 14px ${emblem.color}88, inset 0 0 8px ${emblem.color}33`;
          btn.style.transform = 'translateY(-2px) scale(1.05)';
          btn.style.background = 'rgba(15, 23, 42, 0.95)';
        } else {
          btn.classList.remove('active');
          btn.style.border = '1.5px solid rgba(255, 255, 255, 0.12)';
          btn.style.boxShadow = 'none';
          btn.style.transform = 'none';
          btn.style.background = 'rgba(30, 41, 59, 0.85)';
        }
      }

      // 4. تحديث بادج اسم الشعار المختار
      const badge = document.getElementById('activeEmblemNameBadge');
      if (badge) {
        badge.textContent = emblem.name + ' ✓';
        badge.style.color = emblem.color;
        badge.style.borderColor = emblem.color;
        badge.style.background = `${emblem.color}22`;
      }

      // 5. إشعار التغيير
      if (persist && typeof showToast === 'function') {
        showToast(`👑 تم تغيير وتثبيت شعار العائلة: ${emblem.name}`);
      }
    }

function updateSettingsModalDisplay() {
      const user = state.currentUser || 'ماهر';
        const curEmblem = localStorage.getItem('family_monefy_emblem') || 1;
        if (typeof switchFamilyEmblem === 'function') switchFamilyEmblem(curEmblem, false);


      // مزامنة حالة الأزرار والبادجات للمظهر
      try {
        const curTheme = document.documentElement.getAttribute('data-app-theme') || localStorage.getItem('family_monefy_theme') || 'navy';
        setAppTheme(curTheme, false);

        const curIconTheme = document.documentElement.getAttribute('data-icon-theme') || localStorage.getItem('family_monefy_icon_theme') || 'vibrant';
        setAppIconTheme(curIconTheme, false);

        const curFont = localStorage.getItem('family_expense_app_font') || 'tajawal';
        setAppFont(curFont, false);

        const curFontSize = document.documentElement.getAttribute('data-font-size') || localStorage.getItem('family_expense_font_size') || 'medium';
        setAppFontSize(curFontSize, false);

        const curCardStyle = document.documentElement.getAttribute('data-card-style') || localStorage.getItem('family_monefy_design_style') || 'glass';
        setAppDesignStyle(curCardStyle, false);
      } catch(e) {}
      const nameEl = document.getElementById('settingsCurrentMemberName');
      if (nameEl) nameEl.textContent = user;

      const activeNameTxt = document.getElementById('settingsActiveUserNameTxt');
      if (activeNameTxt) activeNameTxt.textContent = user;

      if (typeof renderSettingsMembersGrid === 'function') renderSettingsMembersGrid();

      const emailEl = document.getElementById('settingsModalUserEmail');
      if (emailEl) emailEl.textContent = (typeof GDRIVE_CONFIG !== 'undefined' ? GDRIVE_CONFIG.targetAccount : 'maher.easybakery@gmail.com');

      const avatarEl = document.getElementById('settingsCurrentMemberAvatar');
      if (avatarEl) {
        const emojis = { 'ماهر': '👨‍💼', 'أية': '👩‍💼', 'محمد': '👦', 'مريم': '👧' };
        avatarEl.textContent = emojis[user] || '👤';
      }

      const pinEl = document.getElementById('settingsMemberPinStatus');
      if (pinEl) {
        pinEl.innerHTML = `<i class="fa-solid fa-shield-check" style="color: #34d399;"></i> الحساب محمي برمز PIN سري 🔒`;
      }

      const walletCountEl = document.getElementById('settingsWalletCountText');
      if (walletCountEl && state.wallets) {
        const totalBal = state.wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
        const curr = state.currency || 'ج.م';
        walletCountEl.textContent = `${state.wallets.length} محافظ نشطة (إجمالي: ${formatMoney(totalBal, curr)})`;
      }

      // حساب الموازنة الرياضية للأرصدة وفرق الرصيد اللحظي
      const diffBadge = document.getElementById('settingsReconciliationDiffBadge');
      if (diffBadge) {
        let actualBal = 0;
        let computedBal = 0;
        if (state.wallets && Array.isArray(state.wallets)) {
          state.wallets.forEach(w => {
            actualBal += Number(w.balance) || 0;
            let wComp = parseFloat(w.initialBalance || w.baseBalance || 0);
            (state.transactions || []).forEach(tx => {
              if (tx.deleted) return;
              const amt = Math.abs(parseFloat(tx.amount) || 0);
              if (tx.type === 'expense' && tx.wallet === w.name) wComp -= amt;
              else if (tx.type === 'income' && tx.wallet === w.name) wComp += amt;
              else if (tx.type === 'transfer') {
                if (tx.fromWallet === w.name || tx.wallet === w.name) wComp -= amt;
                if (tx.toWallet === w.name) wComp += amt;
              }
            });
            computedBal += wComp;
          });
        }
        const diff = Math.abs(actualBal - computedBal);
        const curr = state.currency || 'ج.م';
        if (diff < 0.01) {
          diffBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #34d399;"></i> مطابقة تامة (فرق الرصيد: 0.00 ${curr})`;
          diffBadge.style.color = '#34d399';
        } else {
          diffBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #f87171;"></i> فرق رصيد: ${formatMoney(diff, curr)}`;
          diffBadge.style.color = '#f87171';
        }
      }

      updateDriveSyncStatusDisplay();
    }

    function downloadBackup() {
      try {
        const backupData = {
          app: 'FamilyExpenseTrackerMonefy',
          version: '3.5.0',
          exportedAt: new Date().toISOString(),
          account: (typeof GDRIVE_CONFIG !== 'undefined' ? GDRIVE_CONFIG.targetAccount : 'maher.easybakery@gmail.com'),
          state: state
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        const dStr = new Date().toISOString().slice(0, 10);
        dlAnchor.setAttribute("download", `family_expense_tracker_backup_${dStr}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        if (typeof showToast === 'function') showToast('💾 تم تنزيل النسخة الاحتياطية بنجاح!');
      } catch(e) {
        alert('حدث خطأ أثناء تنزيل النسخة الاحتياطية: ' + e.message);
      }
    }

    function handleBackupUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          const incomingState = parsed.state || parsed;
          if (incomingState && Array.isArray(incomingState.transactions)) {
            if (!confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم دمج كافة المعاملات والمحافظ وتحديث المزامنة.')) return;
            if (typeof mergeIncomingSyncData === 'function') {
              mergeIncomingSyncData(incomingState);
            } else {
              state = Object.assign(state, incomingState);
            }
            if (typeof saveState === 'function') saveState();
            if (typeof auditAndRecomputeAllWalletBalances === 'function') auditAndRecomputeAllWalletBalances();
            if (typeof executeGoogleDriveSync === 'function') executeGoogleDriveSync();
            if (typeof renderUI === 'function') renderUI();
            if (typeof showToast === 'function') showToast('✅ تم استعادة النسخة الاحتياطية وتزامنها مع Google Drive بنجاح!');
          } else {
            alert('ملف النسخة الاحتياطية غير صالح أو لا يحتوي على بنية بيانات صحيحة.');
          }
        } catch(err) {
          alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية: ' + err.message);
        }
        event.target.value = '';
      };
      reader.readAsText(file);
    }

    function setAppTheme(theme, persist = true) {
      const validThemes = ['navy', 'black', 'emerald', 'purple', 'gold', 'ocean', 'rose', 'slate', 'light'];
      if (!validThemes.includes(theme)) theme = 'navy';

      state.appTheme = theme;
      document.documentElement.setAttribute('data-app-theme', theme);
      document.body.setAttribute('data-app-theme', theme);

      if (theme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }

      if (persist) {
        try { localStorage.setItem('family_monefy_theme', theme); } catch(e) {}
      }

      const themeMetadata = [
        { key: 'Navy', theme: 'navy', color: '#38bdf8', bg: 'rgba(14, 39, 76, 0.75)', name: 'كحلي ملكي أزرق' },
        { key: 'Black', theme: 'black', color: '#e2e8f0', bg: 'rgba(0, 0, 0, 0.90)', name: 'أسود ملكي فاحم (OLED)' },
        { key: 'Emerald', theme: 'emerald', color: '#34d399', bg: 'rgba(6, 69, 50, 0.75)', name: 'زمردي أخضر فاخر' },
        { key: 'Purple', theme: 'purple', color: '#c084fc', bg: 'rgba(55, 18, 94, 0.75)', name: 'بنفسجي إمبراطوري' },
        { key: 'Rose', theme: 'rose', color: '#fb7185', bg: 'rgba(70, 14, 38, 0.75)', name: 'عنابي وياقوتي فخم' },
        { key: 'Ocean', theme: 'ocean', color: '#22d3ee', bg: 'rgba(14, 62, 92, 0.75)', name: 'سماوي فيروزي بحري' },
        { key: 'Gold', theme: 'gold', color: '#fbbf24', bg: 'rgba(59, 35, 16, 0.75)', name: 'موكا وبرونزي دافئ' },
        { key: 'Slate', theme: 'slate', color: '#94a3b8', bg: 'rgba(30, 41, 59, 0.75)', name: 'تيتانيوم رمادي معماري' },
        { key: 'Light', theme: 'light', color: '#0284c7', bg: 'rgba(255, 255, 255, 0.95)', name: 'النهار الأبيض اللؤلؤي' }
      ];

      themeMetadata.forEach(tm => {
        const el = document.getElementById('themeOpt' + tm.key);
        if (!el) return;
        const isMatch = (tm.theme === theme);
        const dot = el.querySelector('.theme-color-dot');
        const badge = el.querySelector('.theme-selected-badge');

        if (isMatch) {
          el.classList.add('active');
          el.style.border = `2.5px solid ${tm.color}`;
          el.style.boxShadow = `0 0 16px ${tm.color}88, inset 0 0 8px ${tm.color}33`;
          el.style.transform = 'translateY(-2px) scale(1.03)';
          if (dot) {
            dot.innerHTML = `<i class="fa-solid fa-check" style="font-size:0.62rem; font-weight:900; color:${tm.theme === 'light' ? '#fff' : '#000'};"></i>`;
            dot.style.background = tm.color;
            dot.style.borderColor = '#ffffff';
            dot.style.boxShadow = `0 0 10px ${tm.color}`;
          }
          if (badge) {
            badge.style.display = 'inline-block';
            badge.style.color = tm.color;
            badge.style.borderColor = tm.color;
          }
        } else {
          el.classList.remove('active');
          el.style.border = '';
          el.style.boxShadow = '';
          el.style.transform = '';
          if (dot) {
            dot.innerHTML = '';
            dot.style.background = '';
            dot.style.borderColor = '';
            dot.style.boxShadow = '';
          }
          if (badge) {
            badge.style.display = 'none';
          }
        }
      });

      const names = {
        'black': 'أسود ملكي فاحم (OLED)',
        'navy': 'كحلي ملكي أزرق',
        'emerald': 'زمردي أخضر فاخر',
        'purple': 'بنفسجي إمبراطوري',
        'rose': 'عنابي وياقوتي فخم',
        'ocean': 'سماوي فيروزي بحري',
        'gold': 'موكا وبرونزي دافئ',
        'slate': 'تيتانيوم رمادي معماري',
        'light': 'النهار الأبيض اللؤلؤي'
      };

      const activeBadge = document.getElementById('activeThemeBadge');
      if (activeBadge) {
        activeBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="margin-left: 3px;"></i>المختار: ${names[theme] || theme}`;
        activeBadge.style.color = '#38bdf8';
        activeBadge.style.background = 'rgba(56, 189, 248, 0.18)';
        activeBadge.style.border = '1px solid #38bdf8';
        activeBadge.style.boxShadow = '0 0 8px rgba(56, 189, 248, 0.3)';
      }

      updateThemeCheckDots();

      // إعادة رسم وتحديث كافة الكروت الداخلية وقمرة القيادة فورياً لتتخذ مظهر السمة المختارة
      try {
        if (typeof renderUI === 'function') renderUI();
        if (typeof renderExpectedList === 'function') renderExpectedList();
        if (typeof updateAnalyticsChart === 'function') updateAnalyticsChart();
      } catch(e) {
        console.warn('Theme live render error:', e);
      }

      if (persist && typeof showToast === 'function') {
        showToast(`🎨 تم تطبيق خلفية ولون: ${names[theme] || theme}`);
      }
    }

    function openThemeDrawer() {
      updateThemeCheckDots();
      openModal('themeDrawerModal');
    }

    function selectThemeAndApply(theme) {
      setAppTheme(theme);
      updateThemeCheckDots();
      if (typeof showToast === 'function') {
        showToast('✨ تم تغيير وحفظ خلفية التطبيق بنجاح');
      }
    }

    function updateThemeCheckDots() {
      const cur = state.appTheme || 'navy';
      document.querySelectorAll('.theme-check-dot').forEach(dot => {
        const t = dot.getAttribute('data-theme');
        if (t === cur) {
          dot.innerHTML = '<i class="fa-solid fa-check" style="font-weight:900;"></i>';
          dot.style.background = '#38bdf8';
          dot.style.color = '#000';
          dot.style.borderColor = '#ffffff';
          dot.style.boxShadow = '0 0 10px #38bdf8';
        } else {
          dot.innerHTML = '';
          dot.style.background = 'transparent';
          dot.style.borderColor = 'rgba(255,255,255,0.3)';
          dot.style.boxShadow = 'none';
        }
      });

      // مزامنة الكروت في مودال استعراض السمات (themeDrawerModal)
      document.querySelectorAll('.theme-card-box').forEach(box => {
        const checkDot = box.querySelector('.theme-check-dot');
        const dotTheme = checkDot ? checkDot.getAttribute('data-theme') : '';
        if (dotTheme === cur) {
          box.classList.add('active');
          box.style.border = '2.2px solid #38bdf8';
          box.style.boxShadow = '0 0 18px rgba(56, 189, 248, 0.55), inset 0 0 8px rgba(56, 189, 248, 0.15)';
          box.style.transform = 'translateY(-2px) scale(1.02)';
        } else {
          box.classList.remove('active');
          box.style.border = '';
          box.style.boxShadow = '';
          box.style.transform = '';
        }
      });
    }

    function setAppIconTheme(iconTheme, persist = true) {
      const validThemes = ['vibrant', 'gold', 'emerald', 'ocean', 'purple', 'silver'];
      if (!validThemes.includes(iconTheme)) iconTheme = 'vibrant';

      state.iconTheme = iconTheme;
      document.documentElement.setAttribute('data-icon-theme', iconTheme);
      document.body.setAttribute('data-icon-theme', iconTheme);

      if (persist) {
        try { localStorage.setItem('family_monefy_icon_theme', iconTheme); } catch(e) {}
      }

      const opts = ['Vibrant', 'Gold', 'Emerald', 'Ocean', 'Purple', 'Silver'];
      opts.forEach(o => {
        const el = document.getElementById('iconThemeOpt' + o);
        if (el) {
          if (o.toLowerCase() === iconTheme) el.classList.add('active');
          else el.classList.remove('active');
        }
      });

      const names = {
        'vibrant': 'ملون فينتك (افتراضي)',
        'gold': 'ذهبي ملكي',
        'emerald': 'زمردي فاخر',
        'ocean': 'سماوي بحري',
        'purple': 'بنفسجي ياقوتي',
        'silver': 'بلاتيني مونوكروم'
      };

      const badge = document.getElementById('activeIconThemeBadge');
      if (badge) badge.textContent = names[iconTheme] || iconTheme;

      // تحديث فوري للكروت وشبكة المصروفات لتأخذ ألوان الأيقونات الجديدة
      try {
        if (typeof renderUI === 'function') renderUI();
      } catch(e) {}

      if (persist && typeof showToast === 'function') {
        showToast(`✨ تم تفعيل نمط ألوان الأيقونات: ${names[iconTheme] || iconTheme}`);
      }
    }


    
    // تبديل إظهار وطي شارت TradingView المصغر في بورصة الذهب
    function toggleTradingViewChart() {
      const container = document.getElementById('tvChartContainer');
      const btn = document.getElementById('btnToggleTvChart');
      if (!container) return;
      if (container.style.display === 'none') {
        container.style.display = 'block';
        if (btn) btn.textContent = 'طي الشارت';
      } else {
        container.style.display = 'none';
        if (btn) btn.textContent = 'إظهار الشارت';
      }
    }

    // تطبيق نمط وتصميم الكروت (Design Style Engine)
    // ==========================================
    // التحكم التلقائي في حجم الخط ومقاس الشاشات والكروت (v3.5.5)
    // ==========================================
    function getChartDynamicFontSize(base = 10) {
      const size = document.documentElement.getAttribute('data-font-size') || 'medium';
      if (size === 'small') return Math.max(8, base - 1.5);
      if (size === 'large') return base + 1.8;
      return base;
    }

    function setAppFontSize(size, persist = true, notify = false) {
      const validSizes = ['small', 'medium', 'large'];
      if (!validSizes.includes(size)) size = 'medium';

      document.documentElement.setAttribute('data-font-size', size);
      document.body.setAttribute('data-font-size', size);

      if (persist) {
        try {
          localStorage.setItem('family_expense_font_size', size);
        } catch (e) {}
      }

      // تحديث حالة الأزرار في الإعدادات
      document.querySelectorAll('.font-size-pill').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById(
        size === 'small' ? 'fontSizeSmall' : 
        (size === 'large' ? 'fontSizeLarge' : 'fontSizeMedium')
      );
      if (activeBtn) activeBtn.classList.add('active');

      const badge = document.getElementById('activeFontSizeBadge');
      const labels = { small: 'صغير (مدمج)', medium: 'وسط (الافتراضي)', large: 'كبير (واضح وبارز)' };
      if (badge) badge.textContent = labels[size] || 'وسط';

      // تحديث الشاشات والكروت تلقائياً لضبط التناسب مع الحجم الجديد
      if (typeof renderCategoriesGrid === 'function') {
        const txs = (typeof getFilteredTransactions === 'function') ? getFilteredTransactions() : state.transactions;
        renderCategoriesGrid(txs);
      }
      if (typeof renderAnalyticsUI === 'function') {
        renderAnalyticsUI();
      }
      if (typeof renderUI === 'function') {
        renderUI();
      }
      try { window.dispatchEvent(new Event('resize')); } catch(e) {}

      if (notify) showToast(`🔠 تم تفعيل حجم الخط: ${labels[size]} وتكييف الشاشات تلقائياً`);
    }

    // رصد وتطبيق التكيف التلقائي مع مقاس الشاشة المفتوحة منها
    function applyScreenAdaptiveLayout() {
      const h = window.innerHeight;
      const w = window.innerWidth;
      const hMode = h < 700 ? 'compact' : (h > 860 ? 'tall' : 'standard');
      const wMode = w >= 600 ? 'tablet' : 'mobile';
      document.documentElement.setAttribute('data-screen-h', hMode);
      document.documentElement.setAttribute('data-screen-w', wMode);
    }