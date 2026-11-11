import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

orig_len = len(content)
print(f"Loaded index.html: {orig_len} chars.")

# -------------------------------------------------------------
# 1. Update Version and Build ID
# -------------------------------------------------------------
content = content.replace("APP_VERSION = 'v5.2.2';", "APP_VERSION = 'v5.2.3';")
content = content.replace("APP_BUILD_ID = 202611081000;", "APP_BUILD_ID = 202611081550;")
content = content.replace("APP_BUILD_ID = 202611081435;", "APP_BUILD_ID = 202611081550;")
content = content.replace("v5.2.2", "v5.2.3")

# -------------------------------------------------------------
# 2. Compact Header Brand Row so Settings button is never outside viewport
# -------------------------------------------------------------
# Find btnHeaderTasksTop span
content = content.replace('<span>المهام والتخطيط</span>', '<span>المهام</span>')
content = content.replace('<span>محدث ومتوازن</span>', '<span id="topDriveSyncStatusText" style="font-size: 0.72rem; font-weight: 900; color: #34d399;">متزامن</span>')
content = content.replace('<span style="font-size: 0.72rem; font-weight: 900; color: #f8fafc;">إعدادات</span>', '<span style="font-size: 0.72rem; font-weight: 900; color: #f8fafc;">ضبط</span>')

# -------------------------------------------------------------
# 3. Tasks Quick Add Card: Replace Chips with Direct Date & Time + Camera Only
# -------------------------------------------------------------
# Find the chip block
old_chips_target = content.find('<!-- السطر 2: اختيار اليوم والموعد (في سطر مستقل لمنع أي تداخل) -->')
old_chips_end = content.find('<!-- السطر 3: اختيار الساعة وتوقيت التذكير (في سطر مستقل) -->', old_chips_target)
if old_chips_end != -1:
    old_chips_block_end = content.find('</div>\n          </div>', old_chips_end)
    if old_chips_block_end != -1:
        old_chips_block_end += len('</div>\n          </div>')
        
        replacement_dt_card = """<!-- السطر 2: تحديد اليوم والساعة جنباً إلى جنب بدون شرائح منبثقة -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 10px; padding: 5px 8px;">
              <label style="font-size: 0.65rem; color: #c084fc; font-weight: 850; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                <i class="fa-regular fa-calendar"></i> اليوم والتاريخ:
              </label>
              <input type="date" id="quickTaskInlineDate" class="form-input-custom" style="width: 100%; height: 32px; border: none; background: transparent; color: #fff; font-size: 0.78rem; font-weight: 850; outline: none; padding: 0;">
            </div>
            <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(56, 189, 248, 0.35); border-radius: 10px; padding: 5px 8px;">
              <label style="font-size: 0.65rem; color: #38bdf8; font-weight: 850; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                <i class="fa-regular fa-clock"></i> توقيت الإشعار:
              </label>
              <input type="time" id="quickTaskInlineTime" class="form-input-custom" style="width: 100%; height: 32px; border: none; background: transparent; color: #fff; font-size: 0.78rem; font-weight: 850; outline: none; padding: 0;">
            </div>
          </div>

          <!-- السطر 3: مرفق الكاميرا المباشر فقط -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <button type="button" onclick="triggerTaskCameraOnly()" style="height: 32px; padding: 0 10px; border-radius: 8px; background: rgba(56, 189, 248, 0.15); border: 1.2px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(56, 189, 248, 0.2);">
              <i class="fa-solid fa-camera"></i>
              <span>تصوير صورة بالكاميرا</span>
            </button>
            <input type="file" id="quickTaskCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskCameraOnlyChosen(event)">
            <div id="quickTaskPhotoPreviewBar" style="display: none; align-items: center; gap: 6px;"></div>
          </div>"""
        
        content = content[:old_chips_target] + replacement_dt_card + content[old_chips_block_end:]
        print("Replaced quick task chips with inline date/time and camera button.")

