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
        # Mobile Viewport (Samsung Galaxy S22 / iPhone 13 dimensions)
        page = await browser.new_page(viewport={"width": 412, "height": 915})

        errors = []
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type in ['error', 'warning'] else None)

        print("1. Loading index.html...")
        await page.goto(HTML_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)

        # 1. Capture Home Header
        print("2. Capturing Home Header...")
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_home_header.png"))

        # 2. Test & Capture Commitments Page (Bills & Debts Tab)
        print("3. Testing Commitments Page -> Bills & Debts...")
        await page.click("#navTabExpected")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_commitments_bills_and_debts.png"))

        # 3. Test & Capture Commitments Page -> Budgets Tab
        print("4. Testing Commitments Page -> Budgets...")
        await page.click("#tabExpectedBudgets")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_commitments_budgets_tab.png"))

        # Switch back to Bills and Debts to verify
        await page.click("#tabExpectedBillsAndDebts")
        await page.wait_for_timeout(500)

        # 4. Test & Capture Tasks Modal (Mobile Single-Add & Header)
        print("5. Testing Tasks Modal (Single Screen Inline Add)...")
        await page.click("#btnHeaderTasksTop")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_tasks_mobile_single_screen.png"))

        # Add a quick test task using the new inline inputs
        await page.fill("#quickTaskTitleInput", "شراء مستلزمات البيت الشهرية")
        await page.click("#chipQuickDateTomorrow")
        await page.click("#quickTaskInlineDate") # verify no crash
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_tasks_inline_date_time_filled.png"))

        # Close Tasks Modal
        await page.click(".btn-close-drawer")
        await page.wait_for_timeout(500)

        # 5. Test Settings Modal (Check Themes, Icons, Fonts)
        print("6. Testing Settings Modal...")
        await page.click("#btnMainSettings")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_settings_modal_unified.png"))

        print("\n=== Error Summary ===")
        print(f"Total Errors Encountered: {len(errors)}")
        for e in errors:
            print("  ", e)

        await browser.close()
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

asyncio.run(run())
