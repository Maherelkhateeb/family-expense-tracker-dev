import sys

sys.stdout.reconfigure(encoding='utf-8')

FILE_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# Make header-brand-row flex items fit gracefully without overflow
old_row = """      <div class="header-brand-row">
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
            <span id="headerSyncTimeBadge" style="font-size: 0.63rem; color: #94a3b8; font-family: monospace; display: none;"></span>
          </button>

          <!-- زر الإعدادات الرئيسي -->
          <button class="header-settings-btn" id="btnMainSettings" onclick="openSettingsModal()" title="الإعدادات" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(56, 189, 248, 0.35); color: #f8fafc; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 11px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);">
            <i class="fa-solid fa-sliders" style="font-size: 0.74rem; color: #38bdf8;"></i>
            <span style="font-size: 0.72rem; font-weight: 900; color: #f8fafc;">ضبط</span>
          </button>
          <button class="header-settings-btn" id="btnGlobalSearch" onclick="openGlobalSearchModal()" title="بحث" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #38bdf8; margin-left: 4px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>بحث</span>
          </button>
          <span id="headerUserEmailDisplay" style="display: none;">maher@family.com</span>
        </div>
      </div>"""

new_row = """      <div class="header-brand-row" style="display: flex; align-items: center; justify-content: space-between; gap: 4px; width: 100%; box-sizing: border-box; overflow: hidden;">
        <div class="brand-box" style="display: flex; align-items: center; gap: 0; flex-shrink: 0;">
          <!-- زر المهام الرئيسي الفاخر في أعلى الصفحة الرئيسية في مكان الشعار المحذوف تماماً وبدون أي فراغ -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="إدارة المهام والتخطيط اليومي" style="height: 32px; padding: 0 9px; border-radius: 9px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.32), rgba(99, 102, 241, 0.32)); border: 1.2px solid rgba(168, 85, 247, 0.6); color: #f8fafc; font-size: 0.76rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 10px rgba(168, 85, 247, 0.3); transition: all 0.2s; white-space: nowrap;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.86rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.62rem; padding: 1px 5px; border-radius: 8px; font-weight: 900;">0</span>
          </button>
        </div>

        <!-- أزرار الضبط والمزامنة السحابية الموحدة في الهيدر الرئيسي -->
        <div style="display: flex; align-items: center; gap: 3px; flex-shrink: 1; min-width: 0;">
          <!-- زر التنبيهات -->
          <button class="header-settings-btn" id="btnNotificationsBell" onclick="openNotificationsModal()" title="الإشعارات والتنبيهات الذكية" style="position: relative; background: rgba(245, 158, 11, 0.18); border-color: rgba(245, 158, 11, 0.45); color: #fbbf24; padding: 4px 6px; font-size: 0.70rem; height: 32px; border-radius: 9px;">
            <i class="fa-solid fa-bell"></i>
            <span id="headerNotifBadge" class="notif-badge-dot" style="position: absolute; top: 2px; right: 2px; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; border: 1px solid #0f172a; display: inline-block;"></span>
            <span>تنبيهات</span>
          </button>

          <!-- زر المزامنة والتحديث المدمج الشامل -->
          <button class="header-settings-btn header-master-sync-btn" id="btnHeaderMasterSync" onclick="executeMasterUnifiedSyncAndRefresh(true)" title="تحديث شامل وموازنة الأرصدة والذهب" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(2, 132, 199, 0.24)); border: 1.2px solid rgba(56, 189, 248, 0.5); color: #38bdf8; font-weight: 850; display: inline-flex; align-items: center; gap: 4px; padding: 4px 7px; border-radius: 9px; height: 32px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25); max-width: 105px; overflow: hidden; white-space: nowrap;">
            <i class="fa-solid fa-arrows-rotate master-sync-icon-spin" id="headerMasterSyncSpinIcon" style="font-size: 0.74rem; color: #34d399; flex-shrink: 0;"></i>
            <span id="topDriveSyncStatusText" style="font-size: 0.70rem; font-weight: 900; color: #34d399; overflow: hidden; text-overflow: ellipsis;">متزامن ✓</span>
            <span id="headerSyncTimeBadge" style="font-size: 0.60rem; color: #94a3b8; font-family: monospace; display: none;"></span>
          </button>

          <!-- زر الإعدادات الرئيسي -->
          <button class="header-settings-btn" id="btnMainSettings" onclick="openSettingsModal()" title="الإعدادات" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(56, 189, 248, 0.35); color: #f8fafc; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; padding: 4px 7px; border-radius: 9px; height: 32px; cursor: pointer; transition: all 0.25s ease; font-size: 0.70rem;">
            <i class="fa-solid fa-sliders" style="font-size: 0.70rem; color: #38bdf8;"></i>
            <span style="font-weight: 900; color: #f8fafc;">ضبط</span>
          </button>

          <!-- زر البحث -->
          <button class="header-settings-btn" id="btnGlobalSearch" onclick="openGlobalSearchModal()" title="بحث" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #38bdf8; padding: 4px 7px; border-radius: 9px; height: 32px; font-size: 0.70rem;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>بحث</span>
          </button>
          <span id="headerUserEmailDisplay" style="display: none;">maher@family.com</span>
        </div>
      </div>"""

if old_row in html:
    html = html.replace(old_row, new_row, 1)
    print("✓ Replaced header-brand-row with responsive, non-overflowing version.")
else:
    print("⚠️ Could not match old_row!")

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved index.html.")
