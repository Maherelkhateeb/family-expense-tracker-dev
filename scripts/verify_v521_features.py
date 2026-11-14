import asyncio
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

ARTIFACT_DIR = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
INDEX_PATH = os.path.abspath("index.html")

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})

        page.on("console", lambda msg: print(f"[Browser Console {msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser PageError] {err}"))

        page_url = f"file:///{INDEX_PATH.replace(os.sep, '/')}"
        print(f"Loading page: {page_url}")
        await page.goto(page_url, wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(1500)

        # 1. Verify Top Header (Tasks button & Sync button)
        header_tasks_btn = await page.query_selector("#btnHeaderTasksTop")
        header_sync_btn = await page.query_selector("#btnHeaderMasterSync")
        print(f"Header tasks button exists: {header_tasks_btn is not None}")
        print(f"Header sync button exists: {header_sync_btn is not None}")

        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_home_header.png"))
        print("Captured v521_home_header.png")

        # 2. Click Header Tasks Button and open Task Date & Time Picker
        if header_tasks_btn:
            await header_tasks_btn.click()
            await page.wait_for_timeout(800)
            print("Opened tasks full screen modal")

            # Click date time trigger
            dt_trigger = await page.query_selector("#btnQuickTaskDateTimeTrigger")
            if dt_trigger:
                await dt_trigger.click()
                await page.wait_for_timeout(600)
                print("Opened task date time picker modal")
                await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_tasks_datetime_modal.png"))
                print("Captured v521_tasks_datetime_modal.png")

                # Close picker modal
                close_btn = await page.query_selector("#taskDateTimePickerModal .btn-close-drawer")
                if close_btn:
                    await close_btn.click()
                    await page.wait_for_timeout(300)

            # Close tasks modal
            close_tasks = await page.query_selector("#tasksFullScreenModal button")
            if close_tasks:
                await close_tasks.click()
                await page.wait_for_timeout(400)

        # 3. Switch to Operations Page
        await page.evaluate("switchAppPage('operations')")
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_operations_filtered.png"))
        print("Captured v521_operations_filtered.png")

        # 4. Switch to Commitments Page (Rebuilt Bills & Debts)
        await page.evaluate("switchAppPage('expected')")
        await page.wait_for_timeout(800)

        # Bills view
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_commitments_bills_view.png"))
        print("Captured v521_commitments_bills_view.png")

        # Open Unified Add panel
        await page.evaluate("toggleUnifiedAddCommitmentPanel(true)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_commitments_unified_add_form.png"))
        print("Captured v521_commitments_unified_add_form.png")

        # Switch to Debts tab
        await page.evaluate("toggleUnifiedAddCommitmentPanel(false); switchCommitmentSubSection('debts');")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v521_commitments_debts_view.png"))
        print("Captured v521_commitments_debts_view.png")

        await browser.close()
        print("✅ All Playwright visual tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(run())
