# scripts/apply_tasks_overhaul_v528.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ==============================================================================
# 1. Update .app-header brand row:
# Add "+ إضافة مهمة" beside "المهام", and eliminate horizontal collision with settings
# ==============================================================================
old_header_brand_row = '''<header class="app-header">
      <!-- السطر 1: الشعار واسم العائلة + شارة الحساب السحابي بالإيميل -->
      <div class="header-brand-row">
        <div class="brand-box" style="display: flex; align-items: center; gap: 0; flex-shrink: 0;">
          <!-- زر المهام الرئيسي الفاخر في أعلى الصفحة الرئيسية في مكان الشعار المحذوف تماماً وبدون أي فراغ -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="إدارة المهام والتخطيط اليومي" style="height: 32px; padding: 0 9px; border-radius: 9px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.32), rgba(99, 102, 241, 0.32)); border: 1.2px solid rgba(168, 85, 247, 0.6); color: #f8fafc; font-size: 0.76rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 10px rgba(168, 85, 247, 0.3); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.86rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.62rem; padding: 1px 5px; border-radius: 8px; font-weight: 900;">0</span>
          </button>
        </div>

        <!-- زر الضبط والمزامنة السحابية الموحد في الهيدر الرئيسي -->
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <!-- زر التنبيهات -->
          <button class="header-settings-btn" id="btnNotificationsBell" onclick="openNotificationsModal()" title="الإشعارات والتنبيهات الذكية" style="position: relative; background: rgba(245, 158, 11, 0.18); border-color: rgba(245, 158, 11, 0.45); color: #fbbf24; padding: 5px 8px;">
            <i class="fa-solid fa-bell"></i>
            <span id="headerNotifBadge" class="notif-badge-dot" style="position: absolute; top: 2px; right: 2px; width: 7px; height: 7px; background: #ef4444; border-radius: 50%; border: 1px solid #0f172a; display: inline-block;"></span>
            <span>تنبيهات</span>
          </button>

          <!-- زر المزامنة والتحديث المدمج الشامل (كافة وظائف التحديث + الموازنة + الذهب + كود البرنامج) -->
          <button class="header-settings-btn header-master-sync-btn" id="btnHeaderMasterSync" onclick="executeMasterUnifiedSyncAndRefresh(true)" title="تحديث شامل وموازنة الأرصدة والذهب" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(2, 132, 199, 0.24)); border: 1.2px solid rgba(56, 189, 248, 0.5); color: #38bdf8; font-weight: 850; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 11px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.35);">
            <i class="fa-solid fa-arrows-rotate master-sync-icon-spin" id="headerMasterSyncSpinIcon" style="font-size: 0.78rem; color: #34d399;"></i>
            <span id="topDriveSyncStatusText" style="font-size: 0.74rem; font-weight: 900; color: #34d399;">محدث ومتوازن</span>
          </button>

          <!-- زر الإعدادات الرئيسي -->
          <button class="header-settings-btn" id="btnMainSettings" onclick="openSettingsModal()" title="الإعدادات" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(56, 189, 248, 0.35); color: #f8fafc; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 11px; cursor: pointer; transition: all 0.2s ease;">
            <i class="fa-solid fa-sliders" style="color: #38bdf8;"></i>
            <span>الإعدادات</span>
          </button>
        </div>
      </div>'''

