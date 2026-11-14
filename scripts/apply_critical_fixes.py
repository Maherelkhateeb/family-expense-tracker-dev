import sys, io, re, json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Original HTML length:", len(html))

# -------------------------------------------------------------------------
# 1. Synchronize Version and Build ID everywhere to prevent reload loops
# -------------------------------------------------------------------------
NEW_VER = '4.9.5'
NEW_BUILD = 202611071515

# In head
html = re.sub(r'var APP_VERSION = [\'"][^\'"]+[\'"];', f"var APP_VERSION = '{NEW_VER}';", html)
html = re.sub(r'var APP_BUILD_ID = [\d]+;', f"var APP_BUILD_ID = {NEW_BUILD};", html)
html = re.sub(r'window\.APP_VERSION = [\'"][^\'"]+[\'"];', f"window.APP_VERSION = '{NEW_VER}';", html)
html = re.sub(r'window\.APP_BUILD_ID = [\d]+;', f"window.APP_BUILD_ID = {NEW_BUILD};", html)

# In initApp
html = re.sub(r'const APP_VERSION = [\'"][^\'"]+[\'"];', f"const APP_VERSION = '{NEW_VER}';", html)
html = re.sub(r'const APP_BUILD_ID = [\d]+;', f"const APP_BUILD_ID = {NEW_BUILD};", html)

# Header version badge
html = re.sub(r'<span class="version-badge">v[\d\.]+</span>', f'<span class="version-badge">v{NEW_VER}</span>', html)

print(f"✓ Synchronized version v{NEW_VER} and build {NEW_BUILD} everywhere")

# -------------------------------------------------------------------------
# 2. Fix DOM Structure: Close viewExpected & appScrollBody properly before nav
# -------------------------------------------------------------------------
# Currently right before <nav class="app-bottom-nav" id="appBottomNav">:
# We have:
#           </div>
#         </div>
# 
#       </div>
# 
# <nav class="app-bottom-nav" id="appBottomNav">
# We need 2 more </div> tags: one to close viewExpected, one to close appScrollBody!
# And then after </nav>, close appFrame with </div>!

old_nav_prelude = '''          <div id="budgetHistoryListContainer" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- تتولد خطط الميزانيات السابقة ديناميكياً -->
          </div>
        </div>

      </div>

<nav class="app-bottom-nav" id="appBottomNav">'''

new_nav_prelude = '''          <div id="budgetHistoryListContainer" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- تتولد خطط الميزانيات السابقة ديناميكياً -->
          </div>
        </div>
      </div>
    </div> <!-- إغلاق viewExpected الرسمي -->
  </div> <!-- إغلاق appScrollBody الرسمي -->

  <!-- الشريط السفلي الثابت (Bottom Navigation Bar) -->
  <nav class="app-bottom-nav" id="appBottomNav">'''

if old_nav_prelude in html:
    html = html.replace(old_nav_prelude, new_nav_prelude, 1)
    print("✓ Closed viewExpected and appScrollBody properly before nav")
else:
    print("WARNING: old_nav_prelude exact match not found! Trying regex...")
    pattern = r'''id=["\']budgetHistoryListContainer["\'][^>]*>[\s\S]*?</div>\s*</div>\s*</div>\s*<nav class=["\']app-bottom-nav["\'] id=["\']appBottomNav["\']>'''
    if re.search(pattern, html):
        html = re.sub(pattern, '''id="budgetHistoryListContainer" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- تتولد خطط الميزانيات السابقة ديناميكياً -->
          </div>
        </div>
      </div>
    </div> <!-- إغلاق viewExpected الرسمي -->
  </div> <!-- إغلاق appScrollBody الرسمي -->

  <!-- الشريط السفلي الثابت (Bottom Navigation Bar) -->
  <nav class="app-bottom-nav" id="appBottomNav">''', html, count=1)
        print("✓ Closed viewExpected and appScrollBody properly before nav via regex")

# Close appFrame right after </nav>
old_nav_close = '</nav>\n\n\n    <!-- ==============================================\n         القائمة الجانبية المنفصلة: الذهب والعملات (TradingView)'
new_nav_close = '</nav>\n  </div> <!-- إغلاق appFrame الرسمي -->\n\n  <!-- ==============================================\n       القائمة الجانبية المنفصلة: الذهب والعملات (TradingView)'

if old_nav_close in html:
    html = html.replace(old_nav_close, new_nav_close, 1)
    print("✓ Closed appFrame properly after nav")
