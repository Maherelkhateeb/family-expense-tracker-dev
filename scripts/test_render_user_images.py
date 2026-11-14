import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        
        file_path = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_path, wait_until='networkidle')
        await page.wait_for_timeout(1000)
        
        # Take snapshot of cockpit
        cockpit = page.locator('.kpi-master-wealth-cockpit')
        if await cockpit.count() > 0:
            await cockpit.screenshot(path='scripts/current_cockpit.png')
            print('Cockpit snap taken')
        else:
            print('Cockpit not found!')
        
        # Navigate to commitments
        await page.evaluate("""
            if (typeof switchAppPage === 'function') {
                switchAppPage('expected');
            }
            if (typeof switchExpectedTopSection === 'function') {
                switchExpectedTopSection('bills_debts');
            }
        """)
        await page.wait_for_timeout(800)
        
        # Search for commitments cards container
        for sel in ['.com-kpi-cards-grid', '#commitmentsFourCardsGrid', '.commitments-cards-grid']:
            cards = page.locator(sel)
            if await cards.count() > 0:
                await cards.screenshot(path='scripts/current_commitments_cards.png')
                print(f'Cards snap taken with {sel}')
                break
        else:
            # find by one card
            card1 = page.locator('#cardComBills')
            if await card1.count() > 0:
                parent = card1.locator('..')
                await parent.screenshot(path='scripts/current_commitments_cards.png')
                print('Cards snap taken via parent of #cardComBills')
            else:
                print('Cards not found!')
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
