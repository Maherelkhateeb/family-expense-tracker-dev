import sys

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Optimize renderUI() lazy rendering
old_render_ui_tail = '''      // 5. تحديث العمليات وقائمة السجلات والأرشيف
      filterOperationsList();
      renderActivityLogUI();
      initMemberPhotoPickers();

      // 6. تحديث صفحة المؤشرات والشارتات فوراً
      try {
        updateAnalyticsChart();
      } catch(e) {
        console.warn('updateAnalyticsChart error:', e);
      }

      if (state.activeCategoryFilter && typeof showCategoryDetailBanner === 'function') {
        showCategoryDetailBanner(state.activeCategoryFilter);
      }

      if (typeof renderRequestsList === 'function') renderRequestsList();
      if (typeof renderExpectedList === 'function') renderExpectedList();'''

new_render_ui_tail = '''      // 5. تحديث محتويات الصفحة النشطة فقط بذكاء وسرعة فائقة استجابة لطلب المستخدم (Ultra-Fast 60fps Lazy Rendering)
      const activeP = state.activePage || 'expenses';
      if (activeP === 'expenses') {
        // الصفحة الرئيسية تم تحديث قمرتها وبنودها فوراً في أجزاء من الميلي ثانية
      } else if (activeP === 'operations') {
        if (typeof filterOperationsList === 'function') filterOperationsList();
        if (state.activeOpsSubTab === 'archive' && typeof renderActivityLogUI === 'function') renderActivityLogUI();
      } else if (activeP === 'analytics') {
        try {
          if (typeof updateAnalyticsChart === 'function') updateAnalyticsChart();
          if (state.activeCategoryFilter && typeof showCategoryDetailBanner === 'function') {
            showCategoryDetailBanner(state.activeCategoryFilter);
          }
        } catch(e) { console.warn('updateAnalyticsChart error:', e); }
      } else if (activeP === 'requests') {
        if (typeof renderRequestsList === 'function') renderRequestsList();
      } else if (activeP === 'expected') {
        if (typeof renderExpectedList === 'function') renderExpectedList();
      }'''

if old_render_ui_tail in content:
    content = content.replace(old_render_ui_tail, new_render_ui_tail, 1)
    print('1. Optimized renderUI lazy rendering successfully!')
else:
    print('1. old_render_ui_tail not found!')

