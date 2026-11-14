import sys, re

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the inline style of headerBrandFamilyLogo and its parent
old_brand_markup = '''          <div class="brand-icon" title="رمز عائلة ماهر ❤️ أية (انقر للإعدادات وشعار العائلة)" onclick="openSettingsModal('brand_section')" style="cursor: pointer;">
            <img src="assets/family_option2_mosaic.jpg" id="headerBrandFamilyLogo">
          </div>'''

new_brand_markup = '''          <div class="brand-icon" title="رمز عائلة ماهر ❤️ أية (انقر للإعدادات وشعار العائلة)" onclick="openSettingsModal('brand_section')" style="width: 36px !important; height: 36px !important; min-width: 36px !important; min-height: 36px !important; max-width: 36px !important; max-height: 36px !important; border-radius: 12px !important; overflow: hidden !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; cursor: pointer; box-sizing: border-box !important;">
            <img src="assets/family_option2_mosaic.jpg" id="headerBrandFamilyLogo" style="width: 36px !important; height: 36px !important; max-width: 36px !important; max-height: 36px !important; object-fit: cover !important; border-radius: 12px !important; display: block !important;">
          </div>'''

if old_brand_markup in content:
    content = content.replace(old_brand_markup, new_brand_markup, 1)
    print('1. Replaced headerBrandFamilyLogo markup with strict inline 36px size!')
else:
    print('1. old_brand_markup not found, checking regex...')
    content = re.sub(
        r'<div class="brand-icon"[^>]*>\s*<img src="assets/family_option2_mosaic\.jpg" id="headerBrandFamilyLogo"[^>]*>\s*</div>',
        new_brand_markup,
        content
    )
    print('1. Replaced via regex!')

# 2. Fix the unclosed raw CSS before </head> by ensuring proper <style>...</style> wrapping
# Check if there is raw CSS before </head>
target_head = '</head>'
head_idx = content.find(target_head)
if head_idx != -1:
    # Let's inspect the 500 chars before </head>
    snippet = content[max(0, head_idx - 600):head_idx]
    if '/* حماية صارمة لمنع تمدد شعار العائلة' in snippet and '<style' not in snippet[snippet.rfind('/* حماية صارمة'):]:
        print('Found unclosed raw CSS before </head>, wrapping it in <style>...')
        # Replace the raw block with properly wrapped style
        old_raw_block = '''    /* حماية صارمة لمنع تمدد شعار العائلة أو خروج إطار التطبيق عن الشاشة */
    body {
      overflow-x: hidden !important;
      width: 100% !important;
      max-width: 100vw !important;
      margin: 0 auto !important;
      justify-content: center !important;
      align-items: center !important;
    }
    .mobile-frame, #appFrame {
      margin: 0 auto !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      max-width: 480px !important;
      overflow-x: hidden !important;
    }
    .brand-icon {
      width: 36px !important;
      height: 36px !important;
      min-width: 36px !important;
      min-height: 36px !important;
      max-width: 36px !important;
      max-height: 36px !important;
      border-radius: 12px !important;
      overflow: hidden !important;
      flex-shrink: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .brand-icon img, #headerBrandFamilyLogo {
      width: 36px !important;
      height: 36px !important;
      max-width: 36px !important;
      max-height: 36px !important;
      object-fit: cover !important;
      border-radius: 12px !important;
      display: block !important;
    }'''

        wrapped_block = f'''<style>
{old_raw_block}
    /* ضمان إخفاء الأدراج الجانبية من التدفق عندما تكون مغلقة لمنع أي إزاحة أفقية */
    .side-drawer-panel:not(.open) {{
      display: none !important;
    }}
    .summary-left-drawer:not(.open) {{
      display: none !important;
    }}
</style>'''
        if old_raw_block in content:
            content = content.replace(old_raw_block, wrapped_block, 1)
            print('2. Wrapped CSS block in <style> tags successfully!')
        else:
            print('2. Could not find exact old_raw_block!')

