import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto("file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html")
        await page.locator("#btnHeaderTasksTop").click()
        await page.locator("#btnQuickTaskDateTimeTrigger").click()
        await page.wait_for_timeout(300)

        modal = page.locator("#taskDateTimePickerModal")
        box = await modal.bounding_box()
        print("Bounding box of taskDateTimePickerModal:", box)
        css = await modal.evaluate("el => ({ position: getComputedStyle(el).position, display: getComputedStyle(el).display, zIndex: getComputedStyle(el).zIndex, top: getComputedStyle(el).top })")
        print("Computed styles:", css)
        await browser.close()

asyncio.run(check())
