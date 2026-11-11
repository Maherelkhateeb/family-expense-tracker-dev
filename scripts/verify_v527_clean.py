# -*- coding: utf-8 -*-
import sys
import os
import time
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
HTML_PATH = os.path.abspath(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html")

console_errors = []
console_logs = []

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 412, "height": 915},
            is_mobile=True,
            user_agent="Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36"
        )
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else console_logs.append(msg.text))
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("1. Loading index.html...")
        page.goto(f"file:///{HTML_PATH.replace(os.sep, '/')}")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(2000)

        # 1. Check Home page screenshot
        home_shot = os.path.join(SCREENSHOT_DIR, "v527_home_clean.png")
        page.screenshot(path=home_shot)
        print(f"Captured: {home_shot}")

        # 2. Check Tasks Modal
        print("2. Opening Tasks modal...")
        page.click("#btnHeaderTasksTop")
        page.wait_for_timeout(800)

        tasks_modal = page.locator("#tasksFullScreenModal")
        if not tasks_modal.is_visible():
            raise Exception("Tasks modal did not open!")

        # Verify dynamic member pills
        pills_count = page.locator("#tasksMemberFilterPills button").count()
        print(f"Dynamic member pills count: {pills_count}")
        if pills_count < 6:
            raise Exception(f"Expected at least 6 member pills, found {pills_count}")

        # Test clicking detailed task button (+ مهمة مفصلة)
        print("3. Testing + مهمة مفصلة button...")
        btn_detailed = page.locator("button[onclick*='openNewTaskDrawerModal']")
        if btn_detailed.count() > 0:
            btn_detailed.click()
            page.wait_for_timeout(400)
            print("Successfully clicked + مهمة مفصلة without error!")

        # Test smart list section filters
        print("4. Testing smart list section filters...")
        btn_planned = page.locator("#btnFullTodoPlanned")
        btn_planned.click()
        page.wait_for_timeout(400)

        tasks_shot = os.path.join(SCREENSHOT_DIR, "v527_tasks_list.png")
        page.screenshot(path=tasks_shot)
        print(f"Captured: {tasks_shot}")

        # Test Calendar view
        print("5. Testing Tasks calendar view...")
        page.click("#btnTaskTabCalendar")
        page.wait_for_timeout(600)
        cal_shot = os.path.join(SCREENSHOT_DIR, "v527_tasks_calendar.png")
        page.screenshot(path=cal_shot)
        print(f"Captured: {cal_shot}")

        # Close Tasks modal
        page.click("#tasksFullScreenModal header button[onclick*='closeTasksFullScreenModal']")
        page.wait_for_timeout(500)

        # 6. Test Indicators (Analytics) page
        print("6. Navigating to Analytics page...")
        page.click("#navTabAnalytics")
        page.wait_for_timeout(800)

        for period in ['day', 'week', 'month', 'all']:
            page.click(f".analytics-period-btn[data-period='{period}']")
            page.wait_for_timeout(300)
            pill_text = page.locator("#analyticsPeriodActivePill").text_content()
            print(f"Analytics period {period} active pill: {pill_text}")

        ana_shot = os.path.join(SCREENSHOT_DIR, "v527_analytics_clean.png")
        page.screenshot(path=ana_shot)
        print(f"Captured: {ana_shot}")

        # 7. Test Commitments page
        print("7. Navigating to Commitments page...")
        page.click("#navTabExpected")
        page.wait_for_timeout(800)

        # Click Budgets tab
        page.click("#tabExpectedBudgets")
        page.wait_for_timeout(600)
        budgets_shot = os.path.join(SCREENSHOT_DIR, "v527_commitments_budgets.png")
        page.screenshot(path=budgets_shot)
        print(f"Captured: {budgets_shot}")

        # Click Bills tab
        page.click("#tabExpectedBillsAndDebts")
        page.wait_for_timeout(600)

        # 8. Test Settings Modal
        print("8. Opening Settings modal...")
        page.click("#btnMainSettings")
        page.wait_for_timeout(600)
        settings_shot = os.path.join(SCREENSHOT_DIR, "v527_settings_clean.png")
        page.screenshot(path=settings_shot)
        print(f"Captured: {settings_shot}")

        # Filter out harmless network/file:// CORS/SW warnings
        real_errors = [e for e in console_errors if "Failed to load resource" not in e and "serviceWorker" not in e]
        print(f"\nVerification Results:")
        print(f"Total console logs: {len(console_logs)}")
        print(f"Critical page errors: {len(real_errors)}")
        if real_errors:
            for err in real_errors:
                print(f"  [ERROR] {err}")
        else:
            print("  ALL TESTS PASSED WITH 0 JAVASCRIPT / RUNTIME ERRORS!")

        browser.close()

if __name__ == "__main__":
    run_tests()
