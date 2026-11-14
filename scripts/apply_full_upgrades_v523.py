import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Loaded index.html: {len(content)} chars.")

# =========================================================================
# 1. إعادة هيكلة صفحة الالتزامات (viewExpected): فصل قسم الفواتير والديون عن الميزانيات كـ Siblings
# =========================================================================
# سنحدد بالضبط أين يبدأ viewExpected وأين ينتهي
idx_ve = content.find('id="viewExpected"')
idx_bottom_nav = content.find('id="appBottomNav"')

# استخراج محتوى panelMonthlyBudget و panelBudgetHistory
idx_pmb = content.find('id="panelMonthlyBudget"')
idx_pbh = content.find('id="panelBudgetHistory"')

# لنفحص نهاية panelBudgetHistory
idx_pbh_end = content.find('</div>\n        </div>\n      </div>\n    </div> <!-- إغلاق viewExpected الرسمي -->', idx_pbh)
if idx_pbh_end == -1:
    idx_pbh_end = content.find('</div> <!-- إغلاق viewExpected الرسمي -->', idx_pbh)
if idx_pbh_end == -1:
    idx_pbh_end = content.rfind('</div>', 0, idx_bottom_nav)

print(f"idx_pmb: {idx_pmb}, idx_pbh: {idx_pbh}, idx_pbh_end: {idx_pbh_end}")

# لنستخرج كتلتي الميزانية
idx_bud_tabs = content.find('id="budgetsSubTabStrip"')

# كتلة subViewCommitments تنتهي قبل budgetsSubTabStrip
# سنغلق subViewCommitments ونسميه secBillsAndDebts ونبدأ secBudgetsSection
# دعنا نرى ما هو النص بين debtsListContentContainer وبداية الميزانيات
idx_debts_cont = content.find('id="debtsListContentContainer"')
idx_after_debts = content.find('</div>', idx_debts_cont)
idx_after_debts = content.find('</div>', idx_after_debts + 6) # نهاية viewCommitmentsDebtsList

# دعنا نستخرج كود panelMonthlyBudget وكود panelBudgetHistory
idx_pmb_start = content.find('<div id="panelMonthlyBudget"', idx_debts_cont)
idx_pbh_start = content.find('<div id="panelBudgetHistory"', idx_debts_cont)

# نهاية panelBudgetHistory
idx_pbh_close = content.find('</div>', content.find('id="budgetHistoryListContainer"', idx_pbh_start)) + 6

pmb_html = content[idx_pmb_start:idx_pbh_start].strip()
pbh_html = content[idx_pbh_start:idx_pbh_close].strip()

print(f"Extracted pmb length: {len(pmb_html)}, pbh length: {len(pbh_html)}")

# استبدال subViewCommitments ليكون حاوياً فقط للفواتير والديون ويغلق تماماً قبل الميزانيات
# وتغليف الميزانيات داخل secBudgetsSection مستقل
clean_sec_budgets_html = f'''        <!-- ========================================================
             القسم 2: الميزانيات التقديرية والتاريخية (Budgets Section)
             ======================================================== -->
        <div id="secBudgetsSection" style="display: none; flex-direction: column; gap: 10px;">
          
          <!-- شريط التبويب الفرعي لقسم الميزانيات: ميزانية الشهر | أرشيف وسجل الميزانيات -->
          <div class="budgets-sub-tab-strip" id="budgetsSubTabStrip" style="display: flex; gap: 6px; background: rgba(15, 23, 42, 0.95); padding: 5px; border-radius: 12px; border: 1.2px solid rgba(16, 185, 129, 0.3); margin-bottom: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.3);">
            <button type="button" id="btnBudgetSubCurrent" onclick="switchBudgetSubTab('current')" style="flex: 1; padding: 9px 12px; border-radius: 9px; font-size: 0.80rem; font-weight: 900; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: 1px solid rgba(16, 185, 129, 0.5); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35); transition: all 0.2s;">
              <i class="fa-solid fa-chart-pie"></i> <span>ميزانية الشهر النشطة</span>
            </button>
            <button type="button" id="btnBudgetSubHistory" onclick="switchBudgetSubTab('history')" style="flex: 1; padding: 9px 12px; border-radius: 9px; font-size: 0.80rem; font-weight: 900; background: transparent; color: #94a3b8; border: 1px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
              <i class="fa-solid fa-clock-rotate-left"></i> <span>سجل الميزانيات السابقة</span>
            </button>
          </div>

          <!-- لوحة ميزانية الشهر النشطة -->
          <div id="panelMonthlyBudget" class="app-card-panel" style="display: block; background: rgba(30, 41, 59, 0.7); border: 1.2px solid rgba(16, 185, 129, 0.25); border-radius: 16px; padding: 12px 14px; margin-bottom: 12px;">
            {content[idx_pmb_start + len('<div id="panelMonthlyBudget" class="app-card-panel" style="display: none; background: rgba(30, 41, 59, 0.7); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 16px; padding: 12px 14px; margin-bottom: 12px;">'):idx_pbh_start]}

          <!-- لوحة سجل الميزانيات السابقة -->
          {pbh_html}
        </div>
'''

