import re, sys
sys.stdout.reconfigure(encoding='utf-8')

print("Reading index.html...")
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# -------------------------------------------------------------
# 1. Update Swipe Gestures for Left & Right Drawers (Open & Close)
# -------------------------------------------------------------
print("1. Updating Swipe Gestures for both opening and closing...")
old_swipe_regex = r'let touchStartX = 0;\s*let touchStartY = 0;\s*window\.addEventListener\(\'touchstart\'[\s\S]*?window\.addEventListener\(\'touchend\'[\s\S]*?\}\s*,\s*\{\s*passive:\s*true\s*\}\);'

new_swipe_code = '''let touchStartX = 0;
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        // التحقق من أن التمرير أفقي واضح
        if (Math.abs(deltaX) > 40 && Math.abs(deltaY) < 90) {
          const leftDrawer = document.getElementById('summaryLeftDrawer');
          const isLeftOpen = leftDrawer && (leftDrawer.classList.contains('open') || leftDrawer.classList.contains('active'));
          
          const rightDrawer = document.getElementById('goldDrawerPanel');
          const isRightOpen = rightDrawer && (rightDrawer.classList.contains('open') || rightDrawer.classList.contains('active'));

          // 1. إذا كان الدرج الأيسر (الملخص والمهام) مفتوحاً: التمرير لليسار يغلقه فوراً
          if (isLeftOpen && deltaX < -35) {
            closeSummaryLeftDrawer();
            return;
          }

          // 2. إذا كان الدرج الأيمن (الذهب والبورصة) مفتوحاً: التمرير لليمين يغلقه فوراً
          if (isRightOpen && deltaX > 35) {
            closeGoldDrawer();
            return;
          }

          // 3. فتح الدرج الأيسر: سحب من أقصى اليسار إلى اليمين
          if (!isLeftOpen && !isRightOpen && deltaX > 45 && touchStartX < 95) {
            openSummaryDrawer();
            return;
          }

          // 4. فتح الدرج الأيمن: سحب من أقصى اليمين إلى اليسار
          if (!isLeftOpen && !isRightOpen && deltaX < -45 && touchStartX > (window.innerWidth - 95)) {
            openGoldDrawer();
            return;
          }
        }
      }
    }, { passive: true });'''

if re.search(old_swipe_regex, content):
    content = re.sub(old_swipe_regex, new_swipe_code, content)
    print("✓ Upgraded swipe gestures (open & close)")
else:
    idx_swipe = content.find('let touchStartX = 0;')
    if idx_swipe != -1:
        idx_swipe_end = content.find('{ passive: true });', idx_swipe)
        idx_swipe_end = content.find('{ passive: true });', idx_swipe_end + 10)
        if idx_swipe_end != -1:
            full_end = idx_swipe_end + len('{ passive: true });')
            content = content[:idx_swipe] + new_swipe_code + content[full_end:]
            print("✓ Upgraded swipe gestures via substring index")

# -------------------------------------------------------------
# 2. Update toggleCurrency to include Gold 21 in cycle & update badge
# -------------------------------------------------------------
print("2. Upgrading toggleCurrency...")
old_toggle_curr_regex = r'function toggleCurrency\(\)\s*\{[\s\S]*?showToast\([^\)]*\);\s*\}'

new_toggle_curr = '''function toggleCurrency() {
      // دورة العملات الأربعة: جنيه -> دولار -> ريال -> ذهب عيار 21 -> جنيه
      if (state.currency === 'EGP') state.currency = 'USD';
      else if (state.currency === 'USD') state.currency = 'SAR';
      else if (state.currency === 'SAR') state.currency = 'GOLD21';
      else state.currency = 'EGP';

      const el = document.getElementById('activeCurrencyText');
      if (el) {
        if (state.currency === 'GOLD21') el.textContent = 'ذهب 21';
        else el.textContent = state.currency;
      }

      const btn = document.getElementById('btnToggleCurrency');
      if (btn) {
        if (state.currency === 'GOLD21') {
          btn.style.borderColor = '#f59e0b';
          btn.style.color = '#fbbf24';
          btn.title = 'العملة الحالية: تقويم جرام الذهب عيار 21 (انقر للتبديل)';
        } else {
          btn.style.borderColor = 'rgba(245, 158, 11, 0.5)';
          btn.style.color = '#fbbf24';
          btn.title = `العملة الحالية: ${state.currency} (انقر للتبديل)`;
        }
      }
      
      // إعادة رسم كامل الواجهة والبطاقات والرسوم البيانية بالعملة الجديدة
      renderUI();
      try {
        if (typeof renderExecutiveKPIs === 'function') renderExecutiveKPIs();
        if (typeof renderAnalyticsRankings === 'function') renderAnalyticsRankings();
        if (typeof renderDailyTimelineChart === 'function') renderDailyTimelineChart();
        if (typeof renderMonthlyComparison === 'function') renderMonthlyComparison();
        if (typeof renderRequestsCompareChart === 'function') renderRequestsCompareChart();
        if (typeof renderComparisonsSection === 'function') renderComparisonsSection();
      } catch(e) { console.error('Error refreshing charts on currency change:', e); }

      const labelToast = state.currency === 'GOLD21' ? 'جرام الذهب عيار 21' : state.currency;
      showToast(`💱 تم التبديل إلى: ${labelToast} (${getCurrencySymbol()})`);
    }'''

