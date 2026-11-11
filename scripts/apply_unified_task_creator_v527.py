# scripts/apply_unified_task_creator_v527.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Header Button: "+ مهمة مفصلة" -> "+ إضافة مهمة جديدة"
old_header_btn = '''<button type="button" onclick="openNewTaskDrawerModal()" style="height: 36px; padding: 0 14px; border-radius: 9px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.78rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.4);">
          <i class="fa-solid fa-circle-plus"></i>
          <span>+ مهمة مفصلة</span>
        </button>'''

new_header_btn = '''<button type="button" onclick="openOrToggleUnifiedTaskCreator()" style="height: 36px; padding: 0 14px; border-radius: 9px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.78rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.4);">
          <i class="fa-solid fa-circle-plus"></i>
          <span>+ إضافة مهمة جديدة</span>
        </button>'''

if old_header_btn in content:
    content = content.replace(old_header_btn, new_header_btn, 1)
    print("✓ Header button updated to openOrToggleUnifiedTaskCreator")
else:
    print("! Header button not found by exact string, checking regex...")
    pattern = r'<button type="button" onclick="openNewTaskDrawerModal\(\)"[^>]*>[\s\S]*?\+ مهمة مفصلة[\s\S]*?</button>'
    if re.search(pattern, content):
        content = re.sub(pattern, new_header_btn, content, count=1)
        print("✓ Header button updated via regex")
    else:
        print("! Warning: Header button pattern not matched")

# 2. Add CSS for unified task creator chips and styles
css_anchor = '#taskDateTimePickerModal { z-index: 2000050 !important; }'
unified_css = '''#taskDateTimePickerModal { z-index: 2000050 !important; }

    /* تنسيقات لوحة إضافة وتسجيل المهام الموحدة والشاملة من نفس الشاشة */
    .tasks-unified-creator-card {
      box-sizing: border-box;
    }
    .btn-unified-tag-chip {
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 0.74rem;
      font-weight: 850;
      white-space: nowrap;
      background: rgba(30, 41, 59, 0.75);
      border: 1.2px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-unified-tag-chip:hover {
      background: rgba(168, 85, 247, 0.2);
      border-color: rgba(168, 85, 247, 0.4);
      color: #fff;
    }
    .btn-unified-tag-chip.active {
      background: linear-gradient(135deg, #a855f7, #6366f1) !important;
      border-color: #c084fc !important;
      color: #ffffff !important;
      box-shadow: 0 2px 10px rgba(168, 85, 247, 0.45);
      font-weight: 950;
    }
    .btn-inline-dt-preset {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-inline-dt-preset:hover {
      border-color: rgba(168, 85, 247, 0.4);
      color: #fff;
    }
    .btn-inline-dt-preset.active {
      background: rgba(168, 85, 247, 0.35) !important;
      border-color: #a855f7 !important;
      color: #e9d5ff !important;
      box-shadow: 0 1px 6px rgba(168, 85, 247, 0.3);
    }
    .btn-inline-member-chip {
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.68rem;
      font-weight: 800;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-inline-member-chip.active {
      background: rgba(56, 189, 248, 0.25) !important;
      border-color: #38bdf8 !important;
      color: #38bdf8 !important;
      font-weight: 900;
    }'''

if css_anchor in content:
    content = content.replace(css_anchor, unified_css, 1)
    print("✓ Unified creator CSS injected successfully")
else:
    print("! CSS anchor not found")

# 3. Replace .tasks-mobile-single-add-card with the unified creator card
old_card_pattern = r'<!-- شريط الإضافة السريع والمطور مع آلية اختيار الوقت واليوم والاختصارات الذكية -->[\s\S]*?<div class="tasks-mobile-single-add-card"[\s\S]*?</div>\s*</div>'

