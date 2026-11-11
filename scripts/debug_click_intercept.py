import asyncio
from playwright.async_api import async_playwright

async def debug_click():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto("file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html")
        await page.locator("#btnHeaderTasksTop").click()
        await page.locator("#btnQuickTaskDateTimeTrigger").click()
        await page.wait_for_timeout(300)

        chip = page.locator("#chipModalDateTomorrow")
        print("chip is_visible:", await chip.is_visible())
        box = await chip.bounding_box()
        print("chip bounding box:", box)

        # What element is at the center of the chip?
        if box:
            cx = box['x'] + box['width'] / 2
            cy = box['y'] + box['height'] / 2
            top_el = await page.evaluate(f"([x, y]) => {{ const el = document.elementFromPoint(x, y); return el ? el.outerHTML.slice(0, 200) : 'none'; }}", [cx, cy])
            print(f"Element at ({cx}, {cy}):", top_el)

        await browser.close()

asyncio.run(debug_click())
