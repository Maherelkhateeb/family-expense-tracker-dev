import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

print("Original content size:", len(content))

# =========================================================================
# A. EMBLEM BUTTONS & USER BADGE IN SETTINGS MODAL
# =========================================================================
target_settings_top = """        <!-- 2. زر واحد فقط للمستخدم النشط لفتح الشاشة الكاملة للتبديل بين المستخدمين -->
        <div class="settings-user-capsule" onclick="openFullUserSelectionModal()" style="cursor: pointer; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.5px solid rgba(56, 189, 248, 0.45); border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="position: relative;">
              <img id="settingsCurrentMemberImg" src="" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover !important; object-position: top center !important; border: 2.2px solid #38bdf8; display: block; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
              <span style="position: absolute; bottom: -2px; left: -2px; width: 11px; height: 11px; border-radius: 50%; background: #22c55e; border: 1.5px solid #0f172a;"></span>
            </div>
            <div>
              <div style="font-size: 0.88rem; font-weight: 900; color: #fff;">المستخدم النشط: <span id="settingsCurrentMemberName" style="color: #38bdf8;">ماهر</span></div>
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">أفراد الأسرة 👥</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.16); border: 1.2px solid rgba(56, 189, 248, 0.4); padding: 5px 12px; border-radius: 8px; color: #38bdf8; font-size: 0.74rem; font-weight: 900;">
            <span>تبديل الحساب</span>
            <i class="fa-solid fa-chevron-left" style="font-size: 0.68rem;"></i>
          </div>
        </div>

        <!-- 3. بطاقة عائلة ماهر ❤️ أية - رمز الموزاييك المثبت دائماً (حذف الخيارات الأخرى) -->
        <div id="family_portrait_settings_card" style="margin: 0 0 6px; border-radius: 14px; overflow: hidden; position: relative; border: 1.5px solid rgba(56, 189, 248, 0.45); box-shadow: 0 8px 24px rgba(0,0,0,0.5); cursor: pointer;" onclick="openReceiptLightbox('family_portrait.jpg', 'عائلة ماهر ❤️ أية - بيت عامر بالحب والبركة')" title="انقر لعرض صورة العائلة بدقة عالية">
          <img src="family_portrait.jpg" alt="عائلة ماهر وأية" id="settingsFamilyPortraitImg" style="width: 100%; height: 155px; object-fit: cover !important; object-position: top center !important; display: block;">
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.7) 65%, transparent 100%); padding: 8px 12px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="assets/family_option2_mosaic.jpg" alt="شعار الموزاييك الملكي" style="width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #38bdf8; object-fit: cover !important; object-position: top center !important;">
              <div>
                <div style="font-size: 0.88rem; font-weight: 900; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">عائلة ماهر ❤️ أية</div>
                
              </div>
            </div>
            <span style="font-size: 0.64rem; background: rgba(56, 189, 248, 0.3); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.5); padding: 3px 8px; border-radius: 6px; font-weight: 800; backdrop-filter: blur(4px);">
              <i class="fa-solid fa-expand"></i> عرض
            </span>
          </div>
        </div>"""