new_card_html = '''<!-- لوحة تسجيل وإضافة المهمة الموحدة والشاملة (بيان المهمة + التاجات + التاريخ والساعة من نفس الشاشة) -->
        <div id="tasksUnifiedCreatorCard" class="tasks-unified-creator-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98)); border: 1.5px solid rgba(168, 85, 247, 0.45); border-radius: 18px; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); transition: all 0.3s ease;">
          
          <!-- هيدر كارت الإضافة الموحد مع شارة التاج النشط وحالة الشاشة الموحدة -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, #a855f7, #6366f1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.92rem; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);">
                <i class="fa-solid fa-pen-to-square"></i>
              </div>
              <span style="font-size: 0.88rem; font-weight: 900; color: #f8fafc;">تسجيل مهمة جديدة</span>
              <span id="unifiedCreatorActiveTagBadge" style="font-size: 0.68rem; font-weight: 850; padding: 2px 8px; border-radius: 6px; background: rgba(168, 85, 247, 0.25); border: 1px solid rgba(168, 85, 247, 0.5); color: #e9d5ff;">🌐 عامة</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.70rem; color: #34d399; font-weight: 850; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); padding: 2px 8px; border-radius: 6px;">✓ إدخال وتحديد مباشر</span>
            </div>
          </div>

          <!-- 1. بيان المهمة (عنوان / تفاصيل) -->
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="quickTaskTitleInput" style="font-size: 0.75rem; font-weight: 850; color: #cbd5e1; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-align-right" style="color: #a855f7;"></i>
              <span>بيان المهمة / التفاصيل:</span>
            </label>
            <div style="display: flex; gap: 6px; align-items: center;">
              <input type="text" id="quickTaskTitleInput" placeholder="اكتب بيان المهمة هنا... (مثال: سداد فاتورة الكهرباء والإنترنت)" style="flex: 1; height: 42px; border-radius: 11px; background: rgba(15, 23, 42, 0.92); border: 1.2px solid rgba(168, 85, 247, 0.4); color: #fff; font-size: 0.86rem; font-weight: 800; padding: 0 14px; outline: none; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='#c084fc'" onblur="this.style.borderColor='rgba(168, 85, 247, 0.4)'" onkeydown="if(event.key==='Enter') handleQuickTaskAdd()">
              <button type="button" onclick="handleQuickTaskAdd()" style="height: 42px; padding: 0 16px; border-radius: 11px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.84rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.45); flex-shrink: 0; transition: transform 0.15s;" onmousedown="this.style.transform='scale(0.96)'" onmouseup="this.style.transform='scale(1)'">
                <i class="fa-solid fa-plus"></i>
                <span>إضافة</span>
              </button>
            </div>
          </div>

          <!-- 2. اختيار التاجات (يومي، عامة، مجدولة، هامة، مشتريات، منزلية، فواتير، صحة، عمل) -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.74rem; font-weight: 850; color: #cbd5e1; display: flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-tags" style="color: #38bdf8;"></i>
                <span>اختر التاج / الوسم:</span>
              </span>
              <span style="font-size: 0.66rem; color: #94a3b8; font-weight: 700;">(اضغط للتبديل الفوري)</span>
            </div>
            <div id="unifiedTaskTagChipsList" style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 6px;" class="custom-scrollbar">
              <button type="button" class="btn-unified-tag-chip" data-tag="my_day" onclick="selectTaskInlineTag('my_day', this)">☀️ يومي</button>
              <button type="button" class="btn-unified-tag-chip active" data-tag="general" onclick="selectTaskInlineTag('general', this)">🌐 عامة</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="planned" onclick="selectTaskInlineTag('planned', this)">📅 مجدولة</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="important" onclick="selectTaskInlineTag('important', this)" style="border-color: rgba(244,63,94,0.35);">⭐ هامة / عاجلة</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="shopping" onclick="selectTaskInlineTag('shopping', this)">🛒 مشتريات</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="home" onclick="selectTaskInlineTag('home', this)">🛋️ منزلية</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="bills" onclick="selectTaskInlineTag('bills', this)">⚡ فواتير</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="health" onclick="selectTaskInlineTag('health', this)">🩺 صحة</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="work" onclick="selectTaskInlineTag('work', this)">💼 عمل</button>
            </div>
          </div>

          <!-- 3. تحديد التاريخ والساعة من نفس الشاشة بدون أي نوافذ منبثقة -->
          <div style="background: rgba(15, 23, 42, 0.7); border: 1.2px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.74rem; font-weight: 850; color: #e2e8f0; display: flex; align-items: center; gap: 6px;">
                <i class="fa-regular fa-calendar-check" style="color: #c084fc;"></i>
                <span>تحديد موعد المهمة (التاريخ والساعة معاً من نفس الشاشة):</span>
              </span>
              <span id="lblUnifiedTaskDateTimeDisplay" style="font-size: 0.68rem; font-weight: 850; color: #38bdf8;">اليوم</span>
            </div>

            <!-- شبكة التاريخ والساعة -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <!-- عمود التاريخ -->
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-size: 0.68rem; font-weight: 800; color: #94a3b8;">📅 التاريخ:</label>
                <!-- اختصارات سريعة للأيام -->
                <div style="display: flex; gap: 4px;" id="inlineDatePresetGroup">
                  <button type="button" class="btn-inline-dt-preset active" data-preset="today" onclick="selectInlineDatePreset('today', this)" style="flex: 1; padding: 4px 6px; font-size: 0.68rem; border-radius: 6px;">اليوم</button>
                  <button type="button" class="btn-inline-dt-preset" data-preset="tomorrow" onclick="selectInlineDatePreset('tomorrow', this)" style="flex: 1; padding: 4px 6px; font-size: 0.68rem; border-radius: 6px;">غداً</button>
                  <button type="button" class="btn-inline-dt-preset" data-preset="after_two_days" onclick="selectInlineDatePreset('after_two_days', this)" style="flex: 1; padding: 4px 6px; font-size: 0.68rem; border-radius: 6px;">+ يومين</button>
                </div>
                <!-- حقل إدخال التاريخ المباشر من نفس الشاشة -->
                <input type="date" id="inlineTaskDueDate" style="height: 36px; border-radius: 8px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(168, 85, 247, 0.35); color: #fff; font-size: 0.78rem; font-weight: 800; padding: 0 8px; outline: none; box-sizing: border-box; width: 100%;" onchange="onInlineDateCustomChange(this.value)">
              </div>

              <!-- عمود الساعة / الوقت -->
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-size: 0.68rem; font-weight: 800; color: #94a3b8;">⏰ التوقيت (الساعة):</label>
                <!-- اختصارات سريعة للساعات -->
                <div style="display: flex; gap: 3px; overflow-x: auto;" class="custom-scrollbar" id="inlineTimePresetGroup">
                  <button type="button" class="btn-inline-dt-preset" data-time="09:00" onclick="selectInlineTimePreset('09:00', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap;">09:00 ص</button>
                  <button type="button" class="btn-inline-dt-preset" data-time="13:00" onclick="selectInlineTimePreset('13:00', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap;">01:00 م</button>
                  <button type="button" class="btn-inline-dt-preset" data-time="17:00" onclick="selectInlineTimePreset('17:00', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap;">05:00 م</button>
                  <button type="button" class="btn-inline-dt-preset" data-time="21:00" onclick="selectInlineTimePreset('21:00', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap;">09:00 م</button>
                  <button type="button" class="btn-inline-dt-preset" data-time="" onclick="selectInlineTimePreset('', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap; color: #f43f5e;" title="بدون وقت">بدون</button>
                </div>
                <!-- حقل إدخال الساعة المباشر من نفس الشاشة -->
                <input type="time" id="inlineTaskDueTime" style="height: 36px; border-radius: 8px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(168, 85, 247, 0.35); color: #fff; font-size: 0.78rem; font-weight: 800; padding: 0 8px; outline: none; box-sizing: border-box; width: 100%;" onchange="onInlineTimeCustomChange(this.value)">
              </div>
            </div>
          </div>

          <!-- 4. المسؤول + إرفاق صورة بالكاميرا والمرفقات -->
          <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <!-- اختيار فرد العائلة المسؤول -->
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="font-size: 0.70rem; font-weight: 800; color: #cbd5e1;">👤 المسؤول:</span>
              <div style="display: flex; gap: 3px;" id="inlineTaskMemberGroup">
                <button type="button" class="btn-inline-member-chip active" data-member="البيت" onclick="selectInlineTaskMember('البيت', this)">البيت</button>
                <button type="button" class="btn-inline-member-chip" data-member="ماهر" onclick="selectInlineTaskMember('ماهر', this)">ماهر</button>
                <button type="button" class="btn-inline-member-chip" data-member="آية" onclick="selectInlineTaskMember('آية', this)">آية</button>
                <button type="button" class="btn-inline-member-chip" data-member="محمد" onclick="selectInlineTaskMember('محمد', this)">محمد</button>
                <button type="button" class="btn-inline-member-chip" data-member="مريم" onclick="selectInlineTaskMember('مريم', this)">مريم</button>
              </div>
            </div>

            <!-- زر تصوير الكاميرا الفوري -->
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" onclick="triggerTaskCameraOnly()" style="height: 32px; padding: 0 10px; border-radius: 8px; background: rgba(56, 189, 248, 0.16); border: 1px solid rgba(56, 189, 248, 0.45); color: #38bdf8; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-camera"></i>
                <span>تصوير بالكاميرا</span>
              </button>
              <input type="file" id="quickTaskCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskCameraOnlyChosen(event)">
              <div id="quickTaskPhotoPreviewBar" style="display: none; align-items: center; gap: 6px;"></div>
            </div>
          </div>

          <!-- 5. زر الحفظ الرئيسي الشامل الموحد -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" id="btnSubmitUnifiedTask" onclick="handleQuickTaskAdd()" style="flex: 1; height: 42px; border-radius: 11px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.86rem; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); transition: all 0.2s;">
              <i class="fa-solid fa-check-double"></i>
              <span>✨ حفظ وإضافة المهمة</span>
            </button>
            <button type="button" onclick="resetUnifiedTaskForm()" style="height: 42px; padding: 0 14px; border-radius: 11px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #94a3b8; font-size: 0.78rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-arrow-rotate-right"></i>
              <span>مسح</span>
            </button>
          </div>

        </div>'''

