import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# -------------------------------------------------------------------------
# A. OVERHAUL: Settings Modal Rebuild
# -------------------------------------------------------------------------

# The top of settings modal content currently starts around line 14827:
# <div style="padding: 6px 10px; overflow-y: auto; flex: 1; max-height: calc(94vh - 115px); display: flex; flex-direction: column; gap: 8px;" class="custom-scrollbar">

old_settings_users_sec = """        <!-- ========================================================
             قسم إدارة وتبديل حسابات العائلة وقفل الأمان (مدمج في الإعدادات)
             ======================================================== -->
        <div class="settings-unified-section" id="settingsSec_users" style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.94)); border: 1.4px solid rgba(56, 189, 248, 0.45); border-radius: 14px; padding: 12px 14px; margin-bottom: 8px; box-shadow: 0 4px 18px rgba(0,0,0,0.25);">
          <!-- رأس القسم: عنوان إدارة الحسابات + شارة الحساب الحالي -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px; flex-wrap: wrap; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
              <div style="width: 30px; height: 30px; border-radius: 8px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1rem; border: 1px solid rgba(56, 189, 248, 0.35); flex-shrink: 0;">
                <i class="fa-solid fa-users-gear"></i>
              </div>
              <div style="min-width: 0;">
                <span style="font-weight: 900; font-size: 0.85rem; color: #f8fafc; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">إدارة وتبديل حسابات العائلة</span>
                <div style="font-size: 0.62rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">التبديل الفوري بين الأفراد وقفل الخصوصية برمز PIN</div>
              </div>
            </div>
            <!-- شارة الحساب النشط حالياً (داخل الكارت ومحكومة بالكامل) -->
            <div id="settingsActiveUserBadge" style="display: inline-flex; align-items: center; gap: 5px; background: rgba(34, 197, 94, 0.18); border: 1.2px solid rgba(34, 197, 94, 0.5); padding: 3px 9px; border-radius: 12px; font-size: 0.66rem; font-weight: 800; color: #34d399; white-space: nowrap; flex-shrink: 0;">
              <i class="fa-solid fa-circle-check" style="font-size: 0.55rem; color: #22c55e;"></i>
              <span>الحساب الحالي: <strong id="settingsActiveUserNameTxt" style="color: #ffffff;">ماهر</strong></span>
            </div>
          </div>

          <!-- بطاقة العائلة الفاخرة (عائلة ماهر ❤️ أية) -->
          <div id="family_portrait_settings_card" style="margin: 0 0 10px; border-radius: 14px; overflow: hidden; position: relative; border: 1.5px solid rgba(56, 189, 248, 0.4); box-shadow: 0 8px 24px rgba(0,0,0,0.5); cursor: pointer;" onclick="openReceiptLightbox('family_portrait.jpg', 'عائلة ماهر ❤️ أية - بيت عامر بالحب والبركة')" title="انقر لعرض صورة العائلة بدقة عالية">
            <img src="family_portrait.jpg" alt="عائلة ماهر وأية" id="settingsFamilyPortraitImg" style="width: 100%; height: 160px; object-fit: cover; display: block;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.7) 65%, transparent 100%); padding: 10px 14px; display: flex; justify-content: space-between; align-items: flex-end;">
              <div>
                <div style="font-size: 0.92rem; font-weight: 900; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">عائلة ماهر ❤️ أية</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; font-weight: 700;">ماهر، أية، محمد، مريم، النونو، والحاجة الغالية 👨‍👩‍👧‍👦👵</div>
              </div>
              <span style="font-size: 0.64rem; background: rgba(56, 189, 248, 0.3); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.5); padding: 3px 8px; border-radius: 6px; font-weight: 800; backdrop-filter: blur(4px);">
                <i class="fa-solid fa-expand"></i> تكبير الصورة
              </span>
            </div>
          </div>

          <!-- أداة الاختيار التفاعلي لنمط وتصميم شعار العائلة (4 خيارات متناسقة) -->
          <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(251, 191, 36, 0.35); border-radius: 12px; padding: 10px; margin-bottom: 12px;">
            <div style="font-size: 0.72rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
              <span><i class="fa-solid fa-wand-magic-sparkles"></i> اختر نمط رمز وشعار العائلة المفضل لديك:</span>
              <span id="activeEmblemNameBadge" style="font-size: 0.62rem; color: #fbbf24; background: rgba(251, 191, 36, 0.16); border: 1px solid rgba(251, 191, 36, 0.4); padding: 2px 7px; border-radius: 6px; font-weight: 800;">الدرع الملكي المذهب ✓</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;" id="emblemOptionButtonsGroup">
              <button type="button" onclick="switchFamilyEmblem(1)" class="emblem-opt-btn active" id="btnEmblemOpt1" style="background: rgba(30, 41, 59, 0.85); border: 2.2px solid #fbbf24; border-radius: 10px; padding: 5px 2px; cursor: pointer; text-align: center; color: #f8fafc; transition: all 0.2s ease; box-shadow: 0 0 12px rgba(251, 191, 36, 0.45);">
                <img src="assets/family_option1_gold_crest.jpg" style="width: 38px; height: 38px; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto 3px;">
                <div style="font-size: 0.58rem; font-weight: 800; white-space: nowrap;">الدرع الملكي</div>
              </button>
              <button type="button" onclick="switchFamilyEmblem(2)" class="emblem-opt-btn" id="btnEmblemOpt2" style="background: rgba(30, 41, 59, 0.85); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 5px 2px; cursor: pointer; text-align: center; color: #f8fafc; transition: all 0.2s ease;">
                <img src="assets/family_option2_mosaic.jpg" style="width: 38px; height: 38px; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto 3px;">
                <div style="font-size: 0.58rem; font-weight: 800; white-space: nowrap;">الموزاييك</div>
              </button>
              <button type="button" onclick="switchFamilyEmblem(3)" class="emblem-opt-btn" id="btnEmblemOpt3" style="background: rgba(30, 41, 59, 0.85); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 5px 2px; cursor: pointer; text-align: center; color: #f8fafc; transition: all 0.2s ease;">
                <img src="assets/family_option3_rosette.jpg" style="width: 38px; height: 38px; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto 3px;">
                <div style="font-size: 0.58rem; font-weight: 800; white-space: nowrap;">المدار الزجاجي</div>
              </button>
              <button type="button" onclick="switchFamilyEmblem(4)" class="emblem-opt-btn" id="btnEmblemOpt4" style="background: rgba(30, 41, 59, 0.85); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 5px 2px; cursor: pointer; text-align: center; color: #f8fafc; transition: all 0.2s ease;">
                <img src="assets/family_option4_emerald.jpg" style="width: 38px; height: 38px; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto 3px;">
                <div style="font-size: 0.58rem; font-weight: 800; white-space: nowrap;">الزمرد والنيون</div>
              </button>
            </div>
          </div>
          <div id="settingsProfilesGridView">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-bottom: 8px;" id="settingsMembersGridContainer">
              <!-- تتولد الكروت تفاعلياً بواسطة renderSettingsMembersGrid() -->
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.62rem; color: #94a3b8; background: rgba(0,0,0,0.3); padding: 5px 9px; border-radius: 7px; border: 1px dashed rgba(56, 189, 248, 0.25);">
              <span><i class="fa-solid fa-shield-halved" style="color: #38bdf8;"></i> الحسابات محمية برمز قفل سري 🔒</span>
              <span style="color: #cbd5e1;">انقر على أي فرد للتبديل المباشر لحسابه</span>
            </div>
          </div>

          <!-- شاشة إدخال رمز القفل المدمجة داخل الإعدادات (Settings PIN Verification View) -->
          <div id="settingsPinVerificationView" style="display: none; background: rgba(15, 23, 42, 0.95); border: 1.4px solid rgba(56, 189, 248, 0.5); border-radius: 12px; padding: 14px 12px; text-align: center;">
            <div style="margin-bottom: 8px;">
              <img id="settingsPinTargetAvatar" src="" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2.5px solid #38bdf8; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35); margin: 0 auto 6px; display: block;">
              <div id="settingsPinTargetTitle" style="font-size: 0.90rem; font-weight: 900; color: #f8fafc;">قفل الحساب</div>
              <div style="font-size: 0.66rem; color: #94a3b8; margin-top: 2px;">أدخل رمز PIN الخاص بهذا الحساب للتبديل إليه 🔒</div>
            </div>

            <div style="margin-bottom: 10px;">
              <input type="password" id="inpSettingsMemberPin" class="form-input-custom" placeholder="رمز القفل •••••" maxlength="15" inputmode="numeric" onkeydown="if(event.key==='Enter') verifySettingsMemberPinSubmit();" style="height: 40px; font-size: 1.15rem; text-align: center; letter-spacing: 4px; border-radius: 9px; background: rgba(30, 41, 59, 0.9); border: 1.4px solid rgba(56, 189, 248, 0.45); color: #fff; width: 100%; box-sizing: border-box;">
              <div id="settingsPinErrorHint" style="display: none; font-size: 0.68rem; color: #f43f5e; font-weight: 800; margin-top: 6px;">
                ⚠️ رمز القفل غير صحيح! يرجى المحاولة مرة أخرى.
              </div>
            </div>

            <div style="display: flex; gap: 7px;">
              <button type="button" class="btn-submit-tx" onclick="verifySettingsMemberPinSubmit()" style="flex: 2; height: 38px; background: linear-gradient(135deg, #0284c7, #0ea5e9); font-size: 0.82rem; font-weight: 800; border-radius: 8px; margin: 0;">
                <i class="fa-solid fa-unlock"></i> تأكيد ودخول
              </button>
              <button type="button" onclick="cancelSettingsPinVerification()" style="flex: 1; height: 38px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-weight: 800; font-size: 0.76rem; cursor: pointer;">
                إلغاء
              </button>
            </div>
          </div>

        </div>"""

