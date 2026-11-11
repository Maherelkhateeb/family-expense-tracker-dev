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

        await page.goto(HTML_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)

        # 1. Click Commitments Tab
        print("Navigating to Commitments...")
        await page.click("#navTabExpected")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_commitments_bills_and_debts.png"))

        # 2. Click Budgets Top Tab
        print("Switching to Budgets...")
        await page.click("#tabExpectedBudgets")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_commitments_budgets_tab.png"))

        # 3. Switch back to Bills and Debts and click filter pill "فواتير"
        print("Switching back to Bills and Debts...")
        await page.click("#tabExpectedBillsAndDebts")
        await page.wait_for_timeout(500)
        await page.click("#pillSubFilterBills")
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_commitments_filtered_bills.png"))

        # 4. Tasks Modal Check
        print("Opening Tasks...")
        await page.click("#btnHeaderTasksTop")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_tasks_mobile_single_screen.png"))

        await browser.close()
        print("All done!")

asyncio.run(run())