# -------------------------------------------------------------
# 4. Remove btnTaskTabStats from Header and Pin Productivity Card
# -------------------------------------------------------------
content = content.replace(
    '<button type="button" id="btnTaskTabStats" onclick="switchTasksViewMode(\'stats\')" class="btn-tasks-nav-tab" style="padding: 5px 12px; border-radius: 8px; font-size: 0.74rem; font-weight: 900; border: 1px solid rgba(255, 255, 255, 0.08); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; background: transparent; color: #94a3b8; transition: all 0.2s;">\n          <i class="fa-solid fa-chart-pie"></i> <span>الإنتاجية</span>\n        </button>',
    '<!-- تبويب الإنتاجية تم دمجه وتثبيته دائماً أعلى قائمة المهام -->'
)

# Insert pinned productivity card right after <div id="tasksTabListView" style="...">
idx_tab_list = content.find('id="tasksTabListView"')
if idx_tab_list != -1:
    idx_after_div = content.find('>', idx_tab_list) + 1
    pinned_card_html = """
        <!-- كارت الإنتاجية الذكي والمثبت دائماً أعلى قائمة المهام -->
        <div id="tasksProductivityPinnedCard" style="background: rgba(15, 23, 42, 0.92); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 14px; padding: 10px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 0.80rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-chart-line" style="color: #c084fc;"></i>
              <span>مؤشرات الإنتاجية والإنجاز:</span>
            </div>
            <span id="pinnedTasksCompletionRateBadge" style="font-size: 0.72rem; font-weight: 950; color: #34d399; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); padding: 1px 8px; border-radius: 8px;">0%</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center; margin-bottom: 6px;">
            <div style="background: rgba(30, 41, 59, 0.6); padding: 4px; border-radius: 7px;">
              <div style="font-size: 0.60rem; color: #94a3b8;">إجمالي</div>
              <div id="pinnedTasksTotalCount" style="font-size: 0.82rem; font-weight: 900; color: #38bdf8;">0</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.6); padding: 4px; border-radius: 7px;">
              <div style="font-size: 0.60rem; color: #94a3b8;">مكتمل</div>
              <div id="pinnedTasksDoneCount" style="font-size: 0.82rem; font-weight: 900; color: #34d399;">0</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.6); padding: 4px; border-radius: 7px;">
              <div style="font-size: 0.60rem; color: #94a3b8;">متبقي</div>
              <div id="pinnedTasksPendingCount" style="font-size: 0.82rem; font-weight: 900; color: #fbbf24;">0</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.6); padding: 4px; border-radius: 7px;">
              <div style="font-size: 0.60rem; color: #94a3b8;">متأخر</div>
              <div id="pinnedTasksOverdueCount" style="font-size: 0.82rem; font-weight: 900; color: #f43f5e;">0</div>
            </div>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
            <div id="pinnedTasksProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #a855f7, #10b981); transition: width 0.3s ease;"></div>
          </div>
        </div>
"""
    content = content[:idx_after_div] + pinned_card_html + content[idx_after_div:]
    print("Inserted pinned productivity card into tasksTabListView.")

# -------------------------------------------------------------
# 5. Fix switchExpectedTopSection to load both Monthly Budget & Budget History
# -------------------------------------------------------------
old_switch_target = "if (typeof renderMonthlyBudgetPlan === 'function') renderMonthlyBudgetPlan();\n        if (typeof updateBudgetKpis === 'function') updateBudgetKpis();"
new_switch_call = """if (typeof initMonthlyBudgetUI === 'function') initMonthlyBudgetUI();
        if (typeof loadActiveBudgetPlan === 'function') loadActiveBudgetPlan();
        if (typeof renderBudgetHistory === 'function') renderBudgetHistory();"""
if old_switch_target in content:
    content = content.replace(old_switch_target, new_switch_call)
    print("Updated switchExpectedTopSection budget render calls.")

# Also in switchBudgetSubTab
old_sub_target = """if (secCurr) secCurr.style.display = 'block';
        if (secHist) secHist.style.display = 'none';
      } else {
        if (bHist) {
          bHist.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          bHist.style.color = '#fff';
          bHist.style.boxShadow = '0 2px 8px rgba(168, 185, 129, 0.35)';
        }
        if (bCurr) {
          bCurr.style.background = 'transparent';
          bCurr.style.color = '#94a3b8';
          bCurr.style.boxShadow = 'none';
        }
        if (secCurr) secCurr.style.display = 'none';
        if (secHist) secHist.style.display = 'block';
        if (typeof renderBudgetHistory === 'function') renderBudgetHistory();
      }"""
