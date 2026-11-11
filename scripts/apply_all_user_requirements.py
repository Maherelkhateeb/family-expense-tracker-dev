import re, sys
sys.stdout.reconfigure(encoding='utf-8')

print("Reading index.html...")
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

orig_len = len(content)

# -------------------------------------------------------------
# 1. Remove #btnOpenTasksDrawer and #btnOpenGold from Home Screen
# -------------------------------------------------------------
print("1. Removing #btnOpenTasksDrawer and #btnOpenGold from home screen toolbar...")
# Pattern for btnOpenTasksDrawer
pattern_tasks = r'<!-- زر مهام Microsoft To-Do المتكاملة \(Tasks\) -->\s*<button type="button" class="tool-pill-action" id="btnOpenTasksDrawer"[\s\S]*?</button>'
if re.search(pattern_tasks, content):
    content = re.sub(pattern_tasks, '', content)
    print("✓ Removed #btnOpenTasksDrawer")
else:
    # Fallback search
    pattern_tasks_fallback = r'<button type="button" class="tool-pill-action" id="btnOpenTasksDrawer"[\s\S]*?</button>'
    if re.search(pattern_tasks_fallback, content):
        content = re.sub(pattern_tasks_fallback, '', content)
        print("✓ Removed #btnOpenTasksDrawer (fallback)")
    else:
        print("! #btnOpenTasksDrawer not found")

# Pattern for btnOpenGold
pattern_gold = r'<button type="button" class="tool-pill-action gold-pill" id="btnOpenGold"[\s\S]*?</button>'
if re.search(pattern_gold, content):
    content = re.sub(pattern_gold, '', content)
    print("✓ Removed #btnOpenGold")
else:
    print("! #btnOpenGold not found")

# -------------------------------------------------------------
# 2. Overhaul renderCategoriesGrid:
#    - Individual vibrant color gradients for each category (NO MORE BLACK!)
#    - Lower half inner card taking entire 50% bottom half with large bold amount
# -------------------------------------------------------------
print("2. Overhauling renderCategoriesGrid...")

old_grid_regex = r'function renderCategoriesGrid\(filtered\)\s*\{[\s\S]*?grid\.appendChild\(card\);\s*\}\);\s*\}'

