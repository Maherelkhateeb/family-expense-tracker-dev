import asyncio
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

ARTIFACT_DIR = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
INDEX_PATH = os.path.abspath("index.html")

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})

        page_url = f"file:///{INDEX_PATH.replace(os.sep, '/')}"
        print(f"Loading page: {page_url}")
        await page.goto(page_url, wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(1500)

        # 1. Switch to Operations Page
        await page.evaluate("switchAppPage('operations')")
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_operations_filtered.png"))
        print("Captured v521_operations_filtered.png")

        # 2. Switch to Commitments Page (Bills View)
        await page.evaluate("switchAppPage('expected')")
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_commitments_bills_view.png"))
        print("Captured v521_commitments_bills_view.png")

        # 3. Open Unified Add panel
        await page.evaluate("toggleUnifiedAddCommitmentPanel(true)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_commitments_unified_add_form.png"))
        print("Captured v521_commitments_unified_add_form.png")

        # 4. Switch to Debts tab
        await page.evaluate("toggleUnifiedAddCommitmentPanel(false); switchCommitmentSubSection('debts');")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_commitments_debts_view.png"))
        print("Captured v521_commitments_debts_view.png")

        await browser.close()
        print("✅ Remaining visual verifications completed!")

if __name__ == "__main__":
    asyncio.run(run())