new_settings_top_content = """        <!-- 1. زر موازنة وتدقيق كافة الأرصدة والمحافظ فوراً (في الأعلى بدون ديباجة كتابية) -->
        <button type="button" onclick="runInstantSettingsAudit()" style="width: 100%; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #0284c7 0%, #0284c7 50%, #0ea5e9 100%); border: none; color: #fff; font-size: 0.88rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.40); margin: 2px 0 6px; transition: transform 0.12s ease;">
          <i class="fa-solid fa-scale-balanced" style="font-size: 1.1rem; color: #e0f2fe;"></i>
          <span>⚖️ موازنة وتدقيق كافة المحافظ والأرصدة فوراً</span>
        </button>

        <!-- 2. زر واحد فقط للمستخدم النشط لفتح الشاشة الكاملة للتبديل بين المستخدمين -->
        <div class="settings-user-capsule" onclick="openFullUserSelectionModal()" style="cursor: pointer; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.5px solid rgba(56, 189, 248, 0.45); border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="position: relative;">
              <img id="settingsCurrentMemberImg" src="" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover !important; object-position: top center !important; border: 2.2px solid #38bdf8; display: block; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
              <span style="position: absolute; bottom: -2px; left: -2px; width: 11px; height: 11px; border-radius: 50%; background: #22c55e; border: 1.5px solid #0f172a;"></span>
            </div>
            <div>
              <div style="font-size: 0.88rem; font-weight: 900; color: #fff;">المستخدم النشط: <span id="settingsCurrentMemberName" style="color: #38bdf8;">ماهر</span></div>
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">انقر هنا لفتح شاشة التبديل بين أفراد الأسرة 👥</div>
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
                <div style="font-size: 0.65rem; color: #cbd5e1; font-weight: 700;">رمز الموزاييك الملكي المعتمد 👑</div>
              </div>
            </div>
            <span style="font-size: 0.64rem; background: rgba(56, 189, 248, 0.3); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.5); padding: 3px 8px; border-radius: 6px; font-weight: 800; backdrop-filter: blur(4px);">
              <i class="fa-solid fa-expand"></i> عرض
            </span>
          </div>
        </div>"""