new_render_grid = '''function renderCategoriesGrid(filtered) {
      const grid = document.getElementById('catGrid');
      if (!grid) return;
      grid.innerHTML = '';

      const catTotals = {};
      (filtered || []).forEach(t => {
        if (t.type === 'expense') {
          let c = t.category;
          if (c === 'shopping' || c === 'supermarket') c = 'food';
          if (c === 'kids' || c === 'gifts' || c === 'entertainment') c = 'other';
          if (c === 'others') c = 'other';
          catTotals[c] = (catTotals[c] || 0) + (Number(t.amount) || 0);
        }
      });

      // باليت ألوان وصور مجسمة ثلاثية الأبعاد واضحة وفائقة الدقة والجمال لكل بند - لكل تصنيف لونه الخاص المشرق
      const HIGH_CONTRAST_THEMES = {
        food: {
          name: 'طعام ومشتريات',
          emoji: '🛒',
          accent: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          bgDark: 'linear-gradient(160deg, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.06) 40%, #ffffff 90%)',
          border: '#10b981'
        },
        daily: {
          name: 'مصروف يومي',
          emoji: '☕',
          accent: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          bgDark: 'linear-gradient(160deg, rgba(245, 158, 11, 0.28) 0%, rgba(245, 158, 11, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0.06) 40%, #ffffff 90%)',
          border: '#f59e0b'
        },
        bills: {
          name: 'فواتير والتزامات',
          emoji: '⚡',
          accent: '#f97316',
          gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
          bgDark: 'linear-gradient(160deg, rgba(249, 115, 22, 0.28) 0%, rgba(249, 115, 22, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(249, 115, 22, 0.18) 0%, rgba(249, 115, 22, 0.06) 40%, #ffffff 90%)',
          border: '#f97316'
        },
        transport: {
          name: 'مواصلات وبنزين',
          emoji: '🚗',
          accent: '#0284c7',
          gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          bgDark: 'linear-gradient(160deg, rgba(2, 132, 199, 0.28) 0%, rgba(2, 132, 199, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(2, 132, 199, 0.18) 0%, rgba(2, 132, 199, 0.06) 40%, #ffffff 90%)',
          border: '#0284c7'
        },
        house: {
          name: 'مستلزمات منزل',
          emoji: '🛋️',
          accent: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          bgDark: 'linear-gradient(160deg, rgba(139, 92, 246, 0.28) 0%, rgba(139, 92, 246, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0.06) 40%, #ffffff 90%)',
          border: '#8b5cf6'
        },
        health: {
          name: 'صحة وعلاج',
          emoji: '💊',
          accent: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          bgDark: 'linear-gradient(160deg, rgba(239, 68, 68, 0.28) 0%, rgba(239, 68, 68, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(239, 68, 68, 0.18) 0%, rgba(239, 68, 68, 0.06) 40%, #ffffff 90%)',
          border: '#ef4444'
        },
        clothes: {
          name: 'ملابس وأحذية',
          emoji: '👔',
          accent: '#ec4899',
          gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          bgDark: 'linear-gradient(160deg, rgba(236, 72, 153, 0.28) 0%, rgba(236, 72, 153, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(236, 72, 153, 0.18) 0%, rgba(236, 72, 153, 0.06) 40%, #ffffff 90%)',
          border: '#ec4899'
        },
        education: {
          name: 'تعليم ودروس',
          emoji: '🎓',
          accent: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          bgDark: 'linear-gradient(160deg, rgba(59, 130, 246, 0.28) 0%, rgba(59, 130, 246, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.06) 40%, #ffffff 90%)',
          border: '#3b82f6'
        },
        other: {
          name: 'أخرى ونثريات',
          emoji: '🎁',
          accent: '#14b8a6',
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          bgDark: 'linear-gradient(160deg, rgba(20, 184, 166, 0.28) 0%, rgba(20, 184, 166, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(20, 184, 166, 0.18) 0%, rgba(20, 184, 166, 0.06) 40%, #ffffff 90%)',
          border: '#14b8a6'
        },
        entertainment: {
          name: 'أخرى ونثريات',
          emoji: '🎁',
          accent: '#14b8a6',
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
          bgDark: 'linear-gradient(160deg, rgba(20, 184, 166, 0.28) 0%, rgba(20, 184, 166, 0.12) 40%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(20, 184, 166, 0.18) 0%, rgba(20, 184, 166, 0.06) 40%, #ffffff 90%)',
          border: '#14b8a6'
        }
      };

      const activeTheme = state.appTheme || localStorage.getItem('family_monefy_theme') || 'navy';
      const isLight = (activeTheme === 'light') || document.body.classList.contains('light-theme');
      const activeIconTheme = state.iconTheme || localStorage.getItem('family_monefy_icon_theme') || 'vibrant';

      // تدرجات ألوان الأيقونات الموحدة
      const ICON_THEME_GRADIENTS = {
        gold: { grad: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', glow: 'rgba(245, 158, 11, 0.50)' },
        emerald: { grad: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', glow: 'rgba(16, 185, 129, 0.50)' },
        ocean: { grad: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', glow: 'rgba(2, 132, 199, 0.50)' },
        purple: { grad: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', glow: 'rgba(139, 92, 246, 0.50)' },
        silver: { grad: 'linear-gradient(135deg, #64748b 0%, #1e293b 100%)', glow: 'rgba(148, 163, 184, 0.50)' }
      };

      EXPENSE_CATEGORIES.forEach(cat => {
        const spent = catTotals[cat.id] || (cat.id === 'other' ? (catTotals['entertainment'] || 0) : 0);
        const theme = HIGH_CONTRAST_THEMES[cat.id] || {
          name: cat.name,
          emoji: '📦',
          accent: cat.color || '#38bdf8',
          gradient: `linear-gradient(135deg, ${cat.color}, #334155)`,
          bgDark: 'linear-gradient(160deg, rgba(56, 189, 248, 0.25) 0%, rgba(15, 23, 42, 0.94) 100%)',
          bgLight: 'linear-gradient(160deg, rgba(56, 189, 248, 0.15) 0%, #ffffff 90%)',
          border: cat.color
        };

        // كل كارت يحمل خلفيته اللونية المشرقة المبهجة (ليس أسود أبداً!)
        const cardBg = isLight ? theme.bgLight : theme.bgDark;
        const cardBorder = isLight ? `2px solid ${theme.accent}` : `2px solid ${theme.accent}99`;
        const cardShadow = isLight 
          ? `0 6px 16px rgba(0, 0, 0, 0.08), 0 0 12px ${theme.accent}25` 
          : `0 6px 20px rgba(0, 0, 0, 0.50), 0 0 14px ${theme.accent}35, inset 0 1px 0 rgba(255, 255, 255, 0.15)`;

        // تدرج فقاعة الأيقونة
        let bubbleGradient = theme.gradient;
        let bubbleGlow = `${theme.accent}50`;
        if (activeIconTheme !== 'vibrant' && ICON_THEME_GRADIENTS[activeIconTheme]) {
          bubbleGradient = ICON_THEME_GRADIENTS[activeIconTheme].grad;
          bubbleGlow = ICON_THEME_GRADIENTS[activeIconTheme].glow;
        }

        const card = document.createElement('div');
        card.className = `cat-card cat-theme-${cat.id}`;
        card.setAttribute('data-cat-id', cat.id);

        // تنسيق الكارت كحاوية مقسمة إلى نصفين متساويين تماماً
        card.style.cssText = `
          background: ${cardBg} !important;
          border: ${cardBorder} !important;
          border-radius: 16px !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: space-between !important;
          height: 100% !important;
          max-height: var(--app-card-max-h, 135px) !important;
          min-height: 0 !important;
          box-shadow: ${cardShadow} !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        `;

        let amtDisplay = '0.00 ' + getCurrencySymbol();
        if (state.currency === 'USD') amtDisplay = '$0.00';
        if (spent > 0) {
          amtDisplay = '- ' + formatMoney(spent, true);
        }

        // إعداد ألوان الكارت الداخلي السفلي الكبير للمصروفات
        const lowerCardBg = spent > 0 
          ? (isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.24)') 
          : (isLight ? 'rgba(241, 245, 249, 0.85)' : 'rgba(15, 23, 42, 0.70)');
        const lowerCardBorder = spent > 0 
          ? (isLight ? 'rgba(239, 68, 68, 0.6)' : '#f43f5e') 
          : (isLight ? 'rgba(203, 213, 225, 0.8)' : `${theme.accent}44`);
        const amtColor = spent > 0 
          ? (isLight ? '#b91c1c' : '#ff4d6d') 
          : (isLight ? '#475569' : '#cbd5e1');
        const lowerCardSubColor = spent > 0 
          ? (isLight ? '#991b1b' : '#fda4af') 
          : (isLight ? '#64748b' : '#94a3b8');

        // الخط للمبلغ ليكون كبيراً وبارزاً جداً مع احتواء الأرقام الطويلة
        let amtFontSize = 'clamp(0.92rem, 2.8vw, 1.15rem)';
        let amtLetterSpacing = '0px';
        if (amtDisplay.length > 15) {
          amtFontSize = 'clamp(0.72rem, 2.1vw, 0.82rem)';
          amtLetterSpacing = '-0.4px';
        } else if (amtDisplay.length > 12) {
          amtFontSize = 'clamp(0.78rem, 2.3vw, 0.90rem)';
          amtLetterSpacing = '-0.3px';
        }

        card.innerHTML = `
          <!-- 1. النصف العلوي (50%): أيقونة التصنيف واسمه - النقر هنا يفتح تسجيل جديد -->
          <div class="cat-card-top-half" 
               onclick="event.stopPropagation(); openQuickCategoryExpense('${cat.id}');"
               title="انقر على الرمز لتسجيل مصروف جديد في ${theme.name}"
               style="flex: 1 1 50%; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6px 4px 2px; cursor: pointer; transition: background 0.15s ease;">
            <div class="cat-icon-bubble" 
                 style="background: ${bubbleGradient}; width: clamp(38px, 10vw, 46px); height: clamp(38px, 10vw, 46px); min-width: 36px; min-height: 36px; border-radius: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.35), 0 0 12px ${bubbleGlow}; border: 2px solid rgba(255, 255, 255, 0.6); outline: 1.5px solid ${theme.accent}; flex-shrink: 0; transition: transform 0.15s ease;">
              <span style="font-size: clamp(1.45rem, 4.0vw, 1.85rem); line-height: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));">${theme.emoji}</span>
            </div>
            <div class="cat-label-text" 
                 style="font-family: var(--font-family); font-size: clamp(0.72rem, 2.1vw, 0.82rem); font-weight: 800; color: ${isLight ? '#0f172a' : '#f8fafc'} !important; text-align: center; margin-top: 3px; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; padding: 0 4px; box-sizing: border-box;">
              ${theme.name}
            </div>
          </div>

          <!-- 2. النصف السفلي بالكامل (50%): كارت داخلي كبير وبارز للمصروفات - النقر عليه يفتح كشف العمليات والتفاصيل -->
          <div class="cat-card-bottom-half ${spent > 0 ? 'has-spent' : 'zero-spent'}" 
               onclick="event.stopPropagation(); openOperationsFiltered({ category: '${cat.id}', categoryName: '${cat.name}', type: 'expense' });" 
               title="انقر هنا لعرض كشف وتفاصيل حركات ${theme.name}" 
               style="flex: 1 1 50%; min-height: 0; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px 4px 6px; cursor: pointer; background: ${lowerCardBg}; border-top: 2px solid ${lowerCardBorder}; box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.25); box-sizing: border-box; transition: all 0.15s ease;">
            <div class="cat-amount-val" 
                 style="font-family: var(--font-numbers); font-size: ${amtFontSize}; letter-spacing: ${amtLetterSpacing}; font-weight: 950; color: ${amtColor}; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; direction: rtl; text-align: center; font-variant-numeric: tabular-nums;">
              ${amtDisplay}
            </div>
            <div style="font-size: 0.60rem; font-weight: 800; color: ${lowerCardSubColor}; display: flex; align-items: center; gap: 3px; margin-top: 2px; opacity: 0.9;">
              <i class="fa-solid fa-list-ul" style="font-size: 0.55rem;"></i>
              <span>كشف العمليات</span>
            </div>
          </div>
        `;

        grid.appendChild(card);
      });
    }'''

