import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Read full engine code
with open('scripts/tasks_engine_v524_code.js', 'w', encoding='utf-8') as f_out:
    f_out.write('''// =========================================================================
// TASKS, CALENDAR & DATE-TIME PICKER ENGINE (v5.2.4 Master Unified)
// =========================================================================

window.currentTasksViewMode = 'list';
window.calendarCurrentYear = new Date().getFullYear();
window.calendarCurrentMonth = new Date().getMonth();
window.calendarSelectedDate = new Date().toISOString().slice(0, 10);
window.currentTaskCategoryFilter = 'all';
window.currentTaskMemberFilter = 'all';
window.currentTaskSectionFilter = 'all';
window.currentQuickTaskPhoto = null;
window._activeQuickTaskDate = '';
window._activeQuickTaskTime = '10:00';

window.taskSelectedDateVal = '';
window.taskSelectedTimeVal = '10:00';

const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

function formatTimeReadable(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const isPm = h >= 12;
  const h12 = h % 12 || 12;
  return `${h12}:${m < 10 ? '0' + m : m} ${isPm ? 'مساءً' : 'صباحاً'}`;
}

function updateTaskDateTimeSummary() {
  const summaryEl = document.getElementById('taskDateTimeSummaryBadge');
  if (!summaryEl) return;
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);

  let dateName = window.taskSelectedDateVal || todayIso;
  if (window.taskSelectedDateVal === todayIso) dateName = 'اليوم';
  else if (window.taskSelectedDateVal === tomorrowIso) dateName = 'غداً';

  const timeText = formatTimeReadable(window.taskSelectedTimeVal);
  summaryEl.textContent = `الموعد: ${dateName} ${timeText ? '• الساعة ' + timeText : ''}`;
}

function openTaskDateTimePickerModal() {
  const modal = document.getElementById('taskDateTimePickerModal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.classList.add('open', 'active');
  modal.style.zIndex = '1000050';

  const dateInp = document.getElementById('taskCustomPickerDate');
  const timeInp = document.getElementById('taskCustomPickerTime');
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);

  if (!window.taskSelectedDateVal) window.taskSelectedDateVal = todayIso;
  if (dateInp) dateInp.value = window.taskSelectedDateVal;
  if (timeInp) timeInp.value = window.taskSelectedTimeVal || '10:00';

  updateTaskDateTimeSummary();
}

function closeTaskDateTimePickerModal() {
  const modal = document.getElementById('taskDateTimePickerModal');
  if (!modal) return;
  modal.classList.remove('open', 'active');
  modal.style.display = 'none';
}

function selectTaskDatePreset(preset, btn) {
  document.querySelectorAll('#taskModalDateChips .task-dt-chip').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = '#94a3b8';
    b.style.borderColor = 'rgba(255,255,255,0.12)';
  });
  if (btn) {
    btn.classList.add('active');
    btn.style.background = 'rgba(56, 189, 248, 0.22)';
    btn.style.color = '#38bdf8';
    btn.style.borderColor = 'rgba(56, 189, 248, 0.45)';
  }

  const now = new Date();
  let targetDate = new Date(now);

  if (preset === 'today') {
    // today
  } else if (preset === 'tomorrow') {
    targetDate.setDate(now.getDate() + 1);
  } else if (preset === 'after2days') {
    targetDate.setDate(now.getDate() + 2);
  } else if (preset === 'friday') {
    const day = now.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    targetDate.setDate(now.getDate() + diff);
  } else if (preset === 'nextweek') {
    targetDate.setDate(now.getDate() + 7);
  }

  window.taskSelectedDateVal = targetDate.toISOString().slice(0, 10);
  const dateInp = document.getElementById('taskCustomPickerDate');
  if (dateInp) dateInp.value = window.taskSelectedDateVal;

  updateTaskDateTimeSummary();
}

function onTaskCustomDateChange(val) {
  window.taskSelectedDateVal = val;
  document.querySelectorAll('#taskModalDateChips .task-dt-chip').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = '#94a3b8';
  });
  updateTaskDateTimeSummary();
}

function selectTaskTimePreset(timeStr, btn) {
  document.querySelectorAll('#taskModalTimeChips .task-time-chip').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = '#94a3b8';
    b.style.borderColor = 'rgba(255,255,255,0.12)';
  });
  if (btn) {
    btn.classList.add('active');
    btn.style.background = 'rgba(168, 85, 247, 0.22)';
    btn.style.color = '#c084fc';
    btn.style.borderColor = 'rgba(168, 85, 247, 0.45)';
  }

  window.taskSelectedTimeVal = timeStr;
  const timeInp = document.getElementById('taskCustomPickerTime');
  if (timeInp) timeInp.value = timeStr;

  updateTaskDateTimeSummary();
}

function onTaskCustomTimeChange(val) {
  window.taskSelectedTimeVal = val;
  document.querySelectorAll('#taskModalTimeChips .task-time-chip').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = '#94a3b8';
  });
  updateTaskDateTimeSummary();
}

function confirmTaskDateTimePicker() {
  const lbl = document.getElementById('lblQuickTaskDateTimeTrigger');
  const btn = document.getElementById('btnQuickTaskDateTimeTrigger');
  if (!window.taskSelectedDateVal) {
    window.taskSelectedDateVal = new Date().toISOString().slice(0, 10);
  }

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);

  let dateName = window.taskSelectedDateVal;
  if (window.taskSelectedDateVal === todayIso) dateName = 'اليوم';
  else if (window.taskSelectedDateVal === tomorrowIso) dateName = 'غداً';

  const timeText = formatTimeReadable(window.taskSelectedTimeVal);
  const fullLabel = `📅 ${dateName} ${timeText ? '(' + timeText + ')' : ''}`;

  if (lbl) lbl.textContent = fullLabel;
  if (btn) {
    btn.style.background = 'rgba(168, 85, 247, 0.35)';
    btn.style.borderColor = '#c084fc';
    btn.style.color = '#ffffff';
  }

  window._activeQuickTaskDate = window.taskSelectedDateVal;
  window._activeQuickTaskTime = window.taskSelectedTimeVal;

  closeTaskDateTimePickerModal();
  if (typeof showToast === 'function') showToast(`✅ تم تحديد موعد المهمة: ${fullLabel}`);
}

function clearTaskDateTimePicker() {
  window.taskSelectedDateVal = '';
  window.taskSelectedTimeVal = '';
  window._activeQuickTaskDate = '';
  window._activeQuickTaskTime = '';

  const lbl = document.getElementById('lblQuickTaskDateTimeTrigger');
  const btn = document.getElementById('btnQuickTaskDateTimeTrigger');
  if (lbl) lbl.textContent = '📅 تحديد التاريخ والساعة معاً';
  if (btn) {
    btn.style.background = 'rgba(168, 85, 247, 0.22)';
    btn.style.borderColor = 'rgba(168, 85, 247, 0.55)';
    btn.style.color = '#e9d5ff';
  }

  closeTaskDateTimePickerModal();
  if (typeof showToast === 'function') showToast('تم مسح موعد المهمة');
}

function getTodoTasks() {
  try {
    const raw = localStorage.getItem('family_monefy_tasks');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading tasks:', e);
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const sample = [
    {
      id: 'task_' + Date.now() + '_1',
      title: 'سداد فاتورة الكهرباء الشهرية',
      dueDate: todayStr,
      dueTime: '18:00',
      category: 'bills',
      assignedMember: 'ماهر',
      priority: 'high',
      completed: false,
      estimatedAmount: 350,
      createdAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub_1', title: 'فحص العداد ومطابقة القراءة', completed: true },
        { id: 'sub_2', title: 'الدفع عبر تطبيق البنك', completed: false }
      ]
    },
    {
      id: 'task_' + Date.now() + '_2',
      title: 'شراء مستلزمات البيت الأسبوعية',
      dueDate: todayStr,
      dueTime: '11:00',
      category: 'shopping',
      assignedMember: 'البيت',
      priority: 'medium',
      completed: false,
      estimatedAmount: 600,
      createdAt: new Date().toISOString(),
      subtasks: []
    }
  ];
  saveTodoTasks(sample);
  return sample;
}

function saveTodoTasks(tasks) {
  try {
    localStorage.setItem('family_monefy_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

function openTasksFullScreenModal() {
  const modal = document.getElementById('tasksFullScreenModal');
  if (modal) {
    modal.style.display = 'block';
    modal.style.opacity = '1';
    modal.style.zIndex = '100050';
    document.body.style.overflow = 'hidden';
  }
  switchTasksViewMode(window.currentTasksViewMode || 'list');
  renderTasksProList();
  updateTasksProductivityKPIs();
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
  window.currentTasksViewMode = mode;
  const btnList = document.getElementById('btnTaskTabList');
  const btnCal = document.getElementById('btnTaskTabCalendar');
  const viewList = document.getElementById('tasksTabListView');
  const viewCal = document.getElementById('tasksTabCalendarView');

  if (mode === 'calendar') {
    if (btnList) {
      btnList.classList.remove('active');
      btnList.style.background = 'transparent';
      btnList.style.color = '#94a3b8';
      btnList.style.boxShadow = 'none';
      btnList.style.border = '1px solid rgba(255, 255, 255, 0.08)';
    }
    if (btnCal) {
      btnCal.classList.add('active');
      btnCal.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
      btnCal.style.color = '#fff';
      btnCal.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.4)';
      btnCal.style.border = 'none';
    }
    if (viewList) viewList.style.display = 'none';
    if (viewCal) viewCal.style.display = 'flex';
    renderTasksCalendar();
  } else {
    if (btnList) {
      btnList.classList.add('active');
      btnList.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
      btnList.style.color = '#fff';
      btnList.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.4)';
      btnList.style.border = 'none';
    }
    if (btnCal) {
      btnCal.classList.remove('active');
      btnCal.style.background = 'transparent';
      btnCal.style.color = '#94a3b8';
      btnCal.style.boxShadow = 'none';
      btnCal.style.border = '1px solid rgba(255, 255, 255, 0.08)';
    }
    if (viewList) viewList.style.display = 'flex';
    if (viewCal) viewCal.style.display = 'none';
    renderTasksProList();
    updateTasksProductivityKPIs();
  }
}

function triggerTaskCameraOnly() {
  const inp = document.getElementById('quickTaskCameraInput');
  if (inp) {
    inp.click();
  }
}

function handleTaskCameraOnlyChosen(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const rawData = e.target.result;
    const img = new Image();
    img.onload = function() {
      const maxDim = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressedUri = canvas.toDataURL('image/jpeg', 0.72);
      window.currentQuickTaskPhoto = compressedUri;

      const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
      if (previewBar) {
        previewBar.style.display = 'flex';
        previewBar.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <img src="${compressedUri}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1.5px solid #a855f7;">
            <button type="button" onclick="clearTaskPendingPhoto()" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <span style="font-size: 0.72rem; color: #10b981; font-weight: 850;">تم التقاط الصورة ✓</span>
        `;
      }
    };
    img.src = rawData;
  };
  reader.readAsDataURL(file);
}

function clearTaskPendingPhoto() {
  window.currentQuickTaskPhoto = null;
  const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
  if (previewBar) {
    previewBar.style.display = 'none';
    previewBar.innerHTML = '';
  }
  const inp = document.getElementById('quickTaskCameraInput');
  if (inp) inp.value = '';
}

function handleQuickTaskAdd() {
  const titleInp = document.getElementById('quickTaskTitleInput');
  const title = titleInp ? titleInp.value.trim() : '';
  if (!title) {
    if (typeof showToast === 'function') showToast('يرجى إدخال عنوان المهمة أولاً');
    if (titleInp) titleInp.focus();
    return;
  }

  const now = new Date();
  const dueDate = window._activeQuickTaskDate || now.toISOString().slice(0, 10);
  const dueTime = window._activeQuickTaskTime || '';

  const newTask = {
    id: 'task_' + Date.now(),
    title: title,
    dueDate: dueDate,
    dueTime: dueTime,
    category: window.currentTaskCategoryFilter !== 'all' ? window.currentTaskCategoryFilter : 'general',
    assignedMember: window.currentTaskMemberFilter !== 'all' ? window.currentTaskMemberFilter : 'البيت',
    priority: 'medium',
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
  clearTaskDateTimePicker();

  renderTasksProList();
  updateTasksProductivityKPIs();
  if (typeof showToast === 'function') showToast('تمت إضافة المهمة بنجاح ✓');
}

function updateTasksProductivityKPIs() {
  const tasks = getTodoTasks();
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const elTotal = document.getElementById('pinnedTasksTotalCount');
  const elPending = document.getElementById('pinnedTasksPendingCount');
  const elDone = document.getElementById('pinnedTasksDoneCount');
  const elOverdue = document.getElementById('pinnedTasksOverdueCount');
  const elBadge = document.getElementById('pinnedTasksCompletionRateBadge');
  const elBar = document.getElementById('pinnedTasksProgressBar');

  if (elTotal) elTotal.textContent = total;
  if (elPending) elPending.textContent = pending;
  if (elDone) elDone.textContent = done;
  if (elOverdue) elOverdue.textContent = overdue;
  if (elBadge) elBadge.textContent = `${pct}%`;
  if (elBar) elBar.style.width = `${pct}%`;

  const catCounts = { all: total, shopping: 0, bills: 0, health: 0, home: 0, work: 0 };
  tasks.forEach(t => {
    if (catCounts[t.category] !== undefined) catCounts[t.category]++;
  });
  ['All', 'Shopping', 'Bills', 'Health', 'Home', 'Work'].forEach(c => {
    const el = document.getElementById('catBadge' + c);
    if (el) el.textContent = catCounts[c.toLowerCase()] || 0;
  });
}

function toggleTaskCompleted(taskId) {
  const tasks = getTodoTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTodoTasks(tasks);
    renderTasksProList();
    updateTasksProductivityKPIs();
    if (window.currentTasksViewMode === 'calendar') {
      renderTasksCalendar();
    }
  }
}

function deleteTaskItem(taskId) {
  let tasks = getTodoTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  saveTodoTasks(tasks);
  renderTasksProList();
  updateTasksProductivityKPIs();
  if (window.currentTasksViewMode === 'calendar') {
    renderTasksCalendar();
  }
  if (typeof showToast === 'function') showToast('تم حذف المهمة');
}

function toggleExpandTask(taskId) {
  const detailsWrap = document.getElementById('taskDetailsWrap_' + taskId);
  const icon = document.getElementById('taskExpandIcon_' + taskId);
  if (detailsWrap) {
    const isHidden = detailsWrap.style.display === 'none' || !detailsWrap.style.display;
    detailsWrap.style.display = isHidden ? 'flex' : 'none';
    if (icon) {
      icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }
}

function addNewSubtaskInline(taskId) {
  const inp = document.getElementById('newSubtaskInput_' + taskId);
  const title = inp ? inp.value.trim() : '';
  if (!title) return;

  const tasks = getTodoTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    if (!task.subtasks) task.subtasks = [];
    task.subtasks.push({
      id: 'sub_' + Date.now(),
      title: title,
      completed: false
    });
    saveTodoTasks(tasks);
    if (inp) inp.value = '';
    renderTasksProList();
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

function deleteSubtask(taskId, subId) {
  const tasks = getTodoTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task && task.subtasks) {
    task.subtasks = task.subtasks.filter(s => s.id !== subId);
    saveTodoTasks(tasks);
    renderTasksProList();
  }
}

function setTasksCategoryFilter(cat, btn) {
  window.currentTaskCategoryFilter = cat;
  const pills = document.querySelectorAll('.task-category-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-cat') === cat) {
      p.classList.add('active');
      p.style.background = 'linear-gradient(135deg, #a855f7, #6366f1)';
      p.style.color = '#fff';
      p.style.border = 'none';
      p.style.boxShadow = '0 2px 8px rgba(168,85,247,0.35)';
    } else {
      p.classList.remove('active');
      p.style.background = 'rgba(255,255,255,0.06)';
      p.style.color = '#94a3b8';
      p.style.border = '1px solid rgba(255,255,255,0.1)';
      p.style.boxShadow = 'none';
    }
  });
  renderTasksProList();
}

function setTasksMemberFilter(member, btn) {
  window.currentTaskMemberFilter = member;
  const pills = document.querySelectorAll('#tasksMemberFilterPills button');
  pills.forEach(p => {
    p.classList.remove('active');
    p.style.background = 'rgba(255,255,255,0.06)';
    p.style.color = '#94a3b8';
  });
  if (btn) {
    btn.classList.add('active');
    btn.style.background = 'linear-gradient(135deg, #a855f7, #6366f1)';
    btn.style.color = '#fff';
  }
  renderTasksProList();
}

function switchTodoSection(section, btn) {
  window.currentTaskSectionFilter = section;
  const pills = document.querySelectorAll('#tasksSmartListTabs button');
  pills.forEach(p => {
    p.classList.remove('active');
    p.style.background = 'rgba(255,255,255,0.06)';
    p.style.color = '#94a3b8';
  });
  if (btn) {
    btn.classList.add('active');
    btn.style.background = 'linear-gradient(135deg, #a855f7, #6366f1)';
    btn.style.color = '#fff';
  }
  renderTasksProList();
}

function renderTasksProList() {
  const container = document.getElementById('tasksFullScreenContainerList');
  if (!container) return;

  const searchInp = document.getElementById('tasksSearchInput');
  const query = searchInp ? searchInp.value.trim().toLowerCase() : '';

  let tasks = getTodoTasks();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Apply Section Filter
  if (window.currentTaskSectionFilter === 'my_day') {
    tasks = tasks.filter(t => t.dueDate === todayStr);
  } else if (window.currentTaskSectionFilter === 'important') {
    tasks = tasks.filter(t => t.priority === 'high');
  } else if (window.currentTaskSectionFilter === 'planned') {
    tasks = tasks.filter(t => !!t.dueDate);
  } else if (window.currentTaskSectionFilter === 'shopping') {
    tasks = tasks.filter(t => t.category === 'shopping');
  } else if (window.currentTaskSectionFilter === 'overdue') {
    tasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr);
  } else if (window.currentTaskSectionFilter === 'completed') {
    tasks = tasks.filter(t => t.completed);
  }

  // Apply Category Filter
  if (window.currentTaskCategoryFilter !== 'all') {
    tasks = tasks.filter(t => t.category === window.currentTaskCategoryFilter);
  }

  // Apply Member Filter
  if (window.currentTaskMemberFilter !== 'all') {
    tasks = tasks.filter(t => (t.assignedMember || 'البيت') === window.currentTaskMemberFilter);
  }

  // Apply Search
  if (query) {
    tasks = tasks.filter(t => {
      const matchTitle = (t.title || '').toLowerCase().includes(query);
      const matchSubs = (t.subtasks || []).some(s => (s.title || '').toLowerCase().includes(query));
      return matchTitle || matchSubs;
    });
  }

  if (tasks.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px dashed rgba(168, 85, 247, 0.35); border-radius: 14px; padding: 24px; text-align: center; color: #94a3b8;">
        <i class="fa-solid fa-clipboard-check" style="font-size: 2rem; color: #c084fc; opacity: 0.5; margin-bottom: 8px; display: block;"></i>
        <div style="font-size: 0.85rem; font-weight: 850; color: #f8fafc; margin-bottom: 4px;">لا توجد مهام تطابق هذا الفلتر</div>
        <div style="font-size: 0.72rem;">يمكنك كتابة مهمة جديدة في الحقل أعلاه والضغط على إضافة</div>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  tasks.forEach(t => {
    const isOverdue = !t.completed && t.dueDate && t.dueDate < todayStr;
    const isDueToday = t.dueDate === todayStr;
    const subtasks = t.subtasks || [];
    const doneSubs = subtasks.filter(s => s.completed).length;

    const card = document.createElement('div');
    card.style.cssText = `
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95));
      border: 1.2px solid ${t.completed ? 'rgba(16, 185, 129, 0.3)' : (isOverdue ? 'rgba(244, 63, 94, 0.45)' : 'rgba(168, 85, 247, 0.3)')};
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    `;

    // Compact Collapsed Header (shows title, check button, metadata badges, and expand button)
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer;" onclick="toggleExpandTask('${t.id}')">
        <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
          <button type="button" onclick="event.stopPropagation(); toggleTaskCompleted('${t.id}')" style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid ${t.completed ? '#10b981' : '#a855f7'}; background: ${t.completed ? '#10b981' : 'transparent'}; color: #fff; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;">
            ${t.completed ? '<i class="fa-solid fa-check"></i>' : ''}
          </button>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 0.85rem; font-weight: 850; color: ${t.completed ? '#64748b' : '#f8fafc'}; text-decoration: ${t.completed ? 'line-through' : 'none'}; word-break: break-word;">
              ${escapeHtml(t.title)}
            </div>
            <div style="font-size: 0.66rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-top: 1px; flex-wrap: wrap;">
              ${t.dueDate ? `<span style="color: ${isOverdue ? '#f43f5e' : (isDueToday ? '#38bdf8' : '#94a3b8')}; font-weight: 800;">📅 ${t.dueDate}</span>` : ''}
              ${t.dueTime ? `<span>⏰ ${t.dueTime}</span>` : ''}
              ${t.photo ? `<span style="color: #38bdf8; font-weight: 800;"><i class="fa-solid fa-image"></i> مرفق صورة</span>` : ''}
              ${subtasks.length > 0 ? `<span style="color: #34d399; font-weight: 800;">(${doneSubs}/${subtasks.length} خطوات)</span>` : ''}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          <button type="button" onclick="event.stopPropagation(); toggleExpandTask('${t.id}')" style="width: 28px; height: 28px; border-radius: 7px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; transition: transform 0.2s;">
            <i class="fa-solid fa-chevron-down" id="taskExpandIcon_${t.id}"></i>
          </button>
          <button type="button" onclick="event.stopPropagation(); deleteTaskItem('${t.id}')" style="width: 28px; height: 28px; border-radius: 7px; background: rgba(244,63,94,0.12); border: 1px solid rgba(244,63,94,0.3); color: #f43f5e; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.72rem;"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>

      <!-- Details Container (COLLAPSED BY DEFAULT: display: none) -->
      <div id="taskDetailsWrap_${t.id}" style="display: none; flex-direction: column; gap: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); margin-top: 4px;">
        ${t.photo ? `
          <div style="background: rgba(15, 23, 42, 0.6); padding: 8px; border-radius: 9px; border: 1px solid rgba(168,85,247,0.3);">
            <div style="font-size: 0.70rem; font-weight: 850; color: #c084fc; margin-bottom: 5px;"><i class="fa-solid fa-image"></i> الصورة المرفقة للمهمة (اضغط للتكبير):</div>
            <img src="${t.photo}" style="max-height: 140px; border-radius: 8px; border: 1.2px solid rgba(168,85,247,0.5); object-fit: cover; cursor: pointer; display: block;" onclick="if(typeof openReceiptLightbox==='function') openReceiptLightbox('${t.photo}', '${escapeHtml(t.title)}')">
          </div>
        ` : ''}

        <div style="display: flex; gap: 8px; align-items: center; font-size: 0.70rem; color: #94a3b8;">
          <span style="color: #c084fc;"><i class="fa-solid fa-user"></i> المسؤول: ${escapeHtml(t.assignedMember || 'البيت')}</span>
          ${t.estimatedAmount ? `<span style="color: #fbbf24; font-weight: 850;">💰 التكلفة المقدرة: ${t.estimatedAmount} ج.م</span>` : ''}
        </div>

        ${subtasks.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <div style="font-size: 0.70rem; font-weight: 850; color: #38bdf8;"><i class="fa-solid fa-list-check"></i> الخطوات الفرعية:</div>
            ${subtasks.map(s => `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(15, 23, 42, 0.6); padding: 5px 8px; border-radius: 7px;">
                <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
                  <button type="button" onclick="toggleSubtaskCompleted('${t.id}', '${s.id}')" style="width: 18px; height: 18px; border-radius: 50%; border: 1.2px solid ${s.completed ? '#10b981' : '#a855f7'}; background: ${s.completed ? '#10b981' : 'transparent'}; color: #fff; font-size: 0.60rem; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
                    ${s.completed ? '<i class="fa-solid fa-check"></i>' : ''}
                  </button>
                  <span style="font-size: 0.75rem; color: ${s.completed ? '#64748b' : '#cbd5e1'}; text-decoration: ${s.completed ? 'line-through' : 'none'};">${escapeHtml(s.title)}</span>
                </div>
                <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" style="background: transparent; border: none; color: #f87171; cursor: pointer; font-size: 0.70rem; padding: 2px;"><i class="fa-solid fa-xmark"></i></button>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="display: flex; gap: 4px; margin-top: 4px;">
          <input type="text" id="newSubtaskInput_${t.id}" placeholder="+ إضافة خطوة فرعية..." style="flex: 1; height: 28px; border-radius: 6px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 0.72rem; padding: 0 8px; outline: none;" onkeydown="if(event.key==='Enter') addNewSubtaskInline('${t.id}')">
          <button type="button" onclick="addNewSubtaskInline('${t.id}')" style="height: 28px; padding: 0 10px; border-radius: 6px; background: rgba(168,85,247,0.3); border: 1px solid rgba(168,85,247,0.5); color: #c084fc; font-size: 0.70rem; font-weight: 800; cursor: pointer;">إضافة</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function navigateTasksCalendar(delta) {
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
}

// Global Bindings for inline HTML handlers
window.openTasksFullScreenModal = openTasksFullScreenModal;
window.closeTasksFullScreenModal = closeTasksFullScreenModal;
window.openTasksModal = openTasksModal;
window.switchTasksViewMode = switchTasksViewMode;
window.triggerTaskCameraOnly = triggerTaskCameraOnly;
window.handleTaskCameraOnlyChosen = handleTaskCameraOnlyChosen;
window.clearTaskPendingPhoto = clearTaskPendingPhoto;
window.openTaskDateTimePickerModal = openTaskDateTimePickerModal;
window.closeTaskDateTimePickerModal = closeTaskDateTimePickerModal;
window.selectTaskDatePreset = selectTaskDatePreset;
window.onTaskCustomDateChange = onTaskCustomDateChange;
window.selectTaskTimePreset = selectTaskTimePreset;
window.onTaskCustomTimeChange = onTaskCustomTimeChange;
window.confirmTaskDateTimePicker = confirmTaskDateTimePicker;
window.clearTaskDateTimePicker = clearTaskDateTimePicker;
window.handleQuickTaskAdd = handleQuickTaskAdd;
window.getTodoTasks = getTodoTasks;
window.saveTodoTasks = saveTodoTasks;
window.toggleTaskCompleted = toggleTaskCompleted;
window.deleteTaskItem = deleteTaskItem;
window.toggleExpandTask = toggleExpandTask;
window.addNewSubtaskInline = addNewSubtaskInline;
window.toggleSubtaskCompleted = toggleSubtaskCompleted;
window.deleteSubtask = deleteSubtask;
window.setTasksCategoryFilter = setTasksCategoryFilter;
window.setTasksMemberFilter = setTasksMemberFilter;
window.switchTodoSection = switchTodoSection;
window.updateTasksProductivityKPIs = updateTasksProductivityKPIs;
window.renderTasksProList = renderTasksProList;
window.renderTasksCalendar = renderTasksCalendar;
window.navigateTasksCalendar = navigateTasksCalendar;
window.goToTasksCalendarToday = goToTasksCalendarToday;
window.selectTasksCalendarDay = selectTasksCalendarDay;
''')

print("Saved code to scripts/tasks_engine_v524_code.js")
