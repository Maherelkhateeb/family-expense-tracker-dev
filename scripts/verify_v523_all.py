import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
HTML_URL = r"file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html"

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})

        errors = []
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type in ['error', 'warning'] else None)

        print("1. Loading index.html...")
        await page.goto(HTML_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)

        # 1. Test Settings Modal Open
        print("2. Testing Settings Modal...")
        await page.click("#btnMainSettings")
        await page.wait_for_timeout(1000)
        is_settings_open = await page.eval_on_selector("#settingsModal", "el => el.classList.contains('open') && window.getComputedStyle(el).display !== 'none'")
        print(f"Settings Modal open and visible? {is_settings_open}")
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_settings_open.png"))
        await page.evaluate("closeSettingsModal()")
        await page.wait_for_timeout(500)

        # 2. Test Commitments -> Bills & Debts
        print("3. Testing Commitments Page -> Bills & Debts...")
        await page.click("#navTabExpected")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_commitments_bills.png"))

        # 3. Test Commitments -> Budgets Tab
        print("4. Testing Commitments Page -> Budgets...")
        await page.click("#tabExpectedBudgets")
        await page.wait_for_timeout(1000)
        is_budgets_visible = await page.eval_on_selector("#secBudgetsSection", "el => window.getComputedStyle(el).display !== 'none'")
        print(f"Budgets Section visible? {is_budgets_visible}")
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_budgets_active.png"))

        # 4. Test Budgets -> History Tab
        print("5. Testing Budgets -> History Sub-Tab...")
        await page.click("#btnBudgetSubHistory")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_budgets_history.png"))

        # 5. Test Tasks Modal (Pinned Productivity & Direct Date/Time)
        print("6. Testing Tasks Modal...")
        await page.click("#btnHeaderTasksTop")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_tasks_main.png"))

        # 6. Test Calendar Button in Tasks
        print("7. Testing Calendar Button in Tasks...")
        await page.click("#btnTaskTabCalendar")
        await page.wait_for_timeout(1000)
        cal_cells = await page.eval_on_selector_all("#tasksCalendarGrid > div", "els => els.length")
        print(f"Calendar Day Cells rendered: {cal_cells}")
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_tasks_calendar.png"))

        print("\n=== Error Summary ===")
        print(f"Total Errors: {len(errors)}")
        for e in errors:
            print("  ", e)

        await browser.close()
        print("Verification completed!")

asyncio.run(run())