if re.search(old_grid_regex, content):
    content = re.sub(old_grid_regex, new_render_grid, content)
    print("✓ Successfully replaced renderCategoriesGrid")
else:
    print("! Old renderCategoriesGrid regex failed, trying exact substring replacement")
    # Let's locate 'function renderCategoriesGrid(filtered) {'
    idx_start = content.find('function renderCategoriesGrid(filtered) {')
    if idx_start != -1:
        # find where grid.appendChild(card);\n      });\n    }
        idx_end = content.find('grid.appendChild(card);\n      });\n    }', idx_start)
        if idx_end != -1:
            full_end = idx_end + len('grid.appendChild(card);\n      });\n    }')
            content = content[:idx_start] + new_render_grid + content[full_end:]
            print("✓ Successfully replaced renderCategoriesGrid via substring index")
        else:
            print("! Could not find end of renderCategoriesGrid")

# -------------------------------------------------------------
# 3. Tasks Scheduling: Add Time Input to Drawer New Task Form
# -------------------------------------------------------------
print("3. Adding Time input to Drawer New Task Form...")
old_task_inputs = '<input type="date" id="drawerNewTaskDateInput" style="height: 38px; width: 120px; border-radius: 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.72rem; padding: 0 4px;">'
new_task_inputs = '''<input type="date" id="drawerNewTaskDateInput" style="height: 38px; width: 110px; border-radius: 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.72rem; padding: 0 4px;" title="تاريخ الاستحقاق">
          <input type="time" id="drawerNewTaskTimeInput" style="height: 38px; width: 88px; border-radius: 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.72rem; padding: 0 4px;" title="ساعة التنبيه (اختياري)">'''

