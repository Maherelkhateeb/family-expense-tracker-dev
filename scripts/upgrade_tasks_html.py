#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete Professional Upgrade for Tasks & Planner Workspace
------------------------------------------------------------
Replicates the 10M+ downloaded 'To-Do List - Schedule Planner':
1. 3-Tab Header Navigation: [ 📋 المهام | 📅 التقويم | 📊 الإنتاجية ]
2. Interactive Calendar View with Month Grid & Color Dot Indicators + Day Agenda
3. Categories Carousel with Live Badges (Shopping, Bills, Health, Home, Work)
4. Enhanced Quick Add Bar with Direct Date/Time Selector & Presets beside Quick Chips
5. Subtasks Checklist with Progress Tracker & 1-Click Convert to Wallet Expense
6. Productivity Dashboard with Completion Rate & Streaks
"""

import sys, re
sys.stdout.reconfigure(encoding='utf-8')

path = 'index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

orig_len = len(content)

# ── 1. Locate #tasksFullScreenModal HTML ─────────────────────────────────────────
idx_modal_start = content.find('id="tasksFullScreenModal"')
if idx_modal_start == -1:
    print("Error: Could not find tasksFullScreenModal")
    sys.exit(1)

# Find start of <div id="tasksFullScreenModal"
tag_start = content.rfind('<div', 0, idx_modal_start)
# Find </main> inside tasksFullScreenModal
main_end = content.find('</main>', idx_modal_start)
if main_end == -1:
    print("Error: Could not find </main>")
    sys.exit(1)

modal_end = content.find('</div>', main_end) + 6

new_modal_html = '''<div id="tasksFullScreenModal" style="display: none; position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 100050; background: var(--bg-main, #0b1329); overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 0; margin: 0; box-sizing: border-box; direction: rtl;" dir="rtl">
    
    <!-- شريط علوي ذكي وثابت للشاشة الكاملة -->
    <header style="position: sticky; top: 0; z-index: 100; background: rgba(11, 19, 41, 0.96); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1.2px solid rgba(168, 85, 247, 0.35); padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" onclick="closeTasksFullScreenModal()" style="height: 36px; padding: 0 12px; border-radius: 9px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); color: #cbd5e1; font-size: 0.78rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background 0.15s ease;">
          <i class="fa-solid fa-arrow-right"></i>
          <span>الرئيسية</span>
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

      <!-- شريط التبديل الثلاثي الرئيسي: المهام / التقويم / الإنتاجية (مستوحى من تطبيق To-Do List) -->
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

      <div style="display: flex; align-items: center; gap: 6px;">
        <button type="button" onclick="openNewTaskDrawerModal()" style="height: 36px; padding: 0 14px; border-radius: 9px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.78rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.4);">
          <i class="fa-solid fa-circle-plus"></i>
          <span>+ تفصيلية</span>
        </button>
      </div>
    </header>

    <!-- المحتوى الرئيسي للمهام -->
    <main style="max-width: 920px; margin: 0 auto; padding: 12px 12px 80px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px;">
      
      <!-- ==========================================================
           1. التبويب الأول: شاشة المهام والقوائم (tasksTabListView)
           ========================================================== -->
      <div id="tasksTabListView" style="display: flex; flex-direction: column; gap: 10px;">
        
        <!-- شريط الإضافة السريع والمطور مع آلية اختيار الوقت واليوم والاختصارات الذكية -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" id="quickTaskTitleInput" placeholder="+ اكتب مهمة جديدة سريعة واضغط Enter للإضافة الفورية..." style="flex: 1; height: 38px; border-radius: 9px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.14); color: #fff; font-size: 0.82rem; font-weight: 800; padding: 0 12px; outline: none; box-sizing: border-box;" onkeydown="if(event.key==='Enter') handleQuickTaskAdd()">
            <button type="button" onclick="handleQuickTaskAdd()" style="height: 38px; padding: 0 16px; border-radius: 9px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.80rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 10px rgba(168, 85, 247, 0.4);">
              <i class="fa-solid fa-plus"></i>
              <span>إضافة</span>
            </button>
          </div>

          <!-- السطر المطور: رقائق الموعد السريع + آلية اختيار الساعة واليوم السابقة المطورة -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
            <!-- رقائق الموعد السريع + آلية اختيار الساعة واليوم المباشرة -->
            <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;" id="quickTaskPresetChips">
              <button type="button" class="btn-quick-date-chip active" id="chipQuickToday" onclick="setQuickTaskPreset('today')" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); cursor: pointer;">☀️ اليوم</button>
              <button type="button" class="btn-quick-date-chip" id="chipQuickTomorrow" onclick="setQuickTaskPreset('tomorrow')" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">🌅 غداً</button>
              <button type="button" class="btn-quick-date-chip" id="chipQuickWeekend" onclick="setQuickTaskPreset('weekend')" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">🏖️ الجمعة</button>
              <button type="button" class="btn-quick-date-chip" id="chipQuickNone" onclick="setQuickTaskPreset('none')" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">بدون موعد</button>

              <!-- آلية اختيار الساعة واليوم المباشرة المطورة بجانب الرقائق -->
              <div style="display: inline-flex; align-items: center; gap: 3px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 7px; padding: 1px 6px;">
                <span style="font-size: 0.70rem; color: #a855f7;"><i class="fa-regular fa-clock"></i></span>
                <input type="datetime-local" id="quickTaskDateTimeInput" onchange="onQuickTaskDateTimeChange(this.value)" style="height: 26px; border: none; background: transparent; color: #cbd5e1; font-size: 0.68rem; font-weight: 700; outline: none; font-family: system-ui;">
                <button type="button" onclick="setTaskDateTimePreset('today_evening', 'quickTaskDateTimeInput')" title="اليوم 8 م" style="background: rgba(168,85,247,0.15); border: none; border-radius: 4px; color: #c084fc; font-size: 0.62rem; padding: 2px 5px; cursor: pointer;">8م</button>
                <button type="button" onclick="setTaskDateTimePreset('tomorrow_morning', 'quickTaskDateTimeInput')" title="غداً 10 ص" style="background: rgba(168,85,247,0.15); border: none; border-radius: 4px; color: #c084fc; font-size: 0.62rem; padding: 2px 5px; cursor: pointer;">10ص</button>
                <button type="button" onclick="setTaskDateTimePreset('clear', 'quickTaskDateTimeInput')" title="مسح الموعد" style="background: rgba(239,68,68,0.15); border: none; border-radius: 4px; color: #f87171; font-size: 0.62rem; padding: 2px 5px; cursor: pointer;">&times;</button>
              </div>
            </div>

            <!-- الفرد والأولوية والمبلغ التقديري -->
            <div style="display: flex; gap: 5px; align-items: center; flex-wrap: wrap;">
              <select id="quickTaskMemberSelect" style="height: 28px; border-radius: 7px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; font-size: 0.70rem; font-weight: 800; padding: 0 6px; outline: none;">
                <option value="البيت">🏠 البيت</option>
                <option value="ماهر">👤 ماهر</option>
                <option value="آية">👤 آية</option>
                <option value="محمد">👤 محمد</option>
                <option value="مريم">👤 مريم</option>
                <option value="الحاجة">👤 الحاجة</option>
                <option value="التونو">👤 التونو</option>
              </select>

              <select id="quickTaskPrioritySelect" style="height: 28px; border-radius: 7px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; font-size: 0.70rem; font-weight: 800; padding: 0 6px; outline: none;">
                <option value="high">🔴 عاجل P1</option>
                <option value="medium">🟡 متوسطة P2</option>
                <option value="normal" selected>⚪ عادية P3</option>
                <option value="low">🔘 منخفضة P4</option>
              </select>

              <input type="number" id="quickTaskEstAmount" placeholder="مبلغ تقديري ج.م" style="width: 85px; height: 28px; border-radius: 7px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.12); color: #fbbf24; font-size: 0.70rem; font-weight: 800; padding: 0 6px; outline: none;">
            </div>
          </div>
        </div>

        <!-- كاروسيل الفئات الدائرية الملونة المستوحى من تطبيق To-Do List -->
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 6px;" class="custom-scrollbar" id="tasksCategoryPillsStrip">
          <button type="button" class="task-category-pill active" onclick="setTasksCategoryFilter('all')" data-cat="all" style="padding: 5px 11px; border-radius: 9px; font-size: 0.72rem; font-weight: 900; background: linear-gradient(135deg, #a855f7, #6366f1); color: #fff; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; box-shadow: 0 2px 8px rgba(168,85,247,0.35);">
            <i class="fa-solid fa-layer-group"></i> <span>الكل</span>
            <span id="catBadgeAll" style="background: rgba(255,255,255,0.25); padding: 1px 5px; border-radius: 6px; font-size: 0.62rem;">0</span>
          </button>
          <button type="button" class="task-category-pill" onclick="setTasksCategoryFilter('shopping')" data-cat="shopping" style="padding: 5px 11px; border-radius: 9px; font-size: 0.72rem; font-weight: 900; background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <i class="fa-solid fa-cart-shopping"></i> <span>تسوق ومشتريات</span>
            <span id="catBadgeShopping" style="background: rgba(16,185,129,0.2); padding: 1px 5px; border-radius: 6px; font-size: 0.62rem;">0</span>
          </button>
          <button type="button" class="task-category-pill" onclick="setTasksCategoryFilter('bills')" data-cat="bills" style="padding: 5px 11px; border-radius: 9px; font-size: 0.72rem; font-weight: 900; background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <i class="fa-solid fa-file-invoice-dollar"></i> <span>فواتير والتزامات</span>
            <span id="catBadgeBills" style="background: rgba(245,158,11,0.2); padding: 1px 5px; border-radius: 6px; font-size: 0.62rem;">0</span>
          </button>
          <button type="button" class="task-category-pill" onclick="setTasksCategoryFilter('health')" data-cat="health" style="padding: 5px 11px; border-radius: 9px; font-size: 0.72rem; font-weight: 900; background: rgba(244, 63, 94, 0.12); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.35); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <i class="fa-solid fa-notes-medical"></i> <span>صحة وعلاج</span>
            <span id="catBadgeHealth" style="background: rgba(244,63,94,0.2); padding: 1px 5px; border-radius: 6px; font-size: 0.62rem;">0</span>
          </button>
          <button type="button" class="task-category-pill" onclick="setTasksCategoryFilter('home')" data-cat="home" style="padding: 5px 11px; border-radius: 9px; font-size: 0.72rem; font-weight: 900; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <i class="fa-solid fa-house"></i> <span>المنزل والأسرة</span>
            <span id="catBadgeHome" style="background: rgba(56,189,248,0.2); padding: 1px 5px; border-radius: 6px; font-size: 0.62rem;">0</span>
          </button>
          <button type="button" class="task-category-pill" onclick="setTasksCategoryFilter('work')" data-cat="work" style="padding: 5px 11px; border-radius: 9px; font-size: 0.72rem; font-weight: 900; background: rgba(168, 85, 247, 0.12); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <i class="fa-solid fa-briefcase"></i> <span>العمل والمشاريع</span>
            <span id="catBadgeWork" style="background: rgba(168,85,247,0.2); padding: 1px 5px; border-radius: 6px; font-size: 0.62rem;">0</span>
          </button>
        </div>

        <!-- أشرطة التصفية السريعة والبحث وفلتر الأفراد -->
        <div style="display: flex; gap: 6px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <!-- الفلاتر السريعة للمهام -->
          <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;" class="custom-scrollbar" id="tasksSmartListTabs">
            <button type="button" class="btn-export-tool active exp-filter-pill" id="btnFullTodoMyDay" onclick="switchTodoSection('my_day')" style="padding: 4px 9px; border-radius: 7px; font-size: 0.70rem; font-weight: 800; white-space: nowrap;">☀️ يومي</button>
            <button type="button" class="btn-export-tool exp-filter-pill" id="btnFullTodoImportant" onclick="switchTodoSection('important')" style="padding: 4px 9px; border-radius: 7px; font-size: 0.70rem; font-weight: 800; white-space: nowrap; color: #fde047;">⭐ الهامة</button>
            <button type="button" class="btn-export-tool exp-filter-pill" id="btnFullTodoPlanned" onclick="switchTodoSection('planned')" style="padding: 4px 9px; border-radius: 7px; font-size: 0.70rem; font-weight: 800; white-space: nowrap; color: #38bdf8;">📅 المجدولة</button>
            <button type="button" class="btn-export-tool exp-filter-pill" id="btnFullTodoShopping" onclick="switchTodoSection('shopping')" style="padding: 4px 9px; border-radius: 7px; font-size: 0.70rem; font-weight: 800; white-space: nowrap; color: #34d399;">🛒 مشتريات</button>
            <button type="button" class="btn-export-tool exp-filter-pill" id="btnFullTodoOverdue" onclick="switchTodoSection('overdue')" style="padding: 4px 9px; border-radius: 7px; font-size: 0.70rem; font-weight: 800; white-space: nowrap; color: #f87171;">⚠️ متأخرة</button>
            <button type="button" class="btn-export-tool exp-filter-pill" id="btnFullTodoCompleted" onclick="switchTodoSection('completed')" style="padding: 4px 9px; border-radius: 7px; font-size: 0.70rem; font-weight: 800; white-space: nowrap; color: #10b981;">✅ المكتملة</button>
          </div>

          <!-- فلتر أفراد العائلة -->
          <div style="display: flex; gap: 3px; align-items: center; overflow-x: auto;" id="tasksMemberFilterPills">
            <button type="button" class="btn-export-tool active" onclick="setTasksMemberFilter('all', this)" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800;">👥 الكل</button>
            <button type="button" class="btn-export-tool" onclick="setTasksMemberFilter('ماهر', this)" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800;">ماهر</button>
            <button type="button" class="btn-export-tool" onclick="setTasksMemberFilter('آية', this)" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800;">آية</button>
            <button type="button" class="btn-export-tool" onclick="setTasksMemberFilter('محمد', this)" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800;">محمد</button>
            <button type="button" class="btn-export-tool" onclick="setTasksMemberFilter('مريم', this)" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800;">مريم</button>
            <button type="button" class="btn-export-tool" onclick="setTasksMemberFilter('البيت', this)" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800;">البيت</button>
          </div>
        </div>

        <!-- حقل البحث السريع -->
        <div style="position: relative;">
          <input type="text" id="tasksSearchInput" placeholder="🔍 بحث في نصوص المهام والخطوات..." oninput="renderTasksProList()" style="width: 100%; height: 34px; border-radius: 8px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; font-size: 0.74rem; font-weight: 700; padding: 0 32px 0 10px; outline: none; box-sizing: border-box;">
        </div>

        <!-- حاوية عرض كروت المهام التفاعلية -->
        <div id="tasksFullScreenContainerList" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- تتولد كروت المهام التفاعلية ديناميكياً بواسطة محرك renderTasksProList() -->
        </div>
      </div>

      <!-- ==========================================================
           2. التبويب الثاني: شاشة التقويم الشهري التفاعلي (tasksTabCalendarView)
           ========================================================== -->
      <div id="tasksTabCalendarView" style="display: none; flex-direction: column; gap: 10px;">
        <!-- بطاقة التقويم الشهري التفاعلي -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 14px; padding: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <!-- شريط تصفح الشهر -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" onclick="navigateTasksCalendar(-1)" style="width: 30px; height: 30px; border-radius: 7px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-chevron-right"></i></button>
              <span id="calendarMonthTitle" style="font-size: 0.92rem; font-weight: 900; color: #f8fafc;">نوفمبر 2026</span>
              <button type="button" onclick="navigateTasksCalendar(1)" style="width: 30px; height: 30px; border-radius: 7px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-chevron-left"></i></button>
            </div>
            <button type="button" onclick="goToTasksCalendarToday()" style="padding: 4px 10px; border-radius: 7px; font-size: 0.70rem; font-weight: 800; background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); cursor: pointer;">
              <i class="fa-solid fa-calendar-day"></i> اليوم
            </button>
          </div>

          <!-- شبكة أيام الأسبوع -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 3px; margin-bottom: 6px; font-size: 0.68rem; font-weight: 800; color: #94a3b8;">
            <div>سبت</div><div>أحد</div><div>إثنين</div><div>ثلاثاء</div><div>أربعاء</div><div>خميس</div><div>جمعة</div>
          </div>

          <!-- شبكة أيام الشهر مع مؤشرات المهام النقطية الملونة -->
          <div id="tasksCalendarGrid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
            <!-- تتولد خلايا الأيام ديناميكياً مع النقاط الملونة للمهام -->
          </div>
        </div>

        <!-- قائمة مهام اليوم المختار من التقويم -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
            <div style="font-size: 0.82rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-calendar-check"></i> <span id="calendarSelectedDayTitle">مهام اليوم المختار</span>
            </div>
            <span id="calendarSelectedDayCountBadge" style="font-size: 0.64rem; background: rgba(56, 189, 248, 0.18); color: #38bdf8; padding: 2px 7px; border-radius: 6px; font-weight: 800;">0 مهام</span>
          </div>
          <div id="tasksCalendarDayList" style="display: flex; flex-direction: column; gap: 6px;">
            <!-- قائمة مهام اليوم المحدد -->
          </div>
        </div>
      </div>

      <!-- ==========================================================
           3. التبويب الثالث: شاشة متابعة الإنتاجية (tasksTabStatsView)
           ========================================================== -->
      <div id="tasksTabStatsView" style="display: none; flex-direction: column; gap: 10px;">
        <!-- بطاقة الإنجاز والإنتاجية العامة -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.92rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 7px;">
              <i class="fa-solid fa-award" style="color: #fbbf24;"></i> <span>معدل الإنتاجية والإنجاز اليومي</span>
            </div>
            <span class="badge-active-currency" id="tasksProductivityBadge" style="font-size: 0.70rem; padding: 3px 10px; border-radius: 8px;">جاهز للتحدي!</span>
          </div>

          <!-- شريط نسبة الإنجاز العريض -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="flex: 1; height: 10px; background: rgba(255,255,255,0.08); border-radius: 5px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
              <div id="tasksOverallProgressBarFull" style="height: 100%; width: 0%; background: linear-gradient(90deg, #a855f7, #10b981); border-radius: 5px; transition: width 0.4s ease;"></div>
            </div>
            <span id="tasksOverallProgressPctFull" style="font-size: 0.88rem; font-weight: 950; color: #34d399; font-family: var(--font-numbers); direction: ltr; min-width: 40px; text-align: left;">0%</span>
          </div>

          <!-- المؤشرات الرقمية الأربعة للإنتاجية -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding-top: 4px;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 8px 4px; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 800;">إجمالي المهام</div>
              <div id="kpiTasksTotalFull" style="font-size: 1.05rem; font-weight: 950; color: #38bdf8; margin-top: 2px;">0</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 8px 4px; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 800;">قيد التنفيذ</div>
              <div id="kpiTasksActiveFull" style="font-size: 1.05rem; font-weight: 950; color: #c084fc; margin-top: 2px;">0</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 8px 4px; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 800;">المتأخرة</div>
              <div id="kpiTasksOverdueFull" style="font-size: 1.05rem; font-weight: 950; color: #f87171; margin-top: 2px;">0</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 8px 4px; text-align: center;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 800;">المكتملة</div>
              <div id="kpiTasksDoneFull" style="font-size: 1.05rem; font-weight: 950; color: #34d399; margin-top: 2px;">0</div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>'''

content = content[:tag_start] + new_modal_html + content[modal_end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Modal HTML successfully updated!")
print(f"Diff: {len(content) - orig_len} bytes")
