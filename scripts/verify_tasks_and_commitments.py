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

        print("Navigating to app...")
        await page.goto(HTML, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(2000)

        # 1. Dismiss any login/PIN if present
        for sel in ["#loginBtn", "#pinSubmitBtn", ".btn-login", ".skip-btn"]:
            try:
                btn = page.locator(sel)
                if await btn.count() > 0 and await btn.is_visible():
                    await btn.click()
                    await page.wait_for_timeout(500)
                    break
            except:
                pass

        # 2. Check Commitments View (viewExpected)
        print("Switching to Commitments View via switchAppPage('expected')...")
        await page.evaluate("switchAppPage('expected')")
        await page.wait_for_timeout(1500)

        commitments_path = os.path.join(ART, "v510_commitments_view.png")
        await page.screenshot(path=commitments_path, full_page=False)
        print(f"Commitments screenshot saved: {commitments_path}")

        # 3. Open Tasks Full Screen Modal
        print("Opening Tasks Full Screen Modal...")
        await page.evaluate("openTasksFullScreenModal()")
        await page.wait_for_timeout(1000)

        # Screenshot of Tasks View (List Mode)
        tasks_list_path = os.path.join(ART, "v510_tasks_list_view.png")
        await page.screenshot(path=tasks_list_path, full_page=False)
        print(f"Tasks List screenshot saved: {tasks_list_path}")

        # 4. Switch to Calendar Mode
        print("Switching to Calendar Tab...")
        await page.evaluate("switchTasksViewMode('calendar')")
        await page.wait_for_timeout(1000)

        tasks_cal_path = os.path.join(ART, "v510_tasks_calendar_view.png")
        await page.screenshot(path=tasks_cal_path, full_page=False)
        print(f"Tasks Calendar screenshot saved: {tasks_cal_path}")

        # 5. Switch to Stats Mode
        print("Switching to Stats Tab...")
        await page.evaluate("switchTasksViewMode('stats')")
        await page.wait_for_timeout(1000)

        tasks_stats_path = os.path.join(ART, "v510_tasks_stats_view.png")
        await page.screenshot(path=tasks_stats_path, full_page=False)
        print(f"Tasks Stats screenshot saved: {tasks_stats_path}")

        # 6. Switch back to List and test Quick Add
        print("Switching back to List Mode & Testing Quick Add with exact datetime...")
        await page.evaluate("switchTasksViewMode('list')")
        await page.wait_for_timeout(500)

        await page.fill("#quickTaskTitleInput", "شراء مستلزمات الحلويات والأفران 🥐")
        
        # Fill datetime
        dt_input = page.locator("#quickTaskDateTimeInput")
        if await dt_input.count() > 0:
            await dt_input.fill("2026-11-15T19:30")
        
        amt_input = page.locator("#quickTaskAmountInput")
        if await amt_input.count() > 0:
            await amt_input.fill("450")

        # Click quick add button inside modal
        add_btn = page.locator("button[onclick*='handleQuickTaskAdd']")
        await add_btn.click()
        await page.wait_for_timeout(1200)

        tasks_added_path = os.path.join(ART, "v510_tasks_after_quick_add.png")
        await page.screenshot(path=tasks_added_path, full_page=False)
        print(f"Tasks After Add screenshot saved: {tasks_added_path}")

        real_errors = [e for e in errors if 'Failed to fetch' not in e and 'NetworkError' not in e]
        if real_errors:
            print("REAL JS ERRORS FOUND:", real_errors)
        else:
            print("SUCCESS! No JS errors found.")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
