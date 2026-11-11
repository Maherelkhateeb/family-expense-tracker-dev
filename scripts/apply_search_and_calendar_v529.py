import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Header: remove btnHeaderAddTaskTop and add btnGlobalSearch
header_old_regex = r'(<div class="header-brand-row"[^>]*>[\s\S]*?)(<button type="button" class="header-tasks-main-btn" id="btnHeaderAddTaskTop"[\s\S]*?</button>\s*</div>\s*<div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">)'

# Let's inspect exact string in header to be 100% safe
target_header = """      <!-- السطر 1: أزرار المهام وإضافة مهمة (يمين) + أزرار التنبيهات والمزامنة والضبط (يسار) بدون أي تداخل -->
      <div class="header-brand-row" style="display: flex; justify-content: space-between; align-items: center; gap: 6px; width: 100%; box-sizing: border-box; flex-wrap: nowrap;">
        <!-- كتلة أزرار المهام (المهام + إضافة مهمة بجانبها مباشرة) -->
        <div class="brand-box" style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
          <!-- زر المهام الرئيسي -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="عرض قائمة المهام" style="height: 32px; padding: 0 8px; border-radius: 9px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.74rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.25); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.82rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.60rem; padding: 1px 5px; border-radius: 8px; font-weight: 900;">0</span>
          </button>
          
          <!-- الزر الجديد: إضافة مهمة بجانب زر المهام مباشرة -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderAddTaskTop" onclick="openTasksAndAddNewTask()" title="إضافة مهمة جديدة فوراً" style="height: 32px; padding: 0 9px; border-radius: 9px; background: linear-gradient(135deg, #10b981, #059669); border: 1.2px solid rgba(16, 185, 129, 0.6); color: #ffffff; font-size: 0.74rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-plus" style="font-size: 0.74rem;"></i>
            <span>إضافة مهمة</span>
          </button>
        </div>

        <!-- أزرار الإجراءات السريعة (تنبيهات + مزامنة + ضبط) بدون أي تداخل أو انضغاط -->
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">"""

replacement_header = """      <!-- السطر 1: شريط البراند والمهام (يمين) + عدسة البحث والتنبيهات والمزامنة والضبط (يسار) بتناسق فائق -->
      <div class="header-brand-row" style="display: flex; justify-content: space-between; align-items: center; gap: 6px; width: 100%; box-sizing: border-box; flex-wrap: nowrap;">
        <!-- كتلة اليمين (زر المهام الرئيسي) -->
        <div class="brand-box" style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
          <!-- زر المهام الرئيسي -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="عرض وإدارة المهام والمخطط اليومي" style="height: 32px; padding: 0 9px; border-radius: 9px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.74rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.25); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.82rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.60rem; padding: 1px 5px; border-radius: 8px; font-weight: 900;">0</span>
          </button>
        </div>

        <!-- أزرار الإجراءات السريعة (عدسة البحث + تنبيهات + مزامنة + ضبط) بتناسق تام -->
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <!-- استعادة عدسة البحث الشامل -->
          <button class="header-settings-btn" id="btnGlobalSearch" onclick="openGlobalSearchModal()" title="البحث الشامل في البرنامج" style="background: rgba(56, 189, 248, 0.16); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #38bdf8; height: 32px; padding: 0 8px; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 850; transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-magnifying-glass" style="font-size: 0.76rem;"></i>
            <span>بحث</span>
          </button>"""

if target_header in content:
    content = content.replace(target_header, replacement_header, 1)
    print("Header successfully updated!")
else:
    print("WARNING: target_header not found exactly!")

