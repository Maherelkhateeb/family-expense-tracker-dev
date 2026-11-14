import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Inspect Header Sync button and "متزامن والوقت"
print("=== HEADER SYNC & STATUS ===")
m_sync = re.search(r'header-master-sync-btn|btnHeaderMasterSync', html)
if m_sync:
    print(html[m_sync.start()-200:m_sync.start()+800])

m_status = re.search(r'headerDriveSyncStatus|متزامن|سحابياً', html)
if m_status:
    print("--- Status snippet ---")
    print(html[m_status.start()-200:m_status.start()+800])

# 2. Inspect openGoldDrawer and goldDrawerPanel
print("=== GOLD DRAWER (RIGHT DRAWER) ===")
m_gold = re.search(r'function openGoldDrawer\b', html)
if m_gold:
    print(html[m_gold.start():m_gold.start()+800])

m_gold_panel = re.search(r'id=["\']goldDrawerPanel["\']', html)
if m_gold_panel:
    print(html[m_gold_panel.start()-100:m_gold_panel.start()+500])

# 3. Inspect gold drawer CSS (.side-drawer-panel, etc.)
m_panel_css = re.search(r'\.side-drawer-panel\b', html)
if m_panel_css:
    print("--- side-drawer-panel CSS ---")
    print(html[m_panel_css.start()-50:m_panel_css.start()+800])
