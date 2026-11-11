import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We replace the card.innerHTML assignment in renderCategoriesGrid
old_inner_regex = r'<!-- 1\. النصف العلوي[\s\S]*?<!-- 2\. النصف السفلي[\s\S]*?grid\.appendChild\(card\);'

new_inner = '''<!-- 1. النصف العلوي: أيقونة التصنيف واسم البند ظاهر وواضح تماماً تحته - النقر هنا يفتح تسجيل جديد -->
          <div class="cat-card-top-half" 
               onclick="event.stopPropagation(); openQuickCategoryExpense('${cat.id}');"
               title="انقر على الرمز لتسجيل مصروف جديد في ${theme.name}"
               style="flex: 1.15 1 58%; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 5px 3px 2px; cursor: pointer; transition: background 0.15s ease; box-sizing: border-box; overflow: hidden;">
            <div class="cat-icon-bubble" 
                 style="background: ${bubbleGradient}; width: clamp(28px, 7.5vw, 35px); height: clamp(28px, 7.5vw, 35px); min-width: 25px; min-height: 25px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4), inset 0 0 5px rgba(255, 255, 255, 0.35), 0 0 10px ${bubbleGlow}; border: 1.8px solid rgba(255, 255, 255, 0.7); outline: 1.2px solid ${theme.accent}; flex-shrink: 0; transition: transform 0.15s ease;">
              <span style="font-size: clamp(1.10rem, 3.0vw, 1.35rem); line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45));">${theme.emoji}</span>
            </div>
            <!-- اسم بند المصروف ظاهر بوضوح تام تحت صورة البند -->
            <div class="cat-label-text" 
                 style="font-family: var(--font-family); font-size: clamp(0.70rem, 2.0vw, 0.78rem); font-weight: 850; color: ${isLight ? '#0f172a' : '#ffffff'} !important; text-shadow: ${isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.7)'}; text-align: center; margin: 0; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; padding: 0 2px; box-sizing: border-box;">
              ${theme.name}
            </div>
          </div>

          <!-- 2. النصف السفلي: كارت رقم المصروف البارز - النقر عليه يفتح كشف العمليات والتفاصيل (تم حذف كلمة كشف العمليات بالكامل) -->
          <div class="cat-card-bottom-half ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
               onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
               title="انقر هنا لعرض كشف وتفاصيل حركات ${theme.name}" 
               style="flex: 0.85 1 42%; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; padding: 2px 4px; cursor: pointer; background: ${lowerCardBg}; border-top: 1.5px solid ${lowerCardBorder}; box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.25); box-sizing: border-box; transition: all 0.15s ease; overflow: hidden;">
            <div class="cat-amount-val" 
                 style="font-family: var(--font-numbers); font-size: clamp(0.88rem, 2.6vw, 1.12rem); letter-spacing: ${amtLetterSpacing}; font-weight: 950; color: ${amtColor}; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; max-width: 100%; direction: rtl; text-align: center; font-variant-numeric: tabular-nums;">
              ${amtDisplay}
            </div>
          </div>
        `;

        grid.appendChild(card);'''

if re.search(old_inner_regex, content):
    content = re.sub(old_inner_regex, new_inner, content)
    print("✓ Successfully updated card innerHTML")
else:
    print("! Regex not matched, searching substring")
    idx_top = content.find('<!-- 1. النصف العلوي')
    idx_end = content.find('grid.appendChild(card);', idx_top)
    if idx_top != -1 and idx_end != -1:
        content = content[:idx_top] + new_inner + content[idx_end + len('grid.appendChild(card);'):]
        print("✓ Successfully updated card innerHTML via substring")

# Bump build ID to 202611071635
content = re.sub(r'APP_BUILD_ID\s*=\s*\d+', 'APP_BUILD_ID = 202611071635', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

with open('version.json', 'w', encoding='utf-8') as f:
    f.write('''{
  "version": "4.9.6",
  "build": 202611071635,
  "updated_at": "2026-11-07 04:35 PM",
  "description": "v4.9.6: Removed 'كشف العمليات' text from category card bottom half. Ensured category name is clearly displayed and unobstructed under the category image."
}''')

print("Saved updated index.html and version.json")