if old_task_inputs in content:
    content = content.replace(old_task_inputs, new_task_inputs)
    print("✓ Added drawerNewTaskTimeInput")
else:
    print("! old_task_inputs not found in content, checking variations")
    # Use regex
    time_reg = r'<input type="date" id="drawerNewTaskDateInput"[^>]*>'
    if re.search(time_reg, content):
        content = re.sub(time_reg, new_task_inputs, content, count=1)
        print("✓ Added drawerNewTaskTimeInput via regex")

# -------------------------------------------------------------
# 4. Tasks & Subtasks Overhaul with:
#    - Subtask Photo Upload & Lightbox Preview
#    - Date & Time Handling for Task & Subtask
#    - Scheduled Task Reminders Background Engine (Alert + Chime + System Notif)
#    - Enhanced Professional Task UI (Completion celebration, progress bar, overdue badge)
# -------------------------------------------------------------
print("4. Upgrading Tasks logic and functions...")

# Replace handleDrawerAddNewTask
old_handle_task_regex = r'function handleDrawerAddNewTask\(\)\s*\{[\s\S]*?showToast\(\'✨ تمت إضافة المهمة بنجاح!\'\);\s*\}'
new_handle_task = '''function handleDrawerAddNewTask() {
      const titleInp = document.getElementById('drawerNewTaskTitleInput');
      const dateInp = document.getElementById('drawerNewTaskDateInput');
      const timeInp = document.getElementById('drawerNewTaskTimeInput');
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) {
        showToast('⚠️ يرجى كتابة بيان أو عنوان المهمة');
        return;
      }

      const tasks = getTodoTasks();
      const newTask = {
        id: 'task-' + Date.now(),
        title: title,
        dueDate: dateInp && dateInp.value ? dateInp.value : '',
        dueTime: timeInp && timeInp.value ? timeInp.value : '',
        completed: false,
        starred: currentDrawerTodoSection === 'important',
        photo: currentPendingTaskPhotoUri || null,
        subtasks: [],
        reminderFired: false,
        createdAt: new Date().toISOString(),
        author: state.currentUser || 'ماهر'
      };

      tasks.unshift(newTask);
      saveTodoTasks(tasks);

      if (titleInp) titleInp.value = '';
      if (dateInp) dateInp.value = '';
      if (timeInp) timeInp.value = '';
      clearTaskPendingPhoto();
      playNotificationChime();
      renderDrawerTasksList();
      showToast('✨ تمت إضافة المهمة بنجاح!');
    }'''

