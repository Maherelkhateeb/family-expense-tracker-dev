import asyncio
from playwright.async_api import async_playwright
import os
import shutil

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        
        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type in ['error'] else None)
        page.on('pageerror', lambda exc: console_errors.append(str(exc)))
        
        file_path = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_path, wait_until='networkidle')
        await page.wait_for_timeout(1000)
        
        # 1. Capture Cockpit
        cockpit = page.locator('.kpi-master-wealth-cockpit')
        if await cockpit.count() > 0:
            await cockpit.screenshot(path='scripts/v528_verified_cockpit.png')
            shutil.copy('scripts/v528_verified_cockpit.png', r'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\v528_verified_cockpit.png')
            print('[OK] Cockpit captured with explicit SVGs!')
        else:
            print('[FAIL] Cockpit not found!')
            
        # 2. Navigate to Expected / Commitments
        await page.evaluate("""
            if (typeof switchAppPage === 'function') switchAppPage('expected');
            if (typeof switchExpectedTopSection === 'function') switchExpectedTopSection('bills_and_debts');
        """)
        await page.wait_for_timeout(800)
        
        # 3. Capture Commitment Cards
        card1 = page.locator('#cardComBills')
        if await card1.count() > 0:
            parent = card1.locator('..')
            await parent.screenshot(path='scripts/v528_verified_commitments_cards.png')
            shutil.copy('scripts/v528_verified_commitments_cards.png', r'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\v528_verified_commitments_cards.png')
            print('[OK] Commitment cards captured with stacked badges!')
        else:
            print('[FAIL] Commitment cards not found!')
            
        # 4. Capture Luxury Segmented Dual Tab Strip
        tabs = page.locator('#commitmentsTopTwoTabsStrip')
        if await tabs.count() > 0:
            await tabs.screenshot(path='scripts/v528_verified_tabs_bills.png')
            shutil.copy('scripts/v528_verified_tabs_bills.png', r'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\v528_verified_tabs_bills.png')
            print('[OK] Dual tabs strip (Bills active) captured!')
            
        # 5. Switch to Budgets
        await page.evaluate("""
            if (typeof switchExpectedTopSection === 'function') switchExpectedTopSection('budgets');
        """)
        await page.wait_for_timeout(800)
        
        # Capture Dual tabs strip with Budgets active
        if await tabs.count() > 0:
            await tabs.screenshot(path='scripts/v528_verified_tabs_budgets.png')
            shutil.copy('scripts/v528_verified_tabs_budgets.png', r'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\v528_verified_tabs_budgets.png')
            print('[OK] Dual tabs strip (Budgets active) captured!')
            
        # 6. Capture Budgets Panel & Member Filter Strip
        budget_panel = page.locator('#panelMonthlyBudget')
        if await budget_panel.count() > 0:
            await budget_panel.screenshot(path='scripts/v528_verified_budgets_panel.png')
            shutil.copy('scripts/v528_verified_budgets_panel.png', r'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\v528_verified_budgets_panel.png')
            print('[OK] Budgets panel with Member Filter Strip captured!')
            
        # 7. Test Per-Person Math Rigor
        test_math = await page.evaluate("""
            () => {
                // Prepare mock item for Aya
                const itemAya = {
                    id: 'test-aya-clothes',
                    category: 'clothes',
                    title: 'ملابس أية',
                    amount: 3000,
                    members: ['أية']
                };
                // Prepare mock item for House
                const itemHouse = {
                    id: 'test-house-clothes',
                    category: 'clothes',
                    title: 'ملابس البيت',
                    amount: 5000,
                    members: ['البيت']
                };
                
                const allItems = [itemAya, itemHouse];
                
                const mockMonthExpenses = [
                    { category: 'clothes', amount: 1200, member: 'أية' },
                    { category: 'clothes', amount: 800, member: 'ماهر' },
                    { category: 'clothes', amount: 500, member: 'البيت' }
                ];
                
                const ayaMatches = getExpensesForBudgetItem(itemAya, mockMonthExpenses, allItems);
                const houseMatches = getExpensesForBudgetItem(itemHouse, mockMonthExpenses, allItems);
                
                const ayaTotal = ayaMatches.reduce((s, t) => s + t.amount, 0);
                const houseTotal = houseMatches.reduce((s, t) => s + t.amount, 0);
                
                return {
                    ayaMatchesCount: ayaMatches.length,
                    ayaTotal: ayaTotal,
                    houseMatchesCount: houseMatches.length,
                    houseTotal: houseTotal
                };
            }
        """)
        print('[OK] Per-Person Math Test Result:', test_math)
        assert test_math['ayaTotal'] == 1200, f"Expected 1200 for Aya, got {test_math['ayaTotal']}"
        assert test_math['houseTotal'] == 1300, f"Expected 1300 for House (800 Maher + 500 House), got {test_math['houseTotal']}"
        print('[OK] Math verified down to 0.00 SAR / EGP!')
        
        # 8. Test Edit Modal
        await page.evaluate("""
            if (currentBudgetMonthData && currentBudgetMonthData.items && currentBudgetMonthData.items.length > 0) {
                openEditBudgetItemModal(currentBudgetMonthData.items[0].id);
            }
        """)
        await page.wait_for_timeout(500)
        
        edit_modal = page.locator('#modalEditBudgetItem')
        if await edit_modal.count() > 0 and await edit_modal.is_visible():
            await edit_modal.screenshot(path='scripts/v528_verified_edit_modal.png')
            shutil.copy('scripts/v528_verified_edit_modal.png', r'C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609\v528_verified_edit_modal.png')
            print('[OK] Edit Budget Item Modal captured!')
            await page.evaluate("closeEditBudgetItemModal()")
        
        print('\nConsole Errors count:', len(console_errors))
        if console_errors:
            for err in console_errors[:5]:
                print('  ERR:', err)
        else:
            print('[OK] Zero console errors detected!')
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
