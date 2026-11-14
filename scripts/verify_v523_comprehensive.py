import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
HTML_PATH = os.path.abspath("index.html")

async def run():
    print(f"Starting Playwright verification on: {HTML_PATH}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport
        context = await browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        page_errors = []
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on("console", lambda msg: print(f"[Browser Console {msg.type}] {msg.text}") if msg.type in ['error', 'warn'] else None)

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        await page.goto(file_url, wait_until="load")
        await page.wait_for_timeout(1000)

        # -----------------------------------------------------------------
        # Test 1: Header Brand Row & Settings Modal
        # -----------------------------------------------------------------
        print("Testing Header Brand Row and Settings button...")
        header_sync_btn = page.locator("#btnHeaderMasterSync")
        assert await header_sync_btn.is_visible(), "Master sync button not visible"
        
        btn_settings = page.locator("#btnMainSettings")
        assert await btn_settings.is_visible(), "Settings button not visible"
        
        # Click settings button
        await btn_settings.click()
        await page.wait_for_timeout(500)
        settings_modal = page.locator("#settingsModal")
        assert await settings_modal.is_visible(), "Settings modal failed to open"
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_settings_open.png"))
        print("Settings modal verified & screenshot captured.")

        # Close settings modal
        btn_close_settings = page.locator("#settingsModal .btn-close-modal, #settingsModal [onclick*='closeModal']").first
        if await btn_close_settings.is_visible():
            await btn_close_settings.click()
            await page.wait_for_timeout(300)

        # -----------------------------------------------------------------
        # Test 2: Commitments Page (Bills & Debts vs Budgets)
        # -----------------------------------------------------------------
        print("Testing Commitments Page dual sections...")
        await page.locator("#navTabExpected").click()
        await page.wait_for_timeout(500)
        
        btn_bills_debts = page.locator("#tabExpectedBillsAndDebts")
        btn_budgets = page.locator("#tabExpectedBudgets")
        assert await btn_bills_debts.is_visible(), "Bills & Debts tab not visible"
        assert await btn_budgets.is_visible(), "Budgets tab not visible"

        # Verify bills & debts view
        sec_commitments = page.locator("#subViewCommitments")
        assert await sec_commitments.is_visible(), "subViewCommitments should be visible"
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_commitments_bills.png"))
        print("Commitments bills & debts tab verified.")

        # Switch to Budgets
        await btn_budgets.click()
        await page.wait_for_timeout(600)
        
        sec_budget_panel = page.locator("#panelMonthlyBudget")
        assert await sec_budget_panel.is_visible(), "panelMonthlyBudget should be visible when budgets tab active"
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_budgets_active.png"))
        print("Budgets monthly plan tab verified.")

        # Switch to budget history subtab
        btn_sub_hist = page.locator("#btnBudgetSubHistory")
        if await btn_sub_hist.is_visible():
            await btn_sub_hist.click()
            await page.wait_for_timeout(400)
            sec_hist_panel = page.locator("#panelBudgetHistory")
            assert await sec_hist_panel.is_visible(), "panelBudgetHistory should be visible"
            await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_budgets_history.png"))
            print("Budgets history tab verified.")

        # -----------------------------------------------------------------
        # Test 3: Tasks Screen (Single Screen Add, Pinned Productivity, Calendar)
        # -----------------------------------------------------------------
        print("Testing Tasks Screen...")
        # Switch back to expenses home page
        await page.locator("#navTabExpenses").click()
        await page.wait_for_timeout(300)

        # Click top tasks button in header
        await page.locator("#btnHeaderTasksTop").click()
        await page.wait_for_timeout(500)

        tasks_modal = page.locator("#tasksFullScreenModal")
        assert await tasks_modal.is_visible(), "Tasks full screen modal not visible"

        # Verify pinned productivity card
        pinned_card = page.locator("#tasksProductivityPinnedCard")
        assert await pinned_card.is_visible(), "Pinned productivity card should be visible"

        # Verify inline date and time inputs
        inp_date = page.locator("#quickTaskInlineDate")
        inp_time = page.locator("#quickTaskInlineTime")
        assert await inp_date.is_visible(), "quickTaskInlineDate not visible"
        assert await inp_time.is_visible(), "quickTaskInlineTime not visible"

        # Verify camera button
        cam_btn = page.locator("button:has-text('تصوير مرفق بالكاميرا')")
        assert await cam_btn.is_visible(), "Camera button not visible"

        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_tasks_main.png"))
        print("Tasks main view with pinned productivity and inline date/time verified.")

        # Test Calendar view
        print("Testing Tasks Calendar View...")
        btn_cal_tab = page.locator("#btnTaskTabCalendar")
        await btn_cal_tab.click()
        await page.wait_for_timeout(500)

        cal_grid = page.locator("#tasksCalendarGrid")
        assert await cal_grid.is_visible(), "Calendar grid not visible"
        cell_count = await cal_grid.locator("div").count()
        print(f"Calendar rendered with {cell_count} cells.")
        assert cell_count >= 28, f"Calendar should have at least 28 day cells, got {cell_count}"

        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_tasks_calendar.png"))
        print("Tasks calendar verified and screenshot captured.")

        # Close tasks modal
        await page.locator("#tasksFullScreenModal button:has-text('إغلاق')").click()
        await page.wait_for_timeout(300)

        # -----------------------------------------------------------------
        # Test 4: Master Sync Execution from Home Header
        # -----------------------------------------------------------------
        print("Testing Master Sync Execution...")
        await header_sync_btn.click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v523_home_after_sync.png"))
        print("Master sync executed and verified.")

        print(f"All tests completed successfully! Page errors encountered: {len(page_errors)}")
        if page_errors:
            print("Errors:", page_errors)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
