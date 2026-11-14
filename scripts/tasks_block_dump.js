function getTodoTasks() {
      try {
        return JSON.parse(localStorage.getItem('family_monefy_tasks') || '[]');
      } catch(e) { return []; }
    }

    function saveTodoTasks(tasks) {
      try {
        localStorage.setItem('family_monefy_tasks', JSON.stringify(tasks));
      } catch(e) {}
    }

    function openTasksModal() {
      openSummaryDrawer('tasks');
      return;
      renderTasksList();
      openModal('tasksModal');
    }

    function switchTodoSection(sec) {
      currentTodoSection = sec;
      const tabs = ['my_day', 'important', 'planned', 'all', 'completed'];
      tabs.forEach(t => {
        const btnId = `btnTodoTab${t === 'my_day' ? 'MyDay' : (t === 'important' ? 'Important' : (t === 'planned' ? 'Planned' : (t === 'all' ? 'All' : 'Completed')))}`;
        const btn = document.getElementById(btnId);
        if (btn) {
          if (t === sec) {
            btn.className = 'exp-tab-btn active';
            btn.style.background = 'rgba(168, 85, 247, 0.25)';
            btn.style.color = '#c084fc';
            btn.style.border = 'none';
          } else {
            btn.className = 'exp-tab-btn';
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.border = '1px solid rgba(255,255,255,0.1)';
          }
        }
      });
      renderTasksList();
    }

    function handleAddNewTask() {
      const titleInp = document.getElementById('newTaskTitleInput');
      const dateInp = document.getElementById('newTaskDueDateInput');
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) return;

      const tasks = getTodoTasks();
      const newTask = {
        id: 'task-' + Date.now(),
        title: title,
        dueDate: dateInp && dateInp.value ? dateInp.value : '',
        completed: false,
        starred: currentTodoSection === 'important',
        createdAt: new Date().toISOString(),
        author: state.currentUser || 'ماهر'
      };

      tasks.unshift(newTask);
      saveTodoTasks(tasks);
      if (titleInp) titleInp.value = '';
      playNotificationChime();
      renderTasksList();
      showToast('✨ تمت إضافة المهمة بنجاح!');
    }

    function toggleTaskCompleted(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        saveTodoTasks(tasks);
        playNotificationChime();
        renderTasksList();
        showToast(task.completed ? '🎉 أحسنت! اكتملت المهمة' : 'تمت إعادة فتح المهمة');
      }
    }

    function toggleTaskStarred(taskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.starred = !task.starred;
        saveTodoTasks(tasks);
        renderTasksList();
      }
    }

    function deleteTaskItem(taskId) {
      let tasks = getTodoTasks();
      tasks = tasks.filter(t => t.id !== taskId);
      saveTodoTasks(tasks);
      renderTasksList();
      showToast('🗑️ تم حذف المهمة');
    }

    function renderTasksList() {
      const container = document.getElementById('tasksContainerList');
      if (!container) return;

      const allTasks = getTodoTasks();
      const todayStr = getLocalDateStr(new Date());

      let filtered = allTasks;
      if (currentTodoSection === 'my_day') {
        filtered = allTasks.filter(t => !t.completed && (t.dueDate === todayStr || !t.dueDate));
      } else if (currentTodoSection === 'important') {
        filtered = allTasks.filter(t => !t.completed && t.starred);
      } else if (currentTodoSection === 'planned') {
        filtered = allTasks.filter(t => !t.completed && Boolean(t.dueDate));
      } else if (currentTodoSection === 'completed') {
        filtered = allTasks.filter(t => t.completed);
      } else {
        filtered = allTasks.filter(t => !t.completed);
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 35px 10px; color: #94a3b8; font-size: 0.8rem;">
            <i class="fa-solid fa-list-check" style="font-size: 2rem; color: #a855f7; opacity: 0.5; margin-bottom: 8px;"></i>
            <div>لا توجد مهام في هذا القسم حالياً</div>
            <div style="font-size: 0.68rem; color: #64748b; margin-top: 4px;">أضف مهمتك الأولى باستخدام الحقل أعلاه</div>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(t => {
        const isDone = t.completed;
        const isStar = t.starred;
        const dueText = t.dueDate ? `📅 استحقاق: ${t.dueDate}` : '';

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 9px 12px; margin-bottom: 6px; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
              <button type="button" onclick="toggleTaskCompleted('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isDone ? '#34d399' : '#94a3b8'}; font-size: 1.15rem; padding: 0;">
                <i class="fa-${isDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
              </button>
              <div style="flex: 1;">
                <div style="font-size: 0.80rem; font-weight: 700; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'}; word-break: break-word;">
                  ${escapeHtml(t.title)}
                </div>
                ${dueText ? `<div style="font-size: 0.62rem; color: #c084fc; margin-top: 2px;">${dueText}</div>` : ''}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" onclick="toggleTaskStarred('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isStar ? '#fbbf24' : '#64748b'}; font-size: 0.95rem; padding: 2px;">
                <i class="fa-${isStar ? 'solid' : 'regular'} fa-star"></i>
              </button>
              <button type="button" onclick="deleteTaskItem('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: #ef4444; font-size: 0.85rem; padding: 2px; opacity: 0.7;">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }