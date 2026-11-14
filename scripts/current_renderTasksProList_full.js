function renderTasksProList() {
      const container = document.getElementById('tasksFullScreenContainerList');
      if (!container) return;

      const allTasks = getTodoTasks();
      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const currentHHMM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

      const totalCount = allTasks.length;
      const activeCount = allTasks.filter(t => !t.completed).length;
      const completedCount = allTasks.filter(t => t.completed).length;
      const overdueCount = allTasks.filter(t => {
        if (t.completed) return false;
        if (t.dueDate) {
          if (t.dueDate < todayStr) return true;
          if (t.dueDate === todayStr && t.dueTime && t.dueTime < currentHHMM) return true;
        }
        return false;
      }).length;

      const kTot = document.getElementById('kpiTasksTotalFull');
      const kAct = document.getElementById('kpiTasksActiveFull');
      const kOvd = document.getElementById('kpiTasksOverdueFull');
      const kDon = document.getElementById('kpiTasksDoneFull');
      const bProg = document.getElementById('tasksOverallProgressBarFull');
      const pProg = document.getElementById('tasksOverallProgressPctFull');
      const pBadge = document.getElementById('tasksProductivityBadge');

      if (kTot) kTot.textContent = totalCount;
      if (kAct) kAct.textContent = activeCount;
      if (kOvd) kOvd.textContent = overdueCount;
      if (kDon) kDon.textContent = completedCount;

      const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      if (bProg) bProg.style.width = overallPct + '%';
      if (pProg) pProg.textContent = overallPct + '%';
      if (pBadge) {
        if (overallPct === 100 && totalCount > 0) pBadge.textContent = '🌟 إنجاز 100% مبهر!';
        else if (overallPct >= 60) pBadge.textContent = '🔥 إنتاجية عالية';
        else pBadge.textContent = `${activeCount} مهام متبقية`;
      }

      // تحديث عدادات رقائق الفئات التفاعلية
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

      // تطبيق تصفية القسم الذكي (Smart Lists)
      let filtered = allTasks;
      if (currentDrawerTodoSection === 'my_day') {
        filtered = allTasks.filter(t => !t.completed && (t.dueDate === todayStr || !t.dueDate));
      } else if (currentDrawerTodoSection === 'important') {
        filtered = allTasks.filter(t => !t.completed && (t.starred || t.priority === 'high'));
      } else if (currentDrawerTodoSection === 'planned') {
        filtered = allTasks.filter(t => !t.completed && Boolean(t.dueDate));
      } else if (currentDrawerTodoSection === 'shopping') {
        filtered = allTasks.filter(t => !t.completed && (t.tag === 'shopping' || (t.estimatedAmount && t.estimatedAmount > 0)));
      } else if (currentDrawerTodoSection === 'overdue') {
        filtered = allTasks.filter(t => {
          if (t.completed) return false;
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

      // تطبيق فلترة العضو المختار
      if (currentTasksMemberFilter && currentTasksMemberFilter !== 'all') {
        filtered = filtered.filter(t => (t.assignedMember || 'البيت') === currentTasksMemberFilter);
      }

      // تطبيق نص البحث إذا وجد
      const q = (document.getElementById('tasksSearchInput')?.value || '').trim().toLowerCase();
      if (q) {
        filtered = filtered.filter(t => {
          const title = (t.title || '').toLowerCase();
          const mem = (t.assignedMember || '').toLowerCase();
          const tag = (t.tag || '').toLowerCase();
          const subMatch = (t.subtasks || []).some(s => (s.title || '').toLowerCase().includes(q));
          return title.includes(q) || mem.includes(q) || tag.includes(q) || subMatch;
        });
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 45px 16px; background: rgba(15, 23, 42, 0.65); border: 1.5px dashed rgba(168, 85, 247, 0.35); border-radius: 16px; margin-top: 6px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(168, 85, 247, 0.15); color: #c084fc; display: inline-flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 12px;">
              <i class="fa-solid fa-clipboard-check"></i>
            </div>
            <div style="font-weight: 850; font-size: 0.95rem; color: #f8fafc;">لا توجد مهام في هذه القائمة حالياً</div>
            
          </div>
        `;
        return;
      }

      const TAG_LABELS = {
        bills: { name: 'فواتير والتزامات', icon: 'fa-receipt', color: '#f97316' },
        shopping: { name: 'مشتريات', icon: 'fa-cart-shopping', color: '#10b981' },
        home: { name: 'منزل', icon: 'fa-house', color: '#8b5cf6' },
        family: { name: 'أسرة وشخصي', icon: 'fa-heart', color: '#ec4899' },
        work: { name: 'عمل ودراسة', icon: 'fa-briefcase', color: '#0284c7' },
        general: { name: 'عام', icon: 'fa-tag', color: '#94a3b8' }
      };

      container.innerHTML = filtered.map(t => {
        const isDone = t.completed;
        const isStar = t.starred;
        const subtasks = t.subtasks || [];
        const hasSubs = subtasks.length > 0;
        const subsCompleted = subtasks.filter(s => s.completed).length;

        const isOverdue = !isDone && t.dueDate && (t.dueDate < todayStr || (t.dueDate === todayStr && t.dueTime && t.dueTime < currentHHMM));
        const isDueToday = !isDone && t.dueDate === todayStr;

        let dateBadge = '';
        if (t.dueDate) {
          if (isOverdue) {
            dateBadge = `<span style="font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);"><i class="fa-solid fa-triangle-exclamation"></i> متأخرة (${t.dueDate} ${t.dueTime || ''})</span>`;
          } else if (isDueToday) {
            dateBadge = `<span style="font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);"><i class="fa-solid fa-clock"></i> اليوم ${t.dueTime || ''}</span>`;
          } else {
            dateBadge = `<span style="font-size: 0.65rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);"><i class="fa-solid fa-calendar"></i> ${t.dueDate} ${t.dueTime || ''}</span>`;
          }
        }

        const tagObj = TAG_LABELS[t.tag] || TAG_LABELS.general;
        const memberName = t.assignedMember || 'البيت';

        let subtasksHtml = subtasks.map(s => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.8); padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
              <button type="button" onclick="toggleSubtaskCompleted('${t.id}', '${s.id}')" style="background: transparent; border: none; cursor: pointer; color: ${s.completed ? '#10b981' : '#94a3b8'}; font-size: 1.05rem; padding: 0;">
                <i class="fa-${s.completed ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
              </button>
              <span style="font-size: 0.74rem; font-weight: 700; color: ${s.completed ? '#64748b' : '#f8fafc'}; text-decoration: ${s.completed ? 'line-through' : 'none'};">${escapeHtml(s.title)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              ${s.photoUri ? `<img src="${s.photoUri}" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover; cursor: pointer;" onclick="openReceiptLightbox('${s.photoUri}', '${escapeHtml(s.title)}')">` : ''}
              <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" style="background: transparent; border: none; color: #ef4444; font-size: 0.75rem; cursor: pointer; opacity: 0.7;" title="حذف الخطوة">&times;</button>
            </div>
          </div>
        `).join('');

        return `
          <div class="task-card-item" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.3px solid ${isDone ? 'rgba(52, 211, 153, 0.4)' : (t.priority === 'high' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(168, 85, 247, 0.35)')}; border-radius: 14px; padding: 12px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.35); transition: all 0.15s ease;">
            
            <!-- السطر العلوي: الشيك بوكس + العنوان + النجمة + الحذف -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1;">
                <!-- أيقونة الدائرة التفاعلية (Todoist / Things 3 Style) -->
                <button type="button" onclick="toggleDrawerTaskCompletion('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isDone ? '#34d399' : '#94a3b8'}; font-size: 1.35rem; line-height: 1; padding: 2px 0 0;" title="${isDone ? 'إلغاء الإنجاز' : 'تحديد كمكتملة'}">
                  <i class="fa-${isDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
                </button>
                <div style="flex: 1;">
                  <div style="font-size: 0.92rem; font-weight: 900; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'}; line-height: 1.35;">
                    ${escapeHtml(t.title)}
                  </div>
                </div>
              </div>

              <!-- أزرار الإجراءات السريعة: المفضلة / الحذف -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" onclick="toggleTaskStar('${t.id}')" style="background: transparent; border: none; color: ${isStar ? '#fbbf24' : '#64748b'}; font-size: 1.1rem; cursor: pointer; padding: 0 2px;" title="${isStar ? 'إلغاء التمييز' : 'تمييز كمهمة هامة'}">
                  <i class="fa-${isStar ? 'solid' : 'regular'} fa-star"></i>
                </button>
                <button type="button" onclick="deleteDrawerTask('${t.id}')" style="background: transparent; border: none; color: #ef4444; font-size: 0.95rem; cursor: pointer; opacity: 0.65; padding: 0 2px;" title="حذف المهمة">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            <!-- سطر الشارات والبيانات المرجعية (Member, Due Date, Priority, Est Amount) -->
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
              <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                <!-- شارة الفرد المسند إليه -->
                <span style="font-size: 0.66rem; font-weight: 850; padding: 2px 7px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                  👤 ${escapeHtml(memberName)}
                </span>

                <!-- شارة التصنيف -->
                <span style="font-size: 0.66rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: rgba(255, 255, 255, 0.06); color: ${tagObj.color}; border: 1px solid rgba(255,255,255,0.1);">
                  <i class="fa-solid ${tagObj.icon}"></i> ${tagObj.name}
                </span>

                <!-- شارة الأولوية -->
                ${t.priority === 'high' ? `<span style="font-size: 0.66rem; font-weight: 900; padding: 2px 7px; border-radius: 6px; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);"><i class="fa-solid fa-fire"></i> عاجل P1</span>` : ''}

                <!-- شارة الموعد -->
                ${dateBadge}
              </div>

              <!-- جزء المبلغ المالي والتحويل لمصروف (Fintech Integration) -->
              <div style="display: flex; align-items: center; gap: 6px;">
                ${t.estimatedAmount ? `
                  <span style="font-size: 0.72rem; font-weight: 900; color: #fbbf24; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); padding: 2px 8px; border-radius: 6px; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">
                    ج.م ${Number(t.estimatedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                ` : ''}

                ${!isDone && t.estimatedAmount && !t.isExpenseConverted ? `
                  <button type="button" onclick="convertTaskToExpense('${t.id}')" style="height: 26px; padding: 0 8px; border-radius: 6px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.66rem; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);">
                    <i class="fa-solid fa-credit-card"></i> تحويل لمصروف
                  </button>
                ` : (t.isExpenseConverted ? `
                  <span style="font-size: 0.64rem; font-weight: 850; color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 5px;">✓ تم الصرف</span>
                ` : '')}
              </div>
            </div>

            <!-- قسم الخطوات الفرعية (TickTick & MS To Do Checklist) -->
            <div style="margin-top: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <button type="button" onclick="toggleSubtaskForm('${t.id}')" style="background: transparent; border: none; color: #c084fc; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; padding: 0;">
                  <i class="fa-solid fa-plus-circle"></i> + إضافة خطوة فرعية
                </button>
                ${hasSubs ? `
                  <span style="font-size: 0.66rem; color: #94a3b8; font-weight: 800;">
                    ${subsCompleted} من ${subtasks.length} خطوات مكتملة
                  </span>
                ` : ''}
              </div>

              <!-- قائمة الخطوات إن وجدت -->
              ${hasSubs ? `
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                  ${subtasksHtml}
                </div>
              ` : ''}

              <!-- صندوق إضافة خطوة فرعية سريعة -->
              <div id="subtaskAddBox_${t.id}" style="display: none; background: rgba(15, 23, 42, 0.95); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 10px; padding: 8px 10px; margin-top: 6px;">
                <div style="display: flex; gap: 6px; align-items: center;">
                  <input type="text" id="inpSubtaskTitle_${t.id}" placeholder="اكتب خطوة فرعية واضغط حفظ..." style="flex: 1; height: 32px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255,255,255,0.12); border-radius: 7px; color: #fff; padding: 0 8px; font-size: 0.74rem; font-weight: 700; outline: none;" onkeydown="if(event.key==='Enter') addSubtaskToTask('${t.id}')">
                  
                  <!-- زر إرفاق صورة للخطوة الفرعية -->
                  <input type="file" id="inpSubtaskPhoto_${t.id}" accept="image/*" style="display: none;" onchange="handleSubtaskPhotoPicked(event, '${t.id}')">
                  <button type="button" onclick="document.getElementById('inpSubtaskPhoto_${t.id}').click()" title="إرفاق صورة" style="height: 32px; padding: 0 8px; border-radius: 7px; background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.35); color: #c084fc; font-size: 0.72rem; cursor: pointer;">
                    <i class="fa-solid fa-camera"></i>
                  </button>
                  <button type="button" onclick="addSubtaskToTask('${t.id}')" style="height: 32px; padding: 0 12px; border-radius: 7px; background: #a855f7; border: none; color: #fff; font-size: 0.72rem; font-weight: 850; cursor: pointer;">
                    حفظ
                  </button>
                  <button type="button" onclick="toggleSubtaskForm('${t.id}', false)" style="height: 32px; padding: 0 8px; border-radius: 7px; background: rgba(255,255,255,0.06); border: none; color: #94a3b8; font-size: 0.72rem; cursor: pointer;">
                    &times;
                  </button>
                </div>
              </div>
            </div>

            <!-- صورة المرفق إن وجدت في المهمة الرئيسية -->
            ${t.photoUri ? `
              <div style="margin-top: 8px; text-align: center;">
                <img src="${t.photoUri}" style="max-height: 100px; border-radius: 8px; border: 1.2px solid rgba(168, 85, 247, 0.4); object-fit: contain; cursor: pointer;" onclick="openReceiptLightbox('${t.photoUri}', '${escapeHtml(t.title)}')">
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    // اسم بديل متوافق لضمان عدم توقف أي استدعاء قديم
    const renderDrawerTasksList = renderTasksProList;


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
      const dtInp = document.getElementById('newTaskDateTimeInput') || document.getElementById('newTaskDueDateInput');
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) return;

      const dtVal = dtInp ? dtInp.value : '';
      let dueDate = '', dueTime = '';
      if (dtVal) {
        const parts = dtVal.split('T');
        dueDate = parts[0] || '';
        dueTime = parts[1] ? parts[1].slice(0, 5) : '';
      }

      const tasks = getTodoTasks();
      const newTask = {
        id: 'task-' + Date.now(),
        title: title,
        dueDateTime: dtVal,
        dueDate: dueDate,
        dueTime: dueTime,
        priority: 'normal',
        tag: 'general',
        completed: false,
        starred: currentTodoSection === 'important',
        createdAt: new Date().toISOString(),
        author: state.currentUser || 'ماهر'
      };

      tasks.unshift(newTask);
      saveTodoTasks(tasks);
      if (titleInp) titleInp.value = '';
      if (dtInp) dtInp.value = '';
      playNotificationChime();
      renderTasksList();
      showToast('✨ تمت إضافة المهمة والموعد بنجاح!');
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
            
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(t => {
        const isDone = t.completed;
        const isStar = t.starred;
        const effectiveDt = t.dueDateTime || (t.dueDate ? `${t.dueDate}${t.dueTime ? 'T' + t.dueTime : ''}` : '');
        const dueText = effectiveDt ? `📅 موعد التنبيه: ${formatArabicDateTime(effectiveDt)}` : '';

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

    // =========================================================================
    // 3. نظام الإشعارات والتنبيهات الذكية (Notifications Engine)
    // =========================================================================
    function openNotificationsModal() {
      renderNotificationsList();
      openModal('notificationsModal');
      const dot = document.getElementById('headerNotifBadge');
      if (dot) dot.style.display = 'none';
    }

    function addSystemNotification(item) {
      if (!state.notifications) {
        try {
          state.notifications = JSON.parse(localStorage.getItem('family_monefy_notifications') || '[]');
        } catch(e) { state.notifications = []; }
      }

      const newNotif = {
        id: 'notif-' + Date.now(),
        type: item.type || 'info',
        title: item.title || 'إشعار من النظام',
        body: item.body || '',
        txId: item.txId || null,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      state.notifications.unshift(newNotif);
      if (state.notifications.length > 50) state.notifications = state.notifications.slice(0, 50);

      try {
        localStorage.setItem('family_monefy_notifications', JSON.stringify(state.notifications));
      } catch(e) {}

      const dot = document.getElementById('headerNotifBadge');
      if (dot) dot.style.display = 'inline-block';
    }

    function markAllNotificationsRead() {
      if (state.notifications) {
        state.notifications.forEach(n => n.isRead = true);
        try {
          localStorage.setItem('family_monefy_notifications', JSON.stringify(state.notifications));
        } catch(e) {}
      }
      renderNotificationsList();
      const dot = document.getElementById('headerNotifBadge');
      if (dot) dot.style.display = 'none';
      showToast('✓ تم تحديد كافة الإشعارات كمقروءة');
    }

    function renderNotificationsList() {
      const container = document.getElementById('notificationsListContainer');
      if (!container) return;

      if (!state.notifications) {
        try {
          state.notifications = JSON.parse(localStorage.getItem('family_monefy_notifications') || '[]');
        } catch(e) { state.notifications = []; }
      }

      let items = [...state.notifications];

      // فحص الالتزامات المستحقة قريباً وإظهارها في قائمة التنبيهات
      if (state.expectedExpenses && state.expectedExpenses.length > 0) {
        const upcomingDebts = state.expectedExpenses.filter(e => e.status !== 'paid');
        if (upcomingDebts.length > 0) {
          items.unshift({
            id: 'debt-alert',
            type: 'commitment',
            title: '⚠️ تنبيه التزامات مستحقة:',
            body: `لديك ${upcomingDebts.length} التزامات/ديون قيد المتابعة بقيمة إجمالية ${formatMoney(upcomingDebts.reduce((s,x)=>s+(Number(x.amount)||0),0))}`,
            isRead: true,
            timestamp: new Date().toISOString()
          });
        }
      }

      if (items.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px 10px; color: #94a3b8; font-size: 0.78rem;">
            <i class="fa-solid fa-bell-slash" style="font-size: 1.8rem; margin-bottom: 8px; color: #64748b;"></i>
            <div>لا توجد إشعارات جديدة حالياً</div>
          </div>
        `;
        return;
      }

      container.innerHTML = items.map(n => {
        const isTx = Boolean(n.txId);
        const isExp = Boolean(n.expectedId || n.id === 'debt-alert');
        const isTask = Boolean(n.taskId);
        const isClickable = isTx || isExp || isTask;

        let clickHandler = '';
        if (isTx) clickHandler = `onclick="closeModal('notificationsModal'); openEditTxModal('${n.txId}');"`;
        else if (isExp) clickHandler = `onclick="closeModal('notificationsModal'); switchAppPage('commitments');"`;
        else if (isTask) clickHandler = `onclick="closeModal('notificationsModal'); openSummaryDrawer('tasks');"`;

        const iconClass = n.type === 'income' ? 'fa-circle-arrow-down' : (n.type === 'expense' ? 'fa-circle-arrow-up' : (n.type === 'bill' ? 'fa-file-invoice' : (n.type === 'commitment' ? 'fa-triangle-exclamation' : 'fa-bell')));
        const iconColor = n.type === 'income' ? '#34d399' : (n.type === 'expense' ? '#f43f5e' : (n.type === 'bill' ? '#fbbf24' : '#38bdf8'));

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(30, 41, 59, 0.75); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 10px 12px; cursor: ${isClickable ? 'pointer' : 'default'}; transition: all 0.15s ease;" ${clickHandler} title="${isClickable ? 'انقر للانتقال مباشرة للعملية المرتبطة' : ''}">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
              <i class="fa-solid ${iconClass}" style="color: ${iconColor}; font-size: 1.15rem;"></i>
              <div>
                <div style="font-size: 0.80rem; font-weight: 800; color: #f8fafc;">${escapeHtml(n.title)}</div>
                <div style="font-size: 0.68rem; color: #cbd5e1; margin-top: 2px;">${escapeHtml(n.body)}</div>
              </div>
            </div>
            ${isClickable ? '<span style="font-size: 0.66rem; color: #38bdf8; font-weight: 800; background: rgba(56, 189, 248, 0.15); padding: 3px 8px; border-radius: 6px;"><i class="fa-solid fa-arrow-up-right-from-square"></i> فتح</span>' : ''}
          </div>
        `;
      }).join('');
    }

    // =========================================================================
    // 4. فواتير صفحة الالتزامات (Bills Engine)
    // =========================================================================
    let currentBillPhotoDataUri = null;

    function toggleBillsExpectedPanel() {
      const panel = document.getElementById('panelBillsExpected');
      const btn = document.getElementById('btnFilterExpBills');
      if (!panel) return;

      const isHidden = panel.style.display === 'none' || !panel.style.display;
      panel.style.display = isHidden ? 'block' : 'none';
      if (btn) {
        if (isHidden) {
          btn.classList.add('active');
          btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
          btn.style.color = '#fff';
        } else {
          btn.classList.remove('active');
          btn.style.background = 'rgba(245, 158, 11, 0.15)';
          btn.style.color = '#f59e0b';
        }
      }
      if (isHidden) renderBillsList();
    }

    function handleBillPhotoSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        currentBillPhotoDataUri = e.target.result;
        const badge = document.getElementById('billPhotoPreviewBadge');
        if (badge) {
          badge.innerHTML = '<span style="color: #34d399;"><i class="fa-solid fa-circle-check"></i> تم التقاط الصورة بنجاح</span>';
        }
        const thumbRow = document.getElementById('billPhotoThumbRow');
        const thumbImg = document.getElementById('billPhotoThumbImg');
        if (thumbRow && thumbImg) {
          thumbImg.src = currentBillPhotoDataUri;
          thumbRow.style.display = 'flex';
        }
        showToast('📷 تم حفظ صورة الفاتورة بنجاح!');
      };
      reader.readAsDataURL(file);
    }

    function clearCurrentBillPhoto() {
      currentBillPhotoDataUri = null;
      const fileInp = document.getElementById('inpBillPhotoFile');
      if (fileInp) fileInp.value = '';
      const badge = document.getElementById('billPhotoPreviewBadge');
      if (badge) {
        badge.innerHTML = '<span>لم يتم التقاط صورة</span>';
      }
      const thumbRow = document.getElementById('billPhotoThumbRow');
      if (thumbRow) thumbRow.style.display = 'none';
      showToast('تمت إزالة صورة الفاتورة');
    }

    function payBillAsExpense(billId) {
      const bill = (state.expectedExpenses || []).find(b => b.id === billId);
      if (!bill) return;

      const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(bill.category || 'bills', 'expense') : null;
      const amt = Number(bill.amount) || 0;
      const defaultWallet = (state.wallets && state.wallets[0]) ? state.wallets[0].id : 'wallet-cash-safe';

      const tx = {
        id: 'tx-' + Date.now(),
        type: 'expense',
        label: bill.label || 'سداد فاتورة',
        amount: amt,
        category: bill.category || 'bills',
        member: bill.member || 'البيت',
        walletId: defaultWallet,
        date: typeof getLocalDateStr === 'function' ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        receipt: bill.photo || null,
        note: `تم السداد تلقائياً من فاتورة مسجلة (${bill.label})`,
        author: state.currentUser || 'ماهر',
        createdAt: new Date().toISOString()
      };

      if (!state.transactions) state.transactions = [];
      state.transactions.unshift(tx);

      // تحديث حالة الفاتورة لتصبح مسددة
      bill.status = 'paid';
      bill.paidAt = new Date().toISOString();
      bill.paidTxId = tx.id;

      if (typeof saveState === 'function') saveState();

      if (typeof logActivity === 'function') {
        logActivity('expense', `سداد فاتورة: ${bill.label} بمبلغ ${amt} ج.م`, amt, bill.member);
      }

      renderUI();
      renderBillsList();
      renderExpectedList();
      showToast(`✅ تم سداد الفاتورة (${bill.label}) وتحويلها لمصروف مسجل بنجاح!`);
    }

    function saveNewBill() {
      const nameInp = document.getElementById('inpBillName');
      const amountInp = document.getElementById('inpBillAmount');
      const dateInp = document.getElementById('inpBillDueDate');
      const memberInp = document.getElementById('inpBillMember');
      const catInp = document.getElementById('inpBillCategory');

      const name = nameInp ? nameInp.value.trim() : '';
      const amount = parseFloat(amountInp ? amountInp.value : 0);

      if (!name || isNaN(amount) || amount <= 0) {
        showToast('⚠️ يرجى إدخال اسم الفاتورة ومبلغ صحيح أكبر من الصفر', 'error');
        return;
      }

      if (!state.expectedExpenses) state.expectedExpenses = [];

      const newBill = {
        id: 'bill-' + Date.now(),
        type: 'upcoming_bill',
        label: name,
        amount: amount,
        dueDate: dateInp && dateInp.value ? dateInp.value : new Date().toISOString().split('T')[0],
        member: memberInp ? memberInp.value : 'البيت',
        category: catInp ? catInp.value : 'bills',
        photo: currentBillPhotoDataUri || null,
        status: 'upcoming',
        author: state.currentUser || 'ماهر',
        createdAt: new Date().toISOString()
      };

      state.expectedExpenses.unshift(newBill);
      if (typeof saveState === 'function') saveState();

      addSystemNotification({
        type: 'bill',
        title: 'فاتورة جديدة مستحقة',
        body: `${name} بمبلغ ${amount} ج.م تخص ${newBill.member}`
      });

      currentBillPhotoDataUri = null;
      if (nameInp) nameInp.value = '';
      if (amountInp) amountInp.value = '';
      const badge = document.getElementById('billPhotoPreviewBadge');
      if (badge) {
        badge.textContent = 'لم يتم التقاط صورة';
        badge.style.color = '#94a3b8';
      }

      renderBillsList();
      renderExpectedList();
      showToast('✅ تم تسجيل الفاتورة بنجاح!');
    }

    function renderBillsList() {
      const container = document.getElementById('billsListContainer');
      const badge = document.getElementById('billsCountSummaryBadge');
      if (!container) return;

      const bills = (state.expectedExpenses || []).filter(e => e.type === 'upcoming_bill');
      if (badge) badge.textContent = `${bills.length} فاتورة مسجلة`;

      if (bills.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 20px 10px; color: #94a3b8; font-size: 0.74rem;">
            لا توجد فواتير مسجلة حالياً
          </div>
        `;
        return;
      }

      const badgeTab = document.getElementById('billsCountBadgeTab');
      if (badgeTab) badgeTab.textContent = bills.filter(b => b.status !== 'paid').length;

      container.innerHTML = bills.map(b => {
        const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(b.category || 'bills', 'expense') : { name: 'فواتير', icon: 'fa-file-invoice', color: '#fbbf24' };
        const isPaid = b.status === 'paid';
        const memberAvatar = MEMBER_AVATARS[b.member] || null;
        let avatarHtml = memberAvatar
          ? `<img src="${memberAvatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">`
          : `<i class="fa-solid fa-user" style="font-size: 0.70rem; color: #38bdf8;"></i>`;

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.85); border: 1.2px solid ${isPaid ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}; border-radius: 12px; padding: 10px 14px; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, ${catObj.color || '#fbbf24'}, ${(catObj.color || '#fbbf24')}99); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.1rem; flex-shrink: 0;">
                <i class="fa-solid ${catObj.icon || 'fa-file-invoice'}"></i>
              </div>
              <div>
                <div style="font-size: 0.86rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                  <span>${escapeHtml(b.label)}</span>
                  ${isPaid ? '<span style="font-size: 0.62rem; background: rgba(52, 211, 153, 0.2); color: #34d399; padding: 1px 6px; border-radius: 6px; font-weight: 800;">مسددة ✅</span>' : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px; font-size: 0.68rem; color: #94a3b8; flex-wrap: wrap;">
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    ${avatarHtml}
                    <strong style="color: #cbd5e1;">${b.member || 'البيت'}</strong>
                  </span>
                  <span>•</span>
                  <span><i class="fa-regular fa-calendar" style="color: #38bdf8;"></i> ${b.dueDate || '──'}</span>
                  <span>•</span>
                  <span style="color: ${catObj.color || '#fbbf24'};"><i class="fa-solid fa-tag"></i> ${catObj.name}</span>
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${formatMoneyWithSignHtml(b.amount, '-', 'bill-amount-badge')}
              ${b.photo ? `
                <button type="button" onclick="openReceiptLightbox('${b.photo}', 'فاتورة: ${escapeHtml(b.label)}')" style="background: rgba(236, 72, 153, 0.2); border: 1.2px solid rgba(236, 72, 153, 0.4); color: #f472b6; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="معاينة صورة الفاتورة">
                  <i class="fa-solid fa-image" style="font-size: 0.85rem;"></i>
                </button>
              ` : ''}
              ${!isPaid ? `
                <button type="button" onclick="payBillAsExpense('${b.id}')" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; border-radius: 8px; height: 32px; padding: 0 10px; font-size: 0.70rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);" title="سداد الفاتورة وتحويلها لمصروف">
                  <i class="fa-solid fa-check"></i> <span>سداد</span>
                </button>
              ` : ''}
              <button type="button" onclick="deleteExpectedItem('${b.id}')" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="حذف الفاتورة">
                <i class="fa-solid fa-trash-can" style="font-size: 0.78rem;"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // =========================================================================
    // 5. تعديل الفاتورة في الحركة والتصوير بالكاميرا (Edit Tx Receipt Engine)
    // =========================================================================
    // currentEditTxReceiptDataUri declared at top

    function triggerEditTxCamera() {
      const inp = document.getElementById('editTxReceiptInput');
      if (inp) {
        inp.setAttribute('capture', 'environment');
        inp.click();
      }
    }

    function triggerEditTxGallery() {
      const inp = document.getElementById('editTxReceiptInput');
      if (inp) {
        inp.removeAttribute('capture');
        inp.click();
      }
    }

    function handleEditTxReceiptSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        currentEditTxReceiptDataUri = e.target.result;
        updateEditTxReceiptPreview();
        showToast('📷 تم تحميل صورة الفاتورة بنجاح!');
      };
      reader.readAsDataURL(file);
    }

    function updateEditTxReceiptPreview() {
      const previewContainer = document.getElementById('editTxReceiptPreviewContainer');
      const thumb = document.getElementById('editTxReceiptThumb');
      const badge = document.getElementById('editTxReceiptStatusBadge');

      if (currentEditTxReceiptDataUri) {
        if (thumb) thumb.src = currentEditTxReceiptDataUri;
        if (previewContainer) previewContainer.style.display = 'flex';
        if (badge) {
          badge.textContent = 'فاتورة مرفقة ✓';
          badge.style.color = '#34d399';
        }
      } else {
        if (previewContainer) previewContainer.style.display = 'none';
        if (badge) {
          badge.textContent = 'لا توجد فاتورة مرفقة';
          badge.style.color = '#94a3b8';
        }
      }
    }

    function removeEditTxReceipt() {
      currentEditTxReceiptDataUri = null;
      const inp = document.getElementById('editTxReceiptInput');
      if (inp) inp.value = '';
      updateEditTxReceiptPreview();
      showToast('🗑️ تمت إزالة صورة الفاتورة');
    }

    function viewCurrentEditReceipt() {
      if (currentEditTxReceiptDataUri && typeof openReceiptLightbox === 'function') {
        const lbl = document.getElementById('editTxLabel')?.value || 'فاتورة العملية';
        openReceiptLightbox(currentEditTxReceiptDataUri, lbl);
      }
    }

    // =========================================================================
    // 6. حركات التمرير بالسحب (Touch Swipe Gestures)
    // =========================================================================
    let touchStartX = 0;
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        // التحقق من أن التمرير أفقي واضح
        if (Math.abs(deltaX) > 40 && Math.abs(deltaY) < 90) {
          const leftDrawer = document.getElementById('summaryLeftDrawer');
          const isLeftOpen = leftDrawer && (leftDrawer.classList.contains('open') || leftDrawer.classList.contains('active'));
          
          const rightDrawer = document.getElementById('goldDrawerPanel');
          const isRightOpen = rightDrawer && (rightDrawer.classList.contains('open') || rightDrawer.classList.contains('active'));

          // 1. إذا كان الدرج الأيسر (الملخص والمهام) مفتوحاً: التمرير لليسار يغلقه فوراً
          if (isLeftOpen && deltaX < -35) {
            closeSummaryLeftDrawer();
            return;
          }

          // 2. إذا كان الدرج الأيمن (الذهب والبورصة) مفتوحاً: التمرير لليمين يغلقه فوراً
          if (isRightOpen && deltaX > 35) {
            closeGoldDrawer();
            return;
          }

          // 3. فتح الدرج الأيسر: سحب من أقصى اليسار إلى اليمين
          if (!isLeftOpen && !isRightOpen && deltaX > 45 && touchStartX < 95) {
            openSummaryDrawer();
            return;
          }

          // 4. فتح الدرج الأيمن: سحب من أقصى اليمين إلى اليسار
          if (!isLeftOpen && !isRightOpen && deltaX < -45 && touchStartX > (window.innerWidth - 95)) {
            openGoldDrawer();
            return;
          }
        }
      }
    }, { passive: true });


    // ========================================================
    // نظام فحص تذكيرات وتنبيهات المهام المجدولة بالساعة والتاريخ
    // ========================================================
    function checkScheduledTaskReminders() {
      const tasks = getTodoTasks();
      if (!tasks || tasks.length === 0) return;

      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const currentHHMM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

      let changed = false;

      tasks.forEach(t => {
        // 1. فحص المهمة الرئيسية المجدولة
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
          }

          if (isDue) {
            t.reminderFired = true;
            changed = true;
            playNotificationChime();
            const timeLabel = t.dueTime ? `الساعة ${t.dueTime}` : 'اليوم';
            addSystemNotification({
              type: 'task',
              title: `⏰ تذكير موعد مهمة: ${t.title}`,
              body: `حان موعد إنجاز المهمة المجدولة (${timeLabel} - ${t.dueDate})`,
              txId: null
            });
            triggerSystemNotification(`⏰ تذكير مهمة: ${t.title}`, `حان موعد إنجاز المهمة المجدولة (${timeLabel})`);
            showToast(`⏰ حان موعد المهمة: ${t.title}`);
          }
        }

        // 2. فحص المهام الفرعية المجدولة
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
              }
              if (isSubDue) {
                sub.reminderFired = true;
                changed = true;
                playNotificationChime();
                const subTimeLabel = sub.dueTime ? `الساعة ${sub.dueTime}` : 'اليوم';
                addSystemNotification({
                  type: 'task',
                  title: `⏰ تذكير مهمة فرعية: ${sub.title}`,
                  body: `المهمة التابعة لـ [${t.title}] حان موعدها (${subTimeLabel})`,
                  txId: null
                });
                triggerSystemNotification(`⏰ مهمة فرعية: ${sub.title}`, `حان موعد إنجاز المهمة الفرعية`);
                showToast(`⏰ تذكير فرعي: ${sub.title}`);
              }
            }
          });
        }
      });

      if (changed) {
        saveTodoTasks(tasks);
        renderDrawerTasksList();
      }
    }

    // إطلاق فاحص التذكيرات عند التشغيل وكل 20 ثانية
    if (!window._taskReminderInterval) {
      window._taskReminderInterval = setInterval(checkScheduledTaskReminders, 20000);
      setTimeout(checkScheduledTaskReminders, 2000);
    }

