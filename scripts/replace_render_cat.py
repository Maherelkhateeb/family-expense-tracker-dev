import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pos1 = content.find('function renderCategoriesGrid(filtered) {')
pos2 = content.find('function openQuickCategoryExpense(catId) {')

if pos1 == -1 or pos2 == -1:
    print("Error: markers not found!", pos1, pos2)
    sys.exit(1)

new_render_cat_fn = """function renderCategoriesGrid(filtered) {
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
          gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
        },
        daily: {
          name: 'مصروف يومي',
          emoji: '☕',
          accent: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'
        },
        bills: {
          name: 'فواتير والتزامات',
          emoji: '⚡',
          accent: '#f97316',
          gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
        },
        transport: {
          name: 'مواصلات وبنزين',
          emoji: '🚗',
          accent: '#0284c7',
          gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
        },
        house: {
          name: 'مستلزمات منزل',
          emoji: '🛋️',
          accent: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
        },
        health: {
          name: 'صحة وعلاج',
          emoji: '💊',
          accent: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
        },
        clothes: {
          name: 'ملابس وأحذية',
          emoji: '👔',
          accent: '#ec4899',
          gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
        },
        education: {
          name: 'تعليم ودروس',
          emoji: '📚',
          accent: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
        },
        other: {
          name: 'أخرى ونثريات',
          emoji: '🎁',
          accent: '#14b8a6',
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)'
        }
      };

      const activeTheme = state.appTheme || localStorage.getItem('family_monefy_theme') || 'navy';
      const isLight = (activeTheme === 'light') || document.body.classList.contains('light-theme');
      const isGold = state.currency === 'GOLD21';
      const currSymbol = getCurrencySymbol();

      // محرك لوحات ألوان الكروت الداخلية المتكيفة بالكامل مع كافة سمات التطبيق الـ 9
      const THEME_CARD_PALETTES = {
        navy: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}42 0%, ${c}15 38%, #08162b 100%)`,
          lowerZero: 'rgba(8, 22, 43, 0.88)',
          lowerSpent: 'rgba(239, 68, 68, 0.28)',
          border: (c) => `${c}cc`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.5), 0 0 12px ${c}35, inset 0 1px 0 rgba(255, 255, 255, 0.15)`
        },
        black: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}38 0%, ${c}12 38%, #030407 100%)`,
          lowerZero: 'rgba(10, 10, 14, 0.92)',
          lowerSpent: 'rgba(239, 68, 68, 0.32)',
          border: (c) => `${c}bb`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.7), 0 0 14px ${c}40, inset 0 1px 0 rgba(255, 255, 255, 0.12)`
        },
        emerald: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}45 0%, rgba(6, 69, 50, 0.45) 40%, #031c13 100%)`,
          lowerZero: 'rgba(3, 28, 19, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.28)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}44, inset 0 1px 0 rgba(52, 211, 153, 0.22)`
        },
        purple: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}45 0%, rgba(55, 18, 94, 0.45) 40%, #170729 100%)`,
          lowerZero: 'rgba(23, 7, 41, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.28)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}44, inset 0 1px 0 rgba(192, 132, 252, 0.22)`
        },
        rose: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}45 0%, rgba(70, 14, 38, 0.45) 40%, #220614 100%)`,
          lowerZero: 'rgba(34, 6, 20, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.28)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}44, inset 0 1px 0 rgba(251, 113, 133, 0.22)`
        },
        ocean: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}45 0%, rgba(14, 62, 92, 0.50) 40%, #051b2a 100%)`,
          lowerZero: 'rgba(5, 27, 42, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.28)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}44, inset 0 1px 0 rgba(34, 211, 238, 0.22)`
        },
        gold: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}45 0%, rgba(59, 35, 16, 0.50) 40%, #1e1107 100%)`,
          lowerZero: 'rgba(30, 17, 7, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.28)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}44, inset 0 1px 0 rgba(251, 191, 36, 0.22)`
        },
        slate: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, rgba(30, 41, 59, 0.45) 40%, #0f1622 100%)`,
          lowerZero: 'rgba(15, 22, 34, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.28)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}44, inset 0 1px 0 rgba(148, 163, 184, 0.22)`
        },
        light: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}25 0%, rgba(241, 245, 249, 0.70) 40%, #ffffff 100%)`,
          lowerZero: 'rgba(241, 245, 249, 0.95)',
          lowerSpent: 'rgba(239, 68, 68, 0.14)',
          border: (c) => c,
          shadow: (c) => `0 4px 14px rgba(0, 0, 0, 0.08), 0 0 10px ${c}30`
        }
      };

      const pal = THEME_CARD_PALETTES[activeTheme] || THEME_CARD_PALETTES.navy;
      const existingCards = grid.querySelectorAll('.cat-card');
      const needRebuild = (existingCards.length !== EXPENSE_CATEGORIES.length) || (grid.dataset.theme !== activeTheme);

      if (needRebuild) {
        grid.innerHTML = '';
        grid.dataset.theme = activeTheme;

        EXPENSE_CATEGORIES.forEach(cat => {
          const spent = catTotals[cat.id] || (cat.id === 'other' ? (catTotals['entertainment'] || 0) : 0);
          const theme = HIGH_CONTRAST_THEMES[cat.id] || {
            name: cat.name,
            emoji: '📦',
            accent: cat.color || '#38bdf8',
            gradient: `linear-gradient(135deg, ${cat.color}, #334155)`
          };

          const cardBg = pal.bgGrad(theme.accent);
          const cardBorder = `2px solid ${pal.border(theme.accent)}`;
          const cardShadow = pal.shadow(theme.accent);

          const converted = convertAmount(spent);
          let numStr = '0.00';
          if (spent > 0) {
            numStr = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: isGold ? 3 : 2 });
          }
          const signStr = (spent > 0) ? '-' : '';

          // خط أرقام ذكي يتكيف مع طول المبلغ حتى لا يخرج عن حدود البطاقة نهائياً
          let amtFontSize = 'clamp(0.85rem, 2.6vw, 0.96rem)';
          let amtLetterSpacing = '-0.2px';
          const totalLen = numStr.length;
          if (totalLen >= 14 || isGold) {
            amtFontSize = 'clamp(0.58rem, 1.7vw, 0.68rem)';
            amtLetterSpacing = '-0.5px';
          } else if (totalLen >= 10) {
            amtFontSize = 'clamp(0.66rem, 1.9vw, 0.76rem)';
            amtLetterSpacing = '-0.4px';
          } else if (totalLen >= 7) {
            amtFontSize = 'clamp(0.74rem, 2.2vw, 0.85rem)';
            amtLetterSpacing = '-0.3px';
          }

          const lowerCardBg = spent > 0 ? pal.lowerSpent : pal.lowerZero;
          const lowerCardBorder = spent > 0 
            ? (isLight ? 'rgba(239, 68, 68, 0.6)' : '#f43f5e') 
            : (isLight ? 'rgba(203, 213, 225, 0.8)' : `${theme.accent}55`);
          const amtColor = spent > 0 
            ? (isLight ? '#b91c1c' : '#ff4d6d') 
            : (isLight ? '#334155' : '#f1f5f9');

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
            max-height: var(--app-card-max-h, 140px) !important;
            min-height: 0 !important;
            box-shadow: ${cardShadow} !important;
            transition: all 0.22s ease !important;
            position: relative !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            touch-action: manipulation !important;
            contain: content !important;
          `;

          card.innerHTML = `
            <!-- 1. النصف العلوي: رمز أكبر واسم أكبر يملأ الفراغ المخصص له بالكامل -->
            <div class="cat-card-top-half" 
                 onclick="event.stopPropagation(); openQuickCategoryExpense('${cat.id}');"
                 title="انقر على الرمز لتسجيل مصروف جديد في ${theme.name}"
                 style="flex: 1.4 1 64%; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 6px 3px 2px; cursor: pointer; transition: background 0.15s ease; box-sizing: border-box; overflow: hidden; touch-action: manipulation;">
              
              <!-- بالون الرمز أكبر ومجسم يملأ مساحته بروعة -->
              <div class="cat-icon-bubble" 
                   style="background: ${theme.gradient}; width: clamp(40px, 10.5vw, 46px) !important; height: clamp(40px, 10.5vw, 46px) !important; min-width: 38px !important; min-height: 38px !important; border-radius: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), inset 0 0 6px rgba(255, 255, 255, 0.40); border: 2px solid rgba(255, 255, 255, 0.85); outline: 1.5px solid ${theme.accent}; flex-shrink: 0;">
                <span style="font-size: clamp(1.60rem, 4.2vw, 1.95rem) !important; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.5));">${theme.emoji}</span>
              </div>

              <!-- اسم بند المصروف أكبر وواضح يملأ الفراغ مباشرة تحت الرمز -->
              <div class="cat-label-text" 
                   style="font-family: var(--font-family); font-size: clamp(0.80rem, 2.4vw, 0.92rem) !important; font-weight: 950 !important; color: ${isLight ? '#0f172a' : '#ffffff'} !important; text-shadow: ${isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.95)'}; text-align: center; margin: 0; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; padding: 0 2px; box-sizing: border-box;">
                ${theme.name}
              </div>
            </div>

            <!-- 2. النصف السفلي: كبسولة أرقام محكومة تماماً داخل حدود البطاقة بدون أي خروج -->
            <div class="cat-card-bottom-half ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
                 onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
                 title="انقر لعرض حركات ${theme.name}" 
                 style="flex: 0.8 1 36%; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; padding: 4px 2px; cursor: pointer; background: ${lowerCardBg}; border-top: 1.5px solid ${lowerCardBorder}; box-sizing: border-box; transition: all 0.15s ease; overflow: hidden; touch-action: manipulation;">
              <div class="cat-amount-val" 
                   style="font-family: var(--font-numbers); font-size: ${amtFontSize}; letter-spacing: ${amtLetterSpacing}; font-weight: 950; color: ${amtColor}; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; direction: rtl; text-align: center; font-variant-numeric: tabular-nums; display: flex; align-items: baseline; justify-content: center; gap: 2px; box-sizing: border-box; padding: 0 1px;">
                ${signStr ? `<span style="font-weight: 950; margin-left: 2px; order: 1; font-size: 1.02em;">${signStr}</span>` : ''}
                <span style="font-variant-numeric: tabular-nums; order: 2;">${numStr}</span>
                <span style="font-size: 0.74em; font-weight: 850; opacity: 0.95; margin-right: 1px; order: 3;">${currSymbol}</span>
              </div>
            </div>
          `;
          grid.appendChild(card);
        });
      } else {
        // Fast in-place DOM updates with live theme sync
        EXPENSE_CATEGORIES.forEach(cat => {
          const card = grid.querySelector(`[data-cat-id="${cat.id}"]`);
          if (!card) return;
          const spent = catTotals[cat.id] || (cat.id === 'other' ? (catTotals['entertainment'] || 0) : 0);
          const theme = HIGH_CONTRAST_THEMES[cat.id] || { accent: cat.color || '#38bdf8' };
          const converted = convertAmount(spent);
          let numStr = '0.00';
          if (spent > 0) {
            numStr = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: isGold ? 3 : 2 });
          }
          const signStr = (spent > 0) ? '-' : '';

          let amtFontSize = 'clamp(0.85rem, 2.6vw, 0.96rem)';
          let amtLetterSpacing = '-0.2px';
          const totalLen = numStr.length;
          if (totalLen >= 14 || isGold) {
            amtFontSize = 'clamp(0.58rem, 1.7vw, 0.68rem)';
            amtLetterSpacing = '-0.5px';
          } else if (totalLen >= 10) {
            amtFontSize = 'clamp(0.66rem, 1.9vw, 0.76rem)';
            amtLetterSpacing = '-0.4px';
          } else if (totalLen >= 7) {
            amtFontSize = 'clamp(0.74rem, 2.2vw, 0.85rem)';
            amtLetterSpacing = '-0.3px';
          }

          // مزامنة الألوان الحية للبطاقة
          card.style.background = pal.bgGrad(theme.accent);
          card.style.borderColor = pal.border(theme.accent);
          card.style.boxShadow = pal.shadow(theme.accent);

          const lowerHalf = card.querySelector('.cat-card-bottom-half');
          const amtEl = card.querySelector('.cat-amount-val');
          if (lowerHalf && amtEl) {
            const amtColor = spent > 0 ? (isLight ? '#b91c1c' : '#ff4d6d') : (isLight ? '#334155' : '#f1f5f9');
            const lowerBg = spent > 0 ? pal.lowerSpent : pal.lowerZero;
            lowerHalf.style.background = lowerBg;
            amtEl.style.fontSize = amtFontSize;
            amtEl.style.letterSpacing = amtLetterSpacing;
            amtEl.style.color = amtColor;
            amtEl.innerHTML = `
              ${signStr ? `<span style="font-weight: 950; margin-left: 2px; order: 1; font-size: 1.02em;">${signStr}</span>` : ''}
              <span style="font-variant-numeric: tabular-nums; order: 2;">${numStr}</span>
              <span style="font-size: 0.74em; font-weight: 850; opacity: 0.95; margin-right: 1px; order: 3;">${currSymbol}</span>
            `;
          }
        });
      }
    }\n\n    """

content = content[:pos1] + new_render_cat_fn + content[pos2:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("renderCategoriesGrid replaced successfully! New length:", len(content))