# الآن نبحث عن بداية budgetsSubTabStrip وحتى نهاية panelBudgetHistory ونستبدلها
idx_bud_tabs_start = content.find('<!-- شريط تبويب داخلي منسق لقسم الميزانيات -->')
if idx_bud_tabs_start == -1:
    idx_bud_tabs_start = idx_bud_tabs

# نضع secBillsAndDebts و secBudgetsSection بشكل نظيف ومضمون
content = content[:idx_bud_tabs_start] + clean_sec_budgets_html + "\n      </div>\n    </div> <!-- إغلاق viewExpected الرسمي -->\n" + content[content.find('<!-- الشريط السفلي الثابت', idx_pbh_close):]

print("Successfully decoupled Commitments & Debts from Budgets as sibling containers.")

# =========================================================================
# 2. تحديث شاشة إضافة مهمة جديدة: إلغاء الخيارات المثبتة ودمج التاريخ والساعة مباشرة + تصوير بالكاميرا فقط
# =========================================================================
# نبحث عن كارت الإضافة: tasks-mobile-single-add-card
idx_add_card = content.find('class="tasks-mobile-single-add-card"')
if idx_add_card != -1:
    idx_add_card_end = content.find('id="tasksCategoryPillsStrip"')
    idx_add_card_start = content.rfind('<div class="tasks-mobile-single-add-card"', 0, idx_add_card)
    
    # بطاقة إضافة المهمة الجديدة النظيفة تماماً بدون أي رقائق أو اختيارات مثبتة
    # دمج التاريخ والساعة مباشرة في سطرين واضحين + زر المرفق يفتح تصوير الكاميرا فقط
    new_task_add_clean_html = '''<!-- بطاقة إضافة مهمة جديدة مدمجة ومنسقة للهاتف بدون اختيارات مثبتة (تاريخ وساعة مباشرين + تصوير كاميرا فقط) -->
        <div class="tasks-mobile-single-add-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.45); border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);">
          
          <!-- السطر 1: عنوان المهمة + زر الإضافة -->
          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" id="quickTaskTitleInput" placeholder="+ اكتب مهمة جديدة واضغط إضافة..." style="flex: 1; height: 42px; border-radius: 10px; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 0.86rem; font-weight: 800; padding: 0 12px; outline: none; box-sizing: border-box;" onkeydown="if(event.key==='Enter') handleQuickTaskAdd()">
            <button type="button" onclick="handleQuickTaskAdd()" style="height: 42px; padding: 0 18px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.84rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.45); flex-shrink: 0;">
              <i class="fa-solid fa-plus"></i>
              <span>إضافة</span>
            </button>
          </div>

          <!-- السطر 2: تحديد التاريخ والساعة المباشرين المطوّرين (بدون أي اختيارات مثبتة مسبقاً) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <!-- منتقي التاريخ المباشر -->
            <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 10px; padding: 6px 10px; display: flex; flex-direction: column; gap: 4px;">
              <label for="quickTaskInlineDate" style="font-size: 0.72rem; font-weight: 850; color: #cbd5e1; display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <i class="fa-regular fa-calendar-check" style="color: #c084fc;"></i>
                <span>تاريخ المهمة:</span>
              </label>
              <input type="date" id="quickTaskInlineDate" style="width: 100%; height: 32px; border-radius: 7px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255,255,255,0.12); color: #f8fafc; font-size: 0.78rem; font-weight: 800; padding: 0 8px; outline: none; box-sizing: border-box;">
            </div>

            <!-- منتقي الساعة والتوقيت المباشر -->
            <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 10px; padding: 6px 10px; display: flex; flex-direction: column; gap: 4px;">
              <label for="quickTaskInlineTime" style="font-size: 0.72rem; font-weight: 850; color: #cbd5e1; display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <i class="fa-regular fa-clock" style="color: #38bdf8;"></i>
                <span>ساعة وتوقيت المهمة:</span>
              </label>
              <input type="time" id="quickTaskInlineTime" value="10:00" style="width: 100%; height: 32px; border-radius: 7px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255,255,255,0.12); color: #f8fafc; font-size: 0.78rem; font-weight: 800; padding: 0 8px; outline: none; box-sizing: border-box;">
            </div>
          </div>

          <!-- السطر 3: الفرد، الأولوية، المبلغ، وزر التقاط صورة بالكاميرا فقط -->
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: space-between;">
            <div style="display: flex; gap: 5px; align-items: center; flex-wrap: wrap;">
              <select id="quickTaskMemberSelect" style="height: 30px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.72rem; font-weight: 800; padding: 0 8px; outline: none;">
                <option value="البيت">🏠 البيت</option>
                <option value="ماهر">👤 ماهر</option>
                <option value="آية">👤 آية</option>
                <option value="محمد">👤 محمد</option>
                <option value="مريم">👤 مريم</option>
                <option value="الحاجة">👤 الحاجة</option>
                <option value="التونو">👤 التونو</option>
              </select>

              <select id="quickTaskPrioritySelect" style="height: 30px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.72rem; font-weight: 800; padding: 0 8px; outline: none;">
                <option value="high">🔴 عاجل P1</option>
                <option value="medium">🟡 متوسطة P2</option>
                <option value="normal" selected>⚪ عادية P3</option>
                <option value="low">🔘 منخفضة P4</option>
              </select>

              <input type="number" id="quickTaskEstAmount" placeholder="مبلغ تقديري" style="width: 85px; height: 30px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.15); color: #fbbf24; font-size: 0.72rem; font-weight: 800; padding: 0 8px; outline: none;">
            </div>

            <!-- زر إضافة مرفق يفتح على تصوير صورة بالكاميرا فقط -->
            <button type="button" onclick="triggerTaskCameraOnly()" style="height: 30px; padding: 0 11px; border-radius: 8px; background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 114, 182, 0.2)); border: 1.2px solid rgba(244, 63, 94, 0.45); color: #fb7185; font-size: 0.74rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-camera"></i> <span id="lblQuickTaskPhoto">تصوير بالكاميرا</span>
            </button>
          </div>

          <!-- شريط معاينة الصورة الملتقطة بالكاميرا إن وجدت -->
          <div id="quickTaskPhotoPreviewBar" style="display: none; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.85); border: 1px dashed rgba(244, 63, 94, 0.4); border-radius: 8px; padding: 4px 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img id="quickTaskPhotoPreviewImg" src="" style="width: 28px; height: 28px; border-radius: 5px; object-fit: cover;">
              <span style="font-size: 0.70rem; color: #fb7185; font-weight: 800;">تم التقاط صورة للمهمة</span>
            </div>
            <button type="button" onclick="removeQuickTaskPhoto()" style="background: transparent; border: none; color: #94a3b8; font-size: 0.80rem; cursor: pointer;">&times;</button>
          </div>
        </div>
'''
    idx_end_div = content.rfind('</div>', 0, idx_add_card_end) + 6
    content = content[:idx_add_card_start] + new_task_add_clean_html + "\n\n        " + content[idx_add_card_end:]
    print("Replaced Add Task Card with direct Date & Time pickers and Camera-Only button.")