else:
    # Try regex
    pattern = r'</nav>\s*<!-- ==============================================\s*القائمة الجانبية المنفصلة: الذهب والعملات'
    if re.search(pattern, html):
        html = re.sub(pattern, '</nav>\n  </div> <!-- إغلاق appFrame الرسمي -->\n\n  <!-- ==============================================\n       القائمة الجانبية المنفصلة: الذهب والعملات', html, count=1)
        print("✓ Closed appFrame properly after nav via regex")

# Remove the extra 2 closing </div> tags before txModal
old_gold_end = '''            <div id="goldValuationText" style="font-size: 1.05rem; font-weight: 900; color: #fde047; direction: rtl;">0.00 جم ذهب 21</div>
            <div style="font-size: 0.60rem; color: #34d399; font-weight: 700;">عيار 21 مباشر</div>
          </div>
        </div>

      </div>
    </div>

    <div class="modal-overlay modal-overlay-custom" id="txModal">'''

new_gold_end = '''            <div id="goldValuationText" style="font-size: 1.05rem; font-weight: 900; color: #fde047; direction: rtl;">0.00 جم ذهب 21</div>
            <div style="font-size: 0.60rem; color: #34d399; font-weight: 700;">عيار 21 مباشر</div>
          </div>
        </div>
      </div>
    </div>

    <!-- نوافذ الحوار والتأكيد (Modal Dialogs) -->
    <div class="modal-overlay modal-overlay-custom" id="txModal">'''

if old_gold_end in html:
    html = html.replace(old_gold_end, new_gold_end, 1)
    print("✓ Balanced closing divs at end of goldDrawerPanel")
else:
    print("WARNING: old_gold_end exact match not found!")

# -------------------------------------------------------------------------
# 3. Fix CSS for side-drawer-panel and side-drawer-backdrop (Right Drawer)
# -------------------------------------------------------------------------
# Change position: absolute to position: fixed and z-index: 2500
old_drawer_css = r'''\.side-drawer-backdrop\s*\{\s*position:\s*absolute;[\s\S]*?z-index:\s*100;[\s\S]*?\}'''
new_drawer_css = '''.side-drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(9, 13, 22, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2500;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }'''

if re.search(old_drawer_css, html):
    html = re.sub(old_drawer_css, new_drawer_css, html, count=1)
    print("✓ Updated .side-drawer-backdrop to position: fixed with z-index: 2500")

old_panel_css = r'''\.side-drawer-panel\s*\{\s*position:\s*absolute;[\s\S]*?z-index:\s*110;[\s\S]*?transform:\s*translateX\(100%\);[\s\S]*?visibility:\s*hidden;\s*\}'''
new_panel_css = '''.side-drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 88%;
      max-width: 420px;
      height: 100vh;
      max-height: 100vh;
      background: var(--bg-card);
      box-shadow: -10px 0 35px rgba(0,0,0,0.7);
      z-index: 2600;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.35s;
      border-left: 2px solid var(--gold);
      direction: rtl;
      pointer-events: none;
      visibility: hidden;
    }'''

if re.search(old_panel_css, html):
    html = re.sub(old_panel_css, new_panel_css, html, count=1)
    print("✓ Updated .side-drawer-panel to position: fixed with z-index: 2600")

# -------------------------------------------------------------------------
# 4. Merge Header Sync Button with "متزامن" and the Time
# -------------------------------------------------------------------------
# Target the header buttons area
old_header_btns = r'''<!-- زر الضبط والمزامنة السحابية الموحد في الهيدر الرئيسي -->\s*<div style="display: flex; align-items: center; gap: 6px;">[\s\S]*?<button class="header-settings-btn header-master-sync-btn"[\s\S]*?</button>\s*<button class="header-settings-btn" id="btnMainSettings"[\s\S]*?</button>'''