new_header_brand_row = '''<header class="app-header">
      <!-- السطر 1: أزرار المهام وإضافة مهمة (يمين) + أزرار التنبيهات والمزامنة والضبط (يسار) بدون أي تداخل -->
      <div class="header-brand-row" style="display: flex; justify-content: space-between; align-items: center; gap: 6px; width: 100%; box-sizing: border-box; flex-wrap: nowrap;">
        <!-- كتلة أزرار المهام (المهام + إضافة مهمة بجانبها مباشرة) -->
        <div class="brand-box" style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
          <!-- زر المهام الرئيسي -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="عرض قائمة المهام" style="height: 32px; padding: 0 8px; border-radius: 9px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.74rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.25); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.82rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.60rem; padding: 1px 5px; border-radius: 8px; font-weight: 900;">0</span>
          </button>
          
          <!-- الزر الجديد: إضافة مهمة بجانب زر المهام مباشرة -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderAddTaskTop" onclick="openTasksAndAddNewTask()" title="إضافة مهمة جديدة فوراً" style="height: 32px; padding: 0 9px; border-radius: 9px; background: linear-gradient(135deg, #10b981, #059669); border: 1.2px solid rgba(16, 185, 129, 0.6); color: #ffffff; font-size: 0.74rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-plus" style="font-size: 0.74rem;"></i>
            <span>إضافة مهمة</span>
          </button>
        </div>

        <!-- أزرار الإجراءات السريعة (تنبيهات + مزامنة + ضبط) بدون أي تداخل أو انضغاط -->
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <!-- زر التنبيهات -->
          <button class="header-settings-btn" id="btnNotificationsBell" onclick="openNotificationsModal()" title="الإشعارات والتنبيهات الذكية" style="position: relative; background: rgba(245, 158, 11, 0.18); border: 1.2px solid rgba(245, 158, 11, 0.45); color: #fbbf24; height: 32px; padding: 0 7px; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 0.70rem; font-weight: 800;">
            <i class="fa-solid fa-bell"></i>
            <span id="headerNotifBadge" class="notif-badge-dot" style="position: absolute; top: 3px; right: 3px; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; border: 1px solid #0f172a; display: inline-block;"></span>
            <span>تنبيهات</span>
          </button>

          <!-- زر المزامنة والتحديث المدمج الشامل -->
          <button class="header-settings-btn header-master-sync-btn" id="btnHeaderMasterSync" onclick="executeMasterUnifiedSyncAndRefresh(true)" title="تحديث شامل وموازنة الأرصدة والذهب" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.20), rgba(2, 132, 199, 0.20)); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #38bdf8; font-weight: 850; display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 8px; border-radius: 9px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);">
            <i class="fa-solid fa-arrows-rotate master-sync-icon-spin" id="headerMasterSyncSpinIcon" style="font-size: 0.74rem; color: #34d399;"></i>
            <span id="topDriveSyncStatusText" style="font-size: 0.70rem; font-weight: 900; color: #34d399;">محدث</span>
          </button>

          <!-- زر الضبط والإعدادات الرئيسي - واضح وبارز وبدون أي حجب أو تداخل -->
          <button class="header-settings-btn" id="btnMainSettings" onclick="openSettingsModal()" title="مركز الضبط والمزامنة" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #f8fafc; font-weight: 850; display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 9px; border-radius: 9px; cursor: pointer; transition: all 0.2s ease; z-index: 10;">
            <i class="fa-solid fa-sliders" style="color: #38bdf8; font-size: 0.78rem;"></i>
            <span>الضبط</span>
          </button>
        </div>
      </div>'''

if old_header_brand_row in content:
    content = content.replace(old_header_brand_row, new_header_brand_row, 1)
    print("✓ Header brand row updated with new '+ إضافة مهمة' button and unblocked settings button")
else:
    print("! Exact header_brand_row not matched, trying regex replace...")
    pattern_hdr = r'<header class="app-header">[\s\S]*?<!-- السطر 1:[\s\S]*?</div>\s*</div>'
    match_hdr = re.search(pattern_hdr, content)
    if match_hdr:
        content = content[:match_hdr.start()] + new_header_brand_row + content[match_hdr.end():]
        print("✓ Header brand row replaced via regex")
    else:
        print("! Warning: Could not match header brand row")

# ==============================================================================
# 2. Overhaul tasksFullScreenModal Top Section:
# - Add "+ إضافة مهمة" beside KPIs
# - Set #tasksUnifiedCreatorCard to display: none; by default
# - Add camera & gallery inputs for main task & subtasks
# - Remove duplicate unclosed divs
# ==============================================================================
pos_modal_start = content.find('id="tasksFullScreenModal"')
pos_sticky_filter = content.find('class="tasks-sticky-filter-wrapper"', pos_modal_start)