if old_settings_users_sec in content:
    content = content.replace(old_settings_users_sec, new_settings_top_content)
    print("Rebuilt Settings Modal Top Section successfully!")
else:
    print("WARNING: old_settings_users_sec not found directly!")

# -------------------------------------------------------------------------
# B. Add Full User Selection Modal (#fullUserSelectionModal) before </body>
# -------------------------------------------------------------------------
full_user_modal_html = """
  <!-- =========================================================================
       نافذة الشاشة الكاملة لاختيار والتبديل بين أفراد العائلة (Full User Selection Modal)
       ========================================================================= -->
  <div class="modal-overlay modal-overlay-custom" id="fullUserSelectionModal" style="display: none; z-index: 100040 !important; align-items: center !important; justify-content: center !important; padding: 14px; direction: rtl;" dir="rtl" onclick="if(event.target === this) closeFullUserSelectionModal()">
    <div class="modal-content-card" style="max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto; background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98)); border: 1.5px solid rgba(56, 189, 248, 0.45); border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.85); padding: 16px; box-sizing: border-box;">
      
      <!-- ترويسة النافذة -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(255, 255, 255, 0.08); padding-bottom: 10px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 36px; height: 36px; border-radius: 12px; background: rgba(56, 189, 248, 0.2); border: 1.2px solid rgba(56, 189, 248, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.15rem; color: #38bdf8;">
            <i class="fa-solid fa-users"></i>
          </div>
          <div>
            <h3 style="font-size: 0.98rem; font-weight: 900; color: #f8fafc; margin: 0;">التبديل بين حسابات العائلة</h3>
            <span style="font-size: 0.65rem; color: #38bdf8; font-weight: 700;">انقر على الحساب للانتقال الفوري إليه</span>
          </div>
        </div>
        <button type="button" class="btn-modal-close" onclick="closeFullUserSelectionModal()">&times;</button>
      </div>

      <!-- شبكة بطاقات أفراد الأسرة - ماهر أعلى اليمين (الأول في RTL) -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;" id="fullUserSelectionGridContainer">
        <!-- تتولد ديناميكياً بواسطة renderFullUserSelectionGrid() -->
      </div>

      <!-- قسم التحقق برمز القفل السري إن وجد -->
      <div id="fullUserSelectionPinBox" style="display: none; background: rgba(15, 23, 42, 0.95); border: 1.4px solid rgba(56, 189, 248, 0.5); border-radius: 12px; padding: 14px 12px; text-align: center; margin-bottom: 10px;">
        <div style="margin-bottom: 8px;">
          <img id="fullUserPinAvatar" src="" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover !important; object-position: top center !important; border: 2.5px solid #38bdf8; margin: 0 auto 6px; display: block; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);">
          <div id="fullUserPinTitle" style="font-size: 0.90rem; font-weight: 900; color: #f8fafc;">قفل الحساب</div>
          <div style="font-size: 0.66rem; color: #94a3b8; margin-top: 2px;">أدخل رمز PIN الخاص بهذا الحساب للتبديل إليه 🔒</div>
        </div>
        <input type="password" id="inpFullUserPin" class="form-input-custom" placeholder="رمز القفل •••••" maxlength="15" inputmode="numeric" onkeydown="if(event.key==='Enter') verifyFullUserPinSubmit();" style="height: 40px; font-size: 1.15rem; text-align: center; letter-spacing: 4px; border-radius: 9px; background: rgba(30, 41, 59, 0.9); border: 1.4px solid rgba(56, 189, 248, 0.45); color: #fff; width: 100%; box-sizing: border-box; margin-bottom: 8px;">
        <div id="fullUserPinError" style="display: none; font-size: 0.68rem; color: #f43f5e; font-weight: 800; margin-bottom: 8px;">⚠️ رمز القفل غير صحيح! حاول مرة أخرى.</div>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn-submit-tx" onclick="verifyFullUserPinSubmit()" style="flex: 2; height: 38px; background: linear-gradient(135deg, #0284c7, #0ea5e9); font-size: 0.82rem; font-weight: 800; border-radius: 8px; margin: 0;">تأكيد ودخول</button>
          <button type="button" onclick="cancelFullUserPin()" style="flex: 1; height: 38px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-weight: 800; font-size: 0.76rem; cursor: pointer;">إلغاء</button>
        </div>
      </div>

      <div style="text-align: center;">
        <button type="button" onclick="closeFullUserSelectionModal()" style="width: 100%; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-weight: 800; font-size: 0.78rem; cursor: pointer;">
          إغلاق النافذة
        </button>
      </div>

    </div>
  </div>
"""