# 2. Update HTML of tasksTabCalendarView
target_cal_html = """      <!-- ==========================================================
           2. التبويب الثاني: عرض التقويم والمخطط الشهري (tasksTabCalendarView)
           ========================================================== -->
      <div id="tasksTabCalendarView" style="display: none; flex-direction: column; gap: 10px;">
        <!-- بطاقة التقويم الشهري التفاعلي -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 14px; padding: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <!-- شريط تصفح الشهر -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" onclick="navigateTasksCalendar(-1)" style="width: 30px; height: 30px; border-radius: 7px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-chevron-right"></i></button>
              <span id="calendarMonthTitle" style="font-size: 0.92rem; font-weight: 900; color: #f8fafc;">نوفمبر 2026</span>
              <button type="button" onclick="navigateTasksCalendar(1)" style="width: 30px; height: 30px; border-radius: 7px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-chevron-left"></i></button>
            </div>
            <button type="button" onclick="goToTasksCalendarToday()" style="padding: 4px 10px; border-radius: 7px; font-size: 0.70rem; font-weight: 800; background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); cursor: pointer;">
              <i class="fa-solid fa-calendar-day"></i> اليوم
            </button>
          </div>

          <!-- شبكة أيام الأسبوع -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 3px; margin-bottom: 6px; font-size: 0.68rem; font-weight: 800; color: #94a3b8;">
            <div>سبت</div><div>أحد</div><div>إثنين</div><div>ثلاثاء</div><div>أربعاء</div><div>خميس</div><div>جمعة</div>
          </div>

          <!-- شبكة أيام الشهر مع مؤشرات المهام النقطية الملونة -->
          <div id="tasksCalendarGrid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
            <!-- تتولد خلايا الأيام ديناميكياً مع النقاط الملونة للمهام -->
          </div>
        </div>

        <!-- قائمة مهام اليوم المختار من التقويم -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
            <div style="font-size: 0.82rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-calendar-check"></i> <span id="calendarSelectedDayTitle">مهام اليوم المختار</span>
            </div>
            <span id="calendarSelectedDayCountBadge" style="font-size: 0.64rem; background: rgba(56, 189, 248, 0.18); color: #38bdf8; padding: 2px 7px; border-radius: 6px; font-weight: 800;">0 مهام</span>
          </div>
          <div id="tasksCalendarDayList" style="display: flex; flex-direction: column; gap: 6px;">
            <!-- قائمة مهام اليوم المحدد -->
          </div>
        </div>
      </div>"""

replacement_cal_html = """      <!-- ==========================================================
           2. التبويب الثاني: عرض التقويم والمخطط الشهري (tasksTabCalendarView)
           ========================================================== -->
      <div id="tasksTabCalendarView" style="display: none; flex-direction: column; gap: 12px;">
        <!-- بطاقة التقويم الشهري التفاعلي -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 16px; padding: 14px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);">
          <!-- شريط تصفح الشهر -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <button type="button" onclick="navigateTasksCalendar(-1)" title="الشهر السابق" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"><i class="fa-solid fa-chevron-right"></i></button>
              <span id="calendarMonthTitle" style="font-size: 0.96rem; font-weight: 900; color: #f8fafc; min-width: 110px; text-align: center;">نوفمبر 2026</span>
              <button type="button" onclick="navigateTasksCalendar(1)" title="الشهر التالي" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"><i class="fa-solid fa-chevron-left"></i></button>
            </div>
            <button type="button" onclick="goToTasksCalendarToday()" style="padding: 5px 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 850; background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.45); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s;">
              <i class="fa-solid fa-calendar-day"></i>
              <span>اليوم</span>
            </button>
          </div>

          <!-- شبكة أيام الأسبوع -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 4px; margin-bottom: 8px; font-size: 0.70rem; font-weight: 850; color: #94a3b8;">
            <div>سبت</div><div>أحد</div><div>إثنين</div><div>ثلاثاء</div><div>أربعاء</div><div>خميس</div><div>جمعة</div>
          </div>

          <!-- شبكة أيام الشهر مع مؤشرات المهام النقطية الملونة -->
          <div id="tasksCalendarGrid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
            <!-- تتولد خلايا الأيام ديناميكياً مع النقاط الملونة للمهام -->
          </div>
        </div>

        <!-- قائمة مهام اليوم المختار من التقويم -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.90), rgba(15, 23, 42, 0.95)); border: 1.2px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 0.86rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-calendar-check" style="color: #a855f7;"></i>
              <span id="calendarSelectedDayTitle">مهام اليوم المختار</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span id="calendarSelectedDayCountBadge" style="font-size: 0.68rem; background: rgba(56, 189, 248, 0.18); color: #38bdf8; padding: 2px 8px; border-radius: 7px; font-weight: 850; border: 1px solid rgba(56, 189, 248, 0.35);">0 مهام</span>
              <button type="button" onclick="openAddTaskForSelectedDate(window.calendarSelectedDate)" title="إضافة مهمة لهذا اليوم" style="height: 28px; padding: 0 10px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.70rem; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3); transition: all 0.2s;">
                <i class="fa-solid fa-plus"></i>
                <span>إضافة مهمة</span>
              </button>
            </div>
          </div>
          <div id="tasksCalendarDayList" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- قائمة مهام اليوم المحدد -->
          </div>
        </div>
      </div>"""

