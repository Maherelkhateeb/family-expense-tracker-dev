import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
art_dir = r"C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609"

async def snap():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 390, "height": 844})

        url = "file:///" + os.path.abspath(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").replace("\\", "/")
        await page.goto(url)
        await page.wait_for_timeout(1500)

        cockpit = page.locator("#topKpiThreeStrip")
        await cockpit.screenshot(path=os.path.join(art_dir, "verified_cockpit_perfect.png"))
        print("Screenshot saved: verified_cockpit_perfect.png")

        await browser.close()

asyncio.run(snap())