if re.search(old_handle_task_regex, content):
    content = re.sub(old_handle_task_regex, new_handle_task, content)
    print("✓ Updated handleDrawerAddNewTask")
else:
    print("! Old handleDrawerAddNewTask regex not matched")

# Upgrade addSubtaskToTask, deleteSubtask, toggleSubtaskCompleted and add subtask photo handlers
old_subtask_block_regex = r'function toggleSubtaskCompleted[\s\S]*?function deleteSubtask\([^\)]*\)\s*\{[\s\S]*?renderDrawerTasksList\(\);\s*\}'

new_subtask_block = '''window.pendingSubtaskPhotos = window.pendingSubtaskPhotos || {};

    function handleSubtaskPhotoPicked(event, taskId) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        window.pendingSubtaskPhotos[taskId] = evt.target.result;
        const badge = document.getElementById(`subtaskPhotoBadge_${taskId}`);
        if (badge) badge.style.display = 'inline';
        showToast('📷 تم إرفاق صورة للمهمة الفرعية');
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
      const dateInp = document.getElementById(`inpSubtaskDate_${taskId}`);
      const timeInp = document.getElementById(`inpSubtaskTime_${taskId}`);
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) {
        showToast('⚠️ يرجى كتابة عنوان المهمة الفرعية');
        return;
      }

      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        if (!task.subtasks) task.subtasks = [];
        const photo = (window.pendingSubtaskPhotos && window.pendingSubtaskPhotos[taskId]) || null;
        task.subtasks.push({
          id: 'sub-' + Date.now(),
          title: title,
          dueDate: dateInp && dateInp.value ? dateInp.value : '',
          dueTime: timeInp && timeInp.value ? timeInp.value : '',
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
    }'''

if re.search(old_subtask_block_regex, content):
    content = re.sub(old_subtask_block_regex, new_subtask_block, content)
    print("✓ Upgraded subtask functions with photo support")
