# scripts/test_unified_task_creator.py
import sys
import os
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            locale='ar-SA'
        )
        page = await context.new_page()

        file_url = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        print(f"Loading URL: {file_url}")
        
        # Capture console messages
        page.on("console", lambda msg: print(f"Browser Console [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err}"))

        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # Open Tasks modal
        print("Opening Tasks Full Screen Modal...")
        await page.evaluate("openTasksFullScreenModal()")
        await page.wait_for_timeout(600)

        # Check visibility of unified creator card
        creator_card = await page.query_selector('#tasksUnifiedCreatorCard')
        assert creator_card is not None, "Unified creator card not found in DOM!"
        print("✓ #tasksUnifiedCreatorCard is present")

        # Type statement
        title_input = await page.query_selector('#quickTaskTitleInput')
        assert title_input is not None, "#quickTaskTitleInput not found!"
        await title_input.fill("سداد فاتورة الكهرباء والغاز")
        print("✓ Filled task statement: 'سداد فاتورة الكهرباء والغاز'")

        # Select Tag: bills
        bills_tag = await page.query_selector('#unifiedTaskTagChipsList [data-tag="bills"]')
        assert bills_tag is not None, "Bills tag chip not found!"
        await bills_tag.click()
        await page.wait_for_timeout(200)
        
        active_badge = await page.inner_text('#unifiedCreatorActiveTagBadge')
        print(f"✓ Active tag badge: {active_badge}")
        assert "فواتير" in active_badge, f"Badge does not have 'فواتير': {active_badge}"

        # Select Date preset: tomorrow
        tomorrow_btn = await page.query_selector('#inlineDatePresetGroup [data-preset="tomorrow"]')
        assert tomorrow_btn is not None, "Tomorrow preset button not found!"
        await tomorrow_btn.click()
        await page.wait_for_timeout(200)

        date_val = await page.input_value('#inlineTaskDueDate')
        print(f"✓ Due date input value: {date_val}")

        # Select Time preset: 17:00 (5:00 PM)
        time_btn = await page.query_selector('#inlineTimePresetGroup [data-time="17:00"]')
        assert time_btn is not None, "17:00 preset button not found!"
        await time_btn.click()
        await page.wait_for_timeout(200)

        time_val = await page.input_value('#inlineTaskDueTime')
        print(f"✓ Due time input value: {time_val}")
        assert time_val == "17:00", f"Time value is not 17:00: {time_val}"

        # Select Member: ماهر
        maher_btn = await page.query_selector('#inlineTaskMemberGroup [data-member="ماهر"]')
        assert maher_btn is not None, "Member 'ماهر' button not found!"
        await maher_btn.click()
        await page.wait_for_timeout(200)
        print("✓ Selected member: ماهر")

        # Click submit button
        submit_btn = await page.query_selector('#btnSubmitUnifiedTask')
        assert submit_btn is not None, "Submit button not found!"
        await submit_btn.click()
        await page.wait_for_timeout(600)
        print("✓ Clicked #btnSubmitUnifiedTask")

        # Verify task appeared in the list
        list_container = await page.query_selector('#tasksFullScreenContainerList')
        container_text = await list_container.inner_text()
        print("Container snippet:", container_text[:200])
        assert "سداد فاتورة الكهرباء والغاز" in container_text, "New task not found in rendered list!"
        assert "فواتير" in container_text, "Tag badge 'فواتير' not found in rendered list!"
        assert "17:00" in container_text, "Time '17:00' not found in rendered list!"
        print("✅ Task successfully created and verified in rendered list!")

        # Take screenshot for artifact
        artifact_path = r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v527_unified_task_creator.png'
        await page.screenshot(path=artifact_path)
        print(f"✅ Saved screenshot to: {artifact_path}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
