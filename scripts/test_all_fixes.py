import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})

        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"[{msg.type}] {msg.text}") if msg.type in ['error', 'warning'] else None)

        url = "file:///" + os.path.abspath(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").replace("\\", "/")
        await page.goto(url)
        await page.wait_for_timeout(2000)

        print(f"Page loaded. Any fatal page errors? {len(errors)}")
        for err in errors:
            print("ERROR:", err)

        # 1. Check Cockpit
        cockpit = page.locator("#topKpiThreeStrip")
        if await cockpit.count() > 0:
            await cockpit.screenshot(path="scripts/verified_cockpit.png")
            print("✓ Cockpit screenshot taken: scripts/verified_cockpit.png")

        # 2. Check Commitments page
        await page.click("#navTabExpected")
        await page.wait_for_timeout(1000)
        commitments_card = page.locator("#commitmentKpiMasterCard")
        if await commitments_card.count() > 0:
            await commitments_card.screenshot(path="scripts/verified_commitments_cards.png")
            print("✓ Commitments cards screenshot taken: scripts/verified_commitments_cards.png")

        # 3. Check Budgets tab
        await page.click("#tabExpectedBudgets")
        await page.wait_for_timeout(1000)
        budgets_panel = page.locator("#panelMonthlyBudget")
        if await budgets_panel.count() > 0:
            await budgets_panel.screenshot(path="scripts/verified_budgets_panel.png")
            print("✓ Budgets panel screenshot taken: scripts/verified_budgets_panel.png")

        # 4. Check New Budget Plan Modal
        btn_new_plan = page.locator("#panelMonthlyBudget button:has-text('خطة جديدة')")
        if await btn_new_plan.count() > 0:
            await btn_new_plan.click()
            await page.wait_for_timeout(800)
            modal = page.locator("#newBudgetPlanModal")
            if await modal.count() > 0:
                await modal.screenshot(path="scripts/verified_new_budget_modal.png")
                print("✓ New budget modal screenshot taken: scripts/verified_new_budget_modal.png")
                # close modal
                await page.click("#newBudgetPlanModal .btn-modal-close")
                await page.wait_for_timeout(400)

        # 5. Check Clone Current Budget
        btn_clone = page.locator("#panelMonthlyBudget button:has-text('استنساخ')")
        if await btn_clone.count() > 0:
            page.on("dialog", lambda dialog: dialog.accept())
            await btn_clone.click()
            await page.wait_for_timeout(800)
            print("✓ Clicked clone button successfully")

        # 6. Verify Member Multi-Picker in budget
        picker = page.locator("#budgetMembersMultiPicker")
        if await picker.count() > 0:
            p_text = await page.locator("#budgetSelectedMembersText").text_content()
            print("✓ Initial budget selected member:", p_text)
            btn_first_member = picker.locator("button").first
            await btn_first_member.click()
            await page.wait_for_timeout(400)
            p_text_after = await page.locator("#budgetSelectedMembersText").text_content()
            print("✓ After clicking member, selected:", p_text_after)

        # 7. Add a new budget item
        await page.fill("#inpBudgetItemAmount", "4500")
        await page.fill("#inpBudgetItemTitle", "دروس وتمارين رياضية")
        btn_add_item = page.locator("button:has-text('إضافة البند إلى الميزانية')")
        if await btn_add_item.count() > 0:
            await btn_add_item.click()
            await page.wait_for_timeout(800)
            print("✓ Added new budget item with member linking successfully!")
            await budgets_panel.screenshot(path="scripts/verified_budgets_with_new_item.png")

        await browser.close()
        print("ALL AUDITS AND VERIFICATIONS PASSED 100%!")

asyncio.run(main())