# =========================================================================
# 3. دمج الإنتاجية في الجزء العلوي المثبت أعلى المهام وحذف تبويب الإنتاجية المنفصل
# =========================================================================
# في الهيدر العلوي للمهام: إزالة زر تبويب الإنتاجية والاحتفاظ فقط بـ [ المهام ] و [ التقويم ]
content = re.sub(
    r'<button type="button" id="btnTaskTabStats"[^>]*>.*?</button>',
    '',
    content,
    flags=re.DOTALL
)
print("Removed standalone Productivity Tab button from tasks header.")

# إضافة كارت الإنتاجية المدمج المثبت أعلى شاشة المهام مباشرة
productivity_pinned_strip_html = '''        <!-- ========================================================
             كارت الإنتاجية والإنجاز المدمج المثبت أعلى المهام مباشرة
             ======================================================== -->
        <div class="tasks-productivity-pinned-strip" id="tasksProductivityPinnedCard" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.96)); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.82rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-award" style="color: #fbbf24; font-size: 0.95rem;"></i>
              <span>معدل الإنتاجية والإنجاز:</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="pinnedTasksProgressPct" style="font-size: 0.85rem; font-weight: 950; color: #34d399; font-family: monospace; direction: ltr;">0%</span>
              <span id="pinnedTasksLevelBadge" style="font-size: 0.65rem; font-weight: 850; background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); padding: 1px 7px; border-radius: 6px;">نشط</span>
            </div>
          </div>

          <!-- شريط الإنجاز المتدرج -->
          <div style="width: 100%; height: 7px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
            <div id="pinnedTasksProgressBar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #a855f7, #10b981); border-radius: 4px; transition: width 0.4s ease;"></div>
          </div>

          <!-- مؤشرات سريعة الأربعة -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding-top: 2px;">
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 4px 2px; text-align: center;">
              <div style="font-size: 0.60rem; color: #94a3b8; font-weight: 750;">المهام</div>
              <div id="pinnedTasksKpiTotal" style="font-size: 0.88rem; font-weight: 900; color: #38bdf8; margin-top: 1px;">0</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 4px 2px; text-align: center;">
              <div style="font-size: 0.60rem; color: #94a3b8; font-weight: 750;">متبقية</div>
              <div id="pinnedTasksKpiPending" style="font-size: 0.88rem; font-weight: 900; color: #fbbf24; margin-top: 1px;">0</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 4px 2px; text-align: center;">
              <div style="font-size: 0.60rem; color: #94a3b8; font-weight: 750;">منجزة</div>
              <div id="pinnedTasksKpiDone" style="font-size: 0.88rem; font-weight: 900; color: #34d399; margin-top: 1px;">0</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 4px 2px; text-align: center;">
              <div style="font-size: 0.60rem; color: #94a3b8; font-weight: 750;">متأخرة</div>
              <div id="pinnedTasksKpiOverdue" style="font-size: 0.88rem; font-weight: 900; color: #f87171; margin-top: 1px;">0</div>
            </div>
          </div>
        </div>
'''