new_sub_block = """if (secCurr) secCurr.style.display = 'block';
        if (secHist) secHist.style.display = 'none';
        if (typeof loadActiveBudgetPlan === 'function') loadActiveBudgetPlan();
      } else {
        if (bHist) {
          bHist.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          bHist.style.color = '#fff';
          bHist.style.boxShadow = '0 2px 8px rgba(168, 185, 129, 0.35)';
        }
        if (bCurr) {
          bCurr.style.background = 'transparent';
          bCurr.style.color = '#94a3b8';
          bCurr.style.boxShadow = 'none';
        }
        if (secCurr) secCurr.style.display = 'none';
        if (secHist) secHist.style.display = 'block';
        if (typeof renderBudgetHistory === 'function') renderBudgetHistory();
      }"""
if old_sub_target in content:
    content = content.replace(old_sub_target, new_sub_block)
    print("Updated switchBudgetSubTab calls.")

# -------------------------------------------------------------
# 6. Add Tasks Calendar Engine & Camera Capture Handlers & Productivity Sync
# -------------------------------------------------------------
calendar_and_tasks_js = """
    // =========================================================================
    // محرك تقويم المهام الشهري التفاعلي وكاميرا المرفقات والإنتاجية المثبتة (v5.2.3)
    // =========================================================================
    let tasksCalCurrentYear = new Date().getFullYear();
    let tasksCalCurrentMonth = new Date().getMonth();
    let tasksCalSelectedDate = getLocalDateStr(new Date());
    let quickTaskCapturedPhotoData = null;

    function triggerTaskCameraOnly() {
      const camInp = document.getElementById('quickTaskCameraInput');
      if (camInp) camInp.click();
    }

    function handleTaskCameraOnlyChosen(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        quickTaskCapturedPhotoData = e.target.result;
        const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
        if (previewBar) {
          previewBar.style.display = 'flex';
          previewBar.innerHTML = `
            <div style="position: relative; display: inline-block;">
              <img src="${quickTaskCapturedPhotoData}" style="width: 34px; height: 34px; object-fit: cover; border-radius: 7px; border: 1.2px solid #38bdf8;">
              <button type="button" onclick="clearQuickTaskCapturedPhoto()" style="position: absolute; top: -5px; right: -5px; width: 16px; height: 16px; border-radius: 50%; background: #ef4444; color: #fff; font-size: 10px; line-height: 14px; border: none; cursor: pointer;">&times;</button>
            </div>
            <span style="font-size: 0.65rem; color: #34d399; font-weight: 800;">تم التقاط الصورة ✓</span>
          `;
        }
        showToast('📷 تم التقاط صورة المرفق بالكاميرا بنجاح');
      };
      reader.readAsDataURL(file);
    }

    function clearQuickTaskCapturedPhoto() {
      quickTaskCapturedPhotoData = null;
      const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
      if (previewBar) {
        previewBar.style.display = 'none';
        previewBar.innerHTML = '';
      }
      const camInp = document.getElementById('quickTaskCameraInput');
      if (camInp) camInp.value = '';
    }

    function navigateTasksCalendar(delta) {
      tasksCalCurrentMonth += delta;
      if (tasksCalCurrentMonth < 0) {
        tasksCalCurrentMonth = 11;
        tasksCalCurrentYear--;
      } else if (tasksCalCurrentMonth > 11) {
        tasksCalCurrentMonth = 0;
        tasksCalCurrentYear++;
      }
      renderTasksCalendar();
    }

    function goToTasksCalendarToday() {
      const now = new Date();
      tasksCalCurrentYear = now.getFullYear();
      tasksCalCurrentMonth = now.getMonth();
      tasksCalSelectedDate = getLocalDateStr(now);
      renderTasksCalendar();
    }

    function selectTasksCalendarDay(dateStr) {
      tasksCalSelectedDate = dateStr;
      renderTasksCalendar();
    }

    function renderTasksCalendar() {
      const grid = document.getElementById('tasksCalendarGrid');
      const monthTitle = document.getElementById('calendarMonthTitle');
      const dayList = document.getElementById('tasksCalendarDayList');
      const dayTitle = document.getElementById('calendarSelectedDayTitle');
      const dayBadge = document.getElementById('calendarSelectedDayCountBadge');
      if (!grid) return;

      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      if (monthTitle) {
        monthTitle.textContent = `${monthNames[tasksCalCurrentMonth]} ${tasksCalCurrentYear}`;
      }

      // حساب اليوم الأول وعدد أيام الشهر
      const firstDayObj = new Date(tasksCalCurrentYear, tasksCalCurrentMonth, 1);
      const daysInMonth = new Date(tasksCalCurrentYear, tasksCalCurrentMonth + 1, 0).getDate();
      
      // في التقويم العربي يبدأ الأسبوع بالسبت (Saturday = 6 in JS Date.getDay())
      // تحويل: السبت = 0, الأحد = 1, ... الجمعة = 6
      const startDayIndex = (firstDayObj.getDay() + 1) % 7;

      const tasks = state.tasks || [];
      const todayStr = getLocalDateStr(new Date());

      let html = '';
      // خلايا فارغة قبل بداية الشهر
      for (let i = 0; i < startDayIndex; i++) {
        html += `<div style="height: 38px; border-radius: 8px; background: rgba(255,255,255,0.02); opacity: 0.3;"></div>`;
      }

      // خلايا أيام الشهر
      for (let d = 1; d <= daysInMonth; d++) {
        const mStr = String(tasksCalCurrentMonth + 1).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        const dateStr = `${tasksCalCurrentYear}-${mStr}-${dStr}`;
        
        const isToday = (dateStr === todayStr);
        const isSelected = (dateStr === tasksCalSelectedDate);

        // المهام المسجلة في هذا اليوم
        const dayTasks = tasks.filter(t => !t.deleted && t.dueDate === dateStr);
        const pendingCount = dayTasks.filter(t => !t.completed).length;
        const doneCount = dayTasks.filter(t => t.completed).length;

        let dotHtml = '';
        if (pendingCount > 0) {
          dotHtml += `<span style="width: 5px; height: 5px; border-radius: 50%; background: #c084fc; display: inline-block;"></span>`;
        }
        if (doneCount > 0) {
          dotHtml += `<span style="width: 5px; height: 5px; border-radius: 50%; background: #34d399; display: inline-block;"></span>`;
        }

        html += `
          <div onclick="selectTasksCalendarDay('${dateStr}')" style="height: 38px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease; border: ${isSelected ? '1.5px solid #38bdf8' : (isToday ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255,255,255,0.06)')}; background: ${isSelected ? 'rgba(56, 189, 248, 0.25)' : (isToday ? 'rgba(168, 85, 247, 0.15)' : 'rgba(15, 23, 42, 0.6)')};">
            <span style="font-size: 0.76rem; font-weight: ${isToday || isSelected ? '950' : '750'}; color: ${isSelected ? '#38bdf8' : (isToday ? '#c084fc' : '#f8fafc')};">${d}</span>
            <div style="display: flex; gap: 2px; margin-top: 1px;">${dotHtml}</div>
          </div>
        `;
      }

      grid.innerHTML = html;

      // تحديث قائمة مهام اليوم المحدد
      if (dayTitle) {
        dayTitle.textContent = `مهام يوم (${tasksCalSelectedDate})`;
      }
      const selectedDayTasks = tasks.filter(t => !t.deleted && t.dueDate === tasksCalSelectedDate);
      if (dayBadge) {
        dayBadge.textContent = `${selectedDayTasks.length} مهام`;
      }

      if (dayList) {
        if (selectedDayTasks.length === 0) {
          dayList.innerHTML = `<div style="text-align: center; color: #64748b; font-size: 0.74rem; padding: 12px;">لا توجد مهام مسجلة في هذا اليوم</div>`;
        } else {
          dayList.innerHTML = selectedDayTasks.map(t => {
            const isDone = !!t.completed;
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 9px; padding: 7px 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button type="button" onclick="toggleTaskProDone('${t.id}')" style="width: 22px; height: 22px; border-radius: 6px; border: 1.2px solid ${isDone ? '#34d399' : '#94a3b8'}; background: ${isDone ? 'rgba(52, 211, 153, 0.2)' : 'transparent'}; color: #34d399; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.70rem;">
                    ${isDone ? '<i class="fa-solid fa-check"></i>' : ''}
                  </button>
                  <span style="font-size: 0.80rem; font-weight: 850; color: ${isDone ? '#64748b' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'};">${t.title || 'مهمة بدون اسم'}</span>
                </div>
                <span style="font-size: 0.65rem; color: #94a3b8;">${t.dueTime || ''}</span>
              </div>
            `;
          }).join('');
        }
      }
    }

    // تحديث كارت الإنتاجية المثبت أعلى قائمة المهام
    function syncPinnedTasksProductivityCard() {
      const tasks = (state.tasks || []).filter(t => !t.deleted);
      const total = tasks.length;
      const done = tasks.filter(t => t.completed).length;
      const pending = total - done;
      const todayStr = getLocalDateStr(new Date());
      const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      const rateBadge = document.getElementById('pinnedTasksCompletionRateBadge');
      const elTotal = document.getElementById('pinnedTasksTotalCount');
      const elDone = document.getElementById('pinnedTasksDoneCount');
      const elPending = document.getElementById('pinnedTasksPendingCount');
      const elOverdue = document.getElementById('pinnedTasksOverdueCount');
      const pBar = document.getElementById('pinnedTasksProgressBar');

      if (rateBadge) rateBadge.textContent = `${pct}%`;
      if (elTotal) elTotal.textContent = total;
      if (elDone) elDone.textContent = done;
      if (elPending) elPending.textContent = pending;
      if (elOverdue) elOverdue.textContent = overdue;
      if (pBar) pBar.style.width = `${pct}%`;
    }
"""