else:
    print("! Old subtask block regex not matched")

# Upgrade renderDrawerTasksList
old_render_drawer_tasks_regex = r'function renderDrawerTasksList\(\)\s*\{[\s\S]*?container\.innerHTML\s*=\s*filtered\.map\(t\s*=>\s*\{[\s\S]*?\}\)\.join\(\'\'\);\s*\}'

new_render_drawer_tasks = '''function renderDrawerTasksList() {
      const container = document.getElementById('drawerTasksContainerList');
      const badge = document.getElementById('drawerTasksCountBadge');
      if (!container) return;

      const allTasks = getTodoTasks();
      const todayStr = getLocalDateStr(new Date());

      if (badge) {
        const activeCount = allTasks.filter(t => !t.completed).length;
        badge.textContent = activeCount;
      }

      let filtered = allTasks;
      if (currentDrawerTodoSection === 'my_day') {
        filtered = allTasks.filter(t => !t.completed && (t.dueDate === todayStr || !t.dueDate));
      } else if (currentDrawerTodoSection === 'important') {
        filtered = allTasks.filter(t => !t.completed && t.starred);
      } else if (currentDrawerTodoSection === 'planned') {
        filtered = allTasks.filter(t => !t.completed && Boolean(t.dueDate));
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
            <div style="font-size: 0.70rem; color: #64748b; margin-top: 4px;">يمكنك إضافة مهمة جديدة وتحديد موعد وساعة تنبيه بالأعلى</div>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(t => {
        const isDone = t.completed;
        const isStar = t.starred;
        const subtasks = t.subtasks || [];
        const completedSubs = subtasks.filter(s => s.completed).length;
        const hasSubs = subtasks.length > 0;
        const progressPct = hasSubs ? Math.round((completedSubs / subtasks.length) * 100) : 0;

        // حالة الموعد: متأخرة أو اليوم أو لاحقاً
        let dueBadgeHtml = '';
        if (t.dueDate) {
          const isOverdue = !isDone && t.dueDate < todayStr;
          const isToday = !isDone && t.dueDate === todayStr;
          const timeText = t.dueTime ? ` ⏰ ${t.dueTime}` : '';

          if (isOverdue) {
            dueBadgeHtml = `<span style="font-size: 0.62rem; color: #f87171; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 6px; padding: 2px 6px; font-weight: 800;"><i class="fa-solid fa-triangle-exclamation"></i> متأخرة: ${t.dueDate}${timeText}</span>`;
          } else if (isToday) {
            dueBadgeHtml = `<span style="font-size: 0.62rem; color: #fbbf24; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 6px; padding: 2px 6px; font-weight: 800;"><i class="fa-regular fa-clock"></i> استحقاق اليوم${timeText}</span>`;
          } else {
            dueBadgeHtml = `<span style="font-size: 0.62rem; color: #c084fc; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 6px; padding: 2px 6px; font-weight: 700;"><i class="fa-regular fa-calendar"></i> ${t.dueDate}${timeText}</span>`;
          }
        }

        // تفاصيل المهام الفرعية مع دعم إرفاق صورة وعرضها
        const subtasksHtml = subtasks.map(s => {
          const subDone = s.completed;
          const subTimeText = s.dueTime ? ` ⏰ ${s.dueTime}` : '';
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; background: rgba(15, 23, 42, 0.65); border: 1px solid ${subDone ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 8px; margin-top: 4px; font-size: 0.72rem; transition: all 0.15s ease;">
              <div style="display: flex; align-items: center; gap: 7px; flex: 1; min-width: 0;">
                <input type="checkbox" ${subDone ? 'checked' : ''} onchange="toggleSubtaskCompleted('${t.id}', '${s.id}')" style="cursor: pointer; width: 14px; height: 14px; accent-color: #10b981;">
                <span style="color: ${subDone ? '#64748b' : '#e2e8f0'}; text-decoration: ${subDone ? 'line-through' : 'none'}; word-break: break-word; font-weight: 600; flex: 1;">${escapeHtml(s.title)}</span>
                ${s.dueDate ? `<span style="font-size: 0.60rem; color: #c084fc; white-space: nowrap;">(${s.dueDate}${subTimeText})</span>` : ''}
              </div>

              <!-- صورة المهمة الفرعية المصغرة وزر حذفها -->
              <div style="display: flex; align-items: center; gap: 5px; margin-right: 6px; flex-shrink: 0;">
                ${s.photo ? `
                  <img src="${s.photo}" onclick="openReceiptLightbox(this.src, 'صورة المهمة الفرعية: ${escapeHtml(s.title)}')" style="width: 24px; height: 24px; border-radius: 5px; object-fit: cover; border: 1.2px solid #38bdf8; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.3);" title="انقر لتكبير صورة المهمة الفرعية">
                ` : ''}
                <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" title="حذف المهمة الفرعية" style="background: transparent; border: none; color: #ef4444; font-size: 0.75rem; cursor: pointer; opacity: 0.75; padding: 0 3px;">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="task-card-item" style="background: rgba(30, 41, 59, 0.85); border: 1.2px solid ${isDone ? 'rgba(52, 211, 153, 0.4)' : (t.starred ? 'rgba(245, 158, 11, 0.4)' : 'rgba(168, 85, 247, 0.35)')}; border-radius: 14px; padding: 11px 13px; display: flex; flex-direction: column; gap: 7px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
            <!-- السطر العلوي: علامة الاكتمال + العنوان + الأيقونات والتنبيهات -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: flex-start; gap: 9px; flex: 1; min-width: 0;">
                <button type="button" onclick="toggleTaskCompleted('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isDone ? '#34d399' : '#94a3b8'}; font-size: 1.25rem; padding: 0; line-height: 1; margin-top: 1px; transition: transform 0.15s ease;" title="${isDone ? 'إعادة فتح المهمة' : 'تعيين المهمة كمكتملة'}">
                  <i class="fa-${isDone ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
                </button>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 0.84rem; font-weight: 800; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'}; word-break: break-word; line-height: 1.3;">
                    ${escapeHtml(t.title)}
                  </div>
                  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 4px;">
                    ${dueBadgeHtml}
                    ${hasSubs ? `<span style="font-size: 0.62rem; color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 6px; padding: 2px 6px; font-weight: 800;"><i class="fa-solid fa-list-ol"></i> ${completedSubs}/${subtasks.length} مكتملة (${progressPct}%)</span>` : ''}
                  </div>
                </div>
              </div>

              <!-- صورة المهمة المصغرة وزر النجمة والحذف -->
              <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                ${t.photo ? `
                  <img src="${t.photo}" onclick="openReceiptLightbox(this.src, 'مرفق المهمة: ${escapeHtml(t.title)}')" style="width: 30px; height: 30px; border-radius: 7px; object-fit: cover; border: 1.5px solid #a855f7; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4);" title="انقر لتكبير صورة المهمة">
                ` : ''}
                <button type="button" onclick="toggleTaskStarred('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: ${isStar ? '#fbbf24' : '#64748b'}; font-size: 1.05rem; padding: 2px;" title="${isStar ? 'إلغاء التمييز بنجمة' : 'تمييز كمهمة هامة'}">
                  <i class="fa-${isStar ? 'solid' : 'regular'} fa-star"></i>
                </button>
                <button type="button" onclick="deleteTaskItem('${t.id}')" style="background: transparent; border: none; cursor: pointer; color: #ef4444; font-size: 0.90rem; padding: 2px; opacity: 0.75;" title="حذف المهمة">
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

            <!-- تفاصيل المهام الفرعية وإمكانية إضافة مهمة فرعية جديدة مع صورة وتاريخ ووقت -->
            <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; margin-top: 2px;">
              ${subtasksHtml}

              <!-- سطر إضافة مهمة فرعية جديدة مع موعد وصورة -->
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; align-items: center; background: rgba(15, 23, 42, 0.55); border-radius: 8px; padding: 5px;">
                <input type="text" id="inpSubtaskTitle_${t.id}" placeholder="إضافة خطوة أو مهمة فرعية..." style="flex: 1 1 120px; height: 28px; border-radius: 6px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #fff; font-size: 0.70rem; padding: 0 8px; outline: none;">
                <input type="date" id="inpSubtaskDate_${t.id}" style="width: 95px; height: 28px; border-radius: 6px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.64rem; padding: 0 2px;" title="تاريخ المهمة الفرعية">
                <input type="time" id="inpSubtaskTime_${t.id}" style="width: 70px; height: 28px; border-radius: 6px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.64rem; padding: 0 2px;" title="ساعة المهمة الفرعية">
                
                <!-- إرفاق صورة للمهمة الفرعية -->
                <input type="file" id="inpSubtaskPhoto_${t.id}" accept="image/*" style="display: none;" onchange="handleSubtaskPhotoPicked(event, '${t.id}')">
                <button type="button" onclick="document.getElementById('inpSubtaskPhoto_${t.id}').click()" title="إرفاق صورة للمهمة الفرعية" id="btnSubtaskPhoto_${t.id}" style="height: 28px; padding: 0 7px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.70rem; cursor: pointer; display: flex; align-items: center; gap: 3px;">
                  <i class="fa-solid fa-camera"></i>
                  <span id="subtaskPhotoBadge_${t.id}" style="display: none; font-size: 0.60rem; color: #34d399; font-weight: 800;">✓</span>
                </button>

                <button type="button" onclick="addSubtaskToTask('${t.id}')" style="height: 28px; padding: 0 10px; border-radius: 6px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-plus"></i> إضافة
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }'''

