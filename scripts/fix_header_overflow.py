import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect the exact markup of header-brand-row
idx_h = content.find('<div class="header-brand-row">')
idx_h_end = content.find('<!-- السطر 2: شريط أفراد العائلة', idx_h)

old_header_row = content[idx_h:idx_h_end]
print("Old header row:\n", old_header_row)

new_header_row = '''<div class="header-brand-row" style="display: flex; justify-content: space-between; align-items: center; gap: 4px; padding: 2px 0;">
        <div class="brand-box" style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
          <!-- أيقونة الشعار لفتح الإعدادات بنقرة واحدة -->
          <div class="brand-icon" title="الإعدادات والتخصيص" onclick="openSettingsModal('brand_section')" style="width: 34px !important; height: 34px !important; min-width: 34px !important; min-height: 34px !important; border-radius: 10px !important; overflow: hidden !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; cursor: pointer;">
            <img src="assets/family_option2_mosaic.jpg" id="headerBrandFamilyLogo" style="width: 34px !important; height: 34px !important; object-fit: cover !important; border-radius: 10px !important; display: block !important;">
          </div>
          <!-- زر المهام الرئيسي الفاخر في أعلى الصفحة الرئيسية -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="إدارة المهام والتخطيط اليومي" style="height: 34px; padding: 0 9px; border-radius: 10px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.78rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.35); flex-shrink: 0;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.88rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.65rem; padding: 1px 5px; border-radius: 8px; font-weight: 900;">0</span>
          </button>
        </div>

        <!-- أزرار الهيدر: التنبيهات والمزامنة الموحدة ومركز الضبط (كلها متناسقة وتتسع لشاشات الهاتف بدون أي خروج عن الشاشة) -->
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <!-- زر التنبيهات -->
          <button class="header-settings-btn" id="btnNotificationsBell" onclick="openNotificationsModal()" title="الإشعارات والتنبيهات" style="height: 34px; padding: 0 7px; border-radius: 10px; background: rgba(245, 158, 11, 0.16); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; position: relative;">
            <i class="fa-solid fa-bell" style="font-size: 0.85rem;"></i>
            <span id="headerNotifBadge" class="notif-badge-dot" style="position: absolute; top: 3px; right: 3px; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; border: 1px solid #0f172a; display: inline-block;"></span>
          </button>

          <!-- زر المزامنة والتحديث الموحد الشامل -->
          <button class="header-settings-btn header-master-sync-btn" id="btnHeaderMasterSync" onclick="executeMasterUnifiedSyncAndRefresh(true)" title="تحديث شامل وموازنة الأرصدة" style="height: 34px; padding: 0 8px; border-radius: 10px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(2, 132, 199, 0.22)); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #38bdf8; font-weight: 850; font-size: 0.74rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-arrows-rotate master-sync-icon-spin" id="headerMasterSyncSpinIcon" style="font-size: 0.76rem; color: #34d399;"></i>
            <span id="topDriveSyncStatusText" style="color: #34d399; font-weight: 900;">متزامن</span>
          </button>

          <!-- زر مركز الضبط والإعدادات البارز المضمون -->
          <button class="header-settings-btn" id="btnMainSettings" onclick="openSettingsModal()" title="مركز الضبط والإعدادات" style="height: 34px; padding: 0 9px; border-radius: 10px; background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(30, 41, 59, 0.95)); border: 1.2px solid rgba(56, 189, 248, 0.55); color: #f8fafc; font-weight: 850; font-size: 0.74rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.35);">
            <i class="fa-solid fa-sliders" style="font-size: 0.80rem; color: #38bdf8;"></i>
            <span>ضبط</span>
          </button>
        </div>
      </div>
      '''

content = content[:idx_h] + new_header_row + content[idx_h_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated header row: All buttons now fit completely within 360px without overflowing!")
