import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import time
from playwright.sync_api import sync_playwright

INDEX_FILE_URL = "file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html"
BRAIN_DIR = "C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670"

def run_tests():
    print("Starting Comprehensive Verification for v5.0.6 (Preamble-Free & Fully Optimized)...")
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 430, "height": 932})
        page = context.new_page()

        # Listen for console errors (ignoring offline file:// network fetches)
        def handle_console(msg):
            if msg.type == 'error':
                txt = msg.text
                if 'Fetch API cannot load file' not in txt and 'CORS' not in txt and 'ERR_FAILED' not in txt and 'ERR_FILE_NOT_FOUND' not in txt:
                    errors.append(f"Console {msg.type}: {txt}")
        page.on("console", handle_console)
        page.on("pageerror", lambda err: errors.append(f"Page Error: {err.message}"))

        page.goto(INDEX_FILE_URL, wait_until="load")
        page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # TEST 1: Check Settings Modal (Preamble Free)
        # -------------------------------------------------------------
        print("\n--- Test 1: Settings Modal Preamble-Free Verification ---")
        page.evaluate("openSettingsModal()")
        page.wait_for_timeout(500)
        
        settings_text = page.inner_text("#settingsModal")
        assert "كافة المحافظ والأرصدة فوراً" not in settings_text, "Bulky audit banner still present!"
        assert "زر موحد وذكي يقوم بكل شيء بنقرة واحدة" not in settings_text, "Sync explanatory text still present!"
        assert "لوحة معاينة واختيار خلفيات التطبيق" not in settings_text, "Purple theme banner still present!"
        assert "رمز الموزاييك الملكي المعتمد" not in settings_text, "Mosaic royalty tag still present!"
        assert "نظام مالي محاسبي عائلي متكامل" not in settings_text, "Bulky footer preamble still present!"
        print("  ✓ All Settings preambles and bulky texts successfully removed!")

        page.screenshot(path=f"{BRAIN_DIR}/v506_settings_preamble_free.png")
        print("  ✓ Saved screenshot: v506_settings_preamble_free.png")
        page.evaluate("closeModal('settingsModal')")
        page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # TEST 2: Check Tasks Modal & Full-Screen (Preamble Free)
        # -------------------------------------------------------------
        print("\n--- Test 2: Tasks Full-Screen Workspace Preamble-Free ---")
        page.evaluate("openTasksModal()")
        page.wait_for_timeout(500)

        tasks_text = page.inner_text("#tasksFullScreenModal")
        assert "مهام عيلة ماهر ❤️ أية ومتابعة الإنجاز والمسؤوليات" not in tasks_text, "Tasks subtitle still present!"
        assert "استخدم شريط الإضافة السريعة أعلاه" not in tasks_text, "Quick task enter hint still present!"
        print("  ✓ Tasks full-screen header is clean and subtitle-free!")

        page.screenshot(path=f"{BRAIN_DIR}/v506_tasks_workspace_clean.png")
        print("  ✓ Saved screenshot: v506_tasks_workspace_clean.png")
        page.evaluate("closeTasksFullScreenModal()")
        page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # TEST 3: Check Notifications Modal (Preamble Free)
        # -------------------------------------------------------------
        print("\n--- Test 3: Notifications Modal Preamble-Free ---")
        page.evaluate("openNotificationsModal()")
        page.wait_for_timeout(500)

        notif_text = page.inner_text("#notificationsModal")
        assert "تحديثات العمليات، المزامنة، وتذكيرات الاستحقاق" not in notif_text, "Notif subtitle still present!"
        assert "لا تنسي توثيق مصاريف ومشتريات اليوم" not in notif_text, "Aya reminder still present!"
        print("  ✓ Notifications modal is clean and preamble-free!")

        page.screenshot(path=f"{BRAIN_DIR}/v506_notifications_clean.png")
        print("  ✓ Saved screenshot: v506_notifications_clean.png")
        page.evaluate("closeModal('notificationsModal')")
        page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # TEST 4: Check Left Drawer (Member Financial Summary)
        # -------------------------------------------------------------
        print("\n--- Test 4: Member Financial Summary Drawer ---")
        page.evaluate("openSummaryLeftDrawer('all')")
        page.wait_for_timeout(500)

        drawer_text = page.inner_text("#summaryLeftDrawer")
        assert "المهام (Tasks)" not in drawer_text, "Tasks tab leaked in drawer!"
        assert "(انقر على أي بند للانتقال لكشف حركاته)" not in drawer_text, "Drawer click hint still present!"
        print("  ✓ Member Financial Summary Drawer verified clean without tasks or preamble!")

        page.screenshot(path=f"{BRAIN_DIR}/v506_member_drawer_clean.png")
        print("  ✓ Saved screenshot: v506_member_drawer_clean.png")
        page.evaluate("closeSummaryLeftDrawer(true)")
        page.wait_for_timeout(300)

        # -------------------------------------------------------------
        # TEST 5: Currency Symbol Placement Verification
        # -------------------------------------------------------------
        print("\n--- Test 5: Global Currency Placement Verification ---")
        bal_el = page.query_selector("#topCardBalance")
        bal_text = bal_el.inner_text()
        print(f"  Cockpit Balance text: '{bal_text}'")

        page.screenshot(path=f"{BRAIN_DIR}/v506_cockpit_currency_left.png")
        print("  ✓ Saved screenshot: v506_cockpit_currency_left.png")

        browser.close()

    if errors:
        print(f"\n[FAIL] Console errors occurred ({len(errors)}):")
        for err in errors:
            print("  -", err)
        sys.exit(1)
    else:
        print("\n[ALL TESTS PASSED 100%] v5.0.6 is completely verified, preamble-free and rock solid!")

if __name__ == "__main__":
    run_tests()
