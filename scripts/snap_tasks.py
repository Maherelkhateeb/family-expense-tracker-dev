import asyncio
from playwright.async_api import async_playwright
import os, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')

ART = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
HTML = pathlib.Path(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").as_uri()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 430, "height": 932})
        page = await ctx.new_page()

        await page.goto(HTML, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1000)

        # Open tasks modal
        await page.evaluate("""
            if (typeof openTasksFullScreenModal === 'function') openTasksFullScreenModal();
            else if (typeof openTasksModal === 'function') openTasksModal();
        """)
        await page.wait_for_timeout(1000)

        shot_path = os.path.join(ART, "v508_tasks_fullscreen.png")
        await page.screenshot(path=shot_path, full_page=False)
        print(f"Tasks screenshot saved: {shot_path}")

        await browser.close()

asyncio.run(main())
