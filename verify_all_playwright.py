import http.server
import socketserver
import threading
import time
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

PORT = 8094
DIRECTORY = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass # silent

httpd = socketserver.TCPServer(("", PORT), Handler)
server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
server_thread.start()
print(f"HTTP Server started at http://localhost:{PORT}")

time.sleep(1)

results = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 390, 'height': 844}) # iPhone 12/13/14 size
    page = context.new_page()

    # Listen to console messages and errors
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: console_errors.append(str(err)))

    print(f"Navigating to http://localhost:{PORT}/index.html ...")
    page.goto(f"http://localhost:{PORT}/index.html", wait_until="domcontentloaded", timeout=15000)
    page.wait_for_timeout(2000)

    # 1. Test Version
    version_text = page.locator(".version-badge").first.inner_text()
    results["version"] = version_text
    print(f"1. Version badge: {version_text}")

    # 2. Test Cockpit Actual Balance Subtitle & Prominence
    sub_count = page.locator(".cockpit-hero-sub").count()
    bal_text = page.locator("#topCardBalance").inner_text()
    results["cockpit_sub_removed"] = (sub_count == 0)
    results["cockpit_balance"] = bal_text
    print(f"2. Cockpit subtitle removed: {sub_count == 0}, Balance: {bal_text}")

    # 3. Test Category Card Click -> opens expense modal with logged in user
    first_cat = page.locator(".cat-card").first
    first_cat.click()
    page.wait_for_timeout(1000)
    modal_visible = page.locator("#txModal").is_visible()
    modal_title = page.locator("#txModalTitleText").inner_text()
    results["quick_expense_modal_opens"] = modal_visible
    print(f"3. Quick expense modal open: {modal_visible}, Title: {modal_title}")

    # Close modal
    page.locator("#txModal .btn-modal-close").click()
    page.wait_for_timeout(500)

    # 4. Test Avatar Click -> Visual Filter Only
    page.locator('.avatar-card[data-member="محمد"]').click()
    page.wait_for_timeout(500)
    is_active = "active" in (page.locator('.avatar-card[data-member="محمد"]').get_attribute("class") or "")
    # Check if currentUser was hijacked
    logged_user = page.evaluate("state.currentUser")
    current_filter = page.evaluate("state.currentMemberFilter")
    results["avatar_filter_active"] = is_active
    results["avatar_filter_member"] = current_filter
    results["logged_user_preserved"] = (logged_user != "محمد")
    print(f"4. Avatar filter: active={is_active}, filter={current_filter}, logged_user={logged_user} (Preserved: {logged_user != 'محمد'})")

    # Reset avatar filter to 'الكل'
    page.locator('.avatar-card[data-member="الكل"]').click()
    page.wait_for_timeout(500)

    # Master Sync Button Test
    has_header_master_sync = page.locator("#btnHeaderMasterSync").is_visible()
    print(f"   Header Master Sync button visible: {has_header_master_sync}")
    
    # 5. Test Quick Tools Buttons (Summary & Tasks)
    has_summary_btn = page.locator("#btnOpenSummaryDrawer").is_visible()
    has_tasks_btn = page.locator("#btnOpenTasksDrawer").is_visible()
    print(f"5. Summary button: {has_summary_btn}, Tasks button: {has_tasks_btn}")

    # Open Summary Drawer
    page.locator("#btnOpenSummaryDrawer").click()
    page.wait_for_timeout(800)
    drawer_open = "open" in (page.locator("#summaryLeftDrawer").get_attribute("class") or "")
    print(f"   Summary drawer opened: {drawer_open}")
    page.screenshot(path=r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\summary_drawer_mobile.png")
    page.locator("#summaryLeftDrawer button").first.click()
    page.wait_for_timeout(500)

    # Open Tasks Modal (Microsoft To-Do)
    page.locator("#btnOpenTasksDrawer").click()
    page.wait_for_timeout(800)
    tasks_open = page.locator("#tasksModal").is_visible()
    print(f"   Tasks modal opened: {tasks_open}")
    # Add a test task
    page.locator("#newTaskTitleInput").fill("شراء مستلزمات البيت الشهرية")
    page.locator("#tasksModal form button[type='submit']").click()
    page.wait_for_timeout(500)
    task_added = page.locator("#tasksContainerList").inner_text()
    print(f"   Task added successfully: {'شراء مستلزمات البيت' in task_added}")
    page.screenshot(path=r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\tasks_modal_mobile.png")
    page.locator("#tasksModal .btn-modal-close").click()
    page.wait_for_timeout(500)

    # 6. Test Notifications Modal
    page.locator("#btnNotificationsBell").click()
    page.wait_for_timeout(800)
    notif_open = page.locator("#notificationsModal").is_visible()
    has_aya_banner = page.locator("#notifAyaReminderBanner").is_visible()
    print(f"6. Notifications modal opened: {notif_open}, Aya reminder visible: {has_aya_banner}")
    page.screenshot(path=r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\notifications_modal_mobile.png")
    page.locator("#notificationsModal .btn-modal-close").click()
    page.wait_for_timeout(500)

    # 7. Test Commitments Page & Bills Tab
    page.locator('#navTabExpected').click()
    page.wait_for_timeout(800)
    # Check Commitments KPI Cards
    kpi_up_text = page.locator("#expectedTotalUpcoming").inner_text()
    print(f"7. Commitments upcoming total: {kpi_up_text}")
    # Check "فواتير" tab
    bills_btn = page.locator("#btnFilterExpBills")
    has_bills_btn = bills_btn.is_visible()
    bills_btn.click()
    page.wait_for_timeout(800)
    panel_bills_open = page.locator("#panelBillsExpected").is_visible()
    print(f"   Bills button visible: {has_bills_btn}, Bills panel opened: {panel_bills_open}")
    page.screenshot(path=r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\commitments_bills_mobile.png")

    # 8. Test Currency Toggle (EGP -> SAR -> USD -> GOLD21)
    page.locator('#navTabExpenses').click()
    page.wait_for_timeout(800)
    curr_btn = page.locator("#btnToggleCurrency")
    curr_btn.click() # SAR
    page.wait_for_timeout(300)
    c1 = page.locator("#activeCurrencyText").inner_text()
    curr_btn.click() # USD
    page.wait_for_timeout(300)
    c2 = page.locator("#activeCurrencyText").inner_text()
    curr_btn.click() # GOLD21
    page.wait_for_timeout(300)
    c3 = page.locator("#activeCurrencyText").inner_text()
    print(f"8. Currency toggle sequence: {c1} -> {c2} -> {c3}")
    curr_btn.click() # Return to EGP
    page.wait_for_timeout(300)

    # 9. Test Audit Modal Headers & Multi-Select
    page.locator(".cockpit-hero-side").click()
    page.wait_for_timeout(800)
    audit_open = page.locator("#actualBalanceAuditModal").is_visible()
    print(f"9. Audit modal opened: {audit_open}")
    page.screenshot(path=r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\audit_modal_mobile.png")
    page.locator("#actualBalanceAuditModal .btn-modal-close").click()
    page.wait_for_timeout(500)

    # 10. Test Theme Switcher (Emerald Theme Card Colors)
    page.evaluate("setAppTheme('emerald')")
    page.wait_for_timeout(800)
    card_bg = page.locator(".cat-card").first.evaluate("el => window.getComputedStyle(el).background")
    print(f"10. Emerald theme card background: {card_bg[:60]}...")
    page.screenshot(path=r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\emerald_theme_mobile.png")

    # Final overall home screenshot
    page.screenshot(path=r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\final_home_mobile.png")

    print("\n--- Console Errors Count:", len(console_errors))
    if console_errors:
        for err in console_errors[:5]:
            print("   Console Error:", err)

    browser.close()

httpd.shutdown()
print("Verification complete!")
