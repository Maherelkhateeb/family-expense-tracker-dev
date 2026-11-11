import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import http.server
import socketserver
import threading
import time
import os
from playwright.sync_api import sync_playwright

PORT = 8993
DIRECTORY = "C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy"
ARTIFACTS_DIR = "C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("", PORT), Handler)
server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
server_thread.start()
print(f"[OK] Test server started at http://localhost:{PORT}")

errors = []
console_logs = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()

    page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: errors.append(str(err)))

    page.goto(f"http://localhost:{PORT}/index.html", timeout=15000)
    page.wait_for_timeout(2000)

    print("[TEST 1] Page Title and Baseline Errors:")
    print("Title:", page.title())
    print("Page Errors:", len(errors))
    for err in errors:
        print("  Error:", err)

    # -------------------------------------------------------------
    # Test 1: Check Settings Preambles Cleaned
    # -------------------------------------------------------------
    print("\n[TEST 2] Verify Settings Preambles Cleaned:")
    page.evaluate("openModal('settingsModal')")
    page.wait_for_timeout(800)

    settings_html = page.evaluate("document.getElementById('settingsModal').innerHTML")
    assert "زر موحد وذكي يقوم بكل شيء بنقرة واحدة" not in settings_html, "Sync preamble still present!"
    assert "لوحة معاينة واختيار خلفيات التطبيق (9 ألوان وخلفيات)" not in settings_html, "Purple theme banner still present!"
    assert "المزامنة اللحظية، التخصيص البصري، وإدارة البيانات" not in settings_html, "Subtitle preamble still present!"
    print("  [PASS] All useless preambles successfully eliminated from Settings!")

    settings_shot = os.path.join(ARTIFACTS_DIR, "v505_settings_preamble_free.png")
    page.screenshot(path=settings_shot)
    print("  [SAVED]", settings_shot)

    page.evaluate("closeModal('settingsModal')")
    page.wait_for_timeout(400)

    # -------------------------------------------------------------
    # Test 2: Verify Member Summary Left Drawer & Drill-Down
    # -------------------------------------------------------------
    print("\n[TEST 3] Verify Member Summary Left Drawer & Drill-Down:")
    page.evaluate("openSummaryDrawer('أية')")
    page.wait_for_timeout(800)

    drawer_html = page.evaluate("document.getElementById('summaryLeftDrawer').innerHTML")
    assert "btnDrawerMasterTasks" not in drawer_html, "Tasks tab still present in drawer!"
    assert "drawerTasksContainerList" not in drawer_html, "Tasks list still present in drawer!"
    assert "ملخص المصروفات بالفرد" in drawer_html, "Drawer title missing!"
    print("  [PASS] Tasks completely removed from Left Drawer! Member Summary active.")

    drawer_shot = os.path.join(ARTIFACTS_DIR, "v505_member_drawer_breakdown.png")
    page.screenshot(path=drawer_shot)
    print("  [SAVED]", drawer_shot)

    # Test drill-down to operations
    page.evaluate("drillDownFromMemberDrawer('food', 'طعام ومشتريات')")
    page.wait_for_timeout(800)

    ops_cat_val = page.evaluate("document.getElementById('opsFilterCategory').value")
    ops_mem_val = page.evaluate("document.getElementById('opsFilterMember').value")
    active_page = page.evaluate("state.activePage")
    print(f"  Drill-down results: activePage={active_page}, cat={ops_cat_val}, member={ops_mem_val}")
    assert active_page == "operations", f"Expected operations page, got {active_page}"
    assert ops_cat_val == "food", f"Expected food category, got {ops_cat_val}"
    assert ops_mem_val in ["آية", "أية"], f"Expected Aya member, got {ops_mem_val}"
    print("  [PASS] Drill-down to Operations accurately filtered category and member!")

    # -------------------------------------------------------------
    # Test 3: Verify Tasks Pro Workspace (Todoist/TickTick Standard)
    # -------------------------------------------------------------
    print("\n[TEST 4] Verify Tasks Pro Full-Screen Workspace:")
    page.evaluate("openTasksFullScreenModal()")
    page.wait_for_timeout(800)

    tasks_modal_visible = page.evaluate("document.getElementById('tasksFullScreenModal').style.display !== 'none'")
    assert tasks_modal_visible, "Tasks modal is not visible!"

    # Add quick task
    page.evaluate("""() => {
      document.getElementById('quickTaskTitleInput').value = 'شراء مستلزمات طبية وفيتامينات';
      document.getElementById('quickTaskMemberSelect').value = 'ماهر';
      document.getElementById('quickTaskPrioritySelect').value = 'high';
      document.getElementById('quickTaskEstAmount').value = '420';
      handleQuickTaskAdd();
    }""")
    page.wait_for_timeout(600)

    tasks_list_html = page.evaluate("document.getElementById('tasksFullScreenContainerList').innerHTML")
    assert "شراء مستلزمات طبية وفيتامينات" in tasks_list_html, "Newly added task not found in list!"
    assert "عاجل P1" in tasks_list_html, "P1 priority badge not found!"
    assert "تحويل لمصروف" in tasks_list_html, "Convert to expense button not found!"
    print("  [PASS] Quick Add Bar & Rich Card rendering verified!")

    tasks_shot = os.path.join(ARTIFACTS_DIR, "v505_tasks_pro_workspace.png")
    page.screenshot(path=tasks_shot)
    print("  [SAVED]", tasks_shot)

    page.evaluate("closeTasksFullScreenModal()")
    page.wait_for_timeout(400)

    # -------------------------------------------------------------
    # Test 4: Global Currency Positioning Check
    # -------------------------------------------------------------
    print("\n[TEST 5] Global Currency Positioning Check:")
    page.evaluate("switchAppPage('expenses')")
    page.wait_for_timeout(600)

    cockpit_bal = page.evaluate("document.getElementById('topCardBalance').innerHTML")
    print("  Cockpit Balance HTML:", cockpit_bal[:120])
    assert "tx-currency-label" in cockpit_bal, "Cockpit balance not using amount-flow-cluster!"

    home_shot = os.path.join(ARTIFACTS_DIR, "v505_home_and_currency_left.png")
    page.screenshot(path=home_shot)
    print("  [SAVED]", home_shot)

    browser.close()

httpd.shutdown()
print("\n[ALL TESTS COMPLETED SUCCESSFULLY! 100% PASS]")
