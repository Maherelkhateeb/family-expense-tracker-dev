#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full JS Engine Upgrade for To-Do List & Schedule Planner
--------------------------------------------------------
Implements:
1. switchTasksViewMode(mode): toggles list / calendar / stats
2. setTasksCategoryFilter(cat): updates category pills & filters
3. Calendar Engine: renderTasksCalendar, selectCalendarDay, navigateTasksCalendar, goToTasksCalendarToday
4. Quick Add Bar: direct datetime-local picker + presets integration
5. Subtasks & Checklist progress
6. 1-click convert to wallet expense
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

path = 'index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

orig_len = len(content)

start_idx = content.find('let quickTaskDueDatePreset =')
end_idx = content.find('function handleTaskPhotoUpload(', start_idx)

if start_idx == -1 or end_idx == -1:
    print("Error: Could not locate JS bounds")
    sys.exit(1)

new_engine_code = '''let quickTaskDueDatePreset = 'today';
    let currentTasksViewMode = 'list'; // 'list' | 'calendar' | 'stats'
    let currentTasksCategoryFilter = 'all'; // 'all' | 'shopping' | 'bills' | 'health' | 'home' | 'work'
    let currentTasksMemberFilter = 'all';
    let currentDrawerTodoSection = 'my_day';
    let calendarCurrentYear = new Date().getFullYear();
    let calendarCurrentMonth = new Date().getMonth(); // 0-indexed
    let calendarSelectedDate = getLocalDateStr(new Date());

    window.currentPendingTaskPhotoUri = null;
    window.pendingSubtaskPhotos = window.pendingSubtaskPhotos || {};

    function getTodoTasks() {
      try {
        const raw = localStorage.getItem('family_monefy_tasks');
        if (raw) return JSON.parse(raw);
      } catch(e) {}
      return [
        {
          id: 'task_demo_1',
          title: 'تسوق خضار ومستلزمات السوبرماركت الأسبوعية',
          completed: false,
          dueDate: getLocalDateStr(new Date()),
          dueTime: '18:00',
          priority: 'high',
          tag: 'shopping',
          assignedMember: 'آية',
          estimatedAmount: 750,
          isExpenseConverted: false,
          starred: true,
          subtasks: [
            { id: 'sub_1_1', title: 'شراء فاكهة وخضار طازج', completed: true },
            { id: 'sub_1_2', title: 'ألبان واجبان وبيض', completed: false },
            { id: 'sub_1_3', title: 'منظفات وعناية شخصية', completed: false }
          ]
        },
        {
          id: 'task_demo_2',
          title: 'سداد فاتورة الإنترنت المنزلي وفاتورة الكهرباء',
          completed: false,
          dueDate: getLocalDateStr(new Date()),
          dueTime: '21:00',
          priority: 'high',
          tag: 'bills',
          assignedMember: 'ماهر',
          estimatedAmount: 580,
          isExpenseConverted: false,
          starred: true,
          subtasks: [
            { id: 'sub_2_1', title: 'دفع فاتورة وي WE إنترنت', completed: false },
            { id: 'sub_2_2', title: 'شحن كارت الكهرباء الذكي', completed: false }
          ]
        },
        {
          id: 'task_demo_3',
          title: 'مستلزمات المدرسة ودروس الأطفال',
          completed: false,
          dueDate: getLocalDateStr(new Date(Date.now() + 86400000)),
          dueTime: '14:00',
          priority: 'medium',
          tag: 'home',
          assignedMember: 'محمد',
          estimatedAmount: 300,
          isExpenseConverted: false,
          starred: false,
          subtasks: []
        }
      ];
    }

    function saveTodoTasks(tasks) {
      try {
        localStorage.setItem('family_monefy_tasks', JSON.stringify(tasks));
      } catch(e) {}
    }

    function openTasksFullScreenModal() {
      const modal = document.getElementById('tasksFullScreenModal');
      if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      }
      switchTasksViewMode(currentTasksViewMode || 'list');
    }

    function closeTasksFullScreenModal() {
      const modal = document.getElementById('tasksFullScreenModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }

    function openTasksModal() {
      openTasksFullScreenModal();
    }

    // =========================================================================
    // التبديل بين أوضاع العرض الرئيسية: القوائم / التقويم / الإنتاجية
    // =========================================================================
    function switchTasksViewMode(mode) {
      currentTasksViewMode = mode;
      const vList = document.getElementById('tasksTabListView');
      const vCal = document.getElementById('tasksTabCalendarView');
      const vStats = document.getElementById('tasksTabStatsView');

      const bList = document.getElementById('btnTaskTabList');
      const bCal = document.getElementById('btnTaskTabCalendar');
      const bStats = document.getElementById('btnTaskTabStats');

      [bList, bCal, bStats].forEach(b => {
        if (b) {
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
          b.style.border = '1px solid rgba(255,255,255,0.08)';
          b.style.boxShadow = 'none';
          b.classList.remove('active');
        }
      });

      if (vList) vList.style.display = mode === 'list' ? 'flex' : 'none';
      if (vCal) vCal.style.display = mode === 'calendar' ? 'flex' : 'none';
      if (vStats) vStats.style.display = mode === 'stats' ? 'flex' : 'none';

      const activeBtn = mode === 'list' ? bList : (mode === 'calendar' ? bCal : bStats);
      if (activeBtn) {
        activeBtn.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
        activeBtn.style.color = '#fff';
        activeBtn.style.border = 'none';
        activeBtn.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.4)';
        activeBtn.classList.add('active');
      }

      if (mode === 'calendar') {
        renderTasksCalendar();
      } else {
        renderTasksProList();
      }
    }

    // =========================================================================
    // تصفية الفئات بكاروسيل التصنيفات الملونة
    // =========================================================================
    function setTasksCategoryFilter(cat) {
      currentTasksCategoryFilter = cat;
      const strip = document.getElementById('tasksCategoryPillsStrip');
      if (strip) {
        strip.querySelectorAll('.task-category-pill').forEach(btn => {
          if (btn.getAttribute('data-cat') === cat) {
            btn.classList.add('active');
            btn.style.background = 'linear-gradient(135deg, #a855f7, #6366f1)';
            btn.style.color = '#fff';
            btn.style.boxShadow = '0 2px 8px rgba(168,85,247,0.35)';
          } else {
            btn.classList.remove('active');
            btn.style.boxShadow = 'none';
            // Restore default color styles
            const bCat = btn.getAttribute('data-cat');
            if (bCat === 'shopping') {
              btn.style.background = 'rgba(16, 185, 129, 0.12)';
              btn.style.color = '#34d399';
            } else if (bCat === 'bills') {
              btn.style.background = 'rgba(245, 158, 11, 0.12)';
              btn.style.color = '#fbbf24';
            } else if (bCat === 'health') {
              btn.style.background = 'rgba(244, 63, 94, 0.12)';
              btn.style.color = '#f43f5e';
            } else if (bCat === 'home') {
              btn.style.background = 'rgba(56, 189, 248, 0.12)';
              btn.style.color = '#38bdf8';
            } else if (bCat === 'work') {
              btn.style.background = 'rgba(168, 85, 247, 0.12)';
              btn.style.color = '#c084fc';
            } else {
              btn.style.background = 'rgba(255, 255, 255, 0.08)';
              btn.style.color = '#94a3b8';
            }
          }
        });
      }
      renderTasksProList();
    }

    function switchTodoSection(sec) {
      currentDrawerTodoSection = sec;
      const tabs = ['my_day', 'important', 'planned', 'shopping', 'overdue', 'completed'];
      tabs.forEach(t => {
        const btnId = `btnFullTodo${t === 'my_day' ? 'MyDay' : (t === 'important' ? 'Important' : (t === 'planned' ? 'Planned' : (t === 'shopping' ? 'Shopping' : (t === 'overdue' ? 'Overdue' : 'Completed'))))}`;
        const btn = document.getElementById(btnId);
        if (btn) {
          if (t === sec) {
            btn.classList.add('active');
            btn.style.background = 'rgba(168, 85, 247, 0.25)';
            btn.style.color = '#c084fc';
            btn.style.border = '1.2px solid rgba(168, 85, 247, 0.45)';
          } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.border = '1px solid rgba(255,255,255,0.1)';
          }
        }
      });
      renderTasksProList();
    }

    function setTasksMemberFilter(mem, btn) {
      currentTasksMemberFilter = mem;
      const box = document.getElementById('tasksMemberFilterPills');
      if (box) {
        box.querySelectorAll('button').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
          b.style.border = '1px solid rgba(255,255,255,0.1)';
        });
      }
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'rgba(56, 189, 248, 0.2)';
        btn.style.color = '#38bdf8';
        btn.style.border = '1px solid rgba(56, 189, 248, 0.4)';
      }
      renderTasksProList();
    }

    // =========================================================================
    // آلية اختيار المواعيد والساعة السريعة مع حقل datetime-local
    // =========================================================================
    function setQuickTaskPreset(preset) {
      quickTaskDueDatePreset = preset;
      const chips = document.getElementById('quickTaskPresetChips');
      if (chips) {
        chips.querySelectorAll('.btn-quick-date-chip').forEach(c => {
          c.classList.remove('active');
          c.style.background = 'transparent';
          c.style.color = '#94a3b8';
          c.style.border = '1px solid rgba(255,255,255,0.1)';
        });
      }
      const activeChip = document.getElementById(
        preset === 'today' ? 'chipQuickToday' : 
        (preset === 'tomorrow' ? 'chipQuickTomorrow' : 
        (preset === 'weekend' ? 'chipQuickWeekend' : 'chipQuickNone'))
      );
      if (activeChip) {
        activeChip.classList.add('active');
        activeChip.style.background = 'rgba(168, 85, 247, 0.25)';
        activeChip.style.color = '#c084fc';
        activeChip.style.border = '1px solid rgba(168, 85, 247, 0.4)';
      }

      // ضبط القيمة في حقل الساعة واليوم المباشر
      const dtInp = document.getElementById('quickTaskDateTimeInput');
      if (dtInp) {
        const now = new Date();
        if (preset === 'today') {
          now.setHours(20, 0, 0, 0);
          dtInp.value = formatDateTimeLocalInput(now);
        } else if (preset === 'tomorrow') {
          now.setDate(now.getDate() + 1);
          now.setHours(10, 0, 0, 0);
          dtInp.value = formatDateTimeLocalInput(now);
        } else if (preset === 'weekend') {
          const dayOfWeek = now.getDay();
          const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
          now.setDate(now.getDate() + daysUntilFriday);
          now.setHours(18, 0, 0, 0);
          dtInp.value = formatDateTimeLocalInput(now);
        } else if (preset === 'none') {
          dtInp.value = '';
        }
      }
    }

    function onQuickTaskDateTimeChange(val) {
      if (val) {
        quickTaskDueDatePreset = 'custom';
        const chips = document.getElementById('quickTaskPresetChips');
        if (chips) {
          chips.querySelectorAll('.btn-quick-date-chip').forEach(c => {
            c.classList.remove('active');
            c.style.background = 'transparent';
            c.style.color = '#94a3b8';
            c.style.border = '1px solid rgba(255,255,255,0.1)';
          });
        }
      }
    }

    function formatDateTimeLocalInput(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${day}T${hh}:${mm}`;
    }

    function handleQuickTaskAdd() {
      const inp = document.getElementById('quickTaskTitleInput');
      const title = inp ? inp.value.trim() : '';
      if (!title) {
        showToast('⚠️ يرجى كتابة عنوان المهمة أولاً');
        if (inp) inp.focus();
        return;
      }

      const mem = document.getElementById('quickTaskMemberSelect')?.value || 'البيت';
      const prio = document.getElementById('quickTaskPrioritySelect')?.value || 'normal';
      const estAmt = parseFloat(document.getElementById('quickTaskEstAmount')?.value || 0) || null;
      const dtInp = document.getElementById('quickTaskDateTimeInput');

      let targetDate = '';
      let targetTime = '';

      if (dtInp && dtInp.value) {
        const parts = dtInp.value.split('T');
        targetDate = parts[0];
        targetTime = parts[1] || '';
      } else {
        const now = new Date();
        if (quickTaskDueDatePreset === 'today') {
          targetDate = getLocalDateStr(now);
          targetTime = '20:00';
        } else if (quickTaskDueDatePreset === 'tomorrow') {
          const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          targetDate = getLocalDateStr(tomorrow);
          targetTime = '10:00';
        } else if (quickTaskDueDatePreset === 'weekend') {
          const dayOfWeek = now.getDay();
          const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
          const nextFri = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFriday);
          targetDate = getLocalDateStr(nextFri);
          targetTime = '18:00';
        }
      }

      // تحديد التصنيف تلقائياً بناءً على الكلمات أو الفئة النشطة
      let tag = currentTasksCategoryFilter !== 'all' ? currentTasksCategoryFilter : 'home';
      const tLower = title.toLowerCase();
      if (tLower.includes('شراء') || tLower.includes('سوبرماركت') || tLower.includes('خضار') || tLower.includes('لحمة') || estAmt > 0) tag = 'shopping';
      else if (tLower.includes('فاتورة') || tLower.includes('قسط') || tLower.includes('نت') || tLower.includes('كهرباء') || tLower.includes('غاز')) tag = 'bills';
      else if (tLower.includes('دواء') || tLower.includes('علاج') || tLower.includes('دكتور') || tLower.includes('صيدلية')) tag = 'health';
      else if (tLower.includes('شغل') || tLower.includes('مكتب') || tLower.includes('عميل') || tLower.includes('مشروع')) tag = 'work';

      const newTask = {
        id: 'task_' + Date.now(),
        title: title,
        completed: false,
        dueDate: targetDate,
        dueTime: targetTime,
        priority: prio,
        tag: tag,
        assignedMember: mem,
        estimatedAmount: estAmt,
        isExpenseConverted: false,
        starred: prio === 'high',
        subtasks: [],
        createdAt: new Date().toISOString()
      };

      const tasks = getTodoTasks();
      tasks.unshift(newTask);
      saveTodoTasks(tasks);

      inp.value = '';
      if (dtInp) dtInp.value = '';
      const amtInp = document.getElementById('quickTaskEstAmount');
      if (amtInp) amtInp.value = '';

      showToast(`✅ تمت إضافة المهمة: ${title}`);

      if (currentTasksViewMode === 'calendar') {
        renderTasksCalendar();
      } else {
        renderTasksProList();
      }
    }

    // =========================================================================
    // محرك التقويم الشهري التفاعلي (Interactive Calendar Engine)
    // =========================================================================
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    function renderTasksCalendar() {
      const grid = document.getElementById('tasksCalendarGrid');
      const titleEl = document.getElementById('calendarMonthTitle');
      if (!grid) return;

      if (titleEl) {
        titleEl.textContent = `${arabicMonths[calendarCurrentMonth]} ${calendarCurrentYear}`;
      }

      grid.innerHTML = '';
      const tasks = getTodoTasks();

      // خريطة المهام حسب التاريخ لحساب النقاط الملونة
      const tasksByDate = {};
      tasks.forEach(t => {
        if (!t.dueDate) return;
        if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
        tasksByDate[t.dueDate].push(t);
      });

      const todayStr = getLocalDateStr(new Date());

      // أول يوم في الشهر وعدد الأيام
      const firstDayOfMonth = new Date(calendarCurrentYear, calendarCurrentMonth, 1);
      const lastDayOfMonth = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0);
      const totalDays = lastDayOfMonth.getDate();

      // ترتيب الأيام العربية (يبدأ بالسبت: السبت=6 في JS Day)
      // JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      const startDay = (firstDayOfMonth.getDay() + 1) % 7; // السبت = 0

      // خلايا فارغة قبل بداية الشهر
      for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.style.height = '42px';
        emptyCell.style.opacity = '0.15';
        grid.appendChild(emptyCell);
      }

      // رسم أيام الشهر
      for (let day = 1; day <= totalDays; day++) {
        const dStr = `${calendarCurrentYear}-${String(calendarCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTasks = tasksByDate[dStr] || [];

        const cell = document.createElement('div');
        const isToday = dStr === todayStr;
        const isSelected = dStr === calendarSelectedDate;

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

        cell.onclick = () => selectCalendarDay(dStr);

        // رقم اليوم
        const numSpan = document.createElement('span');
        numSpan.textContent = day;
        numSpan.style.cssText = `
          font-size: 0.76rem;
          font-weight: ${isToday || isSelected ? '900' : '700'};
          color: ${isSelected ? '#f8fafc' : (isToday ? '#38bdf8' : '#cbd5e1')};
          font-family: var(--font-numbers);
        `;
        cell.appendChild(numSpan);

        // نقاط المهام الملونة (Color Dots)
        if (dayTasks.length > 0) {
          const dotsRow = document.createElement('div');
          dotsRow.style.cssText = 'display: flex; gap: 2px; align-items: center; margin-top: 2px;';

          // عرض حتى 3 نقاط ملونة تدل على طبيعة المهام
          dayTasks.slice(0, 3).forEach(t => {
            const dot = document.createElement('span');
            let dotColor = '#38bdf8';
            if (t.completed) dotColor = '#10b981';
            else if (t.priority === 'high') dotColor = '#f43f5e';
            else if (t.tag === 'shopping') dotColor = '#34d399';
            else if (t.tag === 'bills') dotColor = '#fbbf24';

            dot.style.cssText = `width: 5px; height: 5px; border-radius: 50%; background: ${dotColor};`;
            dotsRow.appendChild(dot);
          });
          cell.appendChild(dotsRow);
        }

        grid.appendChild(cell);
      }

      // رسم قائمة مهام اليوم المختار
      selectCalendarDay(calendarSelectedDate || todayStr);
    }

    function selectCalendarDay(dateStr) {
      calendarSelectedDate = dateStr;
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
            <div style="margin-top: 6px;">
              <button type="button" onclick="setQuickTaskDirectDate('${dateStr}')" style="padding: 4px 10px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.4); cursor: pointer;">+ إضافة مهمة لهذا التاريخ</button>
            </div>
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
                ${t.estimatedAmount ? `<span style="color: #fbbf24; font-weight: 800;">${t.estimatedAmount} ج.م</span>` : ''}
              </div>
            </div>
          </div>
          <button type="button" onclick="deleteTaskItem('${t.id}')" style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; color: #f87171; width: 26px; height: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.72rem;"><i class="fa-solid fa-trash-can"></i></button>
        `;
        container.appendChild(item);
      });
    }

    function setQuickTaskDirectDate(dateStr) {
      calendarSelectedDate = dateStr;
      switchTasksViewMode('list');
      const dtInp = document.getElementById('quickTaskDateTimeInput');
      if (dtInp) {
        dtInp.value = `${dateStr}T12:00`;
        onQuickTaskDateTimeChange(dtInp.value);
      }
      const titleInp = document.getElementById('quickTaskTitleInput');
      if (titleInp) titleInp.focus();
    }

    function navigateTasksCalendar(delta) {
      calendarCurrentMonth += delta;
      if (calendarCurrentMonth < 0) {
        calendarCurrentMonth = 11;
        calendarCurrentYear--;
      } else if (calendarCurrentMonth > 11) {
        calendarCurrentMonth = 0;
        calendarCurrentYear++;
      }
      renderTasksCalendar();
    }

    function goToTasksCalendarToday() {
      const now = new Date();
      calendarCurrentYear = now.getFullYear();
      calendarCurrentMonth = now.getMonth();
      calendarSelectedDate = getLocalDateStr(now);
      renderTasksCalendar();
    }

    function toggleTaskCompleted(id) {
      const tasks = getTodoTasks();
      const t = tasks.find(x => x.id === id);
      if (t) {
        t.completed = !t.completed;
        saveTodoTasks(tasks);
        if (currentTasksViewMode === 'calendar') {
          renderTasksCalendar();
        } else {
          renderTasksProList();
        }
      }
    }

    function toggleTaskStarred(id) {
      const tasks = getTodoTasks();
      const t = tasks.find(x => x.id === id);
      if (t) {
        t.starred = !t.starred;
        saveTodoTasks(tasks);
        renderTasksProList();
      }
    }

    function deleteTaskItem(id) {
      let tasks = getTodoTasks();
      tasks = tasks.filter(x => x.id !== id);
      saveTodoTasks(tasks);
      showToast('🗑️ تم حذف المهمة');
      if (currentTasksViewMode === 'calendar') {
        renderTasksCalendar();
      } else {
        renderTasksProList();
      }
    }

    function convertTaskToExpense(id) {
      const tasks = getTodoTasks();
      const t = tasks.find(x => x.id === id);
      if (!t) return;

      const amt = Number(t.estimatedAmount) || 0;
      if (typeof openExpenseModalWithData === 'function') {
        openExpenseModalWithData({
          title: t.title,
          amount: amt,
          member: t.assignedMember || 'البيت',
          tag: t.tag || 'shopping'
        });
      } else {
        showToast(`💰 تحويل: ${t.title} بمبلغ ${amt} ج.م`);
      }
      t.completed = true;
      t.isExpenseConverted = true;
      saveTodoTasks(tasks);
      renderTasksProList();
    }

    function addSubtaskToTask(taskId) {
      const title = prompt('أدخل تفاصيل الخطوة الفرعية الجديدة:');
      if (!title || !title.trim()) return;
      const tasks = getTodoTasks();
      const t = tasks.find(x => x.id === taskId);
      if (t) {
        if (!t.subtasks) t.subtasks = [];
        t.subtasks.push({
          id: 'sub_' + Date.now(),
          title: title.trim(),
          completed: false
        });
        saveTodoTasks(tasks);
        renderTasksProList();
      }
    }

    function toggleSubtaskCompleted(taskId, subId) {
      const tasks = getTodoTasks();
      const t = tasks.find(x => x.id === taskId);
      if (t && t.subtasks) {
        const sub = t.subtasks.find(s => s.id === subId);
        if (sub) {
          sub.completed = !sub.completed;
          saveTodoTasks(tasks);
          renderTasksProList();
        }
      }
    }

    function deleteSubtaskItem(taskId, subId) {
      const tasks = getTodoTasks();
      const t = tasks.find(x => x.id === taskId);
      if (t && t.subtasks) {
        t.subtasks = t.subtasks.filter(s => s.id !== subId);
        saveTodoTasks(tasks);
        renderTasksProList();
      }
    }

    function setTaskDateTimePreset(preset, targetInputId = 'drawerNewTaskDateTimeInput') {
      const inp = document.getElementById(targetInputId);
      if (!inp) return;
      const now = new Date();
      if (preset === 'clear') {
        inp.value = '';
        if (targetInputId === 'quickTaskDateTimeInput') onQuickTaskDateTimeChange('');
        showToast('تم مسح موعد المهمة');
        return;
      }
      let targetDate = new Date(now.getTime());
      if (preset === 'today_evening') {
        targetDate.setHours(20, 0, 0, 0);
      } else if (preset === 'tomorrow_morning') {
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(10, 0, 0, 0);
      } else if (preset === 'after_two_days') {
        targetDate.setDate(targetDate.getDate() + 2);
        targetDate.setHours(12, 0, 0, 0);
      } else if (preset === 'weekend') {
        const dayOfWeek = now.getDay();
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
        targetDate.setDate(targetDate.getDate() + daysUntilFriday);
        targetDate.setHours(18, 0, 0, 0);
      }
      inp.value = formatDateTimeLocalInput(targetDate);
      if (targetInputId === 'quickTaskDateTimeInput') onQuickTaskDateTimeChange(inp.value);
    }
'''

content = content[:start_idx] + new_engine_code + '\n    ' + content[end_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Tasks Engine successfully upgraded in index.html!")