if 'id="fullUserSelectionModal"' not in content:
    content = content.replace("</body>", full_user_modal_html + "\n</body>")
    print("Appended #fullUserSelectionModal before </body>")

# -------------------------------------------------------------------------
# C. Add JS functions for fullUserSelectionModal and runInstantSettingsAudit
# -------------------------------------------------------------------------
settings_js_engine = """
    // =========================================================================
    // محرك موازنة وتدقيق الأرصدة الفوري + نافذة اختيار المستخدم الكاملة
    // =========================================================================
    function runInstantSettingsAudit() {
      if (typeof auditAndRecomputeAllWalletBalances === 'function') {
        auditAndRecomputeAllWalletBalances();
      }
      if (typeof renderUI === 'function') renderUI();
      if (typeof playNotificationChime === 'function') playNotificationChime();
      showToast('⚖️ تمت موازنة وتدقيق كافة الأرصدة والمحافظ بنجاح (فرق 0.00 ج.م)');
    }

    let pendingFullUserTarget = null;

    function openFullUserSelectionModal() {
      renderFullUserSelectionGrid();
      const pinBox = document.getElementById('fullUserSelectionPinBox');
      const grid = document.getElementById('fullUserSelectionGridContainer');
      if (pinBox) pinBox.style.display = 'none';
      if (grid) grid.style.display = 'grid';
      openModal('fullUserSelectionModal');
    }

    function closeFullUserSelectionModal() {
      closeModal('fullUserSelectionModal');
      pendingFullUserTarget = null;
    }

    function renderFullUserSelectionGrid() {
      const container = document.getElementById('fullUserSelectionGridContainer');
      if (!container) return;
      const activeUser = state.currentUser || 'ماهر';

      // ماهر دائماً في البداية (أعلى اليمين في واجهات RTL)
      const membersList = [
        { name: 'ماهر', role: 'رب الأسرة', color: '#38bdf8', key: 'ماهر' },
        { name: 'آية', role: 'ربة المنزل', color: '#ec4899', key: 'أية' },
        { name: 'محمد', role: 'الابن', color: '#f59e0b', key: 'محمد' },
        { name: 'مريم', role: 'الابنة', color: '#8b5cf6', key: 'مريم' },
        { name: 'الحاجة', role: 'البركة', color: '#10b981', key: 'الحاجة' },
        { name: 'النونُو', role: 'أصغر العائلة', color: '#f43f5e', key: 'النونو' },
        { name: 'البيت', role: 'مصروف البيت العام', color: '#0ea5e9', key: 'البيت' }
      ];

      container.innerHTML = membersList.map(m => {
        const isActive = (activeUser === m.name || (activeUser === 'أية' && m.name === 'آية') || (activeUser === 'آية' && m.name === 'أية'));
        const photo = (typeof MEMBER_AVATARS !== 'undefined') ? (MEMBER_AVATARS[m.key] || MEMBER_AVATARS[m.name]) : null;
        const imgHtml = photo 
          ? `<img src="${photo}" alt="${m.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover !important; object-position: top center !important; border: 2.5px solid ${isActive ? '#22c55e' : m.color}; margin: 0 auto 6px; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">`
          : `<div style="width: 50px; height: 50px; border-radius: 50%; background: ${m.color}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; margin: 0 auto 6px;"><i class="fa-solid fa-user"></i></div>`;

        return `
          <div onclick="handleFullUserSelect('${m.name}')" style="background: ${isActive ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.22), rgba(15, 23, 42, 0.95))' : 'rgba(30, 41, 59, 0.75)'}; border: ${isActive ? '2px solid #22c55e' : '1.3px solid rgba(255, 255, 255, 0.12)'}; border-radius: 14px; padding: 12px 8px; text-align: center; cursor: pointer; transition: all 0.2s ease; position: relative; box-shadow: ${isActive ? '0 4px 18px rgba(34, 197, 94, 0.3)' : '0 2px 8px rgba(0,0,0,0.2)'};">
            ${isActive ? `<div style="position: absolute; top: 6px; right: 6px; font-size: 0.65rem; color: #22c55e; background: rgba(34, 197, 94, 0.2); padding: 1px 6px; border-radius: 10px; font-weight: 800;"><i class="fa-solid fa-circle-check"></i> الحساب النشط</div>` : ''}
            ${imgHtml}
            <div style="font-size: 0.86rem; font-weight: 900; color: #ffffff;">${m.name}</div>
            <div style="font-size: 0.64rem; color: ${isActive ? '#34d399' : m.color}; font-weight: 800; margin-top: 2px;">${m.role}</div>
          </div>
        `;
      }).join('');
    }

    function handleFullUserSelect(memberName) {
      const activeUser = state.currentUser || 'ماهر';
      if (activeUser === memberName || (activeUser === 'أية' && memberName === 'آية') || (activeUser === 'آية' && memberName === 'أية')) {
        showToast(`👤 أنت مسجل الدخول بالفعل بحساب ${memberName}`);
        closeFullUserSelectionModal();
        return;
      }

      const pin = FAMILY_PIN_CODES[memberName] || (memberName === 'آية' ? FAMILY_PIN_CODES['أية'] : null);
      if (!pin) {
        completeUserLogin(memberName);
        updateSettingsModalDisplay();
        closeFullUserSelectionModal();
        showToast(`✔ تم التبديل الفوري إلى حساب ${memberName} بنجاح! ✨`);
        return;
      }

      pendingFullUserTarget = memberName;
      const grid = document.getElementById('fullUserSelectionGridContainer');
      const pinBox = document.getElementById('fullUserSelectionPinBox');
      const pinTitle = document.getElementById('fullUserPinTitle');
      const pinAvatar = document.getElementById('fullUserPinAvatar');
      const inpPin = document.getElementById('inpFullUserPin');
      const pinErr = document.getElementById('fullUserPinError');

      if (grid) grid.style.display = 'none';
      if (pinBox) pinBox.style.display = 'block';
      if (pinTitle) pinTitle.textContent = `قفل حساب: ${memberName}`;
      if (pinErr) pinErr.style.display = 'none';
      if (inpPin) {
        inpPin.value = '';
        setTimeout(() => inpPin.focus(), 150);
      }
      if (pinAvatar) {
        let mKey = memberName;
        if (mKey === 'النونُو') mKey = 'النونو';
        if (mKey === 'آية') mKey = 'أية';
        const photo = (typeof MEMBER_AVATARS !== 'undefined') ? (MEMBER_AVATARS[mKey] || MEMBER_AVATARS[memberName]) : null;
        pinAvatar.src = photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=0284c7&color=fff`;
      }
    }

    function cancelFullUserPin() {
      pendingFullUserTarget = null;
      const grid = document.getElementById('fullUserSelectionGridContainer');
      const pinBox = document.getElementById('fullUserSelectionPinBox');
      if (grid) grid.style.display = 'grid';
      if (pinBox) pinBox.style.display = 'none';
    }

    function verifyFullUserPinSubmit() {
      if (!pendingFullUserTarget) return;
      const inpPin = document.getElementById('inpFullUserPin');
      const pinErr = document.getElementById('fullUserPinError');
      const entered = inpPin ? inpPin.value.trim() : '';
      const correctPin = FAMILY_PIN_CODES[pendingFullUserTarget] || (pendingFullUserTarget === 'آية' ? FAMILY_PIN_CODES['أية'] : null);

      if (entered === correctPin) {
        const memberName = pendingFullUserTarget;
        completeUserLogin(memberName);
        cancelFullUserPin();
        closeFullUserSelectionModal();
        updateSettingsModalDisplay();
        if (typeof renderUI === 'function') renderUI();
        if (typeof playNotificationChime === 'function') playNotificationChime();
        showToast(`🔓 تم التحقق بنجاح! مرحباً ${memberName} ✨`);
      } else {
        if (pinErr) pinErr.style.display = 'block';
        if (inpPin) {
          inpPin.classList.add('shake');
          setTimeout(() => inpPin.classList.remove('shake'), 400);
        }
      }
    }
"""