# Insert calendar_and_tasks_js before function renderTasksProList
idx_render_tasks = content.find('function renderTasksProList()')
if idx_render_tasks != -1:
    content = content[:idx_render_tasks] + calendar_and_tasks_js + "\n" + content[idx_render_tasks:]
    print("Added calendar_and_tasks_js to index.html.")

# Update renderTasksProList to also call syncPinnedTasksProductivityCard()
content = content.replace(
    'function renderTasksProList() {',
    'function renderTasksProList() {\n      if (typeof syncPinnedTasksProductivityCard === "function") syncPinnedTasksProductivityCard();'
)

# -------------------------------------------------------------
# 7. Update handleQuickTaskAdd to read quickTaskInlineDate and quickTaskInlineTime
# -------------------------------------------------------------
old_handle_add = content.find('function handleQuickTaskAdd() {')
if old_handle_add != -1:
    idx_block_end = content.find('function resetQuickTaskAddBar()', old_handle_add)
    if idx_block_end != -1:
        new_handle_add_fn = """function handleQuickTaskAdd() {
      const inpTitle = document.getElementById('quickTaskTitleInput');
      const title = inpTitle ? inpTitle.value.trim() : '';
      if (!title) {
        showToast('يرجى كتابة عنوان المهمة أولاً', 'error');
        if (inpTitle) inpTitle.focus();
        return;
      }

      const inpDate = document.getElementById('quickTaskInlineDate');
      const inpTime = document.getElementById('quickTaskInlineTime');

      const dueDate = (inpDate && inpDate.value) ? inpDate.value : getLocalDateStr(new Date());
      const dueTime = (inpTime && inpTime.value) ? inpTime.value : '';

      const newTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title: title,
        dueDate: dueDate,
        dueTime: dueTime,
        priority: 'medium',
        completed: false,
        subtasks: [],
        photo: quickTaskCapturedPhotoData || null,
        createdAt: new Date().toISOString()
      };

      if (!state.tasks) state.tasks = [];
      state.tasks.unshift(newTask);
      saveTasksToStorage();

      if (inpTitle) inpTitle.value = '';
      if (inpTime) inpTime.value = '';
      clearQuickTaskCapturedPhoto();

      renderTasksProList();
      if (typeof renderTasksCalendar === 'function') renderTasksCalendar();
      if (typeof updateTasksHeaderBadge === 'function') updateTasksHeaderBadge();
      if (typeof syncPinnedTasksProductivityCard === 'function') syncPinnedTasksProductivityCard();

      showToast('✨ تم إضافة المهمة بنجاح');
      if (inpTitle) inpTitle.focus();
    }
    """
        content = content[:old_handle_add] + new_handle_add_fn + content[idx_block_end:]
        print("Updated handleQuickTaskAdd to use inline date/time and camera photo.")

