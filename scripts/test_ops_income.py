import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def test_ops_income():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(1000)
        
        # Check what transactions are in state.transactions
        tx_info = await page.evaluate("""() => {
            const all = state.transactions || [];
            const incomes = all.filter(t => t.type === 'income');
            const expenses = all.filter(t => t.type === 'expense');
            return {
                total: all.length,
                incomesCount: incomes.length,
                expensesCount: expenses.length,
                sampleIncome: incomes[0] || null,
                opsTypeFilterState: typeof opsTypeFilterState !== 'undefined' ? opsTypeFilterState : 'undefined'
            };
        }""")
        print("Transactions in state:", tx_info)
        
        # Click on navTabOperations
        await page.locator('#navTabOperations').click()
        await page.wait_for_timeout(600)
        
        # Check what is rendered in #txOperationsList
        rendered_info = await page.evaluate("""() => {
            const cards = document.querySelectorAll('#txOperationsList .ops-tx-card-lux');
            let incRendered = 0, expRendered = 0;
            cards.forEach(c => {
                const isInc = c.querySelector('.sign-income, [style*="#10b981"]');
                if (isInc) incRendered++;
                else expRendered++;
            });
            return {
                cardsCount: cards.length,
                incRendered,
                expRendered
            };
        }""")
        print("Rendered in Operations:", rendered_info)
        await browser.close()

asyncio.run(test_ops_income())