idx_tasks_list_start = content.find('id="tasksTabListView"')
if idx_tasks_list_start != -1:
    idx_open_angle = content.find('>', idx_tasks_list_start) + 1
    content = content[:idx_open_angle] + "\n\n" + productivity_pinned_strip_html + "\n" + content[idx_open_angle:]
    print("Inserted permanently pinned Productivity card at the very top of tasks.")

# =========================================================================
# 4. محرك التقويم الشهري التفاعلي الكامل لشاشة المهام (Full Tasks Calendar Engine)
# =========================================================================
calendar_engine_js = '''
    // =========================================================================
    // محرك التقويم الشهري التفاعلي للمهام (Full Tasks Calendar Engine)
    // =========================================================================
    let tasksCalendarCurrentDate = new Date();
    let tasksCalendarSelectedDate = getLocalDateStr(new Date());

    function renderTasksCalendar() {
      const titleEl = document.getElementById('calendarMonthTitle');
      const gridEl = document.getElementById('calendarGridContainer');
      const dayTasksList = document.getElementById('calendarSelectedDayTasksList');
      const dayTasksTitle = document.getElementById('calendarSelectedDayTitle');

      if (!gridEl) return;

      const year = tasksCalendarCurrentDate.getFullYear();
      const month = tasksCalendarCurrentDate.getMonth();

      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      if (titleEl) titleEl.textContent = `${monthNames[month]} ${year}`;

      const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // ترتيب الأيام في العالم العربي يبدأ من السبت
      // Sunday is 0, Monday is 1, ... Saturday is 6
      // Arabic week: Saturday (0), Sunday (1), Monday (2), Tuesday (3), Wednesday (4), Thursday (5), Friday (6)
      const startOffset = (firstDayOfMonth + 1) % 7;

      const allTasks = state.tasks || [];
      const tasksByDate = {};
      allTasks.forEach(t => {
        if (!t.deleted && t.dueDate) {
          const dStr = t.dueDate.slice(0, 10);
          if (!tasksByDate[dStr]) tasksByDate[dStr] = [];
          tasksByDate[dStr].push(t);
        }
      });

      const todayStr = getLocalDateStr(new Date());

      let html = '';

      // خلايا فارغة قبل بداية الشهر
      for (let i = 0; i < startOffset; i++) {
        html += `<div style="height: 52px; background: rgba(15, 23, 42, 0.3); border-radius: 8px; opacity: 0.3;"></div>`;
      }

      // خلايا أيام الشهر
      for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = (dStr === todayStr);
        const isSelected = (dStr === tasksCalendarSelectedDate);
        const dayTasks = tasksByDate[dStr] || [];
        const taskCount = dayTasks.length;
        const pendingCount = dayTasks.filter(t => !t.completed).length;

        let dotColor = 'transparent';
        if (taskCount > 0) {
          dotColor = pendingCount > 0 ? '#fbbf24' : '#34d399';
        }

        html += `
          <div onclick="selectTasksCalendarDay('${dStr}')" style="height: 52px; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; position: relative; transition: all 0.2s;
            background: ${isSelected ? 'rgba(168, 85, 247, 0.35)' : isToday ? 'rgba(56, 189, 248, 0.18)' : 'rgba(15, 23, 42, 0.75)'};
            border: 1.2px solid ${isSelected ? '#c084fc' : isToday ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'};
            box-shadow: ${isSelected ? '0 0 10px rgba(168, 85, 247, 0.4)' : 'none'};">
            
            <span style="font-size: 0.82rem; font-weight: ${isToday || isSelected ? '950' : '750'}; color: ${isSelected ? '#fff' : isToday ? '#38bdf8' : '#e2e8f0'}; font-family: var(--font-numbers);">${day}</span>
            
            ${taskCount > 0 ? `
              <div style="display: flex; align-items: center; gap: 2px;">
                <span style="width: 5px; height: 5px; border-radius: 50%; background: ${dotColor};"></span>
                <span style="font-size: 0.60rem; color: ${dotColor}; font-weight: 800; font-family: var(--font-numbers);">${taskCount}</span>
              </div>
            ` : '<span style="height: 5px;"></span>'}
          </div>
        `;
      }

      gridEl.innerHTML = html;

      // تحديث قائمة مهام اليوم المختار
      renderTasksCalendarSelectedDayTasks();
    }

    function selectTasksCalendarDay(dateStr) {
      tasksCalendarSelectedDate = dateStr;
      renderTasksCalendar();
    }

    function navigateTasksCalendar(delta) {
      tasksCalendarCurrentDate.setMonth(tasksCalendarCurrentDate.getMonth() + delta);
      renderTasksCalendar();
    }

    function goToTasksCalendarToday() {
      tasksCalendarCurrentDate = new Date();
      tasksCalendarSelectedDate = getLocalDateStr(new Date());
      renderTasksCalendar();
    }

    function renderTasksCalendarSelectedDayTasks() {
      const container = document.getElementById('calendarSelectedDayTasksList');
      const title = document.getElementById('calendarSelectedDayTitle');
      if (!container) return;

      const dateStr = tasksCalendarSelectedDate;
      const todayStr = getLocalDateStr(new Date());
      let dateLabel = dateStr;
      if (dateStr === todayStr) dateLabel = 'اليوم (' + dateStr + ')';

      if (title) title.textContent = `مهام يوم: ${dateLabel}`;

      const allTasks = state.tasks || [];
      const dayTasks = allTasks.filter(t => !t.deleted && t.dueDate && t.dueDate.startsWith(dateStr));

      if (dayTasks.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 20px 10px; color: #94a3b8; font-size: 0.78rem;">
            <i class="fa-regular fa-calendar-xmark" style="font-size: 1.6rem; color: #64748b; margin-bottom: 6px; display: block;"></i>
            لا توجد مهام مجدولة لهذا اليوم
          </div>
        `;
        return;
      }

      let html = '';
      dayTasks.forEach(t => {
        const isDone = !!t.completed;
        html += `
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
              <button type="button" onclick="toggleTaskComplete('${t.id}')" style="background: transparent; border: none; font-size: 1.1rem; cursor: pointer; color: ${isDone ? '#34d399' : '#94a3b8'};">
                <i class="fa-${isDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
              </button>
              <div>
                <div style="font-size: 0.82rem; font-weight: 850; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'};">${escapeHtml(t.title)}</div>
                <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px; display: flex; gap: 6px;">
                  <span>🕒 ${t.dueTime || '10:00'}</span>
                  <span>👤 ${t.member || 'البيت'}</span>
                </div>
              </div>
            </div>
            <button type="button" onclick="deleteTaskItem('${t.id}')" style="background: transparent; border: none; color: #f87171; cursor: pointer; font-size: 0.80rem;"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // =========================================================================
    // تحديث كارت الإنتاجية المثبت أعلى المهام تلقائياً مع كل عملية
    // =========================================================================
    function updatePinnedTasksProductivity() {
      const allTasks = (state.tasks || []).filter(t => !t.deleted);
      const total = allTasks.length;
      const completed = allTasks.filter(t => t.completed).length;
      const pending = total - completed;
      const todayStr = getLocalDateStr(new Date());

      const overdue = allTasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      const pctEl = document.getElementById('pinnedTasksProgressPct');
      const barEl = document.getElementById('pinnedTasksProgressBar');
      const badgeEl = document.getElementById('pinnedTasksLevelBadge');

      const kpiTotal = document.getElementById('pinnedTasksKpiTotal');
      const kpiPending = document.getElementById('pinnedTasksKpiPending');
      const kpiDone = document.getElementById('pinnedTasksKpiDone');
      const kpiOverdue = document.getElementById('pinnedTasksKpiOverdue');

      if (pctEl) pctEl.textContent = `${pct}%`;
      if (barEl) barEl.style.width = `${pct}%`;

      if (badgeEl) {
        if (pct === 100 && total > 0) badgeEl.textContent = 'أداء أسطوري! 🏆';
        else if (pct >= 70) badgeEl.textContent = 'ممتاز جداً 🌟';
        else if (pct >= 40) badgeEl.textContent = 'تقدم رائع 🚀';
        else badgeEl.textContent = 'جاهز للتحدي! 🎯';
      }

      if (kpiTotal) kpiTotal.textContent = total;
      if (kpiPending) kpiPending.textContent = pending;
      if (kpiDone) kpiDone.textContent = completed;
      if (kpiOverdue) kpiOverdue.textContent = overdue;
    }

    // =========================================================================
    // معالجة تصوير المرفق بالكاميرا فقط (Camera Only Attachment)
    // =========================================================================
    function triggerTaskCameraOnly() {
      let fileInp = document.getElementById('primaryTaskCameraOnlyInput');
      if (!fileInp) {
        fileInp = document.createElement('input');
        fileInp.type = 'file';
        fileInp.id = 'primaryTaskCameraOnlyInput';
        fileInp.accept = 'image/*';
        fileInp.capture = 'environment';
        fileInp.style.display = 'none';
        fileInp.onchange = function(e) {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function(evt) {
            window._pendingQuickTaskPhotoData = evt.target.result;
            const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
            const previewImg = document.getElementById('quickTaskPhotoPreviewImg');
            if (previewImg) previewImg.src = evt.target.result;
            if (previewBar) previewBar.style.display = 'flex';
            showToast('📸 تم التقاط صورة المهمة بنجاح');
          };
          reader.readAsDataURL(file);
        };
        document.body.appendChild(fileInp);
      }
      fileInp.click();
    }

    function removeQuickTaskPhoto() {
      window._pendingQuickTaskPhotoData = null;
      const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
      if (previewBar) previewBar.style.display = 'none';
    }

    // =========================================================================
    // تعزيز فتح وإغلاق مركز الضبط الموحد بأمان مطلق (Guaranteed Settings Modal)
    // =========================================================================
    function openSettingsModal(targetSection = '') {
      try {
        if (typeof updateSettingsModalDisplay === 'function') updateSettingsModalDisplay();
      } catch(e) {
        console.warn('Notice in updateSettingsModalDisplay:', e);
      }

      const modal = document.getElementById('settingsModal');
      if (modal) {
        modal.classList.add('open');
        modal.classList.add('active');
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.setProperty('z-index', '1000050', 'important');
        modal.style.setProperty('visibility', 'visible', 'important');
        modal.style.setProperty('opacity', '1', 'important');
        if (typeof pushModalState === 'function') pushModalState('settingsModal');
      }

      if (targetSection === 'users') {
        setTimeout(() => {
          const sec = document.getElementById('settingsSec_users');
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }

    function closeSettingsModal() {
      const modal = document.getElementById('settingsModal');
      if (modal) {
        modal.classList.remove('open');
        modal.classList.remove('active');
        modal.style.setProperty('display', 'none', 'important');
      }
    }
'''