if re.search(old_toggle_curr_regex, content):
    content = re.sub(old_toggle_curr_regex, new_toggle_curr, content)
    print("✓ Updated toggleCurrency with Gold 21")

# -------------------------------------------------------------
# 3. Overhaul renderCategoriesGrid:
#    - Image and Name clearly more prominent than total amount
#    - Delete "كشف العمليات"
#    - Sign on the RIGHT, Currency on the LEFT
#    - Dynamic scaling for millions to never overflow
# -------------------------------------------------------------
print("3. Overhauling renderCategoriesGrid for prominent image/name and clean amount...")
old_grid_func_regex = r'function renderCategoriesGrid\(filtered\)\s*\{[\s\S]*?grid\.appendChild\(card\);\s*\}\);\s*\}'

new_grid_func = '''function renderCategoriesGrid(filtered) {
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

      // ألوان مشرقة زاهية فريدة لكل تصنيف
      const HIGH_CONTRAST_THEMES = {
        food: {
          name: 'طعام ومشتريات',
          emoji: '🛒',
          accent: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          bgDark: 'linear-gradient(160deg, rgba(16, 185, 129, 0.30) 0%, rgba(16, 185, 129, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(16, 185, 129, 0.20) 0%, rgba(16, 185, 129, 0.06) 40%, #ffffff 90%)',
          border: '#10b981'
        },
        daily: {
          name: 'مصروف يومي',
          emoji: '☕',
          accent: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          bgDark: 'linear-gradient(160deg, rgba(245, 158, 11, 0.30) 0%, rgba(245, 158, 11, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(245, 158, 11, 0.20) 0%, rgba(245, 158, 11, 0.06) 40%, #ffffff 90%)',
          border: '#f59e0b'
        },
        bills: {
          name: 'فواتير والتزامات',
          emoji: '⚡',
          accent: '#f97316',
          gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
          bgDark: 'linear-gradient(160deg, rgba(249, 115, 22, 0.30) 0%, rgba(249, 115, 22, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(249, 115, 22, 0.20) 0%, rgba(249, 115, 22, 0.06) 40%, #ffffff 90%)',
          border: '#f97316'
        },
        transport: {
          name: 'مواصلات وبنزين',
          emoji: '🚗',
          accent: '#0284c7',
          gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          bgDark: 'linear-gradient(160deg, rgba(2, 132, 199, 0.30) 0%, rgba(2, 132, 199, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(2, 132, 199, 0.20) 0%, rgba(2, 132, 199, 0.06) 40%, #ffffff 90%)',
          border: '#0284c7'
        },
        house: {
          name: 'مستلزمات منزل',
          emoji: '🛋️',
          accent: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          bgDark: 'linear-gradient(160deg, rgba(139, 92, 246, 0.30) 0%, rgba(139, 92, 246, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(139, 92, 246, 0.20) 0%, rgba(139, 92, 246, 0.06) 40%, #ffffff 90%)',
          border: '#8b5cf6'
        },
        health: {
          name: 'صحة وعلاج',
          emoji: '💊',
          accent: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          bgDark: 'linear-gradient(160deg, rgba(239, 68, 68, 0.30) 0%, rgba(239, 68, 68, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(239, 68, 68, 0.20) 0%, rgba(239, 68, 68, 0.06) 40%, #ffffff 90%)',
          border: '#ef4444'
        },
        clothes: {
          name: 'ملابس وأحذية',
          emoji: '👔',
          accent: '#ec4899',
          gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          bgDark: 'linear-gradient(160deg, rgba(236, 72, 153, 0.30) 0%, rgba(236, 72, 153, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(236, 72, 153, 0.20) 0%, rgba(236, 72, 153, 0.06) 40%, #ffffff 90%)',
          border: '#ec4899'
        },
        education: {
          name: 'تعليم ودروس',
          emoji: '🎓',
          accent: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          bgDark: 'linear-gradient(160deg, rgba(59, 130, 246, 0.30) 0%, rgba(59, 130, 246, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(59, 130, 246, 0.20) 0%, rgba(59, 130, 246, 0.06) 40%, #ffffff 90%)',
          border: '#3b82f6'
        },
        other: {
          name: 'أخرى ونثريات',
          emoji: '🎁',
          accent: '#14b8a6',
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          bgDark: 'linear-gradient(160deg, rgba(20, 184, 166, 0.30) 0%, rgba(20, 184, 166, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(20, 184, 166, 0.20) 0%, rgba(20, 184, 166, 0.06) 40%, #ffffff 90%)',
          border: '#14b8a6'
        },
        entertainment: {
          name: 'أخرى ونثريات',
          emoji: '🎁',
          accent: '#14b8a6',
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          bgDark: 'linear-gradient(160deg, rgba(20, 184, 166, 0.30) 0%, rgba(20, 184, 166, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(20, 184, 166, 0.20) 0%, rgba(20, 184, 166, 0.06) 40%, #ffffff 90%)',
          border: '#14b8a6'
        }
      };

      const activeTheme = state.appTheme || localStorage.getItem('family_monefy_theme') || 'navy';
      const isLight = (activeTheme === 'light') || document.body.classList.contains('light-theme');
      const activeIconTheme = state.iconTheme || localStorage.getItem('family_monefy_icon_theme') || 'vibrant';

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
          bgDark: 'linear-gradient(160deg, rgba(56, 189, 248, 0.28) 0%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(56, 189, 248, 0.18) 0%, #ffffff 90%)',
          border: cat.color
        };

        const cardBg = isLight ? theme.bgLight : theme.bgDark;
        const cardBorder = isLight ? `2px solid ${theme.accent}` : `2px solid ${theme.accent}aa`;
        const cardShadow = isLight 
          ? `0 6px 16px rgba(0, 0, 0, 0.08), 0 0 12px ${theme.accent}25` 
          : `0 6px 20px rgba(0, 0, 0, 0.50), 0 0 14px ${theme.accent}35, inset 0 1px 0 rgba(255, 255, 255, 0.15)`;

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
          border-radius: 16px !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: space-between !important;
          height: 100% !important;
          max-height: var(--app-card-max-h, 135px) !important;
          min-height: 0 !important;
          box-shadow: ${cardShadow} !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        `;

        // حساب المبلغ المحول والرمز والإشارة
        const isGold = state.currency === 'GOLD21';
        const converted = convertAmount(spent);
        const currSymbol = getCurrencySymbol();
        
        let numStr = '0.00';
        if (spent > 0) {
          numStr = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: isGold ? 3 : 2 });
        }
        const signStr = (spent > 0) ? '-' : '';

        // معالجة المبالغ بالملايين أو الأرقام الطويلة حتى لا تخرج عن نطاق الكارت
        let amtFontSize = 'clamp(0.72rem, 2.1vw, 0.84rem)';
        let amtLetterSpacing = '0px';
        const totalLen = numStr.length;

        if (totalLen >= 14 || isGold) {
          amtFontSize = 'clamp(0.50rem, 1.45vw, 0.60rem)';
          amtLetterSpacing = '-0.5px';
        } else if (totalLen >= 10) { // ملايين: 1,000,000.00 فأكثر
          amtFontSize = 'clamp(0.58rem, 1.65vw, 0.68rem)';
          amtLetterSpacing = '-0.4px';
        } else if (totalLen >= 8) { // مئات الآلاف: 100,000.00
          amtFontSize = 'clamp(0.66rem, 1.9vw, 0.76rem)';
          amtLetterSpacing = '-0.2px';
        }

        const lowerCardBg = spent > 0 
          ? (isLight ? 'rgba(239, 68, 68, 0.10)' : 'rgba(239, 68, 68, 0.22)') 
          : (isLight ? 'rgba(241, 245, 249, 0.85)' : 'rgba(15, 23, 42, 0.68)');
        const lowerCardBorder = spent > 0 
          ? (isLight ? 'rgba(239, 68, 68, 0.5)' : '#f43f5e') 
          : (isLight ? 'rgba(203, 213, 225, 0.7)' : `${theme.accent}44`);
        const amtColor = spent > 0 
          ? (isLight ? '#b91c1c' : '#ff4d6d') 
          : (isLight ? '#475569' : '#cbd5e1');

        card.innerHTML = `
          <!-- 1. النصف العلوي (البطل الأساسي الأكثر بروزاً 66%): صورة البند كبيرة ومجسمة واسم البند واضح وبارز تماماً تحتها -->
          <div class="cat-card-top-half" 
               onclick="event.stopPropagation(); openQuickCategoryExpense('${cat.id}');"
               title="انقر على الرمز لتسجيل مصروف جديد في ${theme.name}"
               style="flex: 1.4 1 66%; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 6px 3px 2px; cursor: pointer; transition: background 0.15s ease; box-sizing: border-box; overflow: hidden;">
            
            <!-- صورة البند ثلاثية الأبعاد الفاخرة البارزة -->
            <div class="cat-icon-bubble" 
                 style="background: ${bubbleGradient}; width: clamp(34px, 9.2vw, 42px) !important; height: clamp(34px, 9.2vw, 42px) !important; min-width: 32px !important; min-height: 32px !important; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45), inset 0 0 5px rgba(255, 255, 255, 0.40), 0 0 12px ${bubbleGlow}; border: 1.8px solid rgba(255, 255, 255, 0.80); outline: 1.5px solid ${theme.accent}; flex-shrink: 0; transition: transform 0.15s ease;">
              <span style="font-size: clamp(1.35rem, 3.8vw, 1.70rem) !important; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.5)); transform: translateZ(0);">${theme.emoji}</span>
            </div>

            <!-- اسم بند المصروف بارز وواضح جداً تحت صورة البند مباشرة -->
            <div class="cat-label-text" 
                 style="font-family: var(--font-family); font-size: clamp(0.72rem, 2.1vw, 0.82rem) !important; font-weight: 900 !important; color: ${isLight ? '#0f172a' : '#ffffff'} !important; text-shadow: ${isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.9)'}; text-align: center; margin: 0; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; padding: 0 2px; box-sizing: border-box;">
              ${theme.name}
            </div>
          </div>

          <!-- 2. النصف السفلي (34% كبسولة مدمجة للمبلغ): المبلغ الرقمي محكم مع وضع رمز العملة على يسار المبلغ والإشارة دائماً على يمين المبلغ وبدون كلمة كشف العمليات -->
          <div class="cat-card-bottom-half ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
               onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
               title="انقر هنا لعرض كشف وتفاصيل حركات ${theme.name}" 
               style="flex: 0.65 1 34%; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; padding: 2px 3px; cursor: pointer; background: ${lowerCardBg}; border-top: 1.5px solid ${lowerCardBorder}; box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.25); box-sizing: border-box; transition: all 0.15s ease; overflow: hidden;">
            <div class="cat-amount-val" 
                 style="font-family: var(--font-numbers); font-size: ${amtFontSize}; letter-spacing: ${amtLetterSpacing}; font-weight: 850; color: ${amtColor}; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; direction: rtl; text-align: center; font-variant-numeric: tabular-nums; display: flex; align-items: baseline; justify-content: center; gap: 2.5px; box-sizing: border-box; padding: 0 2px;">
              ${signStr ? `<span style="font-weight: 950; margin-left: 2px;">${signStr}</span>` : ''}
              <span style="font-variant-numeric: tabular-nums;">${numStr}</span>
              <span style="font-size: 0.78em; font-weight: 800; opacity: 0.9; margin-right: 2px;">${currSymbol}</span>
            </div>
          </div>
        `;

        grid.appendChild(card);
      });
    }'''

