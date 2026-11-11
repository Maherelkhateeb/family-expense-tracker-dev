# scripts/snap_unified_task_card.py
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

        file_url = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(800)

        await page.evaluate("openTasksFullScreenModal()")
        await page.wait_for_timeout(500)

        # Select tag: shopping
        shopping_tag = await page.query_selector('#unifiedTaskTagChipsList [data-tag="shopping"]')
        if shopping_tag:
            await shopping_tag.click()

        # Capture card element screenshot
        card = await page.query_selector('#tasksUnifiedCreatorCard')
        card_snap = r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v527_unified_card_detail.png'
        if card:
            await card.screenshot(path=card_snap)
            print(f"Card snapshot saved: {card_snap}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
