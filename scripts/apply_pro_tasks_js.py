import re

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new Tasks JS engine
new_tasks_js = '''    // =========================================================================
    // نظام المهام الذكية الاحترافي المتكامل (Tasks Pro Engine)
    // =========================================================================
    let currentDrawerTodoSection = 'my_day';
    window.currentPendingTaskPhotoUri = null;
    window.pendingSubtaskPhotos = window.pendingSubtaskPhotos || {};

    // اختصارات التاريخ والوقت الذكية الموحدة بنقرة زر
    function setTaskDateTimePreset(preset, targetInputId = 'drawerNewTaskDateTimeInput') {
      const inp = document.getElementById(targetInputId);
      if (!inp) return;

      const now = new Date();
      if (preset === 'clear') {
        inp.value = '';
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
        // الجمعة القادمة الساعة 5 مساءً
        const day = targetDate.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        targetDate.setDate(targetDate.getDate() + diff);
        targetDate.setHours(17, 0, 0, 0);
      }

      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const hh = String(targetDate.getHours()).padStart(2, '0');
      const min = String(targetDate.getMinutes()).padStart(2, '0');

      inp.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      showToast(`⏰ تم ضبط الموعد: ${formatArabicDateTime(inp.value)}`);
    }

    function formatArabicDateTime(dtStr) {
      if (!dtStr) return '';
      try {
        const parts = dtStr.split('T');
        const dParts = parts[0].split('-');
        const year = dParts[0];
        const month = parseInt(dParts[1], 10);
        const day = parseInt(dParts[2], 10);
        
        const monthNames = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        const mName = monthNames[month] || dParts[1];

        let timeStr = '';
        if (parts[1]) {
          const tParts = parts[1].split(':');
          let hours = parseInt(tParts[0], 10);
          const minutes = tParts[1] || '00';
          const period = hours >= 12 ? 'م' : 'ص';
          hours = hours % 12 || 12;
          timeStr = ` - ${hours}:${minutes} ${period}`;
        }
        return `${day} ${mName}${timeStr}`;
      } catch(e) {
        return dtStr;
      }
    }

    function switchDrawerTodoSection(sec) {
      currentDrawerTodoSection = sec;
      const tabs = ['my_day', 'important', 'planned', 'overdue', 'all', 'completed'];
      tabs.forEach(t => {
        const btnId = 'btnDrawerTodo' + (t === 'my_day' ? 'MyDay' : (t === 'important' ? 'Important' : (t === 'planned' ? 'Planned' : (t === 'overdue' ? 'Overdue' : (t === 'all' ? 'All' : 'Completed')))));
        const btn = document.getElementById(btnId);
        if (btn) {
          if (t === sec) {
            btn.className = 'exp-tab-btn active';
            btn.style.background = (sec === 'overdue') ? 'rgba(239, 68, 68, 0.25)' : 'rgba(168, 85, 247, 0.25)';
            btn.style.color = (sec === 'overdue') ? '#f87171' : '#c084fc';
            btn.style.border = 'none';
          } else {
            btn.className = 'exp-tab-btn';
            btn.style.background = 'transparent';
            btn.style.color = (t === 'overdue') ? '#ef4444' : '#94a3b8';
            btn.style.border = (t === 'overdue') ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.1)';
          }
        }
      });
      renderDrawerTasksList();
    }

    function handleTaskPhotoUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const maxDim = 900;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          currentPendingTaskPhotoUri = canvas.toDataURL('image/jpeg', 0.80);
          
          const preview = document.getElementById('taskPendingPhotoPreview');
          const previewImg = document.getElementById('taskPendingPhotoImg');
          if (preview) preview.style.display = 'block';
          if (previewImg) previewImg.src = currentPendingTaskPhotoUri;
          showToast('📸 تم إرفاق صورة للمهمة بنجاح');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function clearTaskPendingPhoto() {
      currentPendingTaskPhotoUri = null;
      const preview = document.getElementById('taskPendingPhotoPreview');
      const previewImg = document.getElementById('taskPendingPhotoImg');
      if (preview) preview.style.display = 'none';
      if (previewImg) previewImg.src = '';
    }

    function handleDrawerAddNewTask() {
      const titleInp = document.getElementById('drawerNewTaskTitleInput');
      const dtInp = document.getElementById('drawerNewTaskDateTimeInput');
      const prioritySel = document.getElementById('drawerNewTaskPriority');
      const tagSel = document.getElementById('drawerNewTaskTag');

      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) {
        showToast('⚠️ يرجى كتابة عنوان أو بيان المهمة');
        if (titleInp) titleInp.focus();
        return;
      }

      const dtVal = dtInp ? dtInp.value : '';
      let dueDate = '', dueTime = '';
      if (dtVal) {
        const parts = dtVal.split('T');
        dueDate = parts[0] || '';
        dueTime = parts[1] ? parts[1].slice(0, 5) : '';
      }

      const priority = prioritySel ? prioritySel.value : 'normal';
      const tag = tagSel ? tagSel.value : 'general';

      const tasks = getTodoTasks();
      const newTask = {
        id: 'task-' + Date.now(),
        title: title,
        dueDateTime: dtVal,
        dueDate: dueDate,
        dueTime: dueTime,
        priority: priority,
        tag: tag,
        completed: false,
        starred: (currentDrawerTodoSection === 'important' || priority === 'high'),
        photo: currentPendingTaskPhotoUri || null,
        subtasks: [],
        reminderFired: false,
        createdAt: new Date().toISOString(),
        author: state.currentUser || 'ماهر'
      };

      tasks.unshift(newTask);
      saveTodoTasks(tasks);

      if (titleInp) titleInp.value = '';
      if (dtInp) dtInp.value = '';
      clearTaskPendingPhoto();
      playNotificationChime();
      renderDrawerTasksList();
      showToast('✨ تمت إضافة المهمة والموعد بنجاح!');
    }

    function handleSubtaskPhotoPicked(event, taskId) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          const maxDim = 800;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          window.pendingSubtaskPhotos[taskId] = canvas.toDataURL('image/jpeg', 0.80);
          
          const badge = document.getElementById(`subtaskPhotoBadge_${taskId}`);
          if (badge) badge.style.display = 'inline';
          showToast('📷 تم إرفاق صورة للمهمة الفرعية');
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }

    function toggleSubtaskCompleted(taskId, subtaskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        const sub = task.subtasks.find(s => s.id === subtaskId);
        if (sub) {
          sub.completed = !sub.completed;
          saveTodoTasks(tasks);
          playNotificationChime();
          renderDrawerTasksList();
          showToast(sub.completed ? '✓ اكتملت المهمة الفرعية' : 'تمت إعادة فتح المهمة الفرعية');
        }
      }
    }

    function addSubtaskToTask(taskId) {
      const titleInp = document.getElementById(`inpSubtaskTitle_${taskId}`);
      const dtInp = document.getElementById(`inpSubtaskDateTime_${taskId}`);
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) {
        showToast('⚠️ يرجى كتابة عنوان المهمة الفرعية');
        if (titleInp) titleInp.focus();
        return;
      }

      const dtVal = dtInp ? dtInp.value : '';
      let dueDate = '', dueTime = '';
      if (dtVal) {
        const parts = dtVal.split('T');
        dueDate = parts[0] || '';
        dueTime = parts[1] ? parts[1].slice(0, 5) : '';
      }

      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        if (!task.subtasks) task.subtasks = [];
        const photo = (window.pendingSubtaskPhotos && window.pendingSubtaskPhotos[taskId]) || null;
        task.subtasks.push({
          id: 'sub-' + Date.now(),
          title: title,
          dueDateTime: dtVal,
          dueDate: dueDate,
          dueTime: dueTime,
          photo: photo,
          completed: false,
          reminderFired: false
        });
        if (window.pendingSubtaskPhotos) delete window.pendingSubtaskPhotos[taskId];
        saveTodoTasks(tasks);
        renderDrawerTasksList();
        showToast('✓ تمت إضافة المهمة الفرعية بنجاح');
      }
    }

    function deleteSubtask(taskId, subtaskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
        saveTodoTasks(tasks);
        renderDrawerTasksList();
        showToast('🗑️ تم حذف المهمة الفرعية');
      }
    }

    // تحويل المهمة إلى مصروف أو التزام مالي بلمسة واحدة
    function convertTaskToExpense(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      closeSummaryLeftDrawer();
      
      // فتح نافذة المعاملة وتجهيز البيان
      setTimeout(() => {
        openTxModal('expense');
        const descInp = document.getElementById('txDescription') || document.getElementById('expenseDescInput');
        if (descInp) {
          descInp.value = task.title;
        }
        showToast(`💡 تم تجهيز تسجيل مصروف للمهمة: ${task.title}`);
      }, 200);
    }

    // تعديل المهمة سريعا
    function openEditTaskPrompt(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newTitle = prompt('تعديل عنوان المهمة:', task.title);
      if (newTitle !== null && newTitle.trim()) {
        task.title = newTitle.trim();
        saveTodoTasks(tasks);
        renderDrawerTasksList();
        showToast('✓ تم تحديث عنوان المهمة بنجاح');
      }
    }

    function renderDrawerTasksList() {
      const container = document.getElementById('drawerTasksContainerList');
      const badge = document.getElementById('drawerTasksCountBadge');
      if (!container) return;

      const allTasks = getTodoTasks();
      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const currentHHMM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      const currentIsoPrefix = `${todayStr}T${currentHHMM}`;

      // 1. حساب مؤشرات الـ KPIs المعتمدة
      const totalCount = allTasks.length;
      const activeCount = allTasks.filter(t => !t.completed).length;
      const completedCount = allTasks.filter(t => t.completed).length;
      const overdueCount = allTasks.filter(t => {
        if (t.completed) return false;
        if (t.dueDateTime) return t.dueDateTime < currentIsoPrefix;
        if (t.dueDate) {
          if (t.dueDate < todayStr) return true;
          if (t.dueDate === todayStr && t.dueTime && t.dueTime < currentHHMM) return true;
        }
        return false;
      }).length;

      const kpiTotalEl = document.getElementById('kpiTasksTotal');
      const kpiActiveEl = document.getElementById('kpiTasksActive');
      const kpiOverdueEl = document.getElementById('kpiTasksOverdue');
      const kpiDoneEl = document.getElementById('kpiTasksDone');
      const progBarEl = document.getElementById('tasksOverallProgressBar');
      const progPctEl = document.getElementById('tasksOverallProgressPct');

      if (kpiTotalEl) kpiTotalEl.textContent = totalCount;
      if (kpiActiveEl) kpiActiveEl.textContent = activeCount;
      if (kpiOverdueEl) kpiOverdueEl.textContent = overdueCount;
      if (kpiDoneEl) kpiDoneEl.textContent = completedCount;
      if (badge) badge.textContent = activeCount;

      const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      if (progBarEl) progBarEl.style.width = overallPct + '%';
      if (progPctEl) progPctEl.textContent = overallPct + '%';

      // 2. الفلترة حسب القسم المحدد
      let filtered = allTasks;
      if (currentDrawerTodoSection === 'my_day') {
        filtered = allTasks.filter(t => !t.completed && (t.dueDate === todayStr || !t.dueDate));
      } else if (currentDrawerTodoSection === 'important') {
        filtered = allTasks.filter(t => !t.completed && (t.starred || t.priority === 'high'));
      } else if (currentDrawerTodoSection === 'planned') {
        filtered = allTasks.filter(t => !t.completed && Boolean(t.dueDate || t.dueDateTime));
      } else if (currentDrawerTodoSection === 'overdue') {
        filtered = allTasks.filter(t => {
          if (t.completed) return false;
          if (t.dueDateTime) return t.dueDateTime < currentIsoPrefix;
          if (t.dueDate) {
            if (t.dueDate < todayStr) return true;
            if (t.dueDate === todayStr && t.dueTime && t.dueTime < currentHHMM) return true;
          }
          return false;
        });
      } else if (currentDrawerTodoSection === 'completed') {
        filtered = allTasks.filter(t => t.completed);
      } else {
        filtered = allTasks.filter(t => !t.completed);
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 35px 10px; color: #94a3b8; font-size: 0.80rem;">
            <i class="fa-solid fa-list-check" style="font-size: 2.2rem; color: #a855f7; opacity: 0.45; margin-bottom: 10px; display: block;"></i>
            <div style="font-weight: 800; color: #cbd5e1;">لا توجد مهام في هذا القسم حالياً</div>
            <div style="font-size: 0.70rem; color: #64748b; margin-top: 4px;">يمكنك إضافة مهمة وتحديد موعد ووقت التنبيه بالأعلى</div>
          </div>
        `;
        return;
      }

      // قواميس الوسوم والأولويات
      const TAG_LABELS = {
        bills: { name: 'فواتير والتزامات', icon: 'fa-receipt', color: '#f97316' },
        shopping: { name: 'مشتريات', icon: 'fa-cart-shopping', color: '#10b981' },
        home: { name: 'منزل', icon: 'fa-house', color: '#8b5cf6' },
        family: { name: 'أسرة وشخصي', icon: 'fa-heart', color: '#ec4899' },
        work: { name: 'عمل ودراسة', icon: 'fa-briefcase', color: '#0284c7' },
        general: { name: 'عام', icon: 'fa-tag', color: '#94a3b8' }
      };

      const PRIORITY_BADGES = {
        high: `<span style="font-size: 0.60rem; font-weight: 900; color: #f87171; background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 5px; padding: 1px 5px;"><i class="fa-solid fa-fire"></i> عالي جداً</span>`,
        medium: `<span style="font-size: 0.60rem; font-weight: 900; color: #fbbf24; background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 5px; padding: 1px 5px;">متوسط</span>`,
        normal: ''
      };

      container.innerHTML = filtered.map(t => {
        const isDone = t.completed;
        const isStar = t.starred;
        const subtasks = t.subtasks || [];
        const completedSubs = subtasks.filter(s => s.completed).length;
        const hasSubs = subtasks.length > 0;
        const progressPct = hasSubs ? Math.round((completedSubs / subtasks.length) * 100) : 0;

        // حالة الموعد والوقت الموحد
        let dueBadgeHtml = '';
        let cardStateClass = '';

        const effectiveDt = t.dueDateTime || (t.dueDate ? `${t.dueDate}${t.dueTime ? 'T' + t.dueTime : ''}` : '');
        if (effectiveDt) {
          const isOverdue = !isDone && effectiveDt < currentIsoPrefix;
          const isToday = !isDone && (t.dueDate === todayStr || effectiveDt.startsWith(todayStr));
          const formattedDt = formatArabicDateTime(effectiveDt);

          if (isOverdue) {
            cardStateClass = 'is-overdue';
            dueBadgeHtml = `<span style="font-size: 0.62rem; color: #f87171; background: rgba(239, 68, 68, 0.20); border: 1px solid rgba(239, 68, 68, 0.45); border-radius: 6px; padding: 2px 7px; font-weight: 900;"><i class="fa-solid fa-triangle-exclamation"></i> متأخرة: ${formattedDt}</span>`;
          } else if (isToday) {
            cardStateClass = 'is-today';
            dueBadgeHtml = `<span style="font-size: 0.62rem; color: #fbbf24; background: rgba(245, 158, 11, 0.20); border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 6px; padding: 2px 7px; font-weight: 900;"><i class="fa-regular fa-clock"></i> اليوم: ${formattedDt}</span>`;
          } else {
            dueBadgeHtml = `<span style="font-size: 0.62rem; color: #c084fc; background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 6px; padding: 2px 7px; font-weight: 800;"><i class="fa-regular fa-calendar-check"></i> ${formattedDt}</span>`;
          }
        }

        const tagInfo = TAG_LABELS[t.tag] || TAG_LABELS.general;
        const tagBadgeHtml = (t.tag && t.tag !== 'general') 
          ? `<span style="font-size: 0.60rem; font-weight: 800; color: ${tagInfo.color}; background: rgba(255,255,255,0.06); border: 1px solid ${tagInfo.color}40; border-radius: 5px; padding: 1px 6px;"><i class="fa-solid ${tagInfo.icon}"></i> ${tagInfo.name}</span>`
          : '';

        const prioBadgeHtml = PRIORITY_BADGES[t.priority] || '';

        // المهام الفرعية التفاعلية مع دعم إرفاق صورة وعرضها
        const subtasksHtml = subtasks.map(s => {
          const subDone = s.completed;
          const subDt = s.dueDateTime || (s.dueDate ? `${s.dueDate}${s.dueTime ? 'T' + s.dueTime : ''}` : '');
          const subDtText = subDt ? formatArabicDateTime(subDt) : '';

          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; background: rgba(15, 23, 42, 0.70); border: 1px solid ${subDone ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 8px; margin-top: 4px; font-size: 0.72rem; transition: all 0.15s ease;">
              <div style="display: flex; align-items: center; gap: 7px; flex: 1; min-width: 0;">
                <input type="checkbox" ${subDone ? 'checked' : ''} onchange="toggleSubtaskCompleted('${t.id}', '${s.id}')" style="cursor: pointer; width: 14px; height: 14px; accent-color: #10b981;">
                <span style="color: ${subDone ? '#64748b' : '#e2e8f0'}; text-decoration: ${subDone ? 'line-through' : 'none'}; word-break: break-word; font-weight: 700; flex: 1;">${escapeHtml(s.title)}</span>
                ${subDtText ? `<span style="font-size: 0.60rem; color: #c084fc; white-space: nowrap;">(${subDtText})</span>` : ''}
              </div>

              <!-- صورة المهمة الفرعية المصغرة وزر حذفها -->
              <div style="display: flex; align-items: center; gap: 6px; margin-right: 6px; flex-shrink: 0;">
                ${s.photo ? `
                  <img src="${s.photo}" onclick="openReceiptLightbox(this.src, 'صورة المهمة الفرعية: ${escapeHtml(s.title)}')" style="width: 26px; height: 26px; border-radius: 6px; object-fit: cover; border: 1.2px solid #38bdf8; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.3);" title="انقر لتكبير صورة المهمة الفرعية">
                ` : ''}
                <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" title="حذف المهمة الفرعية" style="background: transparent; border: none; color: #ef4444; font-size: 0.75rem; cursor: pointer; opacity: 0.75; padding: 0 3px;">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="task-card-item ${cardStateClass} ${isDone ? 'is-completed' : ''}">
            <!-- السطر العلوي: علامة الاكتمال + العنوان + الأوسمة والأزرار -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: flex-start; gap: 9px; flex: 1; min-width: 0;">
                <button type="button" onclick="toggleTaskCompleted('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isDone ? '#34d399' : '#94a3b8'}; font-size: 1.25rem; padding: 0; line-height: 1; margin-top: 1px; transition: transform 0.15s ease;" title="${isDone ? 'إعادة فتح المهمة' : 'تعيين المهمة كمكتملة'}">
                  <i class="fa-${isDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
                </button>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 0.84rem; font-weight: 850; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'}; word-break: break-word; line-height: 1.3;">
                    ${escapeHtml(t.title)}
                  </div>
                  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 4px;">
                    ${dueBadgeHtml}
                    ${prioBadgeHtml}
                    ${tagBadgeHtml}
                    ${hasSubs ? `<span style="font-size: 0.60rem; color: #38bdf8; background: rgba(56, 189, 248, 0.14); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 5px; padding: 1px 6px; font-weight: 800;"><i class="fa-solid fa-list-check"></i> ${completedSubs}/${subtasks.length} مكتملة (${progressPct}%)</span>` : ''}
                  </div>
                </div>
              </div>

              <!-- أدوات التحكم السريعة: تحويل لمصروف، تعديل، صورة، نجمة، حذف -->
              <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
                ${t.photo ? `
                  <img src="${t.photo}" onclick="openReceiptLightbox(this.src, 'مرفق المهمة: ${escapeHtml(t.title)}')" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; border: 1.5px solid #a855f7; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4);" title="انقر لتكبير صورة المهمة">
                ` : ''}
                <button type="button" onclick="convertTaskToExpense('${t.id}')" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 6px; cursor: pointer; color: #34d399; font-size: 0.72rem; padding: 3px 6px; font-weight: 800;" title="تحويل المهمة إلى مصروف مالي">
                  <i class="fa-solid fa-money-bill-transfer"></i>
                </button>
                <button type="button" onclick="openEditTaskPrompt('${t.id}')" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; cursor: pointer; color: #cbd5e1; font-size: 0.72rem; padding: 3px 6px;" title="تعديل عنوان المهمة">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" onclick="toggleTaskStarred('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isStar ? '#fbbf24' : '#64748b'}; font-size: 1.05rem; padding: 2px;" title="${isStar ? 'إلغاء التمييز بنجمة' : 'تمييز كمهمة هامة'}">
                  <i class="fa-${isStar ? 'solid' : 'regular'} fa-star"></i>
                </button>
                <button type="button" onclick="deleteTaskItem('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: #ef4444; font-size: 0.88rem; padding: 2px; opacity: 0.75;" title="حذف المهمة">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            <!-- شريط تقدم إنجاز المهام الفرعية (Progress Bar) -->
            ${hasSubs ? `
              <div style="width: 100%; height: 4px; background: rgba(15, 23, 42, 0.8); border-radius: 3px; overflow: hidden; margin-top: 2px;">
                <div style="width: ${progressPct}%; height: 100%; background: ${progressPct === 100 ? '#10b981' : 'linear-gradient(90deg, #a855f7, #38bdf8)'}; transition: width 0.3s ease;"></div>
              </div>
            ` : ''}

            <!-- تفاصيل المهام الفرعية وإمكانية إضافة مهمة فرعية جديدة مع صورة وتاريخ ووقت موحد -->
            <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; margin-top: 2px;">
              ${subtasksHtml}

              <!-- سطر إضافة مهمة فرعية جديدة مع موعد ووقت موحد وصورة -->
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; align-items: center; background: rgba(15, 23, 42, 0.55); border-radius: 8px; padding: 6px;">
                <input type="text" id="inpSubtaskTitle_${t.id}" placeholder="إضافة خطوة أو مهمة فرعية..." style="flex: 1 1 120px; height: 30px; border-radius: 6px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #fff; font-size: 0.72rem; padding: 0 8px; outline: none;">
                
                <!-- حقل تاريخ ووقت المهمة الفرعية الموحد -->
                <input type="datetime-local" id="inpSubtaskDateTime_${t.id}" class="task-datetime-input" style="width: 135px; height: 30px; border-radius: 6px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.65rem; padding: 0 4px;" title="تحديد موعد وساعة المهمة الفرعية معاً">
                
                <!-- إرفاق صورة للمهمة الفرعية -->
                <input type="file" id="inpSubtaskPhoto_${t.id}" accept="image/*" style="display: none;" onchange="handleSubtaskPhotoPicked(event, '${t.id}')">
                <button type="button" onclick="document.getElementById('inpSubtaskPhoto_${t.id}').click()" title="إرفاق صورة للمهمة الفرعية" id="btnSubtaskPhoto_${t.id}" style="height: 30px; padding: 0 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; gap: 3px;">
                  <i class="fa-solid fa-camera"></i>
                  <span id="subtaskPhotoBadge_${t.id}" style="display: none; font-size: 0.60rem; color: #34d399; font-weight: 800;">✓</span>
                </button>

                <button type="button" onclick="addSubtaskToTask('${t.id}')" style="height: 30px; padding: 0 12px; border-radius: 6px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-plus"></i> إضافة
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }'''