if re.search(old_render_drawer_tasks_regex, content):
    content = re.sub(old_render_drawer_tasks_regex, new_render_drawer_tasks, content)
    print("✓ Successfully upgraded renderDrawerTasksList")
else:
    print("! Old renderDrawerTasksList regex not matched")

# -------------------------------------------------------------
# 5. Background Task Reminders & Notifications Engine:
#    - checkScheduledTaskReminders every 20 seconds
# -------------------------------------------------------------
print("5. Adding checkScheduledTaskReminders Engine...")

reminder_engine_code = '''
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
        // 1. فحص المهمة الرئيسية
        if (!t.completed && !t.reminderFired && t.dueDate) {
          let isDue = false;
          if (t.dueDate < todayStr) {
            isDue = true;
          } else if (t.dueDate === todayStr) {
            if (!t.dueTime || t.dueTime <= currentHHMM) {
              isDue = true;
            }
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

        // 2. فحص المهام الفرعية
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
'''

if 'checkScheduledTaskReminders' not in content:
    # Inject before </script> before closing body
    last_script_close = content.rfind('</script>')
    if last_script_close != -1:
        content = content[:last_script_close] + reminder_engine_code + '\n' + content[last_script_close:]
        print("✓ Injected checkScheduledTaskReminders engine")
    else:
        print("! Could not find </script>")