match = re.search(old_card_pattern, content)
if match:
    content = content[:match.start()] + new_card_html + content[match.end():]
    print("✓ Old add-task card replaced with unified creator card")
else:
    print("! Old card pattern not matched, attempting alternate locator...")
    # Alternate search
    loc1 = content.find('tasks-mobile-single-add-card')
    if loc1 != -1:
        start_div = content.rfind('<div class="tasks-mobile-single-add-card"', 0, loc1 + 50)
        end_div = content.find('<!-- شريط الفلاتر والبحث المثبت', loc1)
        if start_div != -1 and end_div != -1:
            content = content[:start_div] + new_card_html + '\n\n        ' + content[end_div:]
            print("✓ Old add-task card replaced via alternate indices")

# 4. Update JS logic: Add helper functions & update handleQuickTaskAdd & update renderTasksProList
js_functions = '''
/* ==========================================================
   وظائف لوحة تسجيل وإضافة المهام الموحدة (v5.2.7)
   دمج بيان المهمة + التاجات + التاريخ والساعة من نفس الشاشة
   ========================================================== */
window._selectedTaskTag = 'general';
window._selectedTaskPriority = 'medium';
window._selectedTaskMember = 'البيت';

function selectTaskInlineTag(tagKey, element) {
  window._selectedTaskTag = tagKey;
  const chips = document.querySelectorAll('#unifiedTaskTagChipsList .btn-unified-tag-chip');
  chips.forEach(c => c.classList.remove('active'));
  if (element) element.classList.add('active');

  const badge = document.getElementById('unifiedCreatorActiveTagBadge');
  const tagLabels = {
    'my_day': '☀️ يومي',
    'general': '🌐 عامة',
    'planned': '📅 مجدولة',
    'important': '⭐ هامة / عاجلة',
    'shopping': '🛒 مشتريات',
    'home': '🛋️ منزلية',
    'bills': '⚡ فواتير',
    'health': '🩺 صحة',
    'work': '💼 عمل'
  };
  if (badge) badge.textContent = tagLabels[tagKey] || tagKey;

  const todayStr = new Date().toISOString().slice(0, 10);
  const dateInp = document.getElementById('inlineTaskDueDate');

  if (tagKey === 'my_day') {
    if (dateInp) dateInp.value = todayStr;
    const todayBtn = document.querySelector('#inlineDatePresetGroup [data-preset="today"]');
    if (todayBtn) selectInlineDatePreset('today', todayBtn);
  } else if (tagKey === 'planned') {
    if (dateInp && dateInp.value === todayStr) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);
      dateInp.value = tomorrowStr;
      const tmrwBtn = document.querySelector('#inlineDatePresetGroup [data-preset="tomorrow"]');
      if (tmrwBtn) selectInlineDatePreset('tomorrow', tmrwBtn);
    }
  }

  if (tagKey === 'important') {
    window._selectedTaskPriority = 'high';
  } else {
    window._selectedTaskPriority = 'medium';
  }
}

function selectInlineDatePreset(preset, element) {
  const chips = document.querySelectorAll('#inlineDatePresetGroup .btn-inline-dt-preset');
  chips.forEach(c => c.classList.remove('active'));
  if (element) element.classList.add('active');

  const now = new Date();
  let targetStr = now.toISOString().slice(0, 10);

  if (preset === 'tomorrow') {
    now.setDate(now.getDate() + 1);
    targetStr = now.toISOString().slice(0, 10);
  } else if (preset === 'after_two_days') {
    now.setDate(now.getDate() + 2);
    targetStr = now.toISOString().slice(0, 10);
  }

  const dateInp = document.getElementById('inlineTaskDueDate');
  if (dateInp) dateInp.value = targetStr;

  updateUnifiedTaskDateTimeLabel();
}

function onInlineDateCustomChange(val) {
  const chips = document.querySelectorAll('#inlineDatePresetGroup .btn-inline-dt-preset');
  chips.forEach(c => c.classList.remove('active'));

  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  if (val === todayStr) {
    const b = document.querySelector('#inlineDatePresetGroup [data-preset="today"]');
    if (b) b.classList.add('active');
  } else if (val === tomorrowStr) {
    const b = document.querySelector('#inlineDatePresetGroup [data-preset="tomorrow"]');
    if (b) b.classList.add('active');
  }

  updateUnifiedTaskDateTimeLabel();
}

function selectInlineTimePreset(timeStr, element) {
  const chips = document.querySelectorAll('#inlineTimePresetGroup .btn-inline-dt-preset');
  chips.forEach(c => c.classList.remove('active'));
  if (element) element.classList.add('active');

  const timeInp = document.getElementById('inlineTaskDueTime');
  if (timeInp) timeInp.value = timeStr;

  updateUnifiedTaskDateTimeLabel();
}

function onInlineTimeCustomChange(val) {
  const chips = document.querySelectorAll('#inlineTimePresetGroup .btn-inline-dt-preset');
  chips.forEach(c => c.classList.remove('active'));
  chips.forEach(c => {
    if (c.getAttribute('data-time') === val) c.classList.add('active');
  });

  updateUnifiedTaskDateTimeLabel();
}

function updateUnifiedTaskDateTimeLabel() {
  const dateInp = document.getElementById('inlineTaskDueDate');
  const timeInp = document.getElementById('inlineTaskDueTime');
  const lbl = document.getElementById('lblUnifiedTaskDateTimeDisplay');
  if (!lbl) return;

  const dateVal = dateInp ? dateInp.value : '';
  const timeVal = timeInp ? timeInp.value : '';

  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  let dateText = dateVal;
  if (dateVal === todayStr) dateText = 'اليوم';
  else if (dateVal === tomorrowStr) dateText = 'غداً';

  let timeText = '';
  if (timeVal) {
    timeText = ' • ' + formatTime12hArabic(timeVal);
  }

  lbl.textContent = `${dateText || 'اليوم'}${timeText}`;
}

function formatTime12hArabic(val) {
  if (!val) return '';
  const parts = val.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const period = h >= 12 ? 'م' : 'ص';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

function selectInlineTaskMember(member, element) {
  window._selectedTaskMember = member;
  const chips = document.querySelectorAll('#inlineTaskMemberGroup .btn-inline-member-chip');
  chips.forEach(c => c.classList.remove('active'));
  if (element) element.classList.add('active');
}

function openOrToggleUnifiedTaskCreator() {
  const card = document.getElementById('tasksUnifiedCreatorCard');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const inp = document.getElementById('quickTaskTitleInput');
    if (inp) inp.focus();
  }
}

function openNewTaskDrawerModal() {
  openOrToggleUnifiedTaskCreator();
}

function resetUnifiedTaskForm() {
  const titleInp = document.getElementById('quickTaskTitleInput');
  if (titleInp) titleInp.value = '';

  const defaultTagBtn = document.querySelector('#unifiedTaskTagChipsList [data-tag="general"]');
  if (defaultTagBtn) selectTaskInlineTag('general', defaultTagBtn);

  const defaultDateBtn = document.querySelector('#inlineDatePresetGroup [data-preset="today"]');
  if (defaultDateBtn) selectInlineDatePreset('today', defaultDateBtn);

  const defaultTimeBtn = document.querySelector('#inlineTimePresetGroup [data-time=""]');
  if (defaultTimeBtn) selectInlineTimePreset('', defaultTimeBtn);

  const defaultMemberBtn = document.querySelector('#inlineTaskMemberGroup [data-member="البيت"]');
  if (defaultMemberBtn) selectInlineTaskMember('البيت', defaultMemberBtn);

  clearTaskPendingPhoto();
}

function renderTaskTagBadge(task) {
  const tagKey = task.tag || task.category || 'general';
  const tagConfigs = {
    'my_day': { label: '☀️ يومي', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
    'general': { label: '🌐 عامة', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)' },
    'planned': { label: '📅 مجدولة', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)' },
    'important': { label: '⭐ هامة', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)' },
    'shopping': { label: '🛒 مشتريات', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
    'home': { label: '🛋️ منزلية', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)' },
    'bills': { label: '⚡ فواتير', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.4)' },
    'health': { label: '🩺 صحة', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)' },
    'work': { label: '💼 عمل', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' },
  };
  const cfg = tagConfigs[tagKey] || tagConfigs['general'];
  return `<span style="font-size: 0.65rem; font-weight: 850; padding: 1px 7px; border-radius: 6px; color: ${cfg.color}; background: ${cfg.bg}; border: 1px solid ${cfg.border};">${cfg.label}</span>`;
}

window.selectTaskInlineTag = selectTaskInlineTag;
window.selectInlineDatePreset = selectInlineDatePreset;
window.onInlineDateCustomChange = onInlineDateCustomChange;
window.selectInlineTimePreset = selectInlineTimePreset;
window.onInlineTimeCustomChange = onInlineTimeCustomChange;
window.selectInlineTaskMember = selectInlineTaskMember;
window.openOrToggleUnifiedTaskCreator = openOrToggleUnifiedTaskCreator;
window.openNewTaskDrawerModal = openNewTaskDrawerModal;
window.resetUnifiedTaskForm = resetUnifiedTaskForm;
window.renderTaskTagBadge = renderTaskTagBadge;
window.updateUnifiedTaskDateTimeLabel = updateUnifiedTaskDateTimeLabel;
'''