# إضافة calendar_engine_js إلى نهاية السكريبت الرئيسي
idx_script_end = content.rfind('</script>')
content = content[:idx_script_end] + "\n" + calendar_engine_js + "\n" + content[idx_script_end:]
print("Injected Tasks Calendar Engine, Productivity Auto-updater, and Camera-Only Attachment handler.")

# استدعاء updatePinnedTasksProductivity عند renderTasksProList وعند تهيئة الصفحة
content = content.replace(
    'function renderTasksProList() {',
    'function renderTasksProList() {\n      if (typeof updatePinnedTasksProductivity === \'function\') updatePinnedTasksProductivity();',
    1
)

# تحديث switchTasksViewMode ليستدعي renderTasksCalendar بشكل سليم
content = content.replace(
    "else if (mode === 'calendar') renderTasksCalendar();",
    "else if (mode === 'calendar') renderTasksCalendar();\n      else if (mode === 'stats') { switchTasksViewMode('list'); }",
    1
)

# تحديث handleQuickTaskAdd لتقرأ الصورة الملتقطة بالكاميرا إن وجدت
content = content.replace(
    'let newDueDate = inlineTaskDateVal || getLocalDateStr(new Date());',
    """const dateInpVal = document.getElementById('quickTaskInlineDate')?.value;
      const timeInpVal = document.getElementById('quickTaskInlineTime')?.value;
      let newDueDate = dateInpVal || getLocalDateStr(new Date());
      let newDueTime = timeInpVal || '10:00';
      const capturedPhoto = window._pendingQuickTaskPhotoData || null;""",
    1
)
content = content.replace(
    'photo: null,',
    'photo: capturedPhoto,',
    1
)