# 3. Update renderCategoriesGrid: make icon bubble & emoji larger, make category name larger, make amount numbers larger and filling their spaces!
# Locate function renderCategoriesGrid
cat_grid_start = '    function renderCategoriesGrid(filtered) {'
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
          bgDark: 'linear-gradient(160deg, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0.15) 40%, rgba(15, 23, 42, 0.95) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.08) 40%, #ffffff 90%)',
          border: '#10b981'
        },
        daily: {
          name: 'مصروف يومي',
          emoji: '☕',
          accent: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          bgDark: 'linear-gradient(160deg, rgba(245, 158, 11, 0.35) 0%, rgba(245, 158, 11, 0.15) 40%, rgba(15, 23, 42, 0.95) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.08) 40%, #ffffff 90%)',
          border: '#f59e0b'
        },
        bills: {
          name: 'فواتير والتزامات',
          emoji: '⚡',
          accent: '#f97316',
          gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
          bgDark: 'linear-gradient(160deg, rgba(249, 115, 22, 0.35) 0%, rgba(249, 115, 22, 0.15) 40%, rgba(15, 23, 42, 0.95) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(249, 115, 22, 0.22) 0%, rgba(249, 115, 22, 0.08) 40%, #ffffff 90%)',
          border: '#f97316'
        },
        transport: {
          name: 'مواصلات وبنزين',
          emoji: '🚗',
          accent: '#0284c7',
          gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          bgDark: 'linear-gradient(160deg, rgba(2, 132, 199, 0.35) 0%, rgba(2, 132, 199, 0.15) 40%, rgba(15, 23, 42, 0.95) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(2, 132, 199, 0.22) 0%, rgba(2, 132, 199, 0.08) 40%, #ffffff 90%)',
          border: '#0284c7'
        },
        house: {
          name: 'مستلزمات منزل',
          emoji: '🛋️',
          accent: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          bgDark: 'linear-gradient(160deg, rgba(139, 92, 246, 0.35) 0%, rgba(139, 92, 246, 0.15) 40%, rgba(15, 23, 42, 0.95) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(139, 92, 246, 0.22) 0%, rgba(139, 92, 246, 0.08) 40%, #ffffff 90%)',
          border: '#8b5cf6'
        },
        health: {
          name: 'صحة وعلاج',
          emoji: '💊',
          accent: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          bgDark: 'linear-gradient(160deg, rgba(239, 68, 68, 0.35) 0%, rgba(239, 68, 68, 0.15) 40%, rgba(15, 23, 42, 0.95) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.08) 40%, #ffffff 90%)',
          border: '#ef4444'
        },
        clothes: {
          name: 'ملابس وأحذية',
          emoji: '👔',
          accent: '#ec4899',
          gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          bgDark: 'linear-gradient(160deg, rgba(236, 72, 153, 0.35) 0%, rgba(236, 72, 153, 0.15) 40%, rgba(15, 23, 42, 0.95) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(236, 72, 153, 0.22) 0%, rgba(236, 72, 153, 0.08) 40%, #ffffff 90%)',
          border: '#ec4899'
        },
        education: {
          name: 'تعليم ودروس',
          emoji: '🎓',
          accent: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          bgDark: 'linear-gradient(160deg, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.15) 40%, rgba(15, 23, 42, 0.95) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0.08) 40%, #ffffff 90%)',
          border: '#3b82f6'
        },
        other: {
          name: 'أخرى ونثريات',
          emoji: '🎁',
          accent: '#14b8a6',
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          bgDark: 'linear-gradient(160deg, rgba(20, 184, 166, 0.35) 0%, rgba(20, 184, 166, 0.15) 40%, rgba(15, 23, 42, 0.95) 100%)',
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
          const cardBorder = isLight ? `2px solid ${theme.accent}` : `2px solid ${theme.accent}dd`;
          const cardShadow = isLight 
            ? `0 4px 14px rgba(0, 0, 0, 0.08), 0 0 10px ${theme.accent}20` 
            : `0 4px 18px rgba(0, 0, 0, 0.45), 0 0 14px ${theme.accent}35, inset 0 1px 0 rgba(255, 255, 255, 0.15)`;

          const converted = convertAmount(spent);
          let numStr = '0.00';
          if (spent > 0) {
            numStr = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: isGold ? 3 : 2 });
          }
          const signStr = (spent > 0) ? '-' : '';

          // خط أرقام أكبر وأجرأ يملأ فراغ النصف السفلي
          let amtFontSize = 'clamp(0.92rem, 2.8vw, 1.08rem)';
          let amtLetterSpacing = '-0.2px';
          const totalLen = numStr.length;
          if (totalLen >= 14 || isGold) {
            amtFontSize = 'clamp(0.64rem, 1.85vw, 0.74rem)';
            amtLetterSpacing = '-0.5px';
          } else if (totalLen >= 10) {
            amtFontSize = 'clamp(0.72rem, 2.1vw, 0.84rem)';
            amtLetterSpacing = '-0.4px';
          } else if (totalLen >= 8) {
            amtFontSize = 'clamp(0.82rem, 2.5vw, 0.95rem)';
            amtLetterSpacing = '-0.3px';
          }

          const lowerCardBg = spent > 0 
            ? (isLight ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.28)') 
            : (isLight ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.78)');
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
            transition: transform 0.12s ease !important;
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

            <!-- 2. النصف السفلي: كبسولة أرقام أكبر تملأ الفراغ المخصص لها تماماً -->
            <div class="cat-card-bottom-half ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
                 onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
                 title="انقر لعرض حركات ${theme.name}" 
                 style="flex: 0.8 1 36%; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; padding: 4px 3px; cursor: pointer; background: ${lowerCardBg}; border-top: 1.5px solid ${lowerCardBorder}; box-sizing: border-box; transition: all 0.15s ease; overflow: hidden; touch-action: manipulation;">
              <div class="cat-amount-val" 
                   style="font-family: var(--font-numbers); font-size: ${amtFontSize}; letter-spacing: ${amtLetterSpacing}; font-weight: 950; color: ${amtColor}; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; direction: rtl; text-align: center; font-variant-numeric: tabular-nums; display: flex; align-items: baseline; justify-content: center; gap: 3px; box-sizing: border-box; padding: 0 2px;">
                ${signStr ? `<span style="font-weight: 950; margin-left: 2px; order: 1; font-size: 1.05em;">${signStr}</span>` : ''}
                <span style="font-variant-numeric: tabular-nums; order: 2;">${numStr}</span>
                <span style="font-size: 0.78em; font-weight: 850; opacity: 0.95; margin-right: 2px; order: 3;">${currSymbol}</span>
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

          let amtFontSize = 'clamp(0.92rem, 2.8vw, 1.08rem)';
          let amtLetterSpacing = '-0.2px';
          const totalLen = numStr.length;
          if (totalLen >= 14 || isGold) {
            amtFontSize = 'clamp(0.64rem, 1.85vw, 0.74rem)';
            amtLetterSpacing = '-0.5px';
          } else if (totalLen >= 10) {
            amtFontSize = 'clamp(0.72rem, 2.1vw, 0.84rem)';
            amtLetterSpacing = '-0.4px';
          } else if (totalLen >= 8) {
            amtFontSize = 'clamp(0.82rem, 2.5vw, 0.95rem)';
            amtLetterSpacing = '-0.3px';
          }

          const lowerHalf = card.querySelector('.cat-card-bottom-half');
          const amtEl = card.querySelector('.cat-amount-val');
          if (lowerHalf && amtEl) {
            const amtColor = spent > 0 ? (isLight ? '#b91c1c' : '#ff4d6d') : (isLight ? '#334155' : '#f1f5f9');
            const lowerBg = spent > 0 ? (isLight ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.28)') : (isLight ? 'rgba(241, 245, 249, 0.95)' : 'rgba(15, 23, 42, 0.78)');
            lowerHalf.style.background = lowerBg;
            amtEl.style.fontSize = amtFontSize;
            amtEl.style.letterSpacing = amtLetterSpacing;
            amtEl.style.color = amtColor;
            amtEl.innerHTML = `
              ${signStr ? `<span style="font-weight: 950; margin-left: 2px; order: 1; font-size: 1.05em;">${signStr}</span>` : ''}
              <span style="font-variant-numeric: tabular-nums; order: 2;">${numStr}</span>
              <span style="font-size: 0.78em; font-weight: 850; opacity: 0.95; margin-right: 2px; order: 3;">${currSymbol}</span>
            `;
          }
        });
      }
    }
'''
    content = content[:idx1] + new_cat_grid_code + '\n    ' + content[idx2:]
    print('3. Updated renderCategoriesGrid with prominent larger symbols, names, and numbers!')
else:
    print('3. Could not locate cat_grid boundaries!')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('All enhancements saved successfully!')
