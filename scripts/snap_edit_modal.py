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
        await page.wait_for_timeout(600)
        
        await page.evaluate("""
            switchAppPage('expected');
            switchExpectedTopSection('budgets');
        """)
        await page.wait_for_timeout(600)
        
        res = await page.evaluate("""
            () => {
                if (currentBudgetMonthData && currentBudgetMonthData.items && currentBudgetMonthData.items.length > 0) {
                    openEditBudgetItemModal(currentBudgetMonthData.items[0].id);
                    return { success: true, id: currentBudgetMonthData.items[0].id, title: currentBudgetMonthData.items[0].title };
                }
                return { success: false };
            }
        """)
        print('Open edit modal res:', res)
        await page.wait_for_timeout(500)
        
        modal = page.locator('#modalEditBudgetItem')
        if await modal.count() > 0 and await modal.is_visible():
            await modal.screenshot(path='scripts/v528_verified_edit_modal.png')
            shutil.copy('scripts/v528_verified_edit_modal.png', r'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\v528_verified_edit_modal.png')
            print('[OK] Captured Edit Budget Item Modal!')
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
