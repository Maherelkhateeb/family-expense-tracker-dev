import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

p_start = content.find('function renderDrawerTasksList() {')
p_end = content.find('    // =========================================================================\n    // 2. مهام Microsoft To-Do المتكاملة', p_start)

if p_start == -1 or p_end == -1:
    print(f"Error finding bounds: p_start={p_start}, p_end={p_end}")
    sys.exit(1)

new_render_code = """function renderDrawerTasksList() {
      const container = document.getElementById('drawerTasksContainerList');
      const badge = document.getElementById('drawerTasksCountBadge');
      if (!container) return;

      const allTasks = getTodoTasks();
      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const currentHHMM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      const currentIsoPrefix = `${todayStr}T${currentHHMM}`;

      // 1. حساب مؤشرات الـ KPIs المعتمدة بدقة رياضية
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

      // 2. الفلترة المتقدمة حسب القسم المختار
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
          <div style="text-align: center; padding: 40px 14px; background: rgba(15, 23, 42, 0.65); border: 1.5px dashed rgba(168, 85, 247, 0.30); border-radius: 16px; margin-top: 6px;">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(168, 85, 247, 0.15); color: #c084fc; display: inline-flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 10px;">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <div style="font-weight: 850; font-size: 0.88rem; color: #f8fafc;">لا توجد مهام في هذا القسم حالياً</div>
            <div style="font-size: 0.72rem; color: #94a3b8; margin: 6px 0 14px;">يمكنك إضافة مهمة جديدة وتحديد الموعد والتنبيهات الموحدة بخطوة واحدة</div>
            <button type="button" onclick="openNewTaskDrawerModal()" style="height: 36px; padding: 0 18px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.76rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 10px rgba(168, 85, 247, 0.35);">
              <i class="fa-solid fa-plus"></i> + إضافة مهمة جديدة الآن
            </button>
          </div>
        `;
        return;
      }

      // قواميس الوسوم والتصنيفات والأولويات
      const TAG_LABELS = {
        bills: { name: 'فواتير والتزامات', icon: 'fa-receipt', color: '#f97316' },
        shopping: { name: 'مشتريات', icon: 'fa-cart-shopping', color: '#10b981' },
        home: { name: 'منزل', icon: 'fa-house', color: '#8b5cf6' },
        family: { name: 'أسرة وشخصي', icon: 'fa-heart', color: '#ec4899' },
        work: { name: 'عمل ودراسة', icon: 'fa-briefcase', color: '#0284c7' },
        general: { name: 'عام', icon: 'fa-tag', color: '#94a3b8' }
      };

      const PRIORITY_BADGES = {
        high: `<span class="task-badge task-badge-urgent"><i class="fa-solid fa-fire"></i> عاجل</span>`,
        medium: `<span class="task-badge" style="background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24;"><i class="fa-solid fa-star"></i> متوسط</span>`,
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
            dueBadgeHtml = `<span class="task-badge task-badge-overdue"><i class="fa-solid fa-triangle-exclamation"></i> متأخرة: ${formattedDt}</span>`;
          } else if (isToday) {
            cardStateClass = 'is-today';
            dueBadgeHtml = `<span class="task-badge task-badge-today"><i class="fa-regular fa-sun"></i> اليوم: ${formattedDt}</span>`;
          } else {
            dueBadgeHtml = `<span class="task-badge task-badge-planned"><i class="fa-regular fa-calendar"></i> ${formattedDt}</span>`;
          }
        }

        const tagInfo = TAG_LABELS[t.tag] || TAG_LABELS.general;
        const tagBadgeHtml = (t.tag && t.tag !== 'general')
          ? `<span class="task-badge" style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: ${tagInfo.color};"><i class="fa-solid ${tagInfo.icon}"></i> ${tagInfo.name}</span>`
          : '';

        const prioBadgeHtml = PRIORITY_BADGES[t.priority] || '';

        // قائمة الخطوات الفرعية التفاعلية
        const subtasksHtml = subtasks.map(s => {
          const subDone = s.completed;
          const subDt = s.dueDateTime || (s.dueDate ? `${s.dueDate}${s.dueTime ? 'T' + s.dueTime : ''}` : '');
          const subDtText = subDt ? formatArabicDateTime(subDt) : '';

          return `
            <div class="subtask-row-item ${subDone ? 'done' : ''}">
              <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                <button type="button" onclick="toggleSubtaskCompleted('${t.id}', '${s.id}')" title="${subDone ? 'إعادة فتح الخطوة' : 'تعليم كمكتملة'}" style="background: transparent; border: none; padding: 0; cursor: pointer; color: ${subDone ? '#10b981' : '#c084fc'}; font-size: 1rem; display: flex; align-items: center; flex-shrink: 0;">
                  <i class="fa-${subDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
                </button>
                <span style="font-size: 0.76rem; font-weight: 750; color: ${subDone ? '#64748b' : '#e2e8f0'}; text-decoration: ${subDone ? 'line-through' : 'none'}; word-break: break-word;">
                  ${escapeHtml(s.title)}
                </span>
                ${subDtText ? `<span style="font-size: 0.60rem; color: #c084fc; background: rgba(168, 85, 247, 0.14); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 4px; padding: 1px 5px; white-space: nowrap;"><i class="fa-regular fa-clock"></i> ${subDtText}</span>` : ''}
              </div>

              <!-- صورة الخطوة الفرعية وزر حذفها -->
              <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                ${s.photo ? `
                  <img src="${s.photo}" onclick="openReceiptLightbox(this.src, 'مرفق الخطوة الفرعية: ${escapeHtml(s.title)}')" style="width: 22px; height: 22px; border-radius: 5px; object-fit: cover; border: 1.2px solid #a855f7; cursor: zoom-in;" title="تكبير الصورة">
                ` : ''}
                <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" title="حذف الخطوة الفرعية" style="background: transparent; border: none; color: #ef4444; opacity: 0.75; cursor: pointer; font-size: 0.74rem; padding: 2px 4px;">
                  <i class="fa-solid fa-trash-can"></i>
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
                <button type="button" onclick="toggleTaskCompleted('${t.id}')" class="task-check-circle" title="${isDone ? 'إعادة فتح المهمة' : 'تعليم كمكتملة'}" style="margin-top: 1px; color: ${isDone ? '#10b981' : '#c084fc'}; font-size: 1.18rem;">
                  <i class="fa-${isDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
                </button>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 0.86rem; font-weight: 850; line-height: 1.35; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'}; word-break: break-word;">
                    ${escapeHtml(t.title)}
                  </div>
                  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 5px;">
                    ${dueBadgeHtml}
                    ${prioBadgeHtml}
                    ${tagBadgeHtml}
                    ${hasSubs ? `<span class="task-badge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8;"><i class="fa-solid fa-list-check"></i> ${completedSubs}/${subtasks.length} خطوة</span>` : ''}
                    <span style="font-size: 0.58rem; color: #64748b;">بواسطة: ${escapeHtml(t.author || 'العائلة')}</span>
                  </div>
                </div>
              </div>

              <!-- أدوات التحكم السريعة: تحويل لمصروف، تعديل، صورة، نجمة، حذف -->
              <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
                ${t.photo ? `
                  <img src="${t.photo}" onclick="openReceiptLightbox(this.src, 'مرفق المهمة: ${escapeHtml(t.title)}')" style="width: 26px; height: 26px; border-radius: 6px; object-fit: cover; border: 1.3px solid #a855f7; cursor: zoom-in;" title="تكبير الصورة المرفقة">
                ` : ''}
                <button type="button" onclick="convertTaskToExpense('${t.id}')" title="تحويل لمصروف مسجل بلمسة واحدة" style="height: 28px; padding: 0 8px; background: rgba(16, 185, 129, 0.16); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; border-radius: 8px; font-size: 0.68rem; font-weight: 850; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
                  <i class="fa-solid fa-money-bill-transfer"></i>
                  <span>تحويل لمصروف</span>
                </button>
                <button type="button" onclick="openEditTaskPrompt('${t.id}')" title="تعديل عنوان المهمة" style="width: 28px; height: 28px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                  <i class="fa-solid fa-pen" style="font-size: 0.72rem;"></i>
                </button>
                <button type="button" onclick="toggleTaskStarred('${t.id}')" title="${isStar ? 'إلغاء التمييز' : 'تمييز كمهمة هامة'}" style="width: 28px; height: 28px; background: transparent; border: none; color: ${isStar ? '#fbbf24' : '#64748b'}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.85rem;">
                  <i class="fa-${isStar ? 'solid' : 'regular'} fa-star"></i>
                </button>
                <button type="button" onclick="deleteTaskItem('${t.id}')" title="حذف المهمة" style="width: 28px; height: 28px; background: transparent; border: none; color: #ef4444; opacity: 0.8; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.85rem;">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            <!-- شريط تقدم إنجاز المهام الفرعية (Progress Bar) -->
            ${hasSubs ? `
              <div style="width: 100%; height: 5px; background: rgba(15, 23, 42, 0.9); border-radius: 4px; overflow: hidden; margin-top: 4px;">
                <div style="width: ${progressPct}%; height: 100%; background: ${progressPct === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #a855f7, #38bdf8)'}; border-radius: 4px; transition: width 0.3s ease;"></div>
              </div>
            ` : ''}

            <!-- قسم الخطوات والمهام الفرعية المنسق والاحترافي -->
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; margin-top: 6px;">
              <!-- هيدر الخطوات الفرعية مع زر الإضافة المنسق -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.80rem;"></i>
                  <span style="font-size: 0.74rem; font-weight: 850; color: #f8fafc;">الخطوات والمهام الفرعية:</span>
                  ${hasSubs ? `<span style="font-size: 0.62rem; color: #34d399; background: rgba(16, 185, 129, 0.16); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; padding: 1px 5px; font-weight: 800;">${completedSubs} من ${subtasks.length} مكتملة (${progressPct}%)</span>` : ''}
                </div>
                <button type="button" onclick="toggleSubtaskForm('${t.id}')" style="background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.40); color: #c084fc; border-radius: 7px; padding: 3px 8px; font-size: 0.68rem; font-weight: 850; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; transition: all 0.15s ease;">
                  <i class="fa-solid fa-plus"></i> إضافة خطوة فرعية
                </button>
              </div>

              <!-- قائمة الخطوات الفرعية المسجلة -->
              ${hasSubs ? `
                <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 6px;">
                  ${subtasksHtml}
                </div>
              ` : `
                <div style="font-size: 0.68rem; color: #64748b; padding: 4px 2px; text-align: right; margin-bottom: 4px;">
                  💡 لم تتم إضافة خطوات فرعية بعد. انقر على "+ إضافة خطوة فرعية" لتفتيت المهمة لخطوات تنفيذية.
                </div>
              `}

              <!-- صندوق ونموذج إضافة خطوة فرعية مخصص ومنسق هندسياً -->
              <div id="subtaskAddBox_${t.id}" style="display: none; background: rgba(15, 23, 42, 0.98); border: 1.5px solid rgba(168, 85, 247, 0.45); border-radius: 12px; padding: 10px 12px; margin-top: 8px; box-shadow: 0 4px 18px rgba(0,0,0,0.45);">
                <div style="font-size: 0.74rem; font-weight: 900; color: #c084fc; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                  <span style="display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-circle-plus"></i> إضافة خطوة أو مهمة فرعية جديدة:
                  </span>
                  <button type="button" onclick="toggleSubtaskForm('${t.id}', false)" style="background: transparent; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer;">&times;</button>
                </div>

                <!-- 1. عنوان وبيان الخطوة الفرعية -->
                <div style="margin-bottom: 8px;">
                  <input type="text" id="inpSubtaskTitle_${t.id}" placeholder="اكتب بيان الخطوة الفرعية... (مثال: سحب إيصال، شراء خضار)" style="width: 100%; height: 36px; background: rgba(30, 41, 59, 0.95); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 8px; color: #fff; padding: 0 10px; font-size: 0.78rem; font-weight: 700; outline: none;">
                </div>

                <!-- 2. صف التاريخ والوقت الموحد + تصوير وإرفاق الصورة -->
                <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 10px;">
                  <div style="flex: 1; position: relative;">
                    <input type="datetime-local" id="inpSubtaskDateTime_${t.id}" class="task-datetime-input" style="width: 100%; height: 34px; background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; color: #fff; padding: 0 8px; font-size: 0.72rem; outline: none;">
                  </div>

                  <!-- زر إرفاق صورة للخطوة الفرعية -->
                  <input type="file" id="inpSubtaskPhoto_${t.id}" accept="image/*" style="display: none;" onchange="handleSubtaskPhotoPicked(event, '${t.id}')">
                  <button type="button" onclick="document.getElementById('inpSubtaskPhoto_${t.id}').click()" title="إرفاق صورة للخطوة الفرعية" id="btnSubtaskPhoto_${t.id}" style="height: 34px; padding: 0 10px; border-radius: 8px; background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.35); color: #c084fc; font-size: 0.72rem; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; cursor: pointer;">
                    <i class="fa-solid fa-camera"></i>
                    <span>صورة</span>
                    <span id="subtaskPhotoBadge_${t.id}" style="display: none; font-size: 0.65rem; color: #34d399; font-weight: 900;">✓</span>
                  </button>
                </div>

                <!-- 3. أزرار الحفظ والإلغاء المنسقة -->
                <div style="display: flex; gap: 8px;">
                  <button type="button" onclick="addSubtaskToTask('${t.id}')" style="flex: 2; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.76rem; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);">
                    <i class="fa-solid fa-check"></i> حفظ الخطوة الفرعية
                  </button>
                  <button type="button" onclick="toggleSubtaskForm('${t.id}', false)" style="flex: 1; height: 34px; border-radius: 8px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #94a3b8; font-size: 0.74rem; font-weight: 800; cursor: pointer;">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
"""

new_content = content[:p_start] + new_render_code + content[p_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Rebuilt renderDrawerTasksList from scratch successfully!")
