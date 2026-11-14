import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def check_parent():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 412, "height": 915})
        page = await context.new_page()
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(500)
        
        res = await page.evaluate("""() => {
            const el = document.getElementById('panelListExpected');
            const path = [];
            let curr = el;
            while (curr) {
                path.push({
                    tagName: curr.tagName,
                    id: curr.id,
                    className: curr.className,
                    display: window.getComputedStyle(curr).display,
                    inlineDisplay: curr.style.display
                });
                curr = curr.parentElement;
            }
            return path;
        }""")
        for p_elem in res:
            print(p_elem)
        await browser.close()

asyncio.run(check_parent())
