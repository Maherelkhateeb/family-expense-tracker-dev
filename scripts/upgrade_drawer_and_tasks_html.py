import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import re

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

print("Original length:", len(html))

# =========================================================================
# 1. OVERHAUL SUMMARY LEFT DRAWER (MEMBER FINANCIAL SUMMARY)
# =========================================================================
# Find summaryLeftDrawer div and replace its content
# From <div class="summary-left-drawer" id="summaryLeftDrawer" ...> to </div>
drawer_pattern = re.compile(
    r'<div class="summary-left-drawer" id="summaryLeftDrawer".*?</div>\s*<!--\s*=========================================================================\s*2\.\s*نافذة مهام',
    re.DOTALL
)

new_left_drawer_html = """  <!-- الدرج الجانبي الأيسر: ملخص المصروفات بالفرد (Member Financial Breakdown) -->
  <div class="summary-left-drawer" id="summaryLeftDrawer" style="display: flex; flex-direction: column; overflow: hidden;" dir="rtl">
    <!-- ترويسة الدرج الأيسر: ملخص المصروفات بالفرد -->
    <div style="padding: 12px 14px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); background: linear-gradient(135deg, #0f172a, #1e293b); flex-shrink: 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #0284c7, #0369a1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.05rem; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);">
            <i class="fa-solid fa-user-chart"></i>
          </div>
          <div>
            <div style="font-size: 0.95rem; font-weight: 900; color: #f8fafc;">ملخص المصروفات بالفرد</div>
            <div style="font-size: 0.65rem; color: #38bdf8; font-weight: 700;">تحليل دقيق لنفقات وبنود كل فرد من الأسرة</div>
          </div>
        </div>
        <button type="button" onclick="closeSummaryLeftDrawer()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 50%; width: 28px; height: 28px; line-height: 26px; text-align: center; color: #94a3b8; font-size: 1.15rem; cursor: pointer;">&times;</button>
      </div>

      <!-- شريط كبسولات اختيار أفراد العائلة في الدرج -->
      <div id="drawerMemberSelectorStrip" style="display: flex; gap: 5px; overflow-x: auto; padding: 4px 0 6px; -webkit-overflow-scrolling: touch;" class="custom-scrollbar">
        <!-- تتولد ديناميكياً بواسطة renderMemberSelectorStrip() -->
      </div>

      <!-- أدوات الفلاتر الزمنية للملخص -->
      <div id="drawerSummaryFilterBar" style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
        <!-- تبويبات الفترات: اليوم / الأسبوع / الشهر / السنة / مخصص -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px;">
          <button type="button" class="exp-tab-btn active" id="btnSummaryTabDay" onclick="switchSummaryPeriod('day')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: none; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; cursor: pointer; text-align: center;">اليوم</button>
          <button type="button" class="exp-tab-btn" id="btnSummaryTabWeek" onclick="switchSummaryPeriod('week')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; text-align: center;">الأسبوع</button>
          <button type="button" class="exp-tab-btn" id="btnSummaryTabMonth" onclick="switchSummaryPeriod('month')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; text-align: center;">الشهر</button>
          <button type="button" class="exp-tab-btn" id="btnSummaryTabYear" onclick="switchSummaryPeriod('year')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; text-align: center;">السنة</button>
          <button type="button" class="exp-tab-btn" id="btnSummaryTabCustom" onclick="switchSummaryPeriod('custom')" style="padding: 6px 2px; border-radius: 8px; font-weight: 800; font-size: 0.70rem; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8; cursor: pointer; text-align: center;">مخصص</button>
        </div>

        <!-- سطر اختيار التاريخ المخصص (يظهر عند اختيار مخصص) -->
        <div id="drawerSummaryCustomDateRow" style="display: none; grid-template-columns: 1fr 1fr auto; gap: 6px; align-items: center; background: rgba(15, 23, 42, 0.8); padding: 6px; border-radius: 8px; border: 1px dashed rgba(56, 189, 248, 0.4);">
          <input type="date" id="summaryCustomDateFrom" class="form-input-custom" style="height: 30px; font-size: 0.70rem; padding: 0 4px;" onchange="applyCustomSummaryDate()">
          <input type="date" id="summaryCustomDateTo" class="form-input-custom" style="height: 30px; font-size: 0.70rem; padding: 0 4px;" onchange="applyCustomSummaryDate()">
          <button type="button" onclick="applyCustomSummaryDate()" style="padding: 0 8px; height: 30px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: #0284c7; color: #fff; border: none; cursor: pointer;">تطبيق</button>
        </div>

        <!-- شريط تحويل العملات وتقويم الأسعار -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; background: rgba(15, 23, 42, 0.7); padding: 4px 6px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.25);">
          <span style="font-size: 0.64rem; font-weight: 800; color: #fbbf24;"><i class="fa-solid fa-coins"></i> العملة:</span>
          <div style="display: flex; gap: 4px;">
            <button type="button" class="btn-summary-curr-pill active" id="btnSummaryCurrEGP" onclick="setSummaryCurrency('EGP')" style="padding: 2px 7px; border-radius: 6px; font-size: 0.64rem; font-weight: 900; cursor: pointer; border: 1px solid rgba(56, 189, 248, 0.5); background: rgba(56, 189, 248, 0.2); color: #38bdf8;">ج.م</button>
            <button type="button" class="btn-summary-curr-pill" id="btnSummaryCurrSAR" onclick="setSummaryCurrency('SAR')" style="padding: 2px 7px; border-radius: 6px; font-size: 0.64rem; font-weight: 900; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8;">ر.س</button>
            <button type="button" class="btn-summary-curr-pill" id="btnSummaryCurrUSD" onclick="setSummaryCurrency('USD')" style="padding: 2px 7px; border-radius: 6px; font-size: 0.64rem; font-weight: 900; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8;">$ USD</button>
            <button type="button" class="btn-summary-curr-pill" id="btnSummaryCurrGOLD" onclick="setSummaryCurrency('GOLD21')" style="padding: 2px 7px; border-radius: 6px; font-size: 0.64rem; font-weight: 900; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8;">🪙 ذهب 21</button>
          </div>
        </div>
      </div>
    </div>

    <!-- المحتوى التفاعلي للملخص بالفرد -->
    <div id="summaryDrawerContent" style="padding: 12px 14px 40px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px;" class="custom-scrollbar">
      <!-- يتولد ديناميكياً بواسطة renderSummaryDrawer() -->
    </div>
  </div>

  <!-- =========================================================================
       2. نافذة مهام"""

