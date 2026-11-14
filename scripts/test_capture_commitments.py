import asyncio
from playwright.async_api import async_playwright
import os
import shutil

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        
        file_path = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_path, wait_until='networkidle')
        await page.wait_for_timeout(1000)
        
        # Navigate to expected page
        await page.evaluate("""
            if (typeof switchAppPage === 'function') switchAppPage('expected');
            if (typeof switchExpectedTopSection === 'function') switchExpectedTopSection('bills_and_debts');
        """)
        await page.wait_for_timeout(800)
        
        # Find commitments cards
        card1 = page.locator('#cardComBills')
        if await card1.count() > 0:
            parent = card1.locator('..')
            await parent.screenshot(path='scripts/current_commitments_cards.png')
            print('Successfully captured commitments cards!')
            shutil.copy('scripts/current_commitments_cards.png', r'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\current_commitments_cards.png')
        else:
            print('cardComBills not found!')
            
        # Capture the dual tab strip (bills & debts vs budgets)
        tab_strip = page.locator('#commitmentsTopTwoTabsStrip')
        if await tab_strip.count() > 0:
            await tab_strip.screenshot(path='scripts/current_tabs_strip.png')
            print('Successfully captured dual tabs strip!')
            shutil.copy('scripts/current_tabs_strip.png', r'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\current_tabs_strip.png')
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