# تعزيز switchExpectedTopSection لفتح الميزانيات بسلاسة تامة وتجهيز الخطة
content = content.replace(
    "if (typeof renderMonthlyBudgetPlan === 'function') renderMonthlyBudgetPlan();",
    """if (!state.monthlyBudgets || state.monthlyBudgets.length === 0) {
          state.monthlyBudgets = [{
            id: 'plan_default_nov2026',
            name: 'ميزانية نوفمبر 2026 التقديرية',
            month: '2026-11',
            targetIncome: 80000,
            active: true,
            items: [
              { id: 'bi_1', category: 'food', title: 'طعام ومشتريات', amount: 15000, members: ['البيت'] },
              { id: 'bi_2', category: 'bills', title: 'فواتير واشتراكات', amount: 6500, members: ['البيت'] },
              { id: 'bi_3', category: 'health', title: 'صحة وعلاج', amount: 4000, members: ['البيت'] },
              { id: 'bi_4', category: 'education', title: 'تعليم ومدارس', amount: 10000, members: ['محمد', 'مريم'] },
              { id: 'bi_5', category: 'transport', title: 'مواصلات وبنزين', amount: 5000, members: ['ماهر'] }
            ]
          }];
        }
        if (typeof renderMonthlyBudgetPlan === 'function') renderMonthlyBudgetPlan();""",
    1
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: index.html fully updated with all requirements.")
