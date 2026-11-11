import asyncio
from playwright.async_api import async_playwright
import os, pathlib, sys

sys.stdout.reconfigure(encoding='utf-8')
ART = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
HTML = pathlib.Path(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").as_uri()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 420, "height": 890})
        page = await ctx.new_page()

        await page.goto(HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)

        # Open tasks modal
        await page.evaluate("openTasksFullScreenModal()")
        await page.wait_for_timeout(800)

        # Add a task for today
        await page.fill("#quickTaskTitleInput", "شراء خبز وفينو طازج للمنزل 🥖")
        add_btn = page.locator("button[onclick*='handleQuickTaskAdd']")
        await add_btn.click()
        await page.wait_for_timeout(1000)

        # Screenshot
        path = os.path.join(ART, "v510_quick_add_today_verified.png")
        await page.screenshot(path=path, full_page=False)
        print("Screenshot saved:", path)

        # Check if the title exists in the DOM
        count = await page.locator("text=شراء خبز وفينو طازج للمنزل").count()
        print(f"Task count in list: {count}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