replacement_settings_top = """        <!-- 1. كارت إدارة وتبديل حسابات العائلة - محكوم 100% داخل الحدود بدون أي خروج -->
        <div class="settings-user-capsule" onclick="openFullUserSelectionModal()" style="cursor: pointer; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.5px solid rgba(56, 189, 248, 0.45); border-radius: 14px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.35); flex-wrap: wrap; gap: 8px; box-sizing: border-box; overflow: hidden; max-width: 100%;">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
            <div style="position: relative; flex-shrink: 0;">
              <img id="settingsCurrentMemberImg" src="" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover !important; object-position: top center !important; border: 2.2px solid #38bdf8; display: block; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
              <span style="position: absolute; bottom: -2px; left: -2px; width: 11px; height: 11px; border-radius: 50%; background: #22c55e; border: 1.5px solid #0f172a;"></span>
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-size: 0.88rem; font-weight: 900; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">المستخدم النشط: <span id="settingsCurrentMemberName" style="color: #38bdf8;">ماهر</span></div>
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">أفراد الأسرة 👥</div>
            </div>
          </div>
          <!-- شارة الحساب الحالي: محكومة تماماً داخل الكارت ولا تخرج خارج الحدود -->
          <div id="settingsActiveUserBadge" style="display: inline-flex; align-items: center; gap: 5px; background: rgba(34, 197, 94, 0.18); border: 1.2px solid rgba(34, 197, 94, 0.5); padding: 4px 10px; border-radius: 10px; color: #34d399; font-size: 0.72rem; font-weight: 850; flex-shrink: 0; white-space: nowrap; max-width: 100%; box-sizing: border-box;">
            <i class="fa-solid fa-circle-check" style="color: #22c55e; font-size: 0.65rem;"></i>
            <span>الحساب الحالي: <strong id="settingsActiveUserNameTxt" style="color: #ffffff;">ماهر</strong></span>
            <i class="fa-solid fa-chevron-left" style="font-size: 0.65rem; margin-right: 3px; color: #38bdf8;"></i>
          </div>
        </div>

        <!-- 2. بطاقة صورة عائلة ماهر ❤️ أية الفاخرة -->
        <div id="family_portrait_settings_card" style="margin: 0 0 6px; border-radius: 14px; overflow: hidden; position: relative; border: 1.5px solid rgba(56, 189, 248, 0.45); box-shadow: 0 8px 24px rgba(0,0,0,0.5); cursor: pointer;" onclick="openReceiptLightbox('family_portrait.jpg', 'عائلة ماهر ❤️ أية - بيت عامر بالحب والبركة')" title="انقر لعرض صورة العائلة بدقة عالية">
          <img src="family_portrait.jpg" alt="عائلة ماهر وأية" id="settingsFamilyPortraitImg" style="width: 100%; height: 155px; object-fit: cover !important; object-position: top center !important; display: block;">
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.7) 65%, transparent 100%); padding: 8px 12px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img id="settingsCurrentEmblemMini" src="assets/family_option1_gold_crest.jpg" alt="شعار العائلة" style="width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #fbbf24; object-fit: cover !important; object-position: top center !important;">
              <div>
                <div style="font-size: 0.88rem; font-weight: 900; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">عائلة ماهر ❤️ أية</div>
                <div style="font-size: 0.62rem; color: #cbd5e1; font-weight: 700;">بيت عامر بالحب والبركة 👨‍👩‍👧‍👦</div>
              </div>
            </div>
            <span style="font-size: 0.64rem; background: rgba(56, 189, 248, 0.3); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.5); padding: 3px 8px; border-radius: 6px; font-weight: 800; backdrop-filter: blur(4px);">
              <i class="fa-solid fa-expand"></i> عرض
            </span>
          </div>
        </div>

        <!-- 3. أداة الاختيار والتبديل التفاعلي لشعار ورمز العائلة المفضل (4 خيارات ملكية مع حفظ دائم) -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.3px solid rgba(251, 191, 36, 0.40); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <div style="font-size: 0.72rem; font-weight: 900; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
            <span style="display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <span>اختر نمط رمز وشعار العائلة المفضل لديك:</span>
            </span>
            <span id="activeEmblemNameBadge" style="font-size: 0.62rem; color: #fbbf24; background: rgba(251, 191, 36, 0.16); border: 1px solid rgba(251, 191, 36, 0.4); padding: 2px 8px; border-radius: 6px; font-weight: 850;">الدرع الملكي المذهب ✓</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;" id="emblemOptionButtonsGroup">
            <button type="button" onclick="switchFamilyEmblem(1)" class="emblem-opt-btn active" id="btnEmblemOpt1" style="background: rgba(30, 41, 59, 0.85); border: 2.2px solid #fbbf24; border-radius: 10px; padding: 6px 2px; cursor: pointer; text-align: center; color: #f8fafc; transition: all 0.2s ease; box-shadow: 0 0 12px rgba(251, 191, 36, 0.45);">
              <img src="assets/family_option1_gold_crest.jpg" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto 3px;">
              <div style="font-size: 0.58rem; font-weight: 850; white-space: nowrap;">الدرع الملكي</div>
            </button>
            <button type="button" onclick="switchFamilyEmblem(2)" class="emblem-opt-btn" id="btnEmblemOpt2" style="background: rgba(30, 41, 59, 0.85); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 6px 2px; cursor: pointer; text-align: center; color: #f8fafc; transition: all 0.2s ease;">
              <img src="assets/family_option2_mosaic.jpg" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto 3px;">
              <div style="font-size: 0.58rem; font-weight: 850; white-space: nowrap;">الموزاييك</div>
            </button>
            <button type="button" onclick="switchFamilyEmblem(3)" class="emblem-opt-btn" id="btnEmblemOpt3" style="background: rgba(30, 41, 59, 0.85); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 6px 2px; cursor: pointer; text-align: center; color: #f8fafc; transition: all 0.2s ease;">
              <img src="assets/family_option3_rosette.jpg" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto 3px;">
              <div style="font-size: 0.58rem; font-weight: 850; white-space: nowrap;">المدار الزجاجي</div>
            </button>
            <button type="button" onclick="switchFamilyEmblem(4)" class="emblem-opt-btn" id="btnEmblemOpt4" style="background: rgba(30, 41, 59, 0.85); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 6px 2px; cursor: pointer; text-align: center; color: #f8fafc; transition: all 0.2s ease;">
              <img src="assets/family_option4_emerald.jpg" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto 3px;">
              <div style="font-size: 0.58rem; font-weight: 850; white-space: nowrap;">الزمرد والنيون</div>
            </button>
          </div>
        </div>"""

