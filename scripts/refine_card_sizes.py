import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the top half markup in renderCategoriesGrid
old_top_half = '''          <!-- 1. النصف العلوي (50%): أيقونة التصنيف واسمه - النقر هنا يفتح تسجيل جديد -->
          <div class="cat-card-top-half" 
               onclick="event.stopPropagation(); openQuickCategoryExpense('${cat.id}');"
               title="انقر على الرمز لتسجيل مصروف جديد في ${theme.name}"
               style="flex: 1 1 50%; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6px 4px 2px; cursor: pointer; transition: background 0.15s ease;">
            <div class="cat-icon-bubble" 
                 style="background: ${bubbleGradient}; width: clamp(38px, 10vw, 46px); height: clamp(38px, 10vw, 46px); min-width: 36px; min-height: 36px; border-radius: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.35), 0 0 12px ${bubbleGlow}; border: 2px solid rgba(255, 255, 255, 0.6); outline: 1.5px solid ${theme.accent}; flex-shrink: 0; transition: transform 0.15s ease;">
              <span style="font-size: clamp(1.45rem, 4.0vw, 1.85rem); line-height: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));">${theme.emoji}</span>
            </div>
            <div class="cat-label-text" 
                 style="font-family: var(--font-family); font-size: clamp(0.72rem, 2.1vw, 0.82rem); font-weight: 800; color: ${isLight ? '#0f172a' : '#f8fafc'} !important; text-align: center; margin-top: 3px; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; padding: 0 4px; box-sizing: border-box;">
              ${theme.name}
            </div>
          </div>'''

new_top_half = '''          <!-- 1. النصف العلوي (50%): أيقونة التصنيف واسمه - النقر هنا يفتح تسجيل جديد -->
          <div class="cat-card-top-half" 
               onclick="event.stopPropagation(); openQuickCategoryExpense('${cat.id}');"
               title="انقر على الرمز لتسجيل مصروف جديد في ${theme.name}"
               style="flex: 1 1 50%; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px 3px 1px; cursor: pointer; transition: background 0.15s ease; box-sizing: border-box; overflow: hidden;">
            <div class="cat-icon-bubble" 
                 style="background: ${bubbleGradient}; width: clamp(30px, 8.5vw, 38px); height: clamp(30px, 8.5vw, 38px); min-width: 28px; min-height: 28px; border-radius: 11px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4), inset 0 0 5px rgba(255, 255, 255, 0.35), 0 0 10px ${bubbleGlow}; border: 1.8px solid rgba(255, 255, 255, 0.65); outline: 1.2px solid ${theme.accent}; flex-shrink: 0; transition: transform 0.15s ease;">
              <span style="font-size: clamp(1.18rem, 3.2vw, 1.45rem); line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45));">${theme.emoji}</span>
            </div>
            <div class="cat-label-text" 
                 style="font-family: var(--font-family); font-size: clamp(0.68rem, 1.9vw, 0.76rem); font-weight: 800; color: ${isLight ? '#0f172a' : '#f8fafc'} !important; text-align: center; margin-top: 2px; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; padding: 0 2px; box-sizing: border-box;">
              ${theme.name}
            </div>
          </div>'''

# Replace bottom half markup in renderCategoriesGrid
old_bottom_half = '''          <!-- 2. النصف السفلي بالكامل (50%): كارت داخلي كبير وبارز للمصروفات - النقر عليه يفتح كشف العمليات والتفاصيل -->
          <div class="cat-card-bottom-half ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
               onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
               title="انقر هنا لعرض كشف وتفاصيل حركات ${theme.name}" 
               style="flex: 1 1 50%; min-height: 0; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px 4px 6px; cursor: pointer; background: ${lowerCardBg}; border-top: 2px solid ${lowerCardBorder}; box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.25); box-sizing: border-box; transition: all 0.15s ease;">
            <div class="cat-amount-val" 
                 style="font-family: var(--font-numbers); font-size: ${amtFontSize}; letter-spacing: ${amtLetterSpacing}; font-weight: 950; color: ${amtColor}; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; direction: rtl; text-align: center; font-variant-numeric: tabular-nums;">
              ${amtDisplay}
            </div>
            <div style="font-size: 0.60rem; font-weight: 800; color: ${lowerCardSubColor}; display: flex; align-items: center; gap: 3px; margin-top: 2px; opacity: 0.9;">
              <i class="fa-solid fa-list-ul" style="font-size: 0.55rem;"></i>
              <span>كشف العمليات</span>
            </div>
          </div>'''

new_bottom_half = '''          <!-- 2. النصف السفلي بالكامل (50%): كارت داخلي كبير وبارز للمصروفات - النقر عليه يفتح كشف العمليات والتفاصيل -->
          <div class="cat-card-bottom-half ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
               onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
               title="انقر هنا لعرض كشف وتفاصيل حركات ${theme.name}" 
               style="flex: 1 1 50%; min-height: 0; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 2px 4px; cursor: pointer; background: ${lowerCardBg}; border-top: 1.5px solid ${lowerCardBorder}; box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.25); box-sizing: border-box; transition: all 0.15s ease; overflow: hidden;">
            <div class="cat-amount-val" 
                 style="font-family: var(--font-numbers); font-size: ${amtFontSize}; letter-spacing: ${amtLetterSpacing}; font-weight: 950; color: ${amtColor}; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; direction: rtl; text-align: center; font-variant-numeric: tabular-nums; padding: 0 2px; box-sizing: border-box;">
              ${amtDisplay}
            </div>
            <div style="font-size: 0.58rem; font-weight: 800; color: ${lowerCardSubColor}; display: flex; align-items: center; gap: 3px; margin-top: 1px; opacity: 0.9; white-space: nowrap;">
              <i class="fa-solid fa-list-ul" style="font-size: 0.52rem;"></i>
              <span>كشف العمليات</span>
            </div>
          </div>'''

if old_top_half in content:
    content = content.replace(old_top_half, new_top_half, 1)
    print("✓ Replaced top half markup")
else:
    print("! old_top_half not found")

if old_bottom_half in content:
    content = content.replace(old_bottom_half, new_bottom_half, 1)
    print("✓ Replaced bottom half markup")
else:
    print("! old_bottom_half not found")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved updated index.html")