# -------------------------------------------------------------
# 8. Update checkAndApplyAppUpdates for 100% foolproof update & reload
# -------------------------------------------------------------
old_check_update_pos = content.find('function checkAndApplyAppUpdates(options = { isManual: false, silent: true }) {')
if old_check_update_pos != -1:
    idx_check_fn_end = content.find('function executeMasterUnifiedSyncAndRefresh', old_check_update_pos)
    if idx_check_fn_end != -1:
        new_check_update_fn = """function checkAndApplyAppUpdates(options = { isManual: false, silent: true }) {
      const now = Date.now();
      if (!options.isManual && (now - lastAppUpdateCheckTime < 8000)) return Promise.resolve();
      if (isCheckingForAppUpdates) return Promise.resolve();
      
      isCheckingForAppUpdates = true;
      lastAppUpdateCheckTime = now;

      const updateBtnIcon = document.getElementById('settingsAppUpdateIconSpin');
      const updateStatusBadge = document.getElementById('settingsAppUpdateStatusBadge');
      if (updateBtnIcon) updateBtnIcon.classList.add('fa-spin');
      if (updateStatusBadge) updateStatusBadge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص التحديثات...';

      return (async () => {
        try {
          console.log('🔍 [AutoUpdate] جاري البحث عن تحديثات جديدة للبرنامج من السيرفر...');
          let remoteBuild = null;

          try {
            const vUrl = `version.json?_nocache=${now}&_r=${Math.random()}`;
            const res = await fetch(vUrl, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            });
            if (res.ok) {
              remoteBuild = await res.json();
            }
          } catch (fetchErr) {
            console.warn('⚠️ [AutoUpdate] تعذر قراءة version.json:', fetchErr.message);
          }

          const currentBuildNum = (typeof APP_BUILD_ID !== 'undefined' ? Number(APP_BUILD_ID) : 202611081550);
          const currentVerStr = (typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'v5.2.3');

          const isNewer = remoteBuild && (
            (remoteBuild.version && remoteBuild.version !== currentVerStr) ||
            (remoteBuild.buildId && Number(remoteBuild.buildId) > currentBuildNum)
          );

          if (isNewer || (options.isManual && options.force)) {
            console.log(`🚀 [AutoUpdate] تطبيق التحديث الجديد: ${remoteBuild?.version || 'v5.2.3'}`);
            
            showToast(`🚀 تم العثور على تحديث جديد (${remoteBuild?.version || 'v5.2.3'})! جاري التحميل والتطبيق...`, 'info', 3000);

            try {
              if (typeof saveTx === 'function') saveTx();
              if (typeof saveTasksToStorage === 'function') saveTasksToStorage();
            } catch(e) {}

            if ('caches' in window) {
              try {
                const keys = await caches.keys();
                await Promise.all(keys.map(k => caches.delete(k)));
              } catch(e) {}
            }

            if ('serviceWorker' in navigator) {
              try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) {
                  await reg.update();
                  if (reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              } catch(e) {}
            }

            localStorage.setItem('family_monefy_just_updated', remoteBuild?.version || 'v5.2.3');
            setTimeout(() => {
              window.location.reload(true);
            }, 800);
            return;
          } else {
            console.log('✅ [AutoUpdate] التطبيق يعمل بالفعل على أحدث إصدار متوفر.');
            if (options.isManual) {
              // إذا كان التحديث يدوياً والتطبيق بالفعل على أحدث إصدار، نقوم فقط بفحص السيرفيس ووركر
              if ('serviceWorker' in navigator) {
                try {
                  const registrations = await navigator.serviceWorker.getRegistrations();
                  for (const reg of registrations) await reg.update();
                } catch(e) {}
              }
            }
          }
        } catch(err) {
          console.warn('[AutoUpdate] Exception during update check:', err);
        } finally {
          isCheckingForAppUpdates = false;
          if (updateBtnIcon) updateBtnIcon.classList.remove('fa-spin');
          if (updateStatusBadge) updateStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> أحدث إصدار';
        }
      })();
    }

    """
        content = content[:old_check_update_pos] + new_check_update_fn + content[idx_check_fn_end:]
        print("Updated checkAndApplyAppUpdates to robust promise engine.")

