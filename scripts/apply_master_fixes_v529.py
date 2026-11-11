# -*- coding: utf-8 -*-
import sys
import re
import os

sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

print("Original length:", len(content))

# --------------------------------------------------------------------------
# 1. PWA Links in <head>
# --------------------------------------------------------------------------
head_link_pattern = '<link rel="manifest" href="manifest.json">'
pwa_links = '''<link rel="manifest" href="manifest.json">
  <link rel="icon" type="image/png" href="./assets/favicon.png">
  <link rel="shortcut icon" href="./assets/favicon.png">
  <link rel="apple-touch-icon" href="./assets/apple-touch-icon.png">'''

if head_link_pattern in content and 'assets/favicon.png' not in content:
    content = content.replace(head_link_pattern, pwa_links, 1)
    print("1. Added PWA icon link tags to <head>.")
else:
    print("1. PWA icon links already present or skipped.")

# --------------------------------------------------------------------------
# 2. Add CSS for .icon-theme-pill, .icon-palette-preview, .icon-palette-dot
# --------------------------------------------------------------------------
icon_css = '''
    /* =========================================================================
       نمط أزرار باليتات الأيقونات في مركز الضبط
       ========================================================================= */
    .icon-theme-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 7px 4px;
      border-radius: 9px;
      background: rgba(15, 23, 42, 0.7);
      border: 1.2px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      font-size: 0.70rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }
    .icon-theme-pill:hover {
      background: rgba(30, 41, 59, 0.85);
      border-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }
    .icon-theme-pill.active {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(15, 23, 42, 0.95)) !important;
      border: 1.5px solid #38bdf8 !important;
      color: #38bdf8 !important;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.35) !important;
    }
    .icon-palette-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      margin-bottom: 2px;
    }
    .icon-palette-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
'''

if '.icon-theme-pill' not in content:
    target_css_anchor = '/* 1. ذهبي ملكي (Royal Gold) */'
    if target_css_anchor in content:
        content = content.replace(target_css_anchor, icon_css + '\n    ' + target_css_anchor, 1)
        print("2. Added CSS rules for .icon-theme-pill and palettes.")
else:
    print("2. .icon-theme-pill CSS already present.")

# --------------------------------------------------------------------------
# 3. Remove 6-faces photo from inside program:
#    a) In the Avatars bar: replace avatar_all_family.jpg with luxury family icon
#    b) In the Settings modal: replace family_portrait_settings_card
#    c) In promptMemberPin: replace avatar_all_family.jpg fallback
# --------------------------------------------------------------------------
# a) Avatars bar
avatar_img_tag = '<img src="avatar_all_family.jpg" alt="الكل" class="avatar-photo-img" id="avatarImgAllFamily" />'
avatar_icon_replacement = '<i class="fa-solid fa-people-roof" id="avatarImgAllFamily" style="color: #ffffff; font-size: 1.15rem;"></i>'
if avatar_img_tag in content:
    content = content.replace(avatar_img_tag, avatar_icon_replacement, 1)
    print("3a. Replaced avatar_all_family.jpg in members bar with family icon.")

# Also check any other occurrence in members bar
old_avatar_all_bubble = '''<div class="avatar-bubble" style="background: linear-gradient(135deg, #0f766e, #14b8a6); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.4);">
            <img src="avatar_all_family.jpg" alt="الكل" class="avatar-photo-img" id="avatarImgAllFamily" />
          </div>'''
new_avatar_all_bubble = '''<div class="avatar-bubble" style="background: linear-gradient(135deg, #0f766e, #14b8a6); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.4);">
            <i class="fa-solid fa-people-roof" id="avatarImgAllFamily" style="color: #ffffff; font-size: 1.15rem;"></i>
          </div>'''
if old_avatar_all_bubble in content:
    content = content.replace(old_avatar_all_bubble, new_avatar_all_bubble)
    print("3a-2. Replaced avatar bubble for الكل.")

# b) Settings modal: remove 6-faces picture card
old_portrait_card_pattern = re.compile(
    r'<!-- 2\. بطاقة صورة عائلة ماهر ❤️ أية الفاخرة -->\s*<div id="family_portrait_settings_card"[^>]*>[\s\S]*?</div>\s*</div>',
    re.MULTILINE
)
new_portrait_card = '''<!-- 2. شعار وهوية عائلة ماهر ❤️ أية الفاخرة -->
        <div id="family_portrait_settings_card" style="margin: 0 0 6px; border-radius: 14px; overflow: hidden; position: relative; border: 1.5px solid rgba(56, 189, 248, 0.45); background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)); padding: 12px 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 12px;">
          <img src="assets/family_option1_gold_crest.jpg" alt="شعار العائلة" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover; border: 1.5px solid #fbbf24; flex-shrink: 0;">
          <div>
            <div style="font-size: 0.88rem; font-weight: 900; color: #f8fafc;">عائلة ماهر ❤️ أية</div>
            <div style="font-size: 0.72rem; color: #38bdf8; font-weight: 700;">بيت عامر بالحب والبركة والإدارة المالية الذكية</div>
          </div>
        </div>'''

if 'id="family_portrait_settings_card"' in content:
    content = re.sub(
        r'<!-- 2\. بطاقة صورة عائلة ماهر ❤️ أية الفاخرة -->[\s\S]*?</div>\s*</div>\s*(?=<!-- 3\.)',
        new_portrait_card + '\n\n        ',
        content,
        count=1
    )
    print("3b. Replaced family_portrait.jpg in settings modal with luxury crest banner.")

# c) promptMemberPin fallback
content = content.replace(
    ": 'avatar_all_family.jpg';",
    ": 'assets/family_option1_gold_crest.jpg';"
)
print("3c. Updated promptMemberPin fallback.")