if pos_modal_start != -1 and pos_sticky_filter != -1:
    modal_top_old = content[pos_modal_start:pos_sticky_filter]
    
    modal_top_new = '''id="tasksFullScreenModal" style="display: none; position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 100050; background: var(--bg-main, #0b1329); overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 0; margin: 0; box-sizing: border-box; direction: rtl;" dir="rtl">
    
    <!-- شريط علوي ذكي وثابت للشاشة الكاملة للمهام -->
    <header style="position: sticky; top: 0; z-index: 100; background: rgba(11, 19, 41, 0.96); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1.2px solid rgba(168, 85, 247, 0.35); padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      <!-- زر إغلاق صريح وبارز للرجوع للرئيسية بلمسة واحدة -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" onclick="closeTasksFullScreenModal()" style="height: 36px; padding: 0 14px; border-radius: 9px; background: rgba(244, 63, 94, 0.18); border: 1.2px solid rgba(244, 63, 94, 0.45); color: #f43f5e; font-size: 0.82rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(244, 63, 94, 0.25); transition: all 0.2s;">
          <i class="fa-solid fa-xmark" style="font-size: 1rem;"></i>
          <span>إغلاق</span>
        </button>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #6366f1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.05rem; box-shadow: 0 3px 10px rgba(168, 85, 247, 0.35);">
            <i class="fa-solid fa-clipboard-list"></i>
          </div>
          <span style="font-size: 0.88rem; font-weight: 900; color: #f8fafc;">إدارة المهام والمخطط اليومي</span>
        </div>
      </div>

      <!-- أدوات التحكم العلوية: التبديل بين المهام والتقويم + زر إضافة مهمة جديدة -->
      <div style="display: flex; align-items: center; gap: 6px;">
        <div style="display: flex; gap: 3px; background: rgba(15, 23, 42, 0.9); padding: 3px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <button type="button" id="btnTaskTabList" onclick="switchTasksViewMode('list')" class="btn-tasks-nav-tab active" style="padding: 5px 12px; border-radius: 8px; font-size: 0.74rem; font-weight: 900; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4); transition: all 0.2s;">
            <i class="fa-solid fa-list-check"></i> <span>المهام</span>
          </button>
          <button type="button" id="btnTaskTabCalendar" onclick="switchTasksViewMode('calendar')" class="btn-tasks-nav-tab" style="padding: 5px 12px; border-radius: 8px; font-size: 0.74rem; font-weight: 900; border: 1px solid rgba(255, 255, 255, 0.08); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; background: transparent; color: #94a3b8; transition: all 0.2s;">
            <i class="fa-solid fa-calendar-days"></i> <span>التقويم</span>
          </button>
        </div>

        <!-- زر إضافة مهمة في الهيدر العلوي -->
        <button type="button" id="btnTasksHeaderAdd" onclick="toggleUnifiedTaskCreator()" style="height: 36px; padding: 0 12px; border-radius: 9px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.76rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 3px 12px rgba(16, 185, 129, 0.4);">
          <i class="fa-solid fa-plus"></i>
          <span>+ إضافة مهمة</span>
        </button>
      </div>

      <!-- مدخلات رفع وتصوير الصور المخفية للمهام الرئيسية والمهام الفرعية -->
      <input type="file" id="mainTaskCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskFileChosen(event, 'main')">
      <input type="file" id="mainTaskGalleryInput" accept="image/*" style="display: none;" onchange="handleTaskFileChosen(event, 'main')">
      <input type="file" id="subtaskCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskFileChosen(event, 'subtask')">
      <input type="file" id="subtaskGalleryInput" accept="image/*" style="display: none;" onchange="handleTaskFileChosen(event, 'subtask')">
    </header>

    <!-- المحتوى الرئيسي للمهام -->
    <main style="max-width: 920px; margin: 0 auto; padding: 12px 12px 80px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px;">
      
      <!-- ==========================================================
           1. التبويب الأول: شاشة المهام والقوائم (tasksTabListView)
           ========================================================== -->
      <div id="tasksTabListView" style="display: flex; flex-direction: column; gap: 10px;">
        
        <!-- كارت مؤشرات الإنتاجية والإنجاز: منسق وفخم وبجانبه زر إضافة مهمة صريح -->
        <div id="tasksProductivityPinnedCard" style="background: rgba(15, 23, 42, 0.92); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 14px; padding: 10px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); margin-bottom: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 0.82rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-chart-line" style="color: #c084fc;"></i>
              <span>مؤشرات الإنتاجية والإنجاز:</span>
            </div>
            
            <!-- الكتلة بجانب المؤشرات: نسبة الإنجاز + زر إضافة مهمة صريح ومباشر -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="pinnedTasksCompletionRateBadge" style="font-size: 0.72rem; font-weight: 950; color: #34d399; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 8px; border-radius: 8px;">0%</span>
              
              <!-- زر إضافة مهمة بجانب المؤشرات كما طلب المستخدم تماماً -->
              <button type="button" id="btnProductivityAddTask" onclick="toggleUnifiedTaskCreator()" style="height: 30px; padding: 0 12px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.74rem; font-weight: 950; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35); transition: transform 0.15s;" onmousedown="this.style.transform='scale(0.96)'" onmouseup="this.style.transform='scale(1)'">
                <i class="fa-solid fa-circle-plus"></i>
                <span>إضافة مهمة</span>
              </button>
            </div>
          </div>

          <!-- شبكة المؤشرات الأربعة -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center; margin-bottom: 6px;">
            <div style="background: rgba(30, 41, 59, 0.6); padding: 5px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
              <div style="font-size: 0.62rem; color: #94a3b8; font-weight: 750;">إجمالي المهام</div>
              <div id="pinnedTasksTotalCount" style="font-size: 0.86rem; font-weight: 900; color: #38bdf8;">0</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.6); padding: 5px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
              <div style="font-size: 0.62rem; color: #94a3b8; font-weight: 750;">المكتملة ✅</div>
              <div id="pinnedTasksDoneCount" style="font-size: 0.86rem; font-weight: 900; color: #34d399;">0</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.6); padding: 5px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
              <div style="font-size: 0.62rem; color: #94a3b8; font-weight: 750;">المتبقية ⏳</div>
              <div id="pinnedTasksPendingCount" style="font-size: 0.86rem; font-weight: 900; color: #fbbf24;">0</div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.6); padding: 5px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
              <div style="font-size: 0.62rem; color: #94a3b8; font-weight: 750;">المتأخرة ⚠️</div>
              <div id="pinnedTasksOverdueCount" style="font-size: 0.86rem; font-weight: 900; color: #f43f5e;">0</div>
            </div>
          </div>
          
          <!-- شريط التقدم الرشيق -->
          <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
            <div id="pinnedTasksProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #a855f7, #10b981); transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- لوحة تسجيل وإضافة المهمة الموحدة والشاملة (مخفية افتراضياً وتظهر فقط عند الضغط على زر إضافة مهمة) -->
        <div id="tasksUnifiedCreatorCard" class="tasks-unified-creator-card" style="display: none; background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.99)); border: 1.5px solid rgba(16, 185, 129, 0.55); border-radius: 18px; padding: 14px 16px; flex-direction: column; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); transition: all 0.3s ease;">
          
          <!-- هيدر كارت الإضافة مع زر إغلاق / إلغاء واضح للعودة للقائمة النظيفة -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.92rem; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);">
                <i class="fa-solid fa-pen-to-square"></i>
              </div>
              <span style="font-size: 0.88rem; font-weight: 900; color: #f8fafc;">تسجيل مهمة جديدة</span>
              <span id="unifiedCreatorActiveTagBadge" style="font-size: 0.68rem; font-weight: 850; padding: 2px 8px; border-radius: 6px; background: rgba(168, 85, 247, 0.25); border: 1px solid rgba(168, 85, 247, 0.5); color: #e9d5ff;">🌐 عامة</span>
            </div>
            
            <!-- زر إغلاق النموذج -->
            <button type="button" onclick="hideUnifiedTaskCreator()" style="height: 28px; padding: 0 10px; border-radius: 7px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-xmark"></i>
              <span>إلغاء</span>
            </button>
          </div>

          <!-- 1. بيان المهمة (عنوان / تفاصيل) -->
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <label for="quickTaskTitleInput" style="font-size: 0.75rem; font-weight: 850; color: #cbd5e1; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-align-right" style="color: #a855f7;"></i>
              <span>بيان المهمة / التفاصيل:</span>
            </label>
            <div style="display: flex; gap: 6px; align-items: center;">
              <input type="text" id="quickTaskTitleInput" placeholder="اكتب بيان المهمة هنا... (مثال: سداد فاتورة الكهرباء والإنترنت)" style="flex: 1; height: 42px; border-radius: 11px; background: rgba(15, 23, 42, 0.92); border: 1.2px solid rgba(168, 85, 247, 0.4); color: #fff; font-size: 0.86rem; font-weight: 800; padding: 0 14px; outline: none; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='#c084fc'" onblur="this.style.borderColor='rgba(168, 85, 247, 0.4)'" onkeydown="if(event.key==='Enter') handleQuickTaskAdd()">
              <button type="button" onclick="handleQuickTaskAdd()" style="height: 42px; padding: 0 16px; border-radius: 11px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.84rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(16, 185, 129, 0.45); flex-shrink: 0; transition: transform 0.15s;" onmousedown="this.style.transform='scale(0.96)'" onmouseup="this.style.transform='scale(1)'">
                <i class="fa-solid fa-check"></i>
                <span>حفظ</span>
              </button>
            </div>
          </div>

          <!-- 2. اختيار التاجات (يومي، عامة، مجدولة، هامة، مشتريات، منزلية، فواتير، صحة، عمل) -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.74rem; font-weight: 850; color: #cbd5e1; display: flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-tags" style="color: #38bdf8;"></i>
                <span>اختر التاج / الوسم:</span>
              </span>
              <span style="font-size: 0.66rem; color: #94a3b8; font-weight: 700;">(اضغط للتبديل الفوري)</span>
            </div>
            <div id="unifiedTaskTagChipsList" style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 6px;" class="custom-scrollbar">
              <button type="button" class="btn-unified-tag-chip" data-tag="my_day" onclick="selectTaskInlineTag('my_day', this)">☀️ يومي</button>
              <button type="button" class="btn-unified-tag-chip active" data-tag="general" onclick="selectTaskInlineTag('general', this)">🌐 عامة</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="planned" onclick="selectTaskInlineTag('planned', this)">📅 مجدولة</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="important" onclick="selectTaskInlineTag('important', this)" style="border-color: rgba(244,63,94,0.35);">⭐ هامة / عاجلة</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="shopping" onclick="selectTaskInlineTag('shopping', this)">🛒 مشتريات</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="home" onclick="selectTaskInlineTag('home', this)">🛋️ منزلية</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="bills" onclick="selectTaskInlineTag('bills', this)">⚡ فواتير</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="health" onclick="selectTaskInlineTag('health', this)">🩺 صحة</button>
              <button type="button" class="btn-unified-tag-chip" data-tag="work" onclick="selectTaskInlineTag('work', this)">💼 عمل</button>
            </div>
          </div>

          <!-- 3. تحديد التاريخ والساعة من نفس الشاشة بدون أي نوافذ منبثقة -->
          <div style="background: rgba(15, 23, 42, 0.7); border: 1.2px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.74rem; font-weight: 850; color: #e2e8f0; display: flex; align-items: center; gap: 6px;">
                <i class="fa-regular fa-calendar-check" style="color: #c084fc;"></i>
                <span>تحديد موعد المهمة (التاريخ والساعة معاً من نفس الشاشة):</span>
              </span>
              <span id="lblUnifiedTaskDateTimeDisplay" style="font-size: 0.68rem; font-weight: 850; color: #38bdf8;">اليوم</span>
            </div>

            <!-- شبكة التاريخ والساعة -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <!-- عمود التاريخ -->
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-size: 0.68rem; font-weight: 800; color: #94a3b8;">📅 التاريخ:</label>
                <!-- اختصارات سريعة للأيام -->
                <div style="display: flex; gap: 4px;" id="inlineDatePresetGroup">
                  <button type="button" class="btn-inline-dt-preset active" data-preset="today" onclick="selectInlineDatePreset('today', this)" style="flex: 1; padding: 4px 6px; font-size: 0.68rem; border-radius: 6px;">اليوم</button>
                  <button type="button" class="btn-inline-dt-preset" data-preset="tomorrow" onclick="selectInlineDatePreset('tomorrow', this)" style="flex: 1; padding: 4px 6px; font-size: 0.68rem; border-radius: 6px;">غداً</button>
                  <button type="button" class="btn-inline-dt-preset" data-preset="after_two_days" onclick="selectInlineDatePreset('after_two_days', this)" style="flex: 1; padding: 4px 6px; font-size: 0.68rem; border-radius: 6px;">+ يومين</button>
                </div>
                <!-- حقل إدخال التاريخ المباشر من نفس الشاشة -->
                <input type="date" id="inlineTaskDueDate" style="height: 36px; border-radius: 8px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(168, 85, 247, 0.35); color: #fff; font-size: 0.78rem; font-weight: 800; padding: 0 8px; outline: none; box-sizing: border-box; width: 100%;" onchange="onInlineDateCustomChange(this.value)">
              </div>

              <!-- عمود الساعة / الوقت -->
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label style="font-size: 0.68rem; font-weight: 800; color: #94a3b8;">⏰ التوقيت (الساعة):</label>
                <!-- اختصارات سريعة للساعات -->
                <div style="display: flex; gap: 3px; overflow-x: auto;" class="custom-scrollbar" id="inlineTimePresetGroup">
                  <button type="button" class="btn-inline-dt-preset" data-time="09:00" onclick="selectInlineTimePreset('09:00', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap;">09:00 ص</button>
                  <button type="button" class="btn-inline-dt-preset" data-time="13:00" onclick="selectInlineTimePreset('13:00', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap;">01:00 م</button>
                  <button type="button" class="btn-inline-dt-preset" data-time="17:00" onclick="selectInlineTimePreset('17:00', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap;">05:00 م</button>
                  <button type="button" class="btn-inline-dt-preset" data-time="21:00" onclick="selectInlineTimePreset('21:00', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap;">09:00 م</button>
                  <button type="button" class="btn-inline-dt-preset" data-time="" onclick="selectInlineTimePreset('', this)" style="padding: 4px 5px; font-size: 0.66rem; border-radius: 6px; white-space: nowrap; color: #f43f5e;" title="بدون وقت">بدون</button>
                </div>
                <!-- حقل إدخال الساعة المباشر من نفس الشاشة -->
                <input type="time" id="inlineTaskDueTime" style="height: 36px; border-radius: 8px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(168, 85, 247, 0.35); color: #fff; font-size: 0.78rem; font-weight: 800; padding: 0 8px; outline: none; box-sizing: border-box; width: 100%;" onchange="onInlineTimeCustomChange(this.value)">
              </div>
            </div>
          </div>

          <!-- 4. المسؤول + خياري إضافة الصورة (تصوير بالكاميرا أو اختيار من الاستوديو) للمهمة الرئيسية -->
          <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <!-- اختيار فرد العائلة المسؤول -->
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="font-size: 0.70rem; font-weight: 800; color: #cbd5e1;">👤 المسؤول:</span>
              <div style="display: flex; gap: 3px;" id="inlineTaskMemberGroup">
                <button type="button" class="btn-inline-member-chip active" data-member="البيت" onclick="selectInlineTaskMember('البيت', this)">البيت</button>
                <button type="button" class="btn-inline-member-chip" data-member="ماهر" onclick="selectInlineTaskMember('ماهر', this)">ماهر</button>
                <button type="button" class="btn-inline-member-chip" data-member="آية" onclick="selectInlineTaskMember('آية', this)">آية</button>
                <button type="button" class="btn-inline-member-chip" data-member="محمد" onclick="selectInlineTaskMember('محمد', this)">محمد</button>
                <button type="button" class="btn-inline-member-chip" data-member="مريم" onclick="selectInlineTaskMember('مريم', this)">مريم</button>
              </div>
            </div>

            <!-- خيارا إضافة الصورة للمهمة الرئيسية: تصوير أو استوديو -->
            <div style="display: flex; gap: 5px; align-items: center;">
              <button type="button" onclick="triggerMainTaskCamera()" style="height: 32px; padding: 0 10px; border-radius: 8px; background: rgba(56, 189, 248, 0.16); border: 1.2px solid rgba(56, 189, 248, 0.5); color: #38bdf8; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-camera"></i>
                <span>تصوير</span>
              </button>
              <button type="button" onclick="triggerMainTaskGallery()" style="height: 32px; padding: 0 10px; border-radius: 8px; background: rgba(16, 185, 129, 0.16); border: 1.2px solid rgba(16, 185, 129, 0.5); color: #34d399; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-image"></i>
                <span>استوديو</span>
              </button>
              <!-- شريط معاينة صورة المهمة الرئيسية -->
              <div id="quickTaskPhotoPreviewBar" style="display: none; align-items: center; gap: 6px;"></div>
            </div>
          </div>

          <!-- 5. زرا الحفظ والإلغاء النهائيين -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" id="btnSubmitUnifiedTask" onclick="handleQuickTaskAdd()" style="flex: 1; height: 42px; border-radius: 11px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.86rem; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); transition: all 0.2s;">
              <i class="fa-solid fa-check-double"></i>
              <span>✨ حفظ وإضافة المهمة</span>
            </button>
            <button type="button" onclick="hideUnifiedTaskCreator()" style="height: 42px; padding: 0 14px; border-radius: 11px; background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.35); color: #f43f5e; font-size: 0.78rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-xmark"></i>
              <span>إلغاء</span>
            </button>
          </div>

        </div>

        '''
    
    content = content[:pos_modal_start] + modal_top_new + content[pos_sticky_filter:]
    print("✓ tasksFullScreenModal top section overhauled cleanly!")
else:
    print("! Could not find tasksFullScreenModal or sticky filter wrapper")

# Save file
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved stage 1 changes to index.html")