if 'function runInstantSettingsAudit' not in content:
    content = content.replace("function updateSettingsModalDisplay() {", settings_js_engine + "\n    function updateSettingsModalDisplay() {")
    print("Added settings_js_engine")

# Ensure updateSettingsModalDisplay updates #settingsCurrentMemberImg and #settingsCurrentMemberName
target_update_settings_display = """function updateSettingsModalDisplay() {
      const user = state.currentUser || 'ماهر';
        const curEmblem = localStorage.getItem('family_monefy_emblem') || 1;
        if (typeof switchFamilyEmblem === 'function') switchFamilyEmblem(curEmblem, false);"""

replacement_update_settings_display = """function updateSettingsModalDisplay() {
      const user = state.currentUser || 'ماهر';
      const curEmblem = 2; // تثبيت رمز شعار العائلة الموزاييك دائماً
      if (typeof switchFamilyEmblem === 'function') switchFamilyEmblem(2, false);

      const memberImgEl = document.getElementById('settingsCurrentMemberImg');
      const memberNameEl = document.getElementById('settingsCurrentMemberName');
      if (memberNameEl) memberNameEl.textContent = user;
      if (memberImgEl) {
        let mKey = user;
        if (mKey === 'النونُو') mKey = 'النونو';
        if (mKey === 'آية') mKey = 'أية';
        const photo = (typeof MEMBER_AVATARS !== 'undefined') ? (MEMBER_AVATARS[mKey] || MEMBER_AVATARS[user]) : null;
        if (photo) memberImgEl.src = photo;
      }"""

if target_update_settings_display in content:
    content = content.replace(target_update_settings_display, replacement_update_settings_display)
    print("Updated updateSettingsModalDisplay for permanent mosaic emblem and user capsule")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved Step A & B (Settings Overhaul).")
