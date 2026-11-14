import re

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Original content length: {len(content)} characters")

# =========================================================================
# STEP 1: Fix Head CSS & Drawer Overflow Protection
# =========================================================================

# Ensure high contrast rules and drawer overflow protection are properly enclosed in <style>
old_css_split = '''</style>

    /* =========================================================================
       قواعد التباين العالي المحاسبي لكافة التسجيلات والكتابات (High Contrast Rules)'''

new_css_split = '''    /* =========================================================================
       قواعد التباين العالي المحاسبي لكافة التسجيلات والكتابات (High Contrast Rules)'''

if old_css_split in content:
    content = content.replace(old_css_split, new_css_split, 1)
    print("Step 1a: Removed premature </style> at line 11621.")

# Add drawer overflow protection and tasks pro styling before </head>
target_head = '</head>\n<body>'

new_tasks_css = '''
    /* حماية صارمة لمنع تمدد القوائم الجانبية المغلقة لتفادي أي تمدد أفقي في المتصفح */
    .side-drawer-panel:not(.open) { display: none !important; }
    .summary-left-drawer:not(.open) { display: none !important; }
    .side-drawer-panel.open, .summary-left-drawer.open { display: flex !important; }

    /* أنماط وتنسيقات نظام المهام الاحترافي الحديث (Tasks Pro System) */
    .task-kpi-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .task-kpi-card {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 6px 4px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .task-kpi-card:hover {
      border-color: rgba(168, 85, 247, 0.5);
      background: rgba(30, 41, 59, 0.85);
    }
    .task-kpi-num {
      font-family: var(--font-numbers);
      font-size: 0.95rem;
      font-weight: 900;
      line-height: 1.1;
    }
    .task-kpi-label {
      font-size: 0.60rem;
      font-weight: 800;
      color: #94a3b8;
      margin-top: 2px;
    }
    .task-card-item {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%);
      border: 1.2px solid rgba(168, 85, 247, 0.35);
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 7px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
      transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      position: relative;
    }
    .task-card-item.is-overdue {
      border-color: rgba(239, 68, 68, 0.65) !important;
      box-shadow: 0 0 14px rgba(239, 68, 68, 0.25) !important;
    }
    .task-card-item.is-today {
      border-color: rgba(245, 158, 11, 0.60) !important;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.20) !important;
    }
    .task-card-item.is-completed {
      border-color: rgba(52, 211, 153, 0.40) !important;
      opacity: 0.85;
    }
    .task-preset-chip {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.35);
      color: #c084fc;
      font-size: 0.64rem;
      font-weight: 800;
      border-radius: 6px;
      padding: 3px 8px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .task-preset-chip:hover {
      background: rgba(168, 85, 247, 0.30);
      color: #fff;
    }
    .task-datetime-input {
      color-scheme: dark;
    }
    body.light-theme .task-datetime-input {
      color-scheme: light;
    }
  </style>
</head>
<body>'''

if target_head in content:
    content = content.replace(target_head, new_tasks_css, 1)
    print("Step 1b: Added CSS and closed </style> before </head>.")
else:
    print("Step 1b: target_head not found, checking alternatives...")

# =========================================================================
# STEP 2: Upgrade Tasks HTML in drawerTasksViewSection
# =========================================================================