if target_settings_top in content:
    content = content.replace(target_settings_top, replacement_settings_top)
    print("A. Replaced settings top with emblem switcher and non-overflowing user badge.")
else:
    print("ERROR: target_settings_top not found verbatim!")

# =========================================================================
# B. UPDATE switchFamilyEmblem & updateSettingsModalDisplay IN JAVASCRIPT
# =========================================================================
# In switchFamilyEmblem: update #settingsCurrentEmblemMini and avatarImgAllFamily and activeEmblemNameBadge
old_switch_emblem_fn = """    function switchFamilyEmblem(num, persist = true) {
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
    }"""

new_switch_emblem_fn = """    function switchFamilyEmblem(num, persist = true) {
      num = parseInt(num) || 1;
      if (!FAMILY_EMBLEMS[num]) num = 1;
      const emblem = FAMILY_EMBLEMS[num];

      state.familyEmblem = num;
      if (persist) {
        try { localStorage.setItem('family_monefy_emblem', num); } catch(e) {}
      }

      // 1. تحديث صورة الأيقونة لكل العائلة في شريط الأفراد
      if (typeof MEMBER_AVATARS !== 'undefined') {
        MEMBER_AVATARS['الكل'] = emblem.src;
        MEMBER_AVATARS['العائلة'] = emblem.src;
        MEMBER_AVATARS['البيت'] = emblem.src;
      }
      const avatarAll = document.getElementById('avatarImgAllFamily');
      if (avatarAll) avatarAll.src = emblem.src;

      // 2. تحديث الشعار المصغر في كارت العائلة في الإعدادات
      const miniEmblem = document.getElementById('settingsCurrentEmblemMini');
      if (miniEmblem) {
        miniEmblem.src = emblem.src;
        miniEmblem.style.borderColor = emblem.color;
      }

      // 3. تحديث مظهر الأزرار الأربعة وحالة التحديد والوهج
      for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById('btnEmblemOpt' + i);
        if (!btn) continue;
        if (i === num) {
          btn.classList.add('active');
          btn.style.border = `2.5px solid ${emblem.color}`;
          btn.style.boxShadow = `0 0 16px ${emblem.color}aa, inset 0 0 8px ${emblem.color}44`;
          btn.style.transform = 'translateY(-2px) scale(1.05)';
          btn.style.background = 'rgba(15, 23, 42, 0.98)';
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
        badge.style.background = `${emblem.color}25`;
      }

      // 5. إشعار التغيير
      if (persist && typeof showToast === 'function') {
        showToast(`👑 تم تغيير وتثبيت شعار العائلة: ${emblem.name}`);
      }
    }"""