new_header_btns = '''<!-- زر الضبط والمزامنة السحابية الموحد في الهيدر الرئيسي -->
        <div style="display: flex; align-items: center; gap: 5px;">
          <!-- زر التنبيهات -->
          <button class="header-settings-btn" id="btnNotificationsBell" onclick="openNotificationsModal()" title="الإشعارات والتنبيهات الذكية" style="position: relative; background: rgba(245, 158, 11, 0.18); border-color: rgba(245, 158, 11, 0.45); color: #fbbf24; padding: 5px 8px;">
            <i class="fa-solid fa-bell"></i>
            <span id="headerNotifBadge" class="notif-badge-dot" style="position: absolute; top: 2px; right: 2px; width: 7px; height: 7px; background: #ef4444; border-radius: 50%; border: 1px solid #0f172a; display: inline-block;"></span>
            <span>تنبيهات</span>
          </button>

          <!-- زر المزامنة والتحديث المدمج الفاخر (رمز التحديث + كلمة متزامن + الوقت) -->
          <button class="header-settings-btn header-master-sync-btn" id="btnHeaderMasterSync" onclick="executeMasterUnifiedSyncAndRefresh(true)" title="انقر للمزامنة الشاملة وتحديث كود التطبيق والذهب والحسابات" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(2, 132, 199, 0.22)); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #38bdf8; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; border-radius: 11px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.35);">
            <i class="fa-solid fa-arrows-rotate master-sync-icon-spin" id="headerMasterSyncSpinIcon" style="font-size: 0.74rem; color: #34d399;"></i>
            <span id="topDriveSyncStatusText" style="font-size: 0.72rem; font-weight: 900; color: #34d399;">متزامن</span>
            <span id="headerSyncTimeBadge" style="font-size: 0.63rem; font-weight: 800; color: #94a3b8; font-family: var(--font-numbers); direction: ltr; background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 5px;">الآن</span>
          </button>

          <!-- زر الإعدادات الرئيسي -->
          <button class="header-settings-btn" id="btnMainSettings" onclick="openSettingsModal()" title="مركز الضبط، إعدادات المظهر، والمزامنة السحابية" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(56, 189, 248, 0.35); color: #f8fafc; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 11px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);">
            <i class="fa-solid fa-sliders" style="font-size: 0.74rem; color: #38bdf8;"></i>
            <span style="font-size: 0.72rem; font-weight: 900; color: #f8fafc;">إعدادات</span>
          </button>'''

if re.search(old_header_btns, html):
    html = re.sub(old_header_btns, new_header_btns, html, count=1)
    print("✓ Successfully merged Header Sync button with 'متزامن' and the time badge")
else:
    print("WARNING: old_header_btns regex not matched!")

# Also update updateDriveSyncStatusDisplay to update headerSyncTimeBadge
old_fn_sync_display = r'''function updateDriveSyncStatusDisplay\(\) \{[\s\S]*?const topBadge = document\.getElementById\('topDriveSyncStatusText'\);[\s\S]*?if \(lastSync\) \{[\s\S]*?if \(topBadge\) topBadge\.textContent = 'متزامن ' \+ timeStr;[\s\S]*?\} else \{[\s\S]*?if \(topBadge\) topBadge\.textContent = 'متزامن';[\s\S]*?\}[\s\S]*?\}'''

new_fn_sync_display = '''function updateDriveSyncStatusDisplay() {
      const timeTxt = document.getElementById('driveLastSyncTimeText');
      const settingsTimeTxt = document.getElementById('settingsDriveLastSyncTimeText');
      const topBadge = document.getElementById('topDriveSyncStatusText');
      const headerTimeBadge = document.getElementById('headerSyncTimeBadge');
      const lastSync = localStorage.getItem('family_last_drive_sync');

      const nowTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

      if (lastSync) {
        const d = new Date(lastSync);
        const timeStr = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        if (timeTxt) timeTxt.textContent = `آخر مزامنة: اليوم ${timeStr}`;
        if (settingsTimeTxt) settingsTimeTxt.textContent = `آخر مزامنة: اليوم ${timeStr}`;
        if (topBadge) topBadge.textContent = 'متزامن';
        if (headerTimeBadge) headerTimeBadge.textContent = timeStr;
      } else {
        if (timeTxt) timeTxt.textContent = 'آخر مزامنة: اليوم ' + nowTimeStr;
        if (settingsTimeTxt) settingsTimeTxt.textContent = 'آخر مزامنة: اليوم ' + nowTimeStr;
        if (topBadge) topBadge.textContent = 'متزامن';
        if (headerTimeBadge) headerTimeBadge.textContent = nowTimeStr;
      }
    }'''

if re.search(old_fn_sync_display, html):
    html = re.sub(old_fn_sync_display, new_fn_sync_display, html, count=1)
    print("✓ Updated updateDriveSyncStatusDisplay to handle top badge and time badge cleanly")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved updated index.html, new size:", len(html))

# Also update version.json
ver_data = {
    "version": NEW_VER,
    "build": NEW_BUILD,
    "updated_at": "2026-11-07 03:15 PM",
    "description": "v4.9.5: Fixed bottom navigation tabs and right gold drawer visibility by resolving viewExpected container nesting. Merged sync button with status and time badge. Resolved update reload loop."
}
with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(ver_data, f, indent=2, ensure_ascii=False)
print("✓ version.json updated")

# Also update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()

sw = re.sub(r'family-monefy-v[\d\.]+', f'family-monefy-v{NEW_VER}', sw)
sw = re.sub(r'const CACHE_NAME\s*=\s*[\'"][^\'"]+[\'"]', f"const CACHE_NAME = 'family-monefy-v{NEW_VER}'", sw)
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw)
print("✓ sw.js updated")
