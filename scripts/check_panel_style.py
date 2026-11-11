import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def check_style():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 412, "height": 915})
        page = await context.new_page()
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(1000)
        
        # Click navTabExpected
        await page.locator('#navTabExpected').click()
        await page.wait_for_timeout(500)
        
        res = await page.evaluate("""() => {
            const el = document.getElementById('panelListExpected');
            if (!el) return 'NOT FOUND';
            const comp = window.getComputedStyle(el);
            return {
                styleDisplay: el.style.display,
                computedDisplay: comp.display,
                offsetHeight: el.offsetHeight,
                offsetWidth: el.offsetWidth,
                parentDisplay: window.getComputedStyle(el.parentElement).display,
                html: el.outerHTML.slice(0, 300)
            };
        }""")
        print("panelListExpected computed info:", res)
        await browser.close()

asyncio.run(check_style())
