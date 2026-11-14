import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(2000)
        
        # Check why txMemberPhotoPicker was empty
        res = await page.evaluate("""() => {
            const el = document.getElementById('txMemberPhotoPicker');
            const beforeLen = el ? el.children.length : -1;
            
            // call initMemberPhotoPickers()
            if (typeof initMemberPhotoPickers === 'function') {
                initMemberPhotoPickers();
            }
            const afterLen = el ? el.children.length : -1;
            return { beforeLen, afterLen, inner: el ? el.innerHTML : '' };
        }""")
        print("Test initMemberPhotoPickers:", res['beforeLen'], "->", res['afterLen'])
        print("HTML length:", len(res['inner']))
        
        await browser.close()

asyncio.run(run())