# Replace handleQuickTaskAdd
old_quick_task_fn_pattern = r'function handleQuickTaskAdd\(\)\s*\{[\s\S]*?if \(typeof showToast === \'function\'\) showToast\(\'تمت إضافة المهمة بنجاح ✓\'\);\s*\}'

new_quick_task_fn = '''function handleQuickTaskAdd() {
  const titleInp = document.getElementById('quickTaskTitleInput');
  const title = titleInp ? titleInp.value.trim() : '';
  if (!title) {
    if (typeof showToast === 'function') showToast('يرجى إدخال بيان المهمة أولاً');
    if (titleInp) titleInp.focus();
    return;
  }

  const now = new Date();
  const dateInp = document.getElementById('inlineTaskDueDate');
  const timeInp = document.getElementById('inlineTaskDueTime');

  const dueDate = (dateInp && dateInp.value) ? dateInp.value : now.toISOString().slice(0, 10);
  const dueTime = (timeInp && timeInp.value) ? timeInp.value : '';

  const tag = window._selectedTaskTag || 'general';
  const member = window._selectedTaskMember || (window.currentTaskMemberFilter !== 'all' ? window.currentTaskMemberFilter : 'البيت');
  const priority = tag === 'important' ? 'high' : (window._selectedTaskPriority || 'medium');

  const newTask = {
    id: 'task_' + Date.now(),
    title: title,
    dueDate: dueDate,
    dueTime: dueTime,
    tag: tag,
    category: tag, // Ensures seamless matching with category filters
    assignedMember: member,
    priority: priority,
    completed: false,
    photo: window.currentQuickTaskPhoto || null,
    createdAt: new Date().toISOString(),
    subtasks: []
  };

  const tasks = getTodoTasks();
  tasks.unshift(newTask);
  saveTodoTasks(tasks);

  if (titleInp) titleInp.value = '';
  clearTaskPendingPhoto();

  renderTasksProList();
  updateTasksProductivityKPIs();
  if (typeof showToast === 'function') showToast('تمت إضافة المهمة بنجاح ✓');
}'''

