import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def test_currency_toggle():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(1000)
        
        btn = page.locator('#btnToggleCurrency')
        print("btnToggleCurrency count:", await btn.count())
        
        for i in range(5):
            curr_before = await page.evaluate("() => state.currency")
            label_before = await page.locator('#activeCurrencyText').inner_text()
            print(f"Turn {i}: state.currency={curr_before}, text={label_before}")
            await btn.click()
            await page.wait_for_timeout(300)
            
        await browser.close()

asyncio.run(test_currency_toggle())