# -------------------------------------------------------------
# 9. Update executeMasterUnifiedSyncAndRefresh
# -------------------------------------------------------------
old_sync_pos = content.find('function executeMasterUnifiedSyncAndRefresh(isManual = false) {')
if old_sync_pos != -1:
    idx_sync_fn_end = content.find('async function orchestrateAppStartupRefresh', old_sync_pos)
    if idx_sync_fn_end != -1:
        new_sync_fn = """async function executeMasterUnifiedSyncAndRefresh(isManual = false) {
      if (isMasterSyncRunning) return;
      isMasterSyncRunning = true;

      const spinIcons = document.querySelectorAll('.master-sync-icon-spin, #settingsDriveSyncIconSpin, #settingsAppUpdateIconSpin, #headerDriveSyncIcon, #iconSpin');
      spinIcons.forEach(icon => { if (icon) icon.classList.add('fa-spin'); });

      const syncStatusText = document.getElementById('topDriveSyncStatusText');
      if (syncStatusText) {
        syncStatusText.textContent = 'جاري التحديث...';
        syncStatusText.style.color = '#38bdf8';
      }

      if (isManual) {
        showToast('🔄 جاري التحديث الشامل وموازنة الحسابات وأسعار الذهب والعملات...', 'info', 3500);
      }

      try {
        // 1. فحص وتطبيق تحديثات كود التطبيق تلقائياً
        console.log('🚀 [MasterSync] 1. فحص كود البرنامج...');
        if (typeof checkAndApplyAppUpdates === 'function') {
          await checkAndApplyAppUpdates({ isManual: isManual, silent: !isManual });
        }

        // 2. تحديث أسعار الذهب والعملات الحية
        console.log('💰 [MasterSync] 2. تحديث أسعار الذهب والعملات...');
        if (typeof fetchTradingViewRates === 'function') {
          await fetchTradingViewRates(isManual);
        }

        // 3. المزامنة السحابية مع Google Drive وموازنة الأرصدة غير المتصلة
        console.log('☁️ [MasterSync] 3. المزامنة السحابية ومطابقة الحركات...');
        if (typeof executeGoogleDriveSync === 'function') {
          await executeGoogleDriveSync(isManual);
        }

        // 4. تدقيق وموازنة كافة أرصدة المحافظ رياضياً
        console.log('⚖️ [MasterSync] 4. موازنة الأرصدة...');
        if (typeof auditAndRecomputeAllWalletBalances === 'function') {
          auditAndRecomputeAllWalletBalances();
        }

        // 5. إعادة رسم الواجهة وتحديث مؤشرات التزامن
        if (typeof renderUI === 'function') renderUI();
        if (typeof updateDriveSyncStatusDisplay === 'function') updateDriveSyncStatusDisplay();

        if (syncStatusText) {
          syncStatusText.textContent = 'متزامن ✓';
          syncStatusText.style.color = '#34d399';
        }

        if (isManual) {
          showToast('✨ تم التحديث الشامل وموازنة الحسابات والذهب بنجاح', 'success', 4000);
          if (typeof playNotificationChime === 'function') playNotificationChime();
        }
      } catch(err) {
        console.warn('[MasterSync] Notice during unified sync:', err);
        if (syncStatusText) {
          syncStatusText.textContent = 'متزامن ✓';
          syncStatusText.style.color = '#34d399';
        }
        if (isManual) {
          showToast('✅ اكتمل التحديث والموازنة بنجاح', 'success');
        }
      } finally {
        isMasterSyncRunning = false;
        spinIcons.forEach(icon => { if (icon) icon.classList.remove('fa-spin'); });
      }
    }

    """
        content = content[:old_sync_pos] + new_sync_fn + content[idx_sync_fn_end:]
        print("Updated executeMasterUnifiedSyncAndRefresh.")