if target_cal_html in content:
    content = content.replace(target_cal_html, replacement_cal_html, 1)
    print("Calendar HTML successfully updated!")
else:
    print("WARNING: target_cal_html not found exactly!")

# 3. Update Calendar JS functions
target_cal_js = """function navigateTasksCalendar(delta) {
  window.calendarCurrentMonth += delta;
  if (window.calendarCurrentMonth > 11) {
    window.calendarCurrentMonth = 0;
    window.calendarCurrentYear += 1;
  } else if (window.calendarCurrentMonth < 0) {
    window.calendarCurrentMonth = 11;
    window.calendarCurrentYear -= 1;
  }
  renderTasksCalendar();
}

function goToTasksCalendarToday() {
  const now = new Date();
  window.calendarCurrentYear = now.getFullYear();
  window.calendarCurrentMonth = now.getMonth();
  window.calendarSelectedDate = now.toISOString().slice(0, 10);
  renderTasksCalendar();
}

function selectTasksCalendarDay(dateStr) {
  window.calendarSelectedDate = dateStr;
  const titleEl = document.getElementById('calendarSelectedDayTitle');
  const badgeEl = document.getElementById('calendarSelectedDayCountBadge');
  const container = document.getElementById('tasksCalendarDayList');
  if (!container) return;

  const tasks = getTodoTasks().filter(t => t.dueDate === dateStr);
  if (titleEl) titleEl.textContent = `مهام تاريخ: ${dateStr}`;
  if (badgeEl) badgeEl.textContent = `${tasks.length} مهام`;

  if (tasks.length === 0) {
    container.innerHTML = `
      <div style="padding: 16px; text-align: center; color: #64748b; font-size: 0.74rem;">
        <i class="fa-solid fa-calendar-plus" style="font-size: 1.5rem; opacity: 0.4; margin-bottom: 6px; display: block; color: #a855f7;"></i>
        لا توجد مهام مسجلة لهذا اليوم.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  tasks.forEach(t => {
    const item = document.createElement('div');
    item.style.cssText = `
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid ${t.completed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(168, 85, 247, 0.3)'};
      border-radius: 9px;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 6px;
    `;

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
        <button type="button" onclick="toggleTaskCompleted('${t.id}')" style="width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid ${t.completed ? '#10b981' : '#a855f7'}; background: ${t.completed ? '#10b981' : 'transparent'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; cursor: pointer; flex-shrink: 0;">
          ${t.completed ? '<i class="fa-solid fa-check"></i>' : ''}
        </button>
        <div style="min-width: 0;">
          <div style="font-size: 0.82rem; font-weight: 800; color: ${t.completed ? '#94a3b8' : '#f8fafc'}; text-decoration: ${t.completed ? 'line-through' : 'none'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(t.title)}
          </div>
          <div style="font-size: 0.65rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-top: 1px;">
            ${t.dueTime ? `<span>⏰ ${t.dueTime}</span>` : ''}
            <span>👤 ${escapeHtml(t.assignedMember || 'البيت')}</span>
            ${t.photo ? `<span style="color: #38bdf8;">📷 صورة</span>` : ''}
          </div>
        </div>
      </div>
      <button type="button" onclick="deleteTaskItem('${t.id}')" style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; color: #f87171; width: 26px; height: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.72rem;"><i class="fa-solid fa-trash-can"></i></button>
    `;
    container.appendChild(item);
  });
}

function renderTasksCalendar() {
  const grid = document.getElementById('tasksCalendarGrid');
  const titleEl = document.getElementById('calendarMonthTitle');
  if (!grid) return;

  if (titleEl) {
    titleEl.textContent = `${arabicMonths[window.calendarCurrentMonth]} ${window.calendarCurrentYear}`;
  }

  grid.innerHTML = '';
  const tasks = getTodoTasks();
  const tasksByDate = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
    tasksByDate[t.dueDate].push(t);
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const firstDayOfMonth = new Date(window.calendarCurrentYear, window.calendarCurrentMonth, 1);
  const lastDayOfMonth = new Date(window.calendarCurrentYear, window.calendarCurrentMonth + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  const startDay = (firstDayOfMonth.getDay() + 1) % 7;

  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.style.height = '42px';
    emptyCell.style.opacity = '0.15';
    grid.appendChild(emptyCell);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dStr = `${window.calendarCurrentYear}-${String(window.calendarCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasksByDate[dStr] || [];

    const cell = document.createElement('div');
    const isToday = dStr === todayStr;
    const isSelected = dStr === window.calendarSelectedDate;

    cell.style.cssText = `
      height: 44px;
      border-radius: 9px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
      border: ${isSelected ? '1.5px solid #a855f7' : (isToday ? '1.2px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)')};
      background: ${isSelected ? 'rgba(168, 85, 247, 0.25)' : (isToday ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.5)')};
    `;

    cell.onclick = () => {
      selectTasksCalendarDay(dStr);
      renderTasksCalendar();
    };

    const numSpan = document.createElement('span');
    numSpan.textContent = day;
    numSpan.style.cssText = `
      font-size: 0.76rem;
      font-weight: ${isToday || isSelected ? '900' : '700'};
      color: ${isSelected ? '#f8fafc' : (isToday ? '#38bdf8' : '#cbd5e1')};
      font-family: var(--font-numbers);
    `;
    cell.appendChild(numSpan);

    if (dayTasks.length > 0) {
      const dotsRow = document.createElement('div');
      dotsRow.style.cssText = 'display: flex; gap: 2px; align-items: center; margin-top: 2px;';
      dayTasks.slice(0, 3).forEach(t => {
        const dot = document.createElement('span');
        let dotColor = '#38bdf8';
        if (t.completed) dotColor = '#10b981';
        else if (t.priority === 'high') dotColor = '#f43f5e';
        else if (t.category === 'shopping') dotColor = '#34d399';
        else if (t.category === 'bills') dotColor = '#fbbf24';
        dot.style.cssText = `width: 5px; height: 5px; border-radius: 50%; background: ${dotColor};`;
        dotsRow.appendChild(dot);
      });
      cell.appendChild(dotsRow);
    }

    grid.appendChild(cell);
  }

  selectTasksCalendarDay(window.calendarSelectedDate || todayStr);
}"""

