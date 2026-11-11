import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def test_syntax():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"PAGE CONSOLE [{msg.type}]: {msg.text}") if msg.type in ['error', 'warn'] else None)
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(1000)
        
        print("Page loaded. JS Errors count:", len(errors))
        if errors:
            for e in errors:
                print("JS Error:", e)
        else:
            print("No JavaScript syntax or runtime errors on startup!")
            
        await browser.close()

asyncio.run(test_syntax())
