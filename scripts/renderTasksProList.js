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