if old_switch_emblem_fn in content:
    content = content.replace(old_switch_emblem_fn, new_switch_emblem_fn)
    print("B1. Updated switchFamilyEmblem.")
else:
    print("ERROR: old_switch_emblem_fn not found verbatim!")

# In updateSettingsModalDisplay, ensure emblem is read from localStorage and NOT hardcoded to 2!
old_update_disp_emblem = """      const curEmblem = 2; // تثبيت رمز شعار العائلة الموزاييك دائماً
      if (typeof switchFamilyEmblem === 'function') switchFamilyEmblem(2, false);"""

new_update_disp_emblem = """      const curEmblem = parseInt(localStorage.getItem('family_monefy_emblem')) || 1;
      if (typeof switchFamilyEmblem === 'function') switchFamilyEmblem(curEmblem, false);"""

if old_update_disp_emblem in content:
    content = content.replace(old_update_disp_emblem, new_update_disp_emblem)
    print("B2. Restored dynamic family emblem loading in updateSettingsModalDisplay.")
else:
    print("ERROR: old_update_disp_emblem not found verbatim!")

# =========================================================================
# C. OVERHAUL: renderCategoriesGrid DYNAMIC THEMES & NUMBER SIZING
# =========================================================================
# Find renderCategoriesGrid and replace it with theme-responsive palette engine
pattern_render_cat = re.compile(r'function renderCategoriesGrid\(filtered\)\s*\{[\s\S]*?\n    function openQuickCategoryExpense', re.MULTILINE)

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
    }\n\n    function openQuickCategoryExpense"""

match = pattern_render_cat.search(content)
if match:
    content = content[:match.start()] + new_render_cat_fn + content[match.end():]
    print("C. Replaced renderCategoriesGrid with theme-responsive palette engine successfully.")
else:
    print("ERROR: pattern_render_cat did not match in content!")

# =========================================================================
# D. ENHANCE setAppTheme: PROMINENT ACTIVE FEEDBACK FOR ALL 9 THEMES
# =========================================================================
old_set_app_theme_part = """      themeMetadata.forEach(tm => {
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
      });"""

new_set_app_theme_part = """      themeMetadata.forEach(tm => {
        const el = document.getElementById('themeOpt' + tm.key);
        if (!el) return;
        const isMatch = (tm.theme === theme);
        const dot = el.querySelector('.theme-color-dot');
        const badge = el.querySelector('.theme-selected-badge');

        if (isMatch) {
          el.classList.add('active');
          el.style.setProperty('border', `2.8px solid ${tm.color}`, 'important');
          el.style.setProperty('box-shadow', `0 0 18px ${tm.color}99, inset 0 0 8px ${tm.color}44`, 'important');
          el.style.setProperty('transform', 'translateY(-2px) scale(1.04)', 'important');
          el.style.setProperty('background', tm.bg, 'important');
          if (dot) {
            dot.innerHTML = `<i class="fa-solid fa-check" style="font-size:0.72rem; font-weight:900; color:${tm.theme === 'light' ? '#000' : '#fff'};"></i>`;
            dot.style.setProperty('background', tm.color, 'important');
            dot.style.setProperty('border', '2px solid #ffffff', 'important');
            dot.style.setProperty('box-shadow', `0 0 12px ${tm.color}`, 'important');
          }
          if (badge) {
            badge.style.setProperty('display', 'inline-block', 'important');
            badge.textContent = 'مفعل الآن ✓';
            badge.style.setProperty('color', tm.color, 'important');
            badge.style.setProperty('border-color', tm.color, 'important');
            badge.style.setProperty('background', `${tm.color}33`, 'important');
          }
        } else {
          el.classList.remove('active');
          el.style.border = '1.5px solid rgba(255, 255, 255, 0.12)';
          el.style.boxShadow = 'none';
          el.style.transform = 'none';
          el.style.background = tm.bg;
          if (dot) {
            dot.innerHTML = '';
            dot.style.background = 'transparent';
            dot.style.borderColor = 'rgba(255,255,255,0.3)';
            dot.style.boxShadow = 'none';
          }
          if (badge) {
            badge.style.display = 'none';
          }
        }
      });"""

if old_set_app_theme_part in content:
    content = content.replace(old_set_app_theme_part, new_set_app_theme_part)
    print("D1. Replaced setAppTheme loop for prominent active indicator.")
else:
    print("ERROR: old_set_app_theme_part not found verbatim!")

# In updateThemeCheckDots, make sure each dot takes its own theme color rather than hardcoded #38bdf8!
old_update_dots = """    function updateThemeCheckDots() {
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
      });"""

new_update_dots = """    function updateThemeCheckDots() {
      const cur = state.appTheme || 'navy';
      const themeColorsMap = {
        'navy': '#38bdf8',
        'black': '#e2e8f0',
        'emerald': '#34d399',
        'purple': '#c084fc',
        'rose': '#fb7185',
        'ocean': '#22d3ee',
        'gold': '#fbbf24',
        'slate': '#94a3b8',
        'light': '#0284c7'
      };
      const curColor = themeColorsMap[cur] || '#38bdf8';
      document.querySelectorAll('.theme-check-dot').forEach(dot => {
        const t = dot.getAttribute('data-theme');
        if (t === cur) {
          dot.innerHTML = `<i class="fa-solid fa-check" style="font-size: 0.72rem; font-weight:900; color:${cur === 'light' ? '#000' : '#fff'};"></i>`;
          dot.style.setProperty('background', curColor, 'important');
          dot.style.setProperty('border', '2px solid #ffffff', 'important');
          dot.style.setProperty('box-shadow', `0 0 12px ${curColor}`, 'important');
        } else {
          dot.innerHTML = '';
          dot.style.background = 'transparent';
          dot.style.borderColor = 'rgba(255,255,255,0.3)';
          dot.style.boxShadow = 'none';
        }
      });"""

if old_update_dots in content:
    content = content.replace(old_update_dots, new_update_dots)
    print("D2. Updated updateThemeCheckDots with per-theme accent colors.")
else:
    print("ERROR: old_update_dots not found verbatim!")

# In setAppTheme live render: ensure renderCategoriesGrid is explicitly called
old_theme_live_render = """      // إعادة رسم وتحديث كافة الكروت الداخلية وقمرة القيادة فورياً لتتخذ مظهر السمة المختارة
      try {
        if (typeof renderUI === 'function') renderUI();
        if (typeof renderExpectedList === 'function') renderExpectedList();
        if (typeof updateAnalyticsChart === 'function') updateAnalyticsChart();
      } catch(e) {
        console.warn('Theme live render error:', e);
      }"""

new_theme_live_render = """      // إعادة رسم وتحديث كافة الكروت الداخلية وقمرة القيادة فورياً لتتخذ مظهر السمة المختارة
      try {
        if (typeof renderCategoriesGrid === 'function') {
          renderCategoriesGrid(state.transactions);
        }
        if (typeof renderUI === 'function') renderUI();
        if (typeof renderExpectedList === 'function') renderExpectedList();
        if (typeof updateAnalyticsChart === 'function') updateAnalyticsChart();
      } catch(e) {
        console.warn('Theme live render error:', e);
      }"""

if old_theme_live_render in content:
    content = content.replace(old_theme_live_render, new_theme_live_render)
    print("D3. Added renderCategoriesGrid call in setAppTheme.")
else:
    print("ERROR: old_theme_live_render not found verbatim!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved all updates to index.html successfully.")