# Locate existing drawer tasks code to replace
start_marker = "    let currentDrawerTodoSection = 'my_day';"
end_marker = "    // =========================================================================\n    // 2. مهام Microsoft To-Do المتكاملة (Tasks Engine)"

if start_marker in content and end_marker in content:
    idx_start = content.find(start_marker)
    idx_end = content.find(end_marker)
    content = content[:idx_start] + new_tasks_js + '\n    ' + content[idx_end:]
    print("Tasks JS engine replaced successfully!")
else:
    print("Could not find start/end markers for Tasks JS engine!")

# Update checkScheduledTaskReminders to handle dueDateTime
old_check_marker = '''        // 1. فحص المهمة الرئيسية
        if (!t.completed && !t.reminderFired && t.dueDate) {
          let isDue = false;
          if (t.dueDate < todayStr) {
            isDue = true;
          } else if (t.dueDate === todayStr) {
            if (!t.dueTime || t.dueTime <= currentHHMM) {
              isDue = true;
            }
          }'''

new_check_marker = '''        // 1. فحص المهمة الرئيسية المجدولة
        if (!t.completed && !t.reminderFired && (t.dueDate || t.dueDateTime)) {
          let isDue = false;
          const effectiveDt = t.dueDateTime || (t.dueDate ? `${t.dueDate}${t.dueTime ? 'T' + t.dueTime : ''}` : '');
          const currentIsoPrefix = `${todayStr}T${currentHHMM}`;
          if (effectiveDt && effectiveDt <= currentIsoPrefix) {
            isDue = true;
          } else if (t.dueDate < todayStr) {
            isDue = true;
          } else if (t.dueDate === todayStr && (!t.dueTime || t.dueTime <= currentHHMM)) {
            isDue = true;
          }'''