if re.search(old_grid_func_regex, content):
    content = re.sub(old_grid_func_regex, new_grid_func, content)
    print("✓ Successfully overhauled renderCategoriesGrid")
else:
    idx_grid_start = content.find('function renderCategoriesGrid(filtered) {')
    idx_grid_end = content.find('grid.appendChild(card);\n      });\n    }', idx_grid_start)
    if idx_grid_start != -1 and idx_grid_end != -1:
        content = content[:idx_grid_start] + new_grid_func + content[idx_grid_end + len('grid.appendChild(card);\n      });\n    }'):]
        print("✓ Replaced renderCategoriesGrid via substring")

# Bump build ID to 202611071650
content = re.sub(r'APP_BUILD_ID\s*=\s*\d+', 'APP_BUILD_ID = 202611071650', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

with open('version.json', 'w', encoding='utf-8') as f:
    f.write('''{
  "version": "4.9.6",
  "build": 202611071650,
  "updated_at": "2026-11-07 04:50 PM",
  "description": "v4.9.6: Category icon and title made more prominent than total amount. Added horizontal swipe gestures to open and close both side drawers. Added 21K Gold to currency toggle cycle. Enforced currency symbol on left and sign (+/-) on right. Scaled million amounts to prevent overflow."
}''')

print("Saved updated index.html and version.json")
