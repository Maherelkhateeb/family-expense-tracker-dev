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

        # Open Settings Modal directly via JS to verify
        print("Opening Settings Modal...")
        await page.evaluate("openSettingsModal()")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v522_settings_modal_unified.png"))
        print("Settings screenshot saved!")

        await browser.close()

asyncio.run(run())