# 2. Optimize renderCategoriesGrid with in-place DOM updates & strict RTL ordering
# Let's locate function renderCategoriesGrid
cat_grid_start = '    function renderCategoriesGrid(filtered) {'
if cat_grid_start in content:
    # Find next function openQuickCategoryExpense
    end_marker = '    function openQuickCategoryExpense(catId) {'
    idx1 = content.find(cat_grid_start)
    idx2 = content.find(end_marker, idx1)
    if idx1 != -1 and idx2 != -1:
        new_cat_grid_code = '''    function renderCategoriesGrid(filtered) {
      const grid = document.getElementById('catGrid');
      if (!grid) return;

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

      const HIGH_CONTRAST_THEMES = {
        food: {
          name: 'طعام ومشتريات',
          emoji: '🛒',
          accent: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          bgDark: 'linear-gradient(160deg, rgba(16, 185, 129, 0.32) 0%, rgba(16, 185, 129, 0.14) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.08) 40%, #ffffff 90%)',
          border: '#10b981'
        },
        daily: {
          name: 'مصروف يومي',
          emoji: '☕',
          accent: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          bgDark: 'linear-gradient(160deg, rgba(245, 158, 11, 0.32) 0%, rgba(245, 158, 11, 0.14) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.08) 40%, #ffffff 90%)',
          border: '#f59e0b'
        },
        bills: {
          name: 'فواتير والتزامات',
          emoji: '⚡',
          accent: '#f97316',
          gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
          bgDark: 'linear-gradient(160deg, rgba(249, 115, 22, 0.32) 0%, rgba(249, 115, 22, 0.14) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(249, 115, 22, 0.22) 0%, rgba(249, 115, 22, 0.08) 40%, #ffffff 90%)',
          border: '#f97316'
        },
        transport: {
          name: 'مواصلات وبنزين',
          emoji: '🚗',
          accent: '#0284c7',
          gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          bgDark: 'linear-gradient(160deg, rgba(2, 132, 199, 0.32) 0%, rgba(2, 132, 199, 0.14) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(2, 132, 199, 0.22) 0%, rgba(2, 132, 199, 0.08) 40%, #ffffff 90%)',
          border: '#0284c7'
        },
        house: {
          name: 'مستلزمات منزل',
          emoji: '🛋️',
          accent: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          bgDark: 'linear-gradient(160deg, rgba(139, 92, 246, 0.32) 0%, rgba(139, 92, 246, 0.14) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(139, 92, 246, 0.22) 0%, rgba(139, 92, 246, 0.08) 40%, #ffffff 90%)',
          border: '#8b5cf6'
        },
        health: {
          name: 'صحة وعلاج',
          emoji: '💊',
          accent: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          bgDark: 'linear-gradient(160deg, rgba(239, 68, 68, 0.32) 0%, rgba(239, 68, 68, 0.14) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.08) 40%, #ffffff 90%)',
          border: '#ef4444'
        },
        clothes: {
          name: 'ملابس وأحذية',
          emoji: '👔',
          accent: '#ec4899',
          gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          bgDark: 'linear-gradient(160deg, rgba(236, 72, 153, 0.32) 0%, rgba(236, 72, 153, 0.14) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(236, 72, 153, 0.22) 0%, rgba(236, 72, 153, 0.08) 40%, #ffffff 90%)',
          border: '#ec4899'
        },
        education: {
          name: 'تعليم ودروس',
          emoji: '🎓',
          accent: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          bgDark: 'linear-gradient(160deg, rgba(59, 130, 246, 0.32) 0%, rgba(59, 130, 246, 0.14) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0.08) 40%, #ffffff 90%)',
          border: '#3b82f6'
        },
        other: {
          name: 'أخرى ونثريات',
          emoji: '🎁',
          accent: '#14b8a6',
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          bgDark: 'linear-gradient(160deg, rgba(20, 184, 166, 0.32) 0%, rgba(20, 184, 166, 0.14) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(20, 184, 166, 0.22) 0%, rgba(20, 184, 166, 0.08) 40%, #ffffff 90%)',
          border: '#14b8a6'
        }
      };

      const activeTheme = state.appTheme || localStorage.getItem('family_monefy_theme') || 'navy';
      const isLight = (activeTheme === 'light') || document.body.classList.contains('light-theme');
      const isGold = state.currency === 'GOLD21';
      const currSymbol = getCurrencySymbol();

      const existingCards = grid.querySelectorAll('.cat-card');
      const needRebuild = (existingCards.length !== EXPENSE_CATEGORIES.length) || (grid.dataset.themeMode !== (isLight ? 'light' : 'dark'));

      if (needRebuild) {
        grid.innerHTML = '';
        grid.dataset.themeMode = isLight ? 'light' : 'dark';

        EXPENSE_CATEGORIES.forEach(cat => {
          const spent = catTotals[cat.id] || (cat.id === 'other' ? (catTotals['entertainment'] || 0) : 0);
          const theme = HIGH_CONTRAST_THEMES[cat.id] || {
            name: cat.name,
            emoji: '📦',
            accent: cat.color || '#38bdf8',
            gradient: `linear-gradient(135deg, ${cat.color}, #334155)`,
            bgDark: 'linear-gradient(160deg, rgba(56, 189, 248, 0.28) 0%, rgba(15, 23, 42, 0.94) 100%)',
            bgLight: 'linear-gradient(160deg, rgba(56, 189, 248, 0.18) 0%, #ffffff 90%)',
            border: cat.color
          };

          const cardBg = isLight ? theme.bgLight : theme.bgDark;
          const cardBorder = isLight ? `2px solid ${theme.accent}` : `2px solid ${theme.accent}cc`;
          const cardShadow = isLight 
            ? `0 4px 14px rgba(0, 0, 0, 0.08), 0 0 10px ${theme.accent}20` 
            : `0 4px 18px rgba(0, 0, 0, 0.45), 0 0 12px ${theme.accent}30, inset 0 1px 0 rgba(255, 255, 255, 0.15)`;

          const converted = convertAmount(spent);
          let numStr = '0.00';
          if (spent > 0) {
            numStr = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: isGold ? 3 : 2 });
          }
          const signStr = (spent > 0) ? '-' : '';

          let amtFontSize = 'clamp(0.72rem, 2.1vw, 0.84rem)';
          let amtLetterSpacing = '0px';
          const totalLen = numStr.length;
          if (totalLen >= 14 || isGold) {
            amtFontSize = 'clamp(0.50rem, 1.45vw, 0.60rem)';
            amtLetterSpacing = '-0.5px';
          } else if (totalLen >= 10) {
            amtFontSize = 'clamp(0.58rem, 1.65vw, 0.68rem)';
            amtLetterSpacing = '-0.4px';
          } else if (totalLen >= 8) {
            amtFontSize = 'clamp(0.66rem, 1.9vw, 0.76rem)';
            amtLetterSpacing = '-0.2px';
          }

          const lowerCardBg = spent > 0 
            ? (isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.24)') 
            : (isLight ? 'rgba(241, 245, 249, 0.90)' : 'rgba(15, 23, 42, 0.72)');
          const lowerCardBorder = spent > 0 
            ? (isLight ? 'rgba(239, 68, 68, 0.5)' : '#f43f5e') 
            : (isLight ? 'rgba(203, 213, 225, 0.7)' : `${theme.accent}44`);
          const amtColor = spent > 0 
            ? (isLight ? '#b91c1c' : '#ff4d6d') 
            : (isLight ? '#475569' : '#cbd5e1');

          const card = document.createElement('div');
          card.className = `cat-card cat-theme-${cat.id}`;
          card.setAttribute('data-cat-id', cat.id);
          card.style.cssText = `
            background: ${cardBg} !important;
            border: ${cardBorder} !important;
            border-radius: 16px !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: space-between !important;
            height: 100% !important;
            max-height: var(--app-card-max-h, 135px) !important;
            min-height: 0 !important;
            box-shadow: ${cardShadow} !important;
            transition: transform 0.12s ease !important;
            position: relative !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            touch-action: manipulation !important;
            contain: content !important;
          `;

          card.innerHTML = `
            <div class="cat-card-top-half" 
                 onclick="event.stopPropagation(); openQuickCategoryExpense('${cat.id}');"
                 title="انقر على الرمز لتسجيل مصروف جديد في ${theme.name}"
                 style="flex: 1.4 1 66%; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 6px 3px 2px; cursor: pointer; transition: background 0.15s ease; box-sizing: border-box; overflow: hidden; touch-action: manipulation;">
              
              <div class="cat-icon-bubble" 
                   style="background: ${theme.gradient}; width: clamp(34px, 9.2vw, 42px) !important; height: clamp(34px, 9.2vw, 42px) !important; min-width: 32px !important; min-height: 32px !important; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45), inset 0 0 5px rgba(255, 255, 255, 0.40); border: 1.8px solid rgba(255, 255, 255, 0.85); outline: 1.5px solid ${theme.accent}; flex-shrink: 0;">
                <span style="font-size: clamp(1.35rem, 3.8vw, 1.70rem) !important; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.5));">${theme.emoji}</span>
              </div>

              <div class="cat-label-text" 
                   style="font-family: var(--font-family); font-size: clamp(0.72rem, 2.1vw, 0.82rem) !important; font-weight: 900 !important; color: ${isLight ? '#0f172a' : '#ffffff'} !important; text-shadow: ${isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.9)'}; text-align: center; margin: 0; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; padding: 0 2px; box-sizing: border-box;">
                ${theme.name}
              </div>
            </div>

            <div class="cat-card-bottom-half ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
                 onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
                 title="انقر لعرض حركات ${theme.name}" 
                 style="flex: 0.65 1 34%; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; padding: 2px 3px; cursor: pointer; background: ${lowerCardBg}; border-top: 1.5px solid ${lowerCardBorder}; box-sizing: border-box; transition: all 0.15s ease; overflow: hidden; touch-action: manipulation;">
              <div class="cat-amount-val" 
                   style="font-family: var(--font-numbers); font-size: ${amtFontSize}; letter-spacing: ${amtLetterSpacing}; font-weight: 850; color: ${amtColor}; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; direction: rtl; text-align: center; font-variant-numeric: tabular-nums; display: flex; align-items: baseline; justify-content: center; gap: 2.5px; box-sizing: border-box; padding: 0 2px;">
                ${signStr ? `<span style="font-weight: 950; margin-left: 2px; order: 1;">${signStr}</span>` : ''}
                <span style="font-variant-numeric: tabular-nums; order: 2;">${numStr}</span>
                <span style="font-size: 0.78em; font-weight: 800; opacity: 0.9; margin-right: 2px; order: 3;">${currSymbol}</span>
              </div>
            </div>
          `;
          grid.appendChild(card);
        });
      } else {
        // Fast in-place DOM updates without wiping grid
        EXPENSE_CATEGORIES.forEach(cat => {
          const card = grid.querySelector(`[data-cat-id="${cat.id}"]`);
          if (!card) return;
          const spent = catTotals[cat.id] || (cat.id === 'other' ? (catTotals['entertainment'] || 0) : 0);
          const converted = convertAmount(spent);
          let numStr = '0.00';
          if (spent > 0) {
            numStr = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: isGold ? 3 : 2 });
          }
          const signStr = (spent > 0) ? '-' : '';

          let amtFontSize = 'clamp(0.72rem, 2.1vw, 0.84rem)';
          let amtLetterSpacing = '0px';
          const totalLen = numStr.length;
          if (totalLen >= 14 || isGold) {
            amtFontSize = 'clamp(0.50rem, 1.45vw, 0.60rem)';
            amtLetterSpacing = '-0.5px';
          } else if (totalLen >= 10) {
            amtFontSize = 'clamp(0.58rem, 1.65vw, 0.68rem)';
            amtLetterSpacing = '-0.4px';
          } else if (totalLen >= 8) {
            amtFontSize = 'clamp(0.66rem, 1.9vw, 0.76rem)';
            amtLetterSpacing = '-0.2px';
          }

          const lowerHalf = card.querySelector('.cat-card-bottom-half');
          const amtEl = card.querySelector('.cat-amount-val');
          if (lowerHalf && amtEl) {
            const amtColor = spent > 0 ? (isLight ? '#b91c1c' : '#ff4d6d') : (isLight ? '#475569' : '#cbd5e1');
            const lowerBg = spent > 0 ? (isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.24)') : (isLight ? 'rgba(241, 245, 249, 0.90)' : 'rgba(15, 23, 42, 0.72)');
            lowerHalf.style.background = lowerBg;
            amtEl.style.fontSize = amtFontSize;
            amtEl.style.letterSpacing = amtLetterSpacing;
            amtEl.style.color = amtColor;
            amtEl.innerHTML = `
              ${signStr ? `<span style="font-weight: 950; margin-left: 2px; order: 1;">${signStr}</span>` : ''}
              <span style="font-variant-numeric: tabular-nums; order: 2;">${numStr}</span>
              <span style="font-size: 0.78em; font-weight: 800; opacity: 0.9; margin-right: 2px; order: 3;">${currSymbol}</span>
            `;
          }
        });
      }
    }
'''
        content = content[:idx1] + new_cat_grid_code + '\n    ' + content[idx2:]
        print('2. Optimized renderCategoriesGrid with in-place updates & strict RTL order!')
    else:
        print('2. Could not locate full renderCategoriesGrid boundaries!')
else:
    print('2. cat_grid_start not found!')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Finished applying speedup optimizations to index.html!')