if drawer_pattern.search(html):
    html = drawer_pattern.sub(new_left_drawer_html, html)
    print("[OK] Overhauled summaryLeftDrawer successfully")
else:
    print("[ERROR] Could not find summaryLeftDrawer pattern in HTML")

# =========================================================================
# 2. UPGRADE TASKS FULL SCREEN MODAL (TODOIST + TICKTICK + MS TO-DO + THINGS 3)
# =========================================================================
tasks_full_pattern = re.compile(
    r'<div id="tasksFullScreenModal".*?</main>\s*</div>',
    re.DOTALL
)

new_tasks_modal_html = """<div id="tasksFullScreenModal" style="display: none; position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 100050; background: var(--bg-main, #0b1329); overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 0; margin: 0; box-sizing: border-box; direction: rtl;" dir="rtl">
    
    <!-- شريط علوي ذكي وثابت للشاشة الكاملة -->
    <header style="position: sticky; top: 0; z-index: 100; background: rgba(11, 19, 41, 0.95); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1.2px solid rgba(168, 85, 247, 0.35); padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      <div style="display: flex; align-items: center; gap: 10px;">
        <button type="button" onclick="closeTasksFullScreenModal()" style="height: 38px; padding: 0 14px; border-radius: 10px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); color: #cbd5e1; font-size: 0.82rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s ease;">
          <i class="fa-solid fa-arrow-right"></i>
          <span>الرئيسية</span>
        </button>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, #a855f7, #6366f1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.15rem; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35);">
            <i class="fa-solid fa-list-check"></i>
          </div>
          <div>
            <div style="font-size: 1.02rem; font-weight: 900; color: #f8fafc;">قائمة المهام والمسؤوليات الذكية</div>
            <div style="font-size: 0.68rem; color: #c084fc; font-weight: 700;">مهام عيلة ماهر ❤️ أية ومتابعة الإنجاز والمسؤوليات</div>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" onclick="openNewTaskDrawerModal()" style="height: 38px; padding: 0 16px; border-radius: 11px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.82rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 7px; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.45);">
          <i class="fa-solid fa-circle-plus" style="font-size: 1.05rem;"></i>
          <span>+ مهمة تفصيلية</span>
        </button>
      </div>
    </header>

    <!-- المحتوى الرئيسي للمهام -->
    <main style="max-width: 920px; margin: 0 auto; padding: 14px 14px 80px; display: flex; flex-direction: column; gap: 14px;">
      
      <!-- شريط مؤشرات الإنجاز الذكي والإنتاجية (KPIs & Progress Ring/Bar) -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('all')" style="cursor: pointer; background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(56, 189, 248, 0.35); border-radius: 12px; padding: 10px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" title="عرض كافة المهام">
          <span class="task-kpi-num" id="kpiTasksTotalFull" style="color: #38bdf8; font-size: 1.30rem; font-weight: 900; display: block; font-family: var(--font-numbers);">0</span>
          <span class="task-kpi-label" style="font-size: 0.70rem; color: #94a3b8; font-weight: 800;">إجمالي المهام</span>
        </div>
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('my_day')" style="cursor: pointer; background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(192, 132, 252, 0.35); border-radius: 12px; padding: 10px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" title="عرض مهام اليوم">
          <span class="task-kpi-num" id="kpiTasksActiveFull" style="color: #c084fc; font-size: 1.30rem; font-weight: 900; display: block; font-family: var(--font-numbers);">0</span>
          <span class="task-kpi-label" style="font-size: 0.70rem; color: #94a3b8; font-weight: 800;">قيد التنفيذ</span>
        </div>
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('overdue')" style="cursor: pointer; background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(239, 68, 68, 0.35); border-radius: 12px; padding: 10px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" title="عرض المهام المتأخرة">
          <span class="task-kpi-num" id="kpiTasksOverdueFull" style="color: #ef4444; font-size: 1.30rem; font-weight: 900; display: block; font-family: var(--font-numbers);">0</span>
          <span class="task-kpi-label" style="font-size: 0.70rem; color: #94a3b8; font-weight: 800;">متأخرة ⚠️</span>
        </div>
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('completed')" style="cursor: pointer; background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(52, 211, 153, 0.35); border-radius: 12px; padding: 10px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" title="عرض المهام المكتملة">
          <span class="task-kpi-num" id="kpiTasksDoneFull" style="color: #34d399; font-size: 1.30rem; font-weight: 900; display: block; font-family: var(--font-numbers);">0</span>
          <span class="task-kpi-label" style="font-size: 0.70rem; color: #94a3b8; font-weight: 800;">مكتملة ✅</span>
        </div>
      </div>

      <!-- شريط نسبة الإنجاز والإنتاجية (Things 3 / Todoist Style) -->
      <div style="background: rgba(15, 23, 42, 0.85); border-radius: 12px; padding: 10px 14px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-chart-line" style="color: #a855f7; font-size: 0.95rem;"></i>
          <span style="font-size: 0.76rem; font-weight: 800; color: #cbd5e1;">معدل إنجاز المهام:</span>
        </div>
        <div style="flex: 1; max-width: 320px; height: 8px; background: rgba(30, 41, 59, 0.9); border-radius: 5px; overflow: hidden;">
          <div id="tasksOverallProgressBarFull" style="width: 0%; height: 100%; background: linear-gradient(90deg, #a855f7, #10b981); transition: width 0.4s ease;"></div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span id="tasksOverallProgressPctFull" style="font-size: 0.85rem; font-weight: 900; color: #10b981; font-family: var(--font-numbers);">0%</span>
          <span id="tasksProductivityBadge" style="font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">جاهز للإنجاز</span>
        </div>
      </div>

      <!-- شريط الإضافة السريعة الذكية (Todoist Quick Add Bar) -->
      <div class="tasks-quick-add-bar" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.5px solid rgba(168, 85, 247, 0.45); border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="text" id="quickTaskTitleInput" placeholder="+ اكتب مهمة جديدة سريعة واضغط Enter للإضافة الفورية..." style="flex: 1; height: 40px; border-radius: 10px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.14); color: #fff; font-size: 0.84rem; font-weight: 800; padding: 0 12px; outline: none; box-sizing: border-box;" onkeydown="if(event.key==='Enter') handleQuickTaskAdd()">
          <button type="button" onclick="handleQuickTaskAdd()" style="height: 40px; padding: 0 18px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.82rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 10px rgba(168, 85, 247, 0.4);">
            <i class="fa-solid fa-plus"></i>
            <span>إضافة</span>
          </button>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
          <!-- اختصارات الموعد السريعة (TickTick / Any.do) -->
          <div style="display: flex; gap: 4px; align-items: center;" id="quickTaskPresetChips">
            <button type="button" class="btn-quick-date-chip active" id="chipQuickToday" onclick="setQuickTaskPreset('today')" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); cursor: pointer;">☀️ اليوم</button>
            <button type="button" class="btn-quick-date-chip" id="chipQuickTomorrow" onclick="setQuickTaskPreset('tomorrow')" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">🌅 غداً</button>
            <button type="button" class="btn-quick-date-chip" id="chipQuickWeekend" onclick="setQuickTaskPreset('weekend')" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">🏖️ الجمعة</button>
            <button type="button" class="btn-quick-date-chip" id="chipQuickNone" onclick="setQuickTaskPreset('none')" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">بدون موعد</button>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <select id="quickTaskMemberSelect" style="height: 30px; border-radius: 7px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.14); color: #cbd5e1; font-size: 0.72rem; font-weight: 800; padding: 0 6px;">
              <option value="البيت">🏠 البيت</option>
              <option value="ماهر">👨 ماهر</option>
              <option value="أية">👩 أية</option>
              <option value="محمد">👦 محمد</option>
              <option value="مريم">👧 مريم</option>
              <option value="الحاجة">🧕 الحاجة</option>
            </select>
            <select id="quickTaskPrioritySelect" style="height: 30px; border-radius: 7px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.14); color: #cbd5e1; font-size: 0.72rem; font-weight: 800; padding: 0 6px;">
              <option value="normal">⚪ عادية P3</option>
              <option value="medium">🟡 متوسطة P2</option>
              <option value="high">🔴 عاجل P1</option>
            </select>
            <input type="number" id="quickTaskEstAmount" placeholder="مبلغ تقديري ج.م..." style="width: 100px; height: 30px; border-radius: 7px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.14); color: #fbbf24; font-size: 0.72rem; font-weight: 800; padding: 0 6px; text-align: center;">
          </div>
        </div>
      </div>

      <!-- تبويبات الأقسام الذكية والقوائم المخصصة (Microsoft To Do & Apple Reminders Smart Lists) -->
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px;" id="tasksSmartListTabs">
        <button type="button" class="exp-tab-btn active" id="btnFullTodoMyDay" onclick="switchDrawerTodoSection('my_day')" style="padding: 9px 2px; border-radius: 10px; font-weight: 800; font-size: 0.74rem; background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1.2px solid rgba(168, 85, 247, 0.45); cursor: pointer; text-align: center;">☀️ يومي</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoImportant" onclick="switchDrawerTodoSection('important')" style="padding: 9px 2px; border-radius: 10px; font-weight: 800; font-size: 0.74rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">⭐ الهامة</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoPlanned" onclick="switchDrawerTodoSection('planned')" style="padding: 9px 2px; border-radius: 10px; font-weight: 800; font-size: 0.74rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">📅 المجدولة</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoShopping" onclick="switchDrawerTodoSection('shopping')" style="padding: 9px 2px; border-radius: 10px; font-weight: 800; font-size: 0.74rem; background: transparent; color: #10b981; border: 1px solid rgba(16,185,129,0.25); cursor: pointer; text-align: center;">🛒 مشتريات</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoOverdue" onclick="switchDrawerTodoSection('overdue')" style="padding: 9px 2px; border-radius: 10px; font-weight: 800; font-size: 0.74rem; background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.25); cursor: pointer; text-align: center;">⚠️ متأخرة</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoCompleted" onclick="switchDrawerTodoSection('completed')" style="padding: 9px 2px; border-radius: 10px; font-weight: 800; font-size: 0.74rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">✅ المكتملة</button>
      </div>

      <!-- فلترة حسب أفراد العائلة وشريط البحث اللحظي -->
      <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
        <!-- كبسولات الأفراد -->
        <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0;" id="tasksMemberFilterPills">
          <button type="button" class="btn-task-member-pill active" onclick="setTasksMemberFilter('all', this)" style="padding: 4px 10px; border-radius: 8px; font-size: 0.70rem; font-weight: 850; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); cursor: pointer;">👥 الكل</button>
          <button type="button" class="btn-task-member-pill" onclick="setTasksMemberFilter('ماهر', this)" style="padding: 4px 10px; border-radius: 8px; font-size: 0.70rem; font-weight: 850; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">👨 ماهر</button>
          <button type="button" class="btn-task-member-pill" onclick="setTasksMemberFilter('أية', this)" style="padding: 4px 10px; border-radius: 8px; font-size: 0.70rem; font-weight: 850; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">👩 أية</button>
          <button type="button" class="btn-task-member-pill" onclick="setTasksMemberFilter('محمد', this)" style="padding: 4px 10px; border-radius: 8px; font-size: 0.70rem; font-weight: 850; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">👦 محمد</button>
          <button type="button" class="btn-task-member-pill" onclick="setTasksMemberFilter('مريم', this)" style="padding: 4px 10px; border-radius: 8px; font-size: 0.70rem; font-weight: 850; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">👧 مريم</button>
          <button type="button" class="btn-task-member-pill" onclick="setTasksMemberFilter('البيت', this)" style="padding: 4px 10px; border-radius: 8px; font-size: 0.70rem; font-weight: 850; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">🏠 البيت</button>
        </div>

        <!-- حقل البحث السريع في المهام -->
        <div style="flex: 1; min-width: 180px; position: relative;">
          <input type="text" id="tasksSearchInput" placeholder="🔍 بحث في نصوص المهام والخطوات..." style="width: 100%; height: 32px; border-radius: 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.12); color: #fff; font-size: 0.74rem; font-weight: 700; padding: 0 10px; outline: none; box-sizing: border-box;" oninput="renderTasksProList()">
        </div>
      </div>

      <!-- حاوية قائمة كروت المهام التفاعلية -->
      <div id="tasksFullScreenContainerList" style="display: flex; flex-direction: column; gap: 10px;">
        <!-- تتولد ديناميكياً بواسطة renderTasksProList() -->
      </div>
    </main>
  </div>"""

if tasks_full_pattern.search(html):
    html = tasks_full_pattern.sub(new_tasks_modal_html, html)
    print("[OK] Upgraded tasksFullScreenModal layout")
else:
    print("[ERROR] Could not find tasksFullScreenModal pattern in HTML")

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML structures upgraded. New length:", len(html))