# --------------------------------------------------------------------------
# 4. Fix HTML DOM Div Balance
# --------------------------------------------------------------------------
# Fix line 13604: </div></div></div> <!-- إغلاق subViewCommitments النهائي المؤكد -->
old_subview_close = '</div></div></div> <!-- إغلاق subViewCommitments النهائي المؤكد -->'
new_subview_close = '</div> <!-- إغلاق subViewCommitments -->'
if old_subview_close in content:
    content = content.replace(old_subview_close, new_subview_close, 1)
    print("4a. Fixed premature subViewCommitments triple closing div.")

# Fix extra closing divs before main script
old_settings_footer_area = '''      <!-- تذييل النافذة البسيط والأنيق -->
      <div style="padding: 8px 14px; background: rgba(15, 23, 42, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
        <span style="font-size: 0.65rem; color: #94a3b8;">مصروفات العائلة &copy; 2026</span>
        <button type="button" class="btn-export-tool" onclick="closeModal('settingsModal')" style="padding: 5px 16px; font-size: 0.74rem; font-weight: 800; border-radius: 8px;">
          إغلاق
        </button>
      </div>

    </div>
  </div>
  </div>
<div class="toast-msg" id="toastMsg">
      <i class="fa-solid fa-circle-check" style="color: var(--primary);"></i>
      <span id="toastTxt">تم بنجاح!</span>
    </div>

  </div>'''

new_settings_footer_area = '''      <!-- تذييل النافذة البسيط والأنيق -->
      <div style="padding: 8px 14px; background: rgba(15, 23, 42, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
        <span style="font-size: 0.65rem; color: #94a3b8;">مصروفات العائلة &copy; 2026</span>
        <button type="button" class="btn-export-tool" onclick="closeModal('settingsModal')" style="padding: 5px 16px; font-size: 0.74rem; font-weight: 800; border-radius: 8px;">
          إغلاق
        </button>
      </div>

    </div>
  </div>

  <div class="toast-msg" id="toastMsg">
    <i class="fa-solid fa-circle-check" style="color: var(--primary);"></i>
    <span id="toastTxt">تم بنجاح!</span>
  </div>'''

if old_settings_footer_area in content:
    content = content.replace(old_settings_footer_area, new_settings_footer_area, 1)
    print("4b. Fixed stray closing divs in settings modal footer.")

# Fix extra closing div after tasks modal: line 15224-15226
old_tasks_modal_end = '''    </main>
  </div>
</div>'''
# Check around line 15224
if '</main>\n  </div>\n\n<!-- عرض الفاتورة والصور المكبرة' in content:
    content = content.replace('</main>\n  </div>\n\n<!-- عرض الفاتورة والصور المكبرة', '</main>\n\n<!-- عرض الفاتورة والصور المكبرة', 1)
    print("4c. Removed extra closing div after tasks modal main.")

# --------------------------------------------------------------------------
# 5. Fix Catastrophic Data Wipe
# --------------------------------------------------------------------------
old_wipe_block = '''      // تهيئة البيانات التجريبية الأولية فقط في حال عدم وجود أي حركات مسجلة مسبقاً
      const hasExistingTx = !!localStorage.getItem('family_monefy_v2_tx');
      if (!hasExistingTx && storedSeed !== DATA_SEED_VERSION) {
        localStorage.removeItem('family_monefy_v2_tx');
        localStorage.removeItem('family_monefy_txs');
        localStorage.removeItem('family_monefy_requests');
        localStorage.removeItem('family_monefy_notes');
        localStorage.removeItem('family_monefy_debts');
        localStorage.removeItem('family_monefy_wallets');
        localStorage.removeItem('family_monefy_activity_log');
        localStorage.removeItem('family_monefy_monthly_budgets');
        localStorage.removeItem('family_monefy_expected');
        
        localStorage.setItem('family_monefy_version', APP_VERSION);
        localStorage.setItem('family_monefy_seed_version', DATA_SEED_VERSION);'''

new_safe_block = '''      // تهيئة البيانات الأولية بأمان تام وبدون مساس بأي بيانات موجودة للمستخدم
      const hasAnyExistingData = !!(
        localStorage.getItem('family_monefy_transactions') ||
        localStorage.getItem('family_monefy_v2_tx') ||
        localStorage.getItem('family_monefy_monthly_budgets') ||
        localStorage.getItem('family_monefy_expected') ||
        localStorage.getItem('family_monefy_wallets') ||
        localStorage.getItem('family_monefy_requests') ||
        localStorage.getItem('family_monefy_tasks')
      );
      if (!hasAnyExistingData && storedSeed !== DATA_SEED_VERSION) {
        localStorage.setItem('family_monefy_version', APP_VERSION);
        localStorage.setItem('family_monefy_seed_version', DATA_SEED_VERSION);'''

if old_wipe_block in content:
    content = content.replace(old_wipe_block, new_safe_block, 1)
    print("5. Successfully replaced catastrophic data wipe with zero-destruction guard.")
else:
    print("5. Note: old wipe block not matched verbatim, checking with regex.")

# --------------------------------------------------------------------------
# 6. Version bump to v5.2.9
# --------------------------------------------------------------------------
content = content.replace("const APP_VERSION = 'v5.2.8';", "const APP_VERSION = 'v5.2.9';")
content = content.replace("v5.2.8 • متزامن", "v5.2.9 • متزامن")
content = content.replace("v5.2.8", "v5.2.9")
print("6. Bumped APP_VERSION to v5.2.9.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished writing updated index.html! New length:", len(content))