# Insert js_functions right before handleQuickTaskAdd
match_quick = re.search(old_quick_task_fn_pattern, content)
if match_quick:
    content = content[:match_quick.start()] + js_functions + '\n\n' + new_quick_task_fn + content[match_quick.end():]
    print("✓ handleQuickTaskAdd replaced and helper functions inserted")
else:
    print("! Could not find old handleQuickTaskAdd via regex")

# 5. Enhance renderTasksProList item badges to include renderTaskTagBadge(t)
old_badge_line = '<div style="font-size: 0.66rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-top: 1px; flex-wrap: wrap;">'
new_badge_line = '<div style="font-size: 0.66rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-top: 1px; flex-wrap: wrap;">\n              ${renderTaskTagBadge(t)}'

if old_badge_line in content:
    content = content.replace(old_badge_line, new_badge_line, 1)
    print("✓ Tag badge added into renderTasksProList")
else:
    print("! old_badge_line not found")

# 6. Ensure openTasksFullScreenModal sets inlineTaskDueDate if empty
old_open_tasks = 'function openTasksFullScreenModal() {'
new_open_tasks = '''function openTasksFullScreenModal() {
  const inlineDate = document.getElementById('inlineTaskDueDate');
  if (inlineDate && !inlineDate.value) {
    inlineDate.value = new Date().toISOString().slice(0, 10);
  }'''

if old_open_tasks in content:
    content = content.replace(old_open_tasks, new_open_tasks, 1)
    print("✓ openTasksFullScreenModal updated to initialize inlineTaskDueDate")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ All modifications written to index.html successfully!")
