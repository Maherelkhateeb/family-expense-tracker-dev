#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete Tasks & Planner Overhaul:
1. Sticky Header: Prominent [ ✕ إغلاق ] button
2. Date Selection Fix: rock-solid date handling, keeps added tasks in view, interactive date editing
3. Primary Task with Collapsible Subtasks Accordion on click
4. Photo / Camera Capture & Upload for BOTH Primary Tasks and each individual Subtask
"""
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Tasks Header with Prominent Close Button
modal_header_start = text.find('id="tasksFullScreenModal"')
if modal_header_start != -1:
    old_header_pat = text.find('<header style="position: sticky;', modal_header_start)
    old_header_end = text.find('</header>', old_header_pat) + len('</header>')
    
    new_header = '''<header style="position: sticky; top: 0; z-index: 100; background: rgba(11, 19, 41, 0.96); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1.2px solid rgba(168, 85, 247, 0.35); padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      <!-- زر إغلاق صريح وبارز جداً للرجوع للرئيسية بلمسة واحدة -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" onclick="closeTasksFullScreenModal()" style="height: 36px; padding: 0 14px; border-radius: 9px; background: rgba(244, 63, 94, 0.18); border: 1.2px solid rgba(244, 63, 94, 0.45); color: #f43f5e; font-size: 0.82rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(244, 63, 94, 0.25); transition: all 0.2s;">
          <i class="fa-solid fa-xmark" style="font-size: 1rem;"></i>
          <span>إغلاق</span>
        </button>
        <div style="display: flex; align-items: center; gap: 7px;">
          <div style="width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #6366f1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.05rem; box-shadow: 0 3px 10px rgba(168, 85, 247, 0.35);">
            <i class="fa-solid fa-calendar-check"></i>
          </div>
          <div>
            <div style="font-size: 0.94rem; font-weight: 900; color: #f8fafc;">قائمة المهام والتخطيط اليومي</div>
          </div>
        </div>
      </div>

      <!-- شريط التبديل الثلاثي الرئيسي: المهام / التقويم / الإنتاجية -->
      <div style="display: flex; gap: 4px; background: rgba(15, 23, 42, 0.9); padding: 3px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <button type="button" id="btnTaskTabList" onclick="switchTasksViewMode('list')" class="btn-tasks-nav-tab active" style="padding: 5px 12px; border-radius: 8px; font-size: 0.74rem; font-weight: 900; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4); transition: all 0.2s;">
          <i class="fa-solid fa-list-check"></i> <span>المهام</span>
        </button>
        <button type="button" id="btnTaskTabCalendar" onclick="switchTasksViewMode('calendar')" class="btn-tasks-nav-tab" style="padding: 5px 12px; border-radius: 8px; font-size: 0.74rem; font-weight: 900; border: 1px solid rgba(255, 255, 255, 0.08); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; background: transparent; color: #94a3b8; transition: all 0.2s;">
          <i class="fa-solid fa-calendar-days"></i> <span>التقويم</span>
        </button>
        <button type="button" id="btnTaskTabStats" onclick="switchTasksViewMode('stats')" class="btn-tasks-nav-tab" style="padding: 5px 12px; border-radius: 8px; font-size: 0.74rem; font-weight: 900; border: 1px solid rgba(255, 255, 255, 0.08); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; background: transparent; color: #94a3b8; transition: all 0.2s;">
          <i class="fa-solid fa-chart-pie"></i> <span>الإنتاجية</span>
        </button>
      </div>

      <!-- مدخلات رفع الصور المخفية للمهام والمهام الفرعية -->
      <input type="file" id="primaryTaskPhotoFileInput" accept="image/*" capture="environment" style="display: none;" onchange="handlePrimaryTaskPhotoChosen(event)">
      <input type="file" id="subtaskPhotoFileInput" accept="image/*" capture="environment" style="display: none;" onchange="handleSubtaskPhotoChosen(event)">

      <div style="display: flex; align-items: center; gap: 6px;">
        <button type="button" onclick="openNewTaskDrawerModal()" style="height: 36px; padding: 0 14px; border-radius: 9px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.78rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.4);">
          <i class="fa-solid fa-circle-plus"></i>
          <span>+ مهمة مفصلة</span>
        </button>
      </div>
    </header>'''
    text = text[:old_header_pat] + new_header + text[old_header_end:]
    print("✓ Successfully replaced Tasks Header with prominent [ ✕ إغلاق ] button!")

# 2. Update Tasks JS Engine
# Locate start of Tasks JS Engine
js_start = text.find('let currentDrawerTodoSection = \'my_day\';')
if js_start == -1:
    js_start = text.find('let quickTaskDueDatePreset =')

js_end = text.find('function handleTaskPhotoUpload(', js_start)

print("Tasks JS bounds:", js_start, "to:", js_end)

new_tasks_js = '''let currentDrawerTodoSection = 'all'; // Default to 'all' so added tasks NEVER disappear!
    let currentTasksMemberFilter = 'all';
    let quickTaskDueDatePreset = 'today';
    let currentTasksViewMode = 'list'; // 'list' | 'calendar' | 'stats'
    let currentTasksCategoryFilter = 'all'; // 'all' | 'shopping' | 'bills' | 'health' | 'home' | 'work'
    let calendarCurrentYear = new Date().getFullYear();
    let calendarCurrentMonth = new Date().getMonth(); // 0-indexed
    let calendarSelectedDate = getLocalDateStr(new Date());

    window.expandedTaskAccordionId = null;
    window.currentPhotoTargetTaskId = null;
    window.currentPhotoTargetSubtaskId = null;

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
          photoUri: null,
          subtasks: [
            { id: 'sub_1_1', title: 'شراء فاكهة وخضار طازج', completed: true, photoUri: null },
            { id: 'sub_1_2', title: 'ألبان واجبان وبيض', completed: false, photoUri: null },
            { id: 'sub_1_3', title: 'منظفات وعناية شخصية', completed: false, photoUri: null }
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
          photoUri: null,
          subtasks: [
            { id: 'sub_2_1', title: 'دفع فاتورة وي WE إنترنت', completed: false, photoUri: null },
            { id: 'sub_2_2', title: 'شحن كارت الكهرباء الذكي', completed: false, photoUri: null }
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
          photoUri: null,
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

    function switchTasksViewMode(mode) {
      currentTasksViewMode = mode;
      ['List', 'Calendar', 'Stats'].forEach(m => {
        const btn = document.getElementById('btnTaskTab' + m);
        if (btn) {
          if (m.toLowerCase() === mode) {
            btn.classList.add('active');
            btn.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.4)';
          } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.border = '1px solid rgba(255,255,255,0.08)';
            btn.style.boxShadow = 'none';
          }
        }
      });

      const listContainer = document.getElementById('tasksTabListView');
      const calContainer = document.getElementById('tasksTabCalendarView');
      const statsContainer = document.getElementById('tasksTabStatsView');

      if (listContainer) listContainer.style.display = mode === 'list' ? 'block' : 'none';
      if (calContainer) calContainer.style.display = mode === 'calendar' ? 'block' : 'none';
      if (statsContainer) statsContainer.style.display = mode === 'stats' ? 'block' : 'none';

      if (mode === 'list') renderTasksProList();
      else if (mode === 'calendar') renderTasksCalendar();
      else if (mode === 'stats') renderTasksProList();
    }

    function setTasksCategoryFilter(cat) {
      currentTasksCategoryFilter = cat;
      const pills = ['All', 'Shopping', 'Bills', 'Health', 'Home', 'Work'];
      pills.forEach(p => {
        const el = document.getElementById('tasksCatPill' + p);
        if (el) {
          if (p.toLowerCase() === cat) {
            el.style.borderColor = '#c084fc';
            el.style.transform = 'scale(1.03)';
          } else {
            el.style.borderColor = 'rgba(255,255,255,0.1)';
            el.style.transform = 'none';
          }
        }
      });
      renderTasksProList();
    }

    function switchTodoSection(sec) {
      currentDrawerTodoSection = sec;
      const sections = ['my_day', 'important', 'planned', 'shopping', 'overdue', 'completed'];
      sections.forEach(s => {
        const btn = document.getElementById('btnTodoSec' + s.charAt(0).toUpperCase() + s.slice(1));
        if (btn) {
          if (s === sec) {
            btn.style.background = 'rgba(168, 85, 247, 0.25)';
            btn.style.color = '#c084fc';
            btn.style.borderColor = 'rgba(168, 85, 247, 0.4)';
          } else {
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.borderColor = 'rgba(255,255,255,0.08)';
          }
        }
      });
      renderTasksProList();
    }

    function setTasksMemberFilter(mem) {
      currentTasksMemberFilter = mem;
      const members = ['all', 'maher', 'aya', 'mohamed', 'maryam', 'home'];
      members.forEach(m => {
        const btn = document.getElementById('btnTaskMem' + m.charAt(0).toUpperCase() + m.slice(1));
        if (btn) {
          const isMatch = (m === 'all' && mem === 'all') || 
                          (m === 'maher' && mem === 'ماهر') ||
                          (m === 'aya' && (mem === 'آية' || mem === 'أية')) ||
                          (m === 'mohamed' && mem === 'محمد') ||
                          (m === 'maryam' && mem === 'مريم') ||
                          (m === 'home' && mem === 'البيت');
          if (isMatch) {
            btn.style.background = 'rgba(56, 189, 248, 0.25)';
            btn.style.color = '#38bdf8';
            btn.style.borderColor = 'rgba(56, 189, 248, 0.4)';
          } else {
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.borderColor = 'rgba(255,255,255,0.08)';
          }
        }
      });
      renderTasksProList();
    }

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
        if (typeof showToast === 'function') showToast('⚠️ يرجى كتابة عنوان المهمة أولاً');
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
        starred: false,
        photoUri: null,
        subtasks: []
      };

      const tasks = getTodoTasks();
      tasks.unshift(newTask);
      saveTodoTasks(tasks);

      if (inp) inp.value = '';
      const amtInp = document.getElementById('quickTaskEstAmount');
      if (amtInp) amtInp.value = '';

      // إبقاء المهمة مرئية فوراً دون أن تختفي
      currentDrawerTodoSection = 'all';
      renderTasksProList();

      if (typeof showToast === 'function') {
        showToast(`✨ تمت إضافة المهمة بنجاح: ${title}`);
      }
    }

    // =========================================================================
    // التوسيع والطي للمهام الأساسية والخطوات الفرعية (Accordion Engine)
    // =========================================================================
    function toggleExpandTask(taskId) {
      if (window.expandedTaskAccordionId === taskId) {
        window.expandedTaskAccordionId = null;
      } else {
        window.expandedTaskAccordionId = taskId;
      }
      renderTasksProList();
    }

    function toggleTaskCompleted(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        saveTodoTasks(tasks);
        renderTasksProList();
        if (typeof showToast === 'function') {
          showToast(task.completed ? '🎉 أحسنت! تم إنجاز المهمة' : 'تم استرجاع المهمة لقيد التنفيذ');
        }
      }
    }

    function toggleSubtaskCompleted(taskId, subId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        const sub = task.subtasks.find(s => s.id === subId);
        if (sub) {
          sub.completed = !sub.completed;
          saveTodoTasks(tasks);
          renderTasksProList();
        }
      }
    }

    function addNewSubtaskInline(taskId) {
      const inp = document.getElementById(`subtaskInlineInp_${taskId}`);
      const val = inp ? inp.value.trim() : '';
      if (!val) return;

      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        if (!task.subtasks) task.subtasks = [];
        task.subtasks.push({
          id: 'sub_' + Date.now(),
          title: val,
          completed: false,
          photoUri: null
        });
        saveTodoTasks(tasks);
        if (inp) inp.value = '';
        renderTasksProList();
      }
    }

    function deleteSubtask(taskId, subId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        task.subtasks = task.subtasks.filter(s => s.id !== subId);
        saveTodoTasks(tasks);
        renderTasksProList();
      }
    }

    function deleteTaskItem(taskId) {
      if (!confirm('هل أنت متأكد من حذف هذه المهمة بالكامل؟')) return;
      let tasks = getTodoTasks();
      tasks = tasks.filter(t => t.id !== taskId);
      saveTodoTasks(tasks);
      renderTasksProList();
      if (typeof showToast === 'function') showToast('🗑️ تم حذف المهمة');
    }

    // =========================================================================
    // محرك رفع وتصوير الصور للمهام والخطوات الفرعية (Camera & Photo Upload Engine)
    // =========================================================================
    function triggerTaskPhotoUpload(taskId) {
      window.currentPhotoTargetTaskId = taskId;
      const fileInp = document.getElementById('primaryTaskPhotoFileInput');
      if (fileInp) fileInp.click();
    }

    function triggerSubtaskPhotoUpload(taskId, subtaskId) {
      window.currentPhotoTargetTaskId = taskId;
      window.currentPhotoTargetSubtaskId = subtaskId;
      const fileInp = document.getElementById('subtaskPhotoFileInput');
      if (fileInp) fileInp.click();
    }

    function handlePrimaryTaskPhotoChosen(e) {
      const file = e.target.files && e.target.files[0];
      if (!file || !window.currentPhotoTargetTaskId) return;

      compressAndSaveImage(file, (dataUri) => {
        const tasks = getTodoTasks();
        const task = tasks.find(t => t.id === window.currentPhotoTargetTaskId);
        if (task) {
          task.photoUri = dataUri;
          saveTodoTasks(tasks);
          renderTasksProList();
          if (typeof showToast === 'function') showToast('📷 تم حفظ وإرفاق صورة المهمة بنجاح');
        }
      });
      e.target.value = '';
    }

    function handleSubtaskPhotoChosen(e) {
      const file = e.target.files && e.target.files[0];
      if (!file || !window.currentPhotoTargetTaskId || !window.currentPhotoTargetSubtaskId) return;

      compressAndSaveImage(file, (dataUri) => {
        const tasks = getTodoTasks();
        const task = tasks.find(t => t.id === window.currentPhotoTargetTaskId);
        if (task && task.subtasks) {
          const sub = task.subtasks.find(s => s.id === window.currentPhotoTargetSubtaskId);
          if (sub) {
            sub.photoUri = dataUri;
            saveTodoTasks(tasks);
            renderTasksProList();
            if (typeof showToast === 'function') showToast('📷 تم حفظ وإرفاق صورة الخطوة الفرعية');
          }
        }
      });
      e.target.value = '';
    }

    function removeTaskPhoto(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.photoUri = null;
        saveTodoTasks(tasks);
        renderTasksProList();
      }
    }

    function removeSubtaskPhoto(taskId, subId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        const sub = task.subtasks.find(s => s.id === subId);
        if (sub) {
          sub.photoUri = null;
          saveTodoTasks(tasks);
          renderTasksProList();
        }
      }
    }

    function compressAndSaveImage(file, callback) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUri = canvas.toDataURL('image/jpeg', 0.75);
          callback(dataUri);
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }

    // =========================================================================
    // عرض لائحة المهام الأساسية مع الخطوات الفرعية المنسدلة (renderTasksProList)
    // =========================================================================
    function renderTasksProList() {
      const container = document.getElementById('tasksFullScreenContainerList');
      if (!container) return;

      const allTasks = getTodoTasks();
      const now = new Date();
      const todayStr = getLocalDateStr(now);

      const totalCount = allTasks.length;
      const activeCount = allTasks.filter(t => !t.completed).length;
      const completedCount = allTasks.filter(t => t.completed).length;
      const overdueCount = allTasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

      // تحديث عدادات الفئات
      const bAll = document.getElementById('catBadgeAll');
      const bShop = document.getElementById('catBadgeShopping');
      const bBills = document.getElementById('catBadgeBills');
      const bHealth = document.getElementById('catBadgeHealth');
      const bHome = document.getElementById('catBadgeHome');
      const bWork = document.getElementById('catBadgeWork');

      if (bAll) bAll.textContent = allTasks.filter(t => !t.completed).length;
      if (bShop) bShop.textContent = allTasks.filter(t => !t.completed && t.tag === 'shopping').length;
      if (bBills) bBills.textContent = allTasks.filter(t => !t.completed && (t.tag === 'bills' || t.tag === 'commitments')).length;
      if (bHealth) bHealth.textContent = allTasks.filter(t => !t.completed && t.tag === 'health').length;
      if (bHome) bHome.textContent = allTasks.filter(t => !t.completed && t.tag === 'home').length;
      if (bWork) bWork.textContent = allTasks.filter(t => !t.completed && t.tag === 'work').length;

      // تحديث مؤشرات الإنتاجية
      const bProg = document.getElementById('tasksOverallProgressBarFull');
      const pProg = document.getElementById('tasksOverallProgressPctFull');
      const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      if (bProg) bProg.style.width = overallPct + '%';
      if (pProg) pProg.textContent = overallPct + '%';

      // تطبيق الفلاتر
      let filtered = allTasks;
      if (currentTasksCategoryFilter !== 'all') {
        filtered = filtered.filter(t => t.tag === currentTasksCategoryFilter);
      }
      if (currentTasksMemberFilter !== 'all') {
        filtered = filtered.filter(t => (t.assignedMember || 'البيت') === currentTasksMemberFilter);
      }

      if (currentDrawerTodoSection === 'my_day') {
        filtered = filtered.filter(t => !t.completed && (t.dueDate === todayStr || !t.dueDate));
      } else if (currentDrawerTodoSection === 'important') {
        filtered = filtered.filter(t => !t.completed && (t.starred || t.priority === 'high'));
      } else if (currentDrawerTodoSection === 'planned') {
        filtered = filtered.filter(t => !t.completed && t.dueDate && t.dueDate > todayStr);
      } else if (currentDrawerTodoSection === 'shopping') {
        filtered = filtered.filter(t => !t.completed && t.tag === 'shopping');
      } else if (currentDrawerTodoSection === 'overdue') {
        filtered = filtered.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr);
      } else if (currentDrawerTodoSection === 'completed') {
        filtered = filtered.filter(t => t.completed);
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 35px 15px; color: #64748b; font-size: 0.82rem; background: rgba(15, 23, 42, 0.4); border-radius: 14px; border: 1px dashed rgba(255,255,255,0.1);">
            <i class="fa-solid fa-clipboard-check" style="font-size: 2.2rem; color: #a855f7; opacity: 0.5; margin-bottom: 8px; display: block;"></i>
            لا توجد مهام مطابقة للفلتر المحدد.
          </div>
        `;
        return;
      }

      const catBadges = {
        shopping: { label: 'مشتريات', color: '#10b981', icon: 'fa-cart-shopping' },
        bills: { label: 'فواتير والتزامات', color: '#f59e0b', icon: 'fa-bolt' },
        health: { label: 'صحة وعلاج', color: '#f43f5e', icon: 'fa-pills' },
        home: { label: 'المنزل والأسرة', color: '#38bdf8', icon: 'fa-house' },
        work: { label: 'العمل', color: '#a855f7', icon: 'fa-briefcase' }
      };

      container.innerHTML = filtered.map(t => {
        const isExp = (window.expandedTaskAccordionId === t.id);
        const subtasks = t.subtasks || [];
        const completedSubs = subtasks.filter(s => s.completed).length;
        const catInfo = catBadges[t.tag] || { label: 'عام', color: '#94a3b8', icon: 'fa-check' };

        return `
          <div class="task-pro-card-lux" style="background: ${isExp ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.75)'}; border: 1px solid ${isExp ? '#c084fc' : (t.completed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)')}; border-radius: 13px; padding: 12px; margin-bottom: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.3); transition: all 0.2s ease;">
            
            <!-- المهمة الأساسية: دائرة الإنجاز، العنوان، الموعد، وشارة الخطوات -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; cursor: pointer;" onclick="toggleExpandTask('${t.id}')">
              
              <!-- خانة الإنجاز والعنوان -->
              <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1;">
                <button type="button" onclick="event.stopPropagation(); toggleTaskCompleted('${t.id}')" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${t.completed ? '#10b981' : '#a855f7'}; background: ${t.completed ? '#10b981' : 'transparent'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; cursor: pointer; flex-shrink: 0; margin-top: 1px;">
                  ${t.completed ? '<i class="fa-solid fa-check"></i>' : ''}
                </button>
                <div style="flex: 1;">
                  <div style="font-size: 0.90rem; font-weight: 850; color: ${t.completed ? '#64748b' : '#f8fafc'}; text-decoration: ${t.completed ? 'line-through' : 'none'}; line-height: 1.4;">
                    ${escapeHtml(t.title)}
                  </div>

                  <!-- شارات المهمة الأساسية -->
                  <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 5px;">
                    <span style="font-size: 0.65rem; background: ${catInfo.color}22; color: ${catInfo.color}; border: 1px solid ${catInfo.color}44; padding: 2px 7px; border-radius: 6px; font-weight: 800;">
                      <i class="fa-solid ${catInfo.icon}"></i> ${catInfo.label}
                    </span>
                    <span style="font-size: 0.65rem; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25); padding: 2px 7px; border-radius: 6px; font-weight: 800;">
                      👤 ${escapeHtml(t.assignedMember || 'البيت')}
                    </span>
                    ${t.dueDate ? `
                      <span style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25); padding: 2px 7px; border-radius: 6px; font-weight: 800;">
                        📅 ${t.dueDate === todayStr ? 'اليوم ' + (t.dueTime || '') : t.dueDate}
                      </span>
                    ` : ''}
                    ${t.estimatedAmount ? `
                      <span style="font-size: 0.65rem; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 7px; border-radius: 6px; font-weight: 900;">
                        💰 ${t.estimatedAmount} ج.م
                      </span>
                    ` : ''}
                    ${t.photoUri ? `
                      <span onclick="event.stopPropagation(); openReceiptLightbox('${t.photoUri}', 'صورة المهمة: ${escapeHtml(t.title)}')" style="font-size: 0.65rem; background: rgba(236, 72, 153, 0.18); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.35); padding: 2px 7px; border-radius: 6px; font-weight: 800; cursor: pointer;">
                        📷 صورة مرفقة
                      </span>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- شارة عدد الخطوات الفرعية وسهم التوسيع -->
              <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                ${subtasks.length > 0 ? `
                  <span style="font-size: 0.68rem; background: rgba(168, 85, 247, 0.18); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35); padding: 3px 8px; border-radius: 8px; font-weight: 850;">
                    📋 ${completedSubs}/${subtasks.length}
                  </span>
                ` : ''}
                <span style="font-size: 0.85rem; color: #a855f7; padding: 4px;">
                  <i class="fa-solid ${isExp ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
                </span>
              </div>

            </div>

            <!-- قسم المهام الفرعية والخيارات التابعة (ينفتح فقط عند النقر على المهمة الأساسية) -->
            ${isExp ? `
              <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.12); animation: fadeIn 0.2s ease;">
                
                <!-- قائمة الخطوات الفرعية -->
                <div style="font-size: 0.76rem; font-weight: 900; color: #c084fc; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
                  <span><i class="fa-solid fa-list-check"></i> الخطوات الفرعية التابعة:</span>
                  <span style="font-size: 0.68rem; color: #94a3b8;">${completedSubs} من ${subtasks.length} مكتملة</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 8px;">
                  ${subtasks.map(s => `
                    <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px 10px;">
                      <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                        <input type="checkbox" ${s.completed ? 'checked' : ''} onchange="toggleSubtaskCompleted('${t.id}', '${s.id}')" style="accent-color: #a855f7; cursor: pointer; width: 16px; height: 16px;">
                        <span style="font-size: 0.76rem; color: ${s.completed ? '#64748b' : '#f1f5f9'}; text-decoration: ${s.completed ? 'line-through' : 'none'};">${escapeHtml(s.title)}</span>
                      </div>
                      
                      <!-- زر ورمز الكاميرا الخاص بالخطوة الفرعية -->
                      <div style="display: flex; align-items: center; gap: 6px;">
                        ${s.photoUri ? `
                          <img src="${s.photoUri}" onclick="openReceiptLightbox('${s.photoUri}', 'خطوة: ${escapeHtml(s.title)}')" style="width: 24px; height: 24px; border-radius: 6px; object-fit: cover; border: 1px solid #38bdf8; cursor: pointer;" title="انقر لتكبير صورة الخطوة">
                          <button type="button" onclick="removeSubtaskPhoto('${t.id}', '${s.id}')" style="background: none; border: none; color: #f87171; font-size: 0.70rem; cursor: pointer;" title="حذف صورة الخطوة">&times;</button>
                        ` : `
                          <button type="button" onclick="triggerSubtaskPhotoUpload('${t.id}', '${s.id}')" style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 6px; color: #c084fc; font-size: 0.65rem; padding: 2px 6px; cursor: pointer; display: flex; align-items: center; gap: 3px;" title="تصوير أو إرفاق صورة لهذه الخطوة">
                            <i class="fa-solid fa-camera"></i> <span>صورة</span>
                          </button>
                        `}
                        <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" style="background: none; border: none; color: #94a3b8; font-size: 0.85rem; cursor: pointer; padding: 0 4px;" title="حذف الخطوة">&times;</button>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- حقل إضافة خطوة فرعية سريعة -->
                <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                  <input type="text" id="subtaskInlineInp_${t.id}" placeholder="+ أضف خطوة فرعية واضغط إضافة..." style="flex: 1; height: 32px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.12); color: #fff; font-size: 0.75rem; padding: 0 10px; outline: none;" onkeydown="if(event.key==='Enter') addNewSubtaskInline('${t.id}')">
                  <button type="button" onclick="addNewSubtaskInline('${t.id}')" style="height: 32px; padding: 0 12px; border-radius: 8px; background: rgba(168, 85, 247, 0.25); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc; font-size: 0.72rem; font-weight: 850; cursor: pointer;">إضافة</button>
                </div>

                <!-- شريط إجراءات المهمة الأساسية -->
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <!-- زر تصوير/رفع صورة للمهمة الأساسية -->
                    <button type="button" onclick="triggerTaskPhotoUpload('${t.id}')" style="padding: 5px 10px; border-radius: 7px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                      <i class="fa-solid fa-camera"></i>
                      <span>${t.photoUri ? 'تغيير صورة المهمة' : 'تصوير/إرفاق صورة'}</span>
                    </button>
                    ${t.photoUri ? `
                      <button type="button" onclick="openReceiptLightbox('${t.photoUri}', 'صورة: ${escapeHtml(t.title)}')" style="padding: 5px 8px; border-radius: 7px; background: rgba(236, 72, 153, 0.18); border: 1px solid rgba(236, 72, 153, 0.35); color: #f472b6; font-size: 0.72rem; font-weight: 850; cursor: pointer;">
                        <i class="fa-solid fa-eye"></i> معاينة
                      </button>
                      <button type="button" onclick="removeTaskPhoto('${t.id}')" style="padding: 5px 8px; border-radius: 7px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; font-size: 0.72rem; cursor: pointer;" title="حذف الصورة">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    ` : ''}
                  </div>

                  <div style="display: flex; align-items: center; gap: 6px;">
                    ${t.estimatedAmount && !t.isExpenseConverted ? `
                      <button type="button" onclick="convertTaskToExpense('${t.id}')" style="padding: 5px 12px; border-radius: 7px; background: linear-gradient(135deg, #059669, #047857); border: none; color: #fff; font-size: 0.72rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-wallet"></i>
                        <span>تحويل لمصروف (${t.estimatedAmount} ج.م)</span>
                      </button>
                    ` : ''}
                    <button type="button" onclick="deleteTaskItem('${t.id}')" style="padding: 5px 9px; border-radius: 7px; background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                      <i class="fa-solid fa-trash-can"></i>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

              </div>
            ` : ''}

          </div>
        `;
      }).join('');
    }'''

text = text[:js_start] + new_tasks_js + '\n\n    ' + text[js_end:]
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("✓ Successfully upgraded Tasks Engine with close button, collapsible subtasks, and camera capture for both primary and subtasks!")