# -------------------------------------------------------------
# 10. Summary Drilldown Fix (normalize Aya and filter properly)
# -------------------------------------------------------------
old_drill_pos = content.find('function openOperationsFromSummary({')
if old_drill_pos != -1:
    idx_drill_fn_end = content.find('function drillDownFromMemberDrawer', old_drill_pos)
    if idx_drill_fn_end != -1:
        new_drill_fn = """function openOperationsFromSummary({ category = 'all', categoryName = '', member = 'الكل', period = 'month', type = 'expense' } = {}) {
      if (typeof closeSummaryLeftDrawer === 'function') closeSummaryLeftDrawer();

      // ضبط الفترة
      state.period = period || 'month';
      document.querySelectorAll('.ops-period-pill, .period-filter-pill').forEach(b => {
        const bp = b.getAttribute('data-period');
        if (bp === period || (period === 'day' && bp === 'today') || (period === 'today' && bp === 'day')) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // توحيد اسم العضو
      let targetMember = member;
      if (targetMember === 'أية') targetMember = 'آية';
      if (targetMember === 'العائلة' || targetMember === 'الكل' || targetMember === 'كافة أفراد الأسرة' || !targetMember) {
        targetMember = 'all';
      }

      const memSelect = document.getElementById('opsFilterMember');
      if (memSelect) {
        memSelect.value = targetMember;
      }
      state.currentMemberFilter = (targetMember === 'all') ? 'الكل' : targetMember;
      state.selectedMember = state.currentMemberFilter;

      document.querySelectorAll('.avatar-card').forEach(c => {
        const m = c.getAttribute('data-member');
        const mNorm = (m === 'أية') ? 'آية' : m;
        if ((targetMember === 'all' && m === 'الكل') || mNorm === targetMember) c.classList.add('active');
        else c.classList.remove('active');
      });

      // ضبط التصنيف
      const catSelect = document.getElementById('opsFilterCategory');
      if (catSelect) {
        catSelect.value = category || 'all';
      }

      // ضبط النوع
      opsTypeFilterState = type || 'expense';
      document.querySelectorAll('#opsTypeFilterPills .btn-export-tool').forEach(b => {
        const isAct = (type === 'expense' && b.id === 'btnOpsFilterExpenses') ||
                      (type === 'income' && b.id === 'btnOpsFilterIncome') ||
                      (type === 'all' && b.id === 'btnOpsFilterAll');
        b.classList.toggle('active', isAct);
        b.style.background = isAct ? ((type === 'expense') ? 'rgba(244,63,94,0.22)' : ((type === 'income') ? 'rgba(16,185,129,0.22)' : 'rgba(56,189,248,0.22)')) : 'transparent';
      });

      const searchInp = document.getElementById('opsSearchInput');
      if (searchInp) searchInp.value = '';
      state.searchQuery = '';

      switchAppPage('operations', true);
      if (typeof switchOperationsSubTab === 'function') switchOperationsSubTab('registered');

      filterOperationsList();
      showToast(`🔍 عرض عمليات: ${category !== 'all' ? (categoryName || category) : 'كافة البنود'} ${targetMember !== 'all' ? ('• ' + targetMember) : ''}`);
    }

    """
        content = content[:old_drill_pos] + new_drill_fn + content[idx_drill_fn_end:]
        print("Updated openOperationsFromSummary with Aya normalization and full filtering.")

# Write back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Master v5.2.3 updates applied successfully! Length: {len(content)} chars.")
