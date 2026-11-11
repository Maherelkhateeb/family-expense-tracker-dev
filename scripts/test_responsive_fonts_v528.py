import asyncio
from playwright.async_api import async_playwright
import os
import shutil

FONTS = ['cairo', 'alexandria', 'tajawal', 'amiri']

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        file_path = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_path, wait_until='networkidle')
        await page.wait_for_timeout(600)
        
        for font in FONTS:
            # Set font and largest size
            await page.evaluate(f"""
                setAppFont('{font}');
                setAppFontSize('large');
                switchAppPage('expected');
                switchExpectedTopSection('bills_and_debts');
            """)
            await page.wait_for_timeout(500)
            
            # Snap cards
            card1 = page.locator('#cardComBills')
            if await card1.count() > 0:
                parent = card1.locator('..')
                fname = f'scripts/cards_{font}_large.png'
                await parent.screenshot(path=fname)
                shutil.copy(fname, rf'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\cards_{font}_large.png')
                print(f'[OK] Captured cards for font {font} with large size')
                
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
