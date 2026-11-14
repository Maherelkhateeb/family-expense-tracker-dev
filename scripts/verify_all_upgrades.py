import asyncio
from playwright.async_api import async_playwright
import os, pathlib, sys

sys.stdout.reconfigure(encoding='utf-8')

ART = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
HTML = pathlib.Path(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").as_uri()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 420, "height": 890})
        page = await ctx.new_page()

        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        print("1. Navigating to app...")
        await page.goto(HTML, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(2000)

        # Dismiss login/PIN if present
        for sel in ["#loginBtn", "#pinSubmitBtn", ".btn-login", ".skip-btn"]:
            try:
                btn = page.locator(sel)
                if await btn.count() > 0 and await btn.is_visible():
                    await btn.click()
                    await page.wait_for_timeout(500)
                    break
            except:
                pass

        # Apply Luxury Black Theme & IBM Font
        await page.evaluate("""
            setAppTheme('black', true);
            setAppFont('ibm', true);
            setAppDesignStyle('glass', false);
        """)
        await page.wait_for_timeout(500)

        # 2. Check Member Expenses Drawer
        print("2. Opening Member Expenses Drawer...")
        await page.evaluate("openSummaryLeftDrawer()")
        await page.wait_for_timeout(1000)

        drawer_path = os.path.join(ART, "v520_member_drawer_upgraded.png")
        await page.screenshot(path=drawer_path, full_page=False)
        print(f"✓ Member Drawer screenshot saved: {drawer_path}")

        # Close Drawer
        await page.evaluate("closeSummaryLeftDrawer()")
        await page.wait_for_timeout(500)

        # 3. Check Universal Operations List
        print("3. Switching to Operations Page...")
        await page.evaluate("switchAppPage('operations')")
        await page.wait_for_timeout(1200)

        # Click the first transaction card to test expandable action drawer
        first_tx = page.locator(".ops-tx-card-clean").first
        if await first_tx.count() > 0:
            await first_tx.click()
            await page.wait_for_timeout(600)

        ops_path = os.path.join(ART, "v520_operations_clean_list.png")
        await page.screenshot(path=ops_path, full_page=False)
        print(f"✓ Operations List screenshot saved: {ops_path}")

        # 4. Check Universal Commitments List
        print("4. Switching to Commitments Page...")
        await page.evaluate("switchAppPage('expected')")
        await page.wait_for_timeout(1200)

        # Click the first commitment card to test expandable action drawer
        first_exp = page.locator(".expected-clean-card").first
        if await first_exp.count() > 0:
            await first_exp.click()
            await page.wait_for_timeout(600)

        exp_path = os.path.join(ART, "v520_commitments_clean_list.png")
        await page.screenshot(path=exp_path, full_page=False)
        print(f"✓ Commitments List screenshot saved: {exp_path}")

        # 5. Check Tasks & Planner Full Screen Modal
        print("5. Opening Tasks Full Screen Modal...")
        await page.evaluate("openTasksFullScreenModal()")
        await page.wait_for_timeout(1000)

        # Click the first task to expand its subtasks accordion!
        first_task = page.locator(".task-pro-card-lux").first
        if await first_task.count() > 0:
            await first_task.click()
            await page.wait_for_timeout(600)

        tasks_path = os.path.join(ART, "v520_tasks_accordion_and_camera.png")
        await page.screenshot(path=tasks_path, full_page=False)
        print(f"✓ Tasks Accordion & Camera screenshot saved: {tasks_path}")

        # Verify close button works
        close_btn = page.locator("header button:has-text('إغلاق')")
        print(f"Close button found count: {await close_btn.count()}")
        await close_btn.click()
        await page.wait_for_timeout(600)
        print("✓ Closed Tasks Modal via [ ✕ إغلاق ] button!")

        # Final check on errors
        real_errors = [e for e in errors if 'Failed to fetch' not in e and 'NetworkError' not in e]
        if real_errors:
            print("REAL JS ERRORS FOUND:", real_errors)
        else:
            print("SUCCESS! No JS errors found.")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
