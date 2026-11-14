# scripts/snap_entire_ui.py
import sys
import os
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            locale='ar-SA'
        )
        page = await context.new_page()

        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        file_url = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # Snapshot Home
        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\screen_home_390.png')

        # Click #btnMainSettings
        settings_btn = await page.query_selector('#btnMainSettings')
        if settings_btn:
            print("Found #btnMainSettings, clicking...")
            await settings_btn.click()
            await page.wait_for_timeout(800)
            await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\screen_settings_clicked.png')
        else:
            print("❌ #btnMainSettings not found!")

        await browser.close()
        print("Done snapshots.")

if __name__ == '__main__':
    asyncio.run(main())
