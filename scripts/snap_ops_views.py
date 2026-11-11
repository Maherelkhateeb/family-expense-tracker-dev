import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

HTML_PATH = os.path.abspath("index.html")
ARTIFACT_DIR = r"C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 390, "height": 844})

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        await page.goto(file_url, wait_until="networkidle")
        await page.wait_for_timeout(800)

        # 1. Switch to operations page
        await page.evaluate("() => { if (typeof switchAppPage === 'function') switchAppPage('operations'); }")
        await page.wait_for_timeout(500)

        # Set to daily first
        await page.evaluate("() => { if (typeof setOperationsViewMode === 'function') setOperationsViewMode('daily'); }")
        await page.wait_for_timeout(400)
        shot_daily = os.path.join(ARTIFACT_DIR, "v524_ops_daily_mode.png")
        await page.screenshot(path=shot_daily, full_page=False)
        print(f"Daily mode screenshot saved: {shot_daily}")

        # Set to flat
        await page.click("#btnOpsModeFlat")
        await page.wait_for_timeout(400)
        shot_flat = os.path.join(ARTIFACT_DIR, "v524_ops_flat_mode.png")
        await page.screenshot(path=shot_flat, full_page=False)
        print(f"Flat mode screenshot saved: {shot_flat}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