replacement_cal_js = """function navigateTasksCalendar(delta) {
  window.calendarCurrentMonth += delta;
  if (window.calendarCurrentMonth > 11) {
    window.calendarCurrentMonth = 0;
    window.calendarCurrentYear += 1;
  } else if (window.calendarCurrentMonth < 0) {
    window.calendarCurrentMonth = 11;
    window.calendarCurrentYear -= 1;
  }
  const now = new Date();
  if (window.calendarCurrentYear === now.getFullYear() && window.calendarCurrentMonth === now.getMonth()) {
    window.calendarSelectedDate = (typeof getLocalDateStr === 'function') ? getLocalDateStr(now) : now.toISOString().slice(0, 10);
  } else {
    window.calendarSelectedDate = `${window.calendarCurrentYear}-${String(window.calendarCurrentMonth + 1).padStart(2, '0')}-01`;
  }
  renderTasksCalendar();
}

function goToTasksCalendarToday() {
  const now = new Date();
  window.calendarCurrentYear = now.getFullYear();
  window.calendarCurrentMonth = now.getMonth();
  window.calendarSelectedDate = (typeof getLocalDateStr === 'function') ? getLocalDateStr(now) : now.toISOString().slice(0, 10);
  renderTasksCalendar();
}

function formatArabicDateFriendly(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const daysNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = daysNames[d.getDay()] || '';
  const monthName = arabicMonths[parts[1] - 1] || '';
  const todayStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().slice(0, 10);
  const prefix = (dateStr === todayStr) ? 'اليوم - ' : '';
  return `${prefix}${dayName} ${parts[2]} ${monthName} ${parts[0]}`;
}

function openAddTaskForSelectedDate(dateStr) {
  if (!dateStr) dateStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().slice(0, 10);
  switchTasksViewMode('list');
  showUnifiedTaskCreator();
  const dateInp = document.getElementById('inlineTaskDueDate');
  if (dateInp) {
    dateInp.value = dateStr;
    if (typeof onInlineDateCustomChange === 'function') onInlineDateCustomChange(dateStr);
  }
  const titleInp = document.getElementById('quickTaskTitleInput');
  if (titleInp) {
    setTimeout(() => {
      titleInp.focus();
      titleInp.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }
}

function openTaskPhotoLightbox(src, title = 'صورة المهمة') {
  if (typeof openReceiptLightbox === 'function') {
    openReceiptLightbox(src, title);
  } else {
    window.open(src, '_blank');
  }
}

function selectTasksCalendarDay(dateStr) {
  if (!dateStr) {
    dateStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().slice(0, 10);
  }
  window.calendarSelectedDate = dateStr;

  // 1. Highlight cell visually in the grid without tearing down the DOM
  const cells = document.querySelectorAll('#tasksCalendarGrid > [data-calendar-date]');
  cells.forEach(c => {
    const isThisSelected = c.getAttribute('data-calendar-date') === dateStr;
    const isThisToday = c.getAttribute('data-is-today') === 'true';
    c.style.border = isThisSelected ? '1.5px solid #a855f7' : (isThisToday ? '1.2px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)');
    c.style.background = isThisSelected ? 'rgba(168, 85, 247, 0.32)' : (isThisToday ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.55)');
    c.style.boxShadow = isThisSelected ? '0 0 10px rgba(168, 85, 247, 0.45)' : 'none';
    const num = c.querySelector('span');
    if (num) {
      num.style.color = isThisSelected ? '#f8fafc' : (isThisToday ? '#38bdf8' : '#cbd5e1');
      num.style.fontWeight = isThisSelected || isThisToday ? '900' : '700';
    }
  });

  // 2. Update Header Title & Count Badge
  const titleEl = document.getElementById('calendarSelectedDayTitle');
  const badgeEl = document.getElementById('calendarSelectedDayCountBadge');
  const container = document.getElementById('tasksCalendarDayList');
  if (!container) return;

  const allTasks = getTodoTasks();
  const dayTasks = allTasks.filter(t => String(t.dueDate || '').slice(0, 10) === dateStr);

  if (titleEl) {
    titleEl.textContent = formatArabicDateFriendly(dateStr);
  }
  if (badgeEl) {
    const count = dayTasks.length;
    if (count === 0) badgeEl.textContent = '0 مهام';
    else if (count === 1) badgeEl.textContent = 'مهمة واحدة';
    else if (count === 2) badgeEl.textContent = 'مهمتان';
    else if (count >= 3 && count <= 10) badgeEl.textContent = `${count} مهام`;
    else badgeEl.textContent = `${count} مهمة`;
  }

  // 3. Render Daily Tasks List
  if (dayTasks.length === 0) {
    container.innerHTML = `
      <div style="padding: 18px 12px; text-align: center; color: #94a3b8; font-size: 0.78rem; background: rgba(15, 23, 42, 0.6); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(168, 85, 247, 0.15); display: flex; align-items: center; justify-content: center; color: #c084fc; font-size: 1.2rem;">
          <i class="fa-solid fa-calendar-plus"></i>
        </div>
        <span style="font-weight: 700; color: #cbd5e1;">لا توجد مهام مسجلة لهذا اليوم</span>
        <button type="button" onclick="openAddTaskForSelectedDate('${dateStr}')" style="margin-top: 4px; height: 32px; padding: 0 14px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #6366f1); border: none; color: #fff; font-size: 0.74rem; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.35); transition: all 0.2s;">
          <i class="fa-solid fa-plus"></i>
          <span>إضافة مهمة لهذا اليوم</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  dayTasks.forEach(t => {
    const item = document.createElement('div');
    const isDone = !!t.completed;
    item.style.cssText = `
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95));
      border: 1.2px solid ${isDone ? 'rgba(16, 185, 129, 0.35)' : 'rgba(168, 85, 247, 0.35)'};
      border-radius: 12px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    `;

    // Tag badge mapping
    let tagText = 'عامة';
    let tagColor = '#94a3b8';
    let tagBg = 'rgba(148, 163, 184, 0.16)';
    const tag = t.tag || t.category || 'general';
    if (tag === 'daily') { tagText = 'يومية'; tagColor = '#38bdf8'; tagBg = 'rgba(56, 189, 248, 0.18)'; }
    else if (tag === 'scheduled') { tagText = 'مجدولة'; tagColor = '#a855f7'; tagBg = 'rgba(168, 85, 247, 0.18)'; }
    else if (tag === 'important') { tagText = 'عاجلة'; tagColor = '#f43f5e'; tagBg = 'rgba(244, 63, 94, 0.18)'; }
    else if (tag === 'bills') { tagText = 'فواتير'; tagColor = '#fbbf24'; tagBg = 'rgba(245, 158, 11, 0.18)'; }
    else if (tag === 'shopping') { tagText = 'تسوق'; tagColor = '#34d399'; tagBg = 'rgba(16, 185, 129, 0.18)'; }

    const subtasks = Array.isArray(t.subtasks) ? t.subtasks : [];
    const subDoneCount = subtasks.filter(s => s.completed).length;

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
        <!-- Checkbox -->
        <button type="button" onclick="toggleTaskCompleted('${t.id}')" title="${isDone ? 'تعليم كغير مكتمل' : 'تعليم كمكتمل'}" style="width: 26px; height: 26px; border-radius: 8px; border: 1.5px solid ${isDone ? '#10b981' : '#a855f7'}; background: ${isDone ? '#10b981' : 'transparent'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.74rem; cursor: pointer; flex-shrink: 0; transition: all 0.2s;">
          ${isDone ? '<i class="fa-solid fa-check"></i>' : ''}
        </button>

        <!-- Details -->
        <div style="min-width: 0; flex: 1;">
          <div style="font-size: 0.84rem; font-weight: 850; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'}; word-break: break-word; line-height: 1.35;">
            ${escapeHtml(t.title)}
          </div>
          <div style="font-size: 0.68rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
            <!-- Tag Pill -->
            <span style="background: ${tagBg}; color: ${tagColor}; padding: 1px 7px; border-radius: 6px; font-weight: 850; border: 1px solid ${tagColor}40;">
              ${tagText}
            </span>
            ${t.dueTime ? `<span style="background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 5px; color: #cbd5e1; font-weight: 750;"><i class="fa-regular fa-clock" style="font-size: 0.62rem;"></i> ${t.dueTime}</span>` : ''}
            <span style="background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 5px; color: #cbd5e1; font-weight: 750;"><i class="fa-solid fa-user" style="font-size: 0.62rem;"></i> ${escapeHtml(t.assignedMember || 'البيت')}</span>
            ${subtasks.length > 0 ? `<span style="background: rgba(168,85,247,0.15); color: #c084fc; padding: 1px 6px; border-radius: 5px; font-weight: 750;"><i class="fa-solid fa-list-check" style="font-size: 0.62rem;"></i> ${subDoneCount}/${subtasks.length} فرعية</span>` : ''}
            ${t.photo ? `
              <div onclick="openTaskPhotoLightbox('${escapeHtml(t.photo)}')" style="display: inline-flex; align-items: center; gap: 3px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 1px 6px; border-radius: 5px; cursor: pointer; font-weight: 800; border: 1px solid rgba(56,189,248,0.3);">
                <i class="fa-solid fa-image" style="font-size: 0.65rem;"></i>
                <span>صورة</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Actions (Photo thumbnail preview + Delete) -->
      <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
        ${t.photo ? `
          <img src="${t.photo}" onclick="openTaskPhotoLightbox('${escapeHtml(t.photo)}')" style="width: 32px; height: 32px; border-radius: 7px; object-fit: cover; border: 1.2px solid rgba(56, 189, 248, 0.5); cursor: pointer;" title="معاينة الصورة" />
        ` : ''}
        <button type="button" onclick="deleteTaskItem('${t.id}')" title="حذف المهمة" style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 7px; color: #f87171; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.74rem; transition: all 0.2s;">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderTasksCalendar() {
  const grid = document.getElementById('tasksCalendarGrid');
  const titleEl = document.getElementById('calendarMonthTitle');
  if (!grid) return;

  if (titleEl) {
    titleEl.textContent = `${arabicMonths[window.calendarCurrentMonth]} ${window.calendarCurrentYear}`;
  }

  grid.innerHTML = '';
  const tasks = getTodoTasks();
  const tasksByDate = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    const d = String(t.dueDate).slice(0, 10);
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  });

  const todayStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().slice(0, 10);
  if (!window.calendarSelectedDate) {
    window.calendarSelectedDate = todayStr;
  }

  const firstDayOfMonth = new Date(window.calendarCurrentYear, window.calendarCurrentMonth, 1);
  const lastDayOfMonth = new Date(window.calendarCurrentYear, window.calendarCurrentMonth + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // (getDay() + 1) % 7 gives empty cells when week starts on Saturday (سبت)
  const startDay = (firstDayOfMonth.getDay() + 1) % 7;

  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.style.height = '46px';
    emptyCell.style.opacity = '0.15';
    grid.appendChild(emptyCell);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dStr = `${window.calendarCurrentYear}-${String(window.calendarCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasksByDate[dStr] || [];

    const cell = document.createElement('div');
    const isToday = dStr === todayStr;
    const isSelected = dStr === window.calendarSelectedDate;

    cell.setAttribute('data-calendar-date', dStr);
    cell.setAttribute('data-is-today', isToday ? 'true' : 'false');

    cell.style.cssText = `
      height: 46px;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
      border: ${isSelected ? '1.5px solid #a855f7' : (isToday ? '1.2px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)')};
      background: ${isSelected ? 'rgba(168, 85, 247, 0.32)' : (isToday ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.55)')};
      box-shadow: ${isSelected ? '0 0 10px rgba(168, 85, 247, 0.45)' : 'none'};
    `;

    cell.onclick = () => {
      selectTasksCalendarDay(dStr);
    };

    const numSpan = document.createElement('span');
    numSpan.textContent = day;
    numSpan.style.cssText = `
      font-size: 0.78rem;
      font-weight: ${isToday || isSelected ? '900' : '700'};
      color: ${isSelected ? '#f8fafc' : (isToday ? '#38bdf8' : '#cbd5e1')};
      font-family: var(--font-numbers);
    `;
    cell.appendChild(numSpan);

    if (dayTasks.length > 0) {
      const dotsRow = document.createElement('div');
      dotsRow.style.cssText = 'display: flex; gap: 2px; align-items: center; margin-top: 2px;';
      dayTasks.slice(0, 3).forEach(t => {
        const dot = document.createElement('span');
        let dotColor = '#38bdf8';
        if (t.completed) dotColor = '#10b981';
        else if (t.priority === 'high' || t.tag === 'important') dotColor = '#f43f5e';
        else if (t.category === 'shopping' || t.tag === 'shopping') dotColor = '#34d399';
        else if (t.category === 'bills' || t.tag === 'bills') dotColor = '#fbbf24';
        dot.style.cssText = `width: 5px; height: 5px; border-radius: 50%; background: ${dotColor};`;
        dotsRow.appendChild(dot);
      });
      if (dayTasks.length > 3) {
        const plusSpan = document.createElement('span');
        plusSpan.textContent = `+${dayTasks.length - 3}`;
        plusSpan.style.cssText = 'font-size: 0.52rem; color: #a855f7; font-weight: 850; line-height: 1;';
        dotsRow.appendChild(plusSpan);
      }
      cell.appendChild(dotsRow);
    }

    grid.appendChild(cell);
  }

  selectTasksCalendarDay(window.calendarSelectedDate || todayStr);
}"""