if old_check_marker in content:
    content = content.replace(old_check_marker, new_check_marker, 1)
    print("Updated checkScheduledTaskReminders for main tasks!")

old_sub_check = '''        // 2. فحص المهام الفرعية
        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach(sub => {
            if (!sub.completed && !sub.reminderFired && sub.dueDate) {
              let isSubDue = false;
              if (sub.dueDate < todayStr) {
                isSubDue = true;
              } else if (sub.dueDate === todayStr) {
                if (!sub.dueTime || sub.dueTime <= currentHHMM) {
                  isSubDue = true;
                }
              }'''

new_sub_check = '''        // 2. فحص المهام الفرعية المجدولة
        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach(sub => {
            if (!sub.completed && !sub.reminderFired && (sub.dueDate || sub.dueDateTime)) {
              let isSubDue = false;
              const subDt = sub.dueDateTime || (sub.dueDate ? `${sub.dueDate}${sub.dueTime ? 'T' + sub.dueTime : ''}` : '');
              const currentIsoPrefix = `${todayStr}T${currentHHMM}`;
              if (subDt && subDt <= currentIsoPrefix) {
                isSubDue = true;
              } else if (sub.dueDate < todayStr) {
                isSubDue = true;
              } else if (sub.dueDate === todayStr && (!sub.dueTime || sub.dueTime <= currentHHMM)) {
                isSubDue = true;
              }'''

if old_sub_check in content:
    content = content.replace(old_sub_check, new_sub_check, 1)
    print("Updated checkScheduledTaskReminders for subtasks!")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Finished applying Tasks JS engine. Total length: {len(content)}")
