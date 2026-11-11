import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Original length:", len(html))

# =========================================================================
# 1. MOVE TASKS BUTTON TO TOP HEADER REPLACING "عيلة ماهر" BRAND TEXT
# =========================================================================
# Old header brand row:
old_brand_box_regex = r'<div class="brand-box">[\s\S]*?<div style="display: flex; align-items: center; gap: 6px;">[\s\S]*?<h1 class="brand-title"[\s\S]*?</h1>[\s\S]*?<span class="version-badge">v[\d.]+</span>[\s\S]*?</div>[\s\S]*?</div>'

new_header_tasks_btn = '''<div class="brand-box" style="display: flex; align-items: center; gap: 6px;">
          <!-- أيقونة الشعار لفتح الإعدادات بنقرة واحدة -->
          <div class="brand-icon" title="الإعدادات والتخصيص" onclick="openSettingsModal('brand_section')" style="width: 34px !important; height: 34px !important; min-width: 34px !important; min-height: 34px !important; border-radius: 10px !important; overflow: hidden !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; cursor: pointer;">
            <img src="assets/family_option2_mosaic.jpg" id="headerBrandFamilyLogo" style="width: 34px !important; height: 34px !important; object-fit: cover !important; border-radius: 10px !important; display: block !important;">
          </div>
          <!-- زر المهام الرئيسي الفاخر في أعلى الصفحة الرئيسية بدلاً من نص عائلة ماهر -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="إدارة المهام والتخطيط اليومي" style="height: 34px; padding: 0 11px; border-radius: 10px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.80rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.35); transition: all 0.2s;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.90rem;"></i>
            <span>المهام والتخطيط</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.65rem; padding: 1px 6px; border-radius: 10px; font-weight: 900; box-shadow: 0 1px 4px rgba(0,0,0,0.4);">0</span>
          </button>
        </div>'''

if re.search(old_brand_box_regex, html):
    html = re.sub(old_brand_box_regex, new_header_tasks_btn, html, count=1)
    print("✓ Successfully replaced brand text with top header Tasks button")
else:
    print("! Brand box regex not matched, searching fallback...")
    fb_start = html.find('<div class="brand-box">')
    fb_end = html.find('</div>\n\n        <!-- زر الضبط والمزامنة', fb_start)
    if fb_start != -1 and fb_end != -1:
        html = html[:fb_start] + new_header_tasks_btn + html[fb_end:]
        print("✓ Fallback replaced brand box with top header Tasks button")

# =========================================================================
# 2. UPGRADE MASTER SYNC BUTTON IN TOP HEADER
# =========================================================================
# Replace #btnHeaderMasterSync with the unified super-button
old_sync_btn_start = html.find('<!-- زر المزامنة والتحديث المدمج الفاخر')
if old_sync_btn_start == -1:
    old_sync_btn_start = html.find('id="btnHeaderMasterSync"')
    if old_sync_btn_start != -1:
        old_sync_btn_start = html.rfind('<button', 0, old_sync_btn_start)

if old_sync_btn_start != -1:
    old_sync_btn_end = html.find('</button>', old_sync_btn_start) + 9
    new_header_sync_btn = '''<!-- زر المزامنة والتحديث المدمج الشامل (كافة وظائف التحديث + الموازنة + الذهب + كود البرنامج) -->
          <button class="header-settings-btn header-master-sync-btn" id="btnHeaderMasterSync" onclick="executeMasterUnifiedSyncAndRefresh(true)" title="تحديث شامل وموازنة الأرصدة والذهب" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(2, 132, 199, 0.24)); border: 1.2px solid rgba(56, 189, 248, 0.5); color: #38bdf8; font-weight: 850; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 11px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.35);">
            <i class="fa-solid fa-arrows-rotate master-sync-icon-spin" id="headerMasterSyncSpinIcon" style="font-size: 0.78rem; color: #34d399;"></i>
            <span id="topDriveSyncStatusText" style="font-size: 0.74rem; font-weight: 900; color: #34d399;">محدث ومتوازن</span>
            <span id="headerSyncTimeBadge" style="font-size: 0.63rem; color: #94a3b8; font-family: monospace; display: none;"></span>
          </button>'''
    html = html[:old_sync_btn_start] + new_header_sync_btn + html[old_sync_btn_end:]
    print("✓ Successfully upgraded Header Master Sync button")

# =========================================================================
# 3. DELETE DUPLICATE SYNC BUTTON FROM SETTINGS MODAL
# =========================================================================
settings_sync_needle = '<!-- ========================================================\n             القسم 1: المزامنة السحابية والتحديث الفوري الشامل'
if settings_sync_needle in html:
    s_idx = html.find(settings_sync_needle)
    e_idx = html.find('<!-- ========================================================\n             القسم 2: المظهر والتخصيص البصري', s_idx)
    if s_idx != -1 and e_idx != -1:
        html = html[:s_idx] + html[e_idx:]
        print("✓ Successfully deleted duplicate sync button section from Settings modal")
else:
    # Try finding by the button text
    btn_text = 'تحديث ومزامنة فورية 🚀'
    if btn_text in html:
        b_idx = html.find(btn_text)
        sec_start = html.rfind('<div class="settings-unified-section"', 0, b_idx)
        sec_end = html.find('</div>\n        </div>', b_idx) + 15
        html = html[:sec_start] + html[sec_end:]
        print("✓ Fallback: deleted sync section from Settings modal")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved Step 1 & 2. New length:", len(html))