if target_cal_js in content:
    content = content.replace(target_cal_js, replacement_cal_js, 1)
    print("Calendar JS successfully updated!")
else:
    print("WARNING: target_cal_js not found exactly!")

# 4. Also register global bindings
binding_target = "window.switchTodoSection = switchTodoSection;"
binding_addition = """window.switchTodoSection = switchTodoSection;
window.openAddTaskForSelectedDate = openAddTaskForSelectedDate;
window.openTaskPhotoLightbox = openTaskPhotoLightbox;
window.navigateTasksCalendar = navigateTasksCalendar;
window.goToTasksCalendarToday = goToTasksCalendarToday;
window.selectTasksCalendarDay = selectTasksCalendarDay;
window.renderTasksCalendar = renderTasksCalendar;
window.openGlobalSearchModal = openGlobalSearchModal;"""

if binding_target in content:
    content = content.replace(binding_target, binding_addition, 1)
    print("Global bindings added!")

# 5. Version bump to v5.2.9
content = content.replace("var APP_VERSION = 'v5.2.8';", "var APP_VERSION = 'v5.2.9';")
content = content.replace("var APP_BUILD_ID = 202611081805;", "var APP_BUILD_ID = 202611090940;")
content = content.replace("window.APP_VERSION = 'v5.2.8';", "window.APP_VERSION = 'v5.2.9';")
content = content.replace("window.APP_BUILD_ID = 202611081805;", "window.APP_BUILD_ID = 202611090940;")
content = content.replace("const APP_VERSION = 'v5.2.8';", "const APP_VERSION = 'v5.2.9';")
content = content.replace("const APP_BUILD_ID = 202611081805;", "const APP_BUILD_ID = 202611090940;")
content = content.replace("v5.2.8 • متزامن", "v5.2.9 • متزامن")
content = content.replace("(v5.2.8)", "(v5.2.9)")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html completely updated to v5.2.9!")