old_tasks_view_section = '''    <!-- 2. لوحة محتوى المهام المتكاملة (Tasks View Section) -->
    <div id="drawerTasksViewSection" style="display: none; flex: 1; overflow-y: auto; padding: 12px; flex-direction: column; gap: 10px;" class="custom-scrollbar">
      <!-- نموذج إضافة مهمة جديدة مع تحديد التاريخ والصورة -->
      <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 10px;">
        <div style="display: flex; gap: 6px; margin-bottom: 6px;">
          <input type="text" id="drawerNewTaskTitleInput" placeholder="أضف مهمة جديدة... (مثال: سداد اشتراك النادي)" style="flex: 1; height: 38px; border-radius: 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(168, 85, 247, 0.3); color: #fff; font-size: 0.82rem; font-weight: 800; padding: 0 10px; outline: none;">
          <input type="date" id="drawerNewTaskDateInput" style="height: 38px; width: 110px; border-radius: 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.72rem; padding: 0 4px;" title="تاريخ الاستحقاق">
          <input type="time" id="drawerNewTaskTimeInput" style="height: 38px; width: 88px; border-radius: 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.72rem; padding: 0 4px;" title="ساعة التنبيه (اختياري)">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 6px;">
            <input type="file" id="inpTaskPhotoCamera" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <input type="file" id="inpTaskPhotoGallery" accept="image/*" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <button type="button" onclick="document.getElementById('inpTaskPhotoCamera').click()" style="padding: 4px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
              <i class="fa-solid fa-camera"></i> تصوير
            </button>
            <button type="button" onclick="document.getElementById('inpTaskPhotoGallery').click()" style="padding: 4px 8px; border-radius: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
              <i class="fa-solid fa-images"></i> صورة
            </button>
            <span id="taskPhotoAttachedBadge" style="display: none; font-size: 0.62rem; color: #34d399; font-weight: 800; align-self: center;">
              <i class="fa-solid fa-check"></i> تم إرفاق صورة
            </span>
          </div>
          <button type="button" onclick="handleDrawerAddNewTask()" style="padding: 6px 16px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.78rem; font-weight: 900; cursor: pointer;">
            <i class="fa-solid fa-plus"></i> إضافة مهمة
          </button>
        </div>
        <!-- معاينة صورة المهمة المعلقة -->
        <div id="taskPendingPhotoPreview" style="display: none; margin-top: 6px; text-align: center; position: relative;">
          <img id="taskPendingPhotoImg" src="" style="max-height: 70px; border-radius: 6px; border: 1px solid rgba(168, 85, 247, 0.5);">
          <button type="button" onclick="clearTaskPendingPhoto()" style="position: absolute; top: -5px; right: 40%; background: #ef4444; border: none; border-radius: 50%; color: #fff; width: 20px; height: 20px; font-size: 0.70rem; cursor: pointer;">&times;</button>
        </div>
      </div>

      <!-- تبويبات أقسام المهام: مهام اليوم / الهامة / المخططة / الكل / المكتملة -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px;">
        <button type="button" class="exp-tab-btn active" id="btnDrawerTodoMyDay" onclick="switchDrawerTodoSection('my_day')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: rgba(168, 85, 247, 0.25); color: #c084fc; border: none; cursor: pointer; text-align: center;">يومي</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoImportant" onclick="switchDrawerTodoSection('important')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">هام ⭐</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoPlanned" onclick="switchDrawerTodoSection('planned')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">مخطط</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoAll" onclick="switchDrawerTodoSection('all')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">الكل</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoCompleted" onclick="switchDrawerTodoSection('completed')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.66rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">المكتملة</button>
      </div>

      <!-- قائمة المهام التفاعلية المتطورة مع المهام الفرعية والصور -->
      <div id="drawerTasksContainerList" style="display: flex; flex-direction: column; gap: 8px;"></div>
    </div>'''