else:
    print("! checkScheduledTaskReminders already present in content")

# -------------------------------------------------------------
# 6. Bump Version & Build ID to 4.9.6 / 202611071630
# -------------------------------------------------------------
print("6. Bumping build ID and version to 4.9.6 / 202611071630...")
content = re.sub(r"APP_VERSION\s*=\s*'4\.9\.5'", "APP_VERSION = '4.9.6'", content)
content = re.sub(r'APP_BUILD_ID\s*=\s*202611071515', 'APP_BUILD_ID = 202611071630', content)

# Write index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print(f"✓ Wrote updated index.html! New length: {len(content)} (orig: {orig_len})")

# Update version.json
with open('version.json', 'w', encoding='utf-8') as f:
    f.write('''{
  "version": "4.9.6",
  "build": 202611071630,
  "updated_at": "2026-11-07 04:30 PM",
  "description": "v4.9.6: Category cards vibrant gradient colors overhaul, enlarged bottom half expense card with operations view. Removed Tasks and Gold buttons from home toolbar. Upgraded tasks with subtask photos, date & time scheduling, and automated alarm alerts."
}''')
print("✓ Updated version.json")

# Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()
sw = re.sub(r"CACHE_NAME\s*=\s*'family-monefy-v4\.9\.5'", "CACHE_NAME = 'family-monefy-v4.9.6'", sw)
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw)
print("✓ Updated sw.js cache name to family-monefy-v4.9.6")
