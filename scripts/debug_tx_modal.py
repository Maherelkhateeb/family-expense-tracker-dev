import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(2000)
        
        # open tx modal
        await page.evaluate("openTxModal('expense')")
        await page.wait_for_timeout(1000)
        
        picker_html = await page.evaluate("() => document.getElementById('txMemberPhotoPicker')?.innerHTML || 'NOT_FOUND'")
        picker_visible = await page.evaluate("""() => {
            const el = document.getElementById('txMemberPhotoPicker');
            if (!el) return 'NO_ELEMENT';
            const rect = el.getBoundingClientRect();
            return {
                visible: rect.width > 0 && rect.height > 0,
                rect: {x: rect.x, y: rect.y, w: rect.width, h: rect.height},
                display: window.getComputedStyle(el).display,
                parentDisplay: window.getComputedStyle(el.parentElement).display,
                parentRect: el.parentElement.getBoundingClientRect(),
                childCount: el.children.length
            };
        }""")
        
        print("Picker Info:", picker_visible)
        print("Picker HTML snippet:", picker_html[:300])
        
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/tx_modal_debug.png")
        print("Screenshot saved to tx_modal_debug.png")
        
        await browser.close()

asyncio.run(run())