new_tasks_view_section = '''    <!-- 2. لوحة محتوى المهام المتكاملة الاحترافية (Tasks Pro System) -->
    <div id="drawerTasksViewSection" style="display: none; flex: 1; overflow-y: auto; padding: 12px; flex-direction: column; gap: 10px;" class="custom-scrollbar">
      
      <!-- شريط مؤشرات إنجاز المهام الذكي (KPIs & Metrics) -->
      <div class="task-kpi-strip">
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('all')" style="cursor: pointer;" title="عرض كافة المهام النشطة">
          <span class="task-kpi-num" id="kpiTasksTotal" style="color: #38bdf8;">0</span>
          <span class="task-kpi-label">إجمالي المهام</span>
        </div>
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('my_day')" style="cursor: pointer;" title="عرض مهام اليوم">
          <span class="task-kpi-num" id="kpiTasksActive" style="color: #c084fc;">0</span>
          <span class="task-kpi-label">قيد التنفيذ</span>
        </div>
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('overdue')" style="cursor: pointer;" title="عرض المهام المتأخرة">
          <span class="task-kpi-num" id="kpiTasksOverdue" style="color: #ef4444;">0</span>
          <span class="task-kpi-label">متأخرة ⚠️</span>
        </div>
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('completed')" style="cursor: pointer;" title="عرض المهام المنجزة">
          <span class="task-kpi-num" id="kpiTasksDone" style="color: #34d399;">0</span>
          <span class="task-kpi-label">مكتملة ✅</span>
        </div>
      </div>

      <!-- شريط نسبة الإنجاز التراكمي -->
      <div style="background: rgba(15, 23, 42, 0.82); border-radius: 9px; padding: 6px 10px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-chart-line" style="color: #a855f7; font-size: 0.80rem;"></i>
          <span style="font-size: 0.68rem; font-weight: 800; color: #cbd5e1;">معدل إنجاز المهام:</span>
        </div>
        <div style="flex: 1; max-width: 150px; height: 6px; background: rgba(30, 41, 59, 0.9); border-radius: 4px; overflow: hidden;">
          <div id="tasksOverallProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #a855f7, #10b981); transition: width 0.4s ease;"></div>
        </div>
        <span id="tasksOverallProgressPct" style="font-size: 0.70rem; font-weight: 900; color: #10b981; font-family: var(--font-numbers);">0%</span>
      </div>

      <!-- صندوق إضافة مهمة جديدة احترافي مع اختيار موعد ووقت موحد وصور وتصنيفات -->
      <div style="background: rgba(15, 23, 42, 0.88); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 14px; padding: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 0.74rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-circle-plus" style="color: #a855f7;"></i> إضافة مهمة ذكية جديدة
          </span>
          <span style="font-size: 0.62rem; color: #c084fc; font-weight: 700;">تنبيه آلي بالموعد ⏰</span>
        </div>

        <!-- 1. بيان وعنوان المهمة -->
        <div style="margin-bottom: 8px;">
          <input type="text" id="drawerNewTaskTitleInput" placeholder="اكتب عنوان المهمة أو الالتزام... (مثال: سداد قسط المدرسة)" style="width: 100%; height: 38px; border-radius: 9px; background: rgba(30, 41, 59, 0.85); border: 1.2px solid rgba(168, 85, 247, 0.35); color: #fff; font-size: 0.80rem; font-weight: 800; padding: 0 10px; outline: none; box-sizing: border-box;">
        </div>

        <!-- 2. سطر تحديد التاريخ والوقت في نفس الاختيار (Unified DateTime Selection) -->
        <div style="margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="position: relative; flex: 1;">
              <span style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 0.76rem; color: #a855f7; pointer-events: none;">
                <i class="fa-regular fa-clock"></i>
              </span>
              <input type="datetime-local" id="drawerNewTaskDateTimeInput" class="task-datetime-input" style="width: 100%; height: 36px; border-radius: 9px; background: rgba(30, 41, 59, 0.85); border: 1.2px solid rgba(168, 85, 247, 0.35); color: #cbd5e1; font-size: 0.74rem; font-weight: 700; padding: 0 32px 0 8px; outline: none; box-sizing: border-box;" title="تحديد التاريخ والوقت معاً في نفس الاختيار">
            </div>
          </div>

          <!-- اختصارات سريعة لضبط الموعد بنقرة زر -->
          <div style="display: flex; gap: 4px; overflow-x: auto; padding: 5px 0 2px;" class="custom-scrollbar">
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('today_evening')">⚡ اليوم 8:00 م</button>
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('tomorrow_morning')">☀️ غداً 10:00 ص</button>
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('after_two_days')">📅 بعد يومين</button>
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('weekend')">🗓️ عطلة الأسبوع</button>
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('clear')" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.1);">❌ مسح</button>
          </div>
        </div>

        <!-- 3. الأولوية والتصنيف والأزرار -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <select id="drawerNewTaskPriority" style="height: 30px; border-radius: 7px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.68rem; font-weight: 800; padding: 0 6px; outline: none;">
              <option value="normal">🟢 عادي</option>
              <option value="medium">🟡 متوسط</option>
              <option value="high">🔴 عالي جداً</option>
            </select>

            <select id="drawerNewTaskTag" style="height: 30px; border-radius: 7px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.68rem; font-weight: 800; padding: 0 6px; outline: none;">
              <option value="general">📋 عام</option>
              <option value="bills">📄 فواتير والتزامات</option>
              <option value="shopping">🛒 مشتريات وسوبرماركت</option>
              <option value="home">🏠 مستلزمات منزل</option>
              <option value="family">👨‍👩‍👧 أسرة وشخصي</option>
              <option value="work">💼 عمل ودراسة</option>
            </select>
          </div>

          <!-- التقاط وإرفاق صورة -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="file" id="inpTaskPhotoCamera" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <input type="file" id="inpTaskPhotoGallery" accept="image/*" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <button type="button" onclick="document.getElementById('inpTaskPhotoCamera').click()" title="تصوير عبر الكاميرا" style="height: 30px; padding: 0 8px; border-radius: 7px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-camera"></i> تصوير
            </button>
            <button type="button" onclick="document.getElementById('inpTaskPhotoGallery').click()" title="صورة من الاستوديو" style="height: 30px; padding: 0 8px; border-radius: 7px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-images"></i> صورة
            </button>
            <button type="button" onclick="handleDrawerAddNewTask()" style="height: 30px; padding: 0 14px; border-radius: 7px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.76rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);">
              <i class="fa-solid fa-plus"></i> إضافة مهمة
            </button>
          </div>
        </div>

        <!-- معاينة الصورة المعلقة للمهمة -->
        <div id="taskPendingPhotoPreview" style="display: none; margin-top: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 6px; text-align: center; position: relative;">
          <img id="taskPendingPhotoImg" src="" style="max-height: 80px; border-radius: 6px; border: 1.5px solid #a855f7; object-fit: contain;">
          <button type="button" onclick="clearTaskPendingPhoto()" style="position: absolute; top: 4px; left: 8px; background: #ef4444; border: none; border-radius: 50%; color: #fff; width: 22px; height: 22px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
      </div>

      <!-- تبويبات أقسام المهام الستة: يومي / هام / مخطط / متأخرة / الكل / المكتملة -->
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; margin: 2px 0;">
        <button type="button" class="exp-tab-btn active" id="btnDrawerTodoMyDay" onclick="switchDrawerTodoSection('my_day')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.64rem; background: rgba(168, 85, 247, 0.25); color: #c084fc; border: none; cursor: pointer; text-align: center;">يومي</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoImportant" onclick="switchDrawerTodoSection('important')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.64rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">هام ⭐</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoPlanned" onclick="switchDrawerTodoSection('planned')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.64rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">مخطط</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoOverdue" onclick="switchDrawerTodoSection('overdue')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.64rem; background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.25); cursor: pointer; text-align: center;">متأخرة ⚠️</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoAll" onclick="switchDrawerTodoSection('all')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.64rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">الكل</button>
        <button type="button" class="exp-tab-btn" id="btnDrawerTodoCompleted" onclick="switchDrawerTodoSection('completed')" style="padding: 5px 2px; border-radius: 7px; font-weight: 800; font-size: 0.64rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">المكتملة</button>
      </div>

      <!-- قائمة المهام التفاعلية المتطورة مع المهام الفرعية والصور -->
      <div id="drawerTasksContainerList" style="display: flex; flex-direction: column; gap: 8px;"></div>
    </div>'''

if old_tasks_view_section in content:
    content = content.replace(old_tasks_view_section, new_tasks_view_section, 1)
    print("Step 2: Replaced drawerTasksViewSection with professional UI.")
else:
    print("Step 2: old_tasks_view_section not exact match, using regex search...")
    # fallback regex
    idx = content.find('id="drawerTasksViewSection"')
    if idx != -1:
        end_idx = content.find('<!-- =========================================================================\n       2. نافذة مهام Microsoft To-Do', idx)
        if end_idx != -1:
            content = content[:idx-9] + new_tasks_view_section + '\n  </div>\n\n  ' + content[end_idx:]
            print("Step 2: Replaced via index boundaries!")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"File updated. Current length: {len(content)} characters")
