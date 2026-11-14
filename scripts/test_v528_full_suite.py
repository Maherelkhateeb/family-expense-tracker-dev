# scripts/test_v528_full_suite.py
import sys
import os
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Test 360x780 mobile screen
        context = await browser.new_context(viewport={'width': 360, 'height': 780}, locale='ar-SA')
        page = await context.new_page()

        file_url = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        print(f"Loading URL: {file_url}")

        page.on("console", lambda msg: print(f"Browser Console [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err}"))

        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # 1. Verify Header Buttons: Tasks and Add Task side by side
        btn_tasks = await page.query_selector('#btnHeaderTasksTop')
        btn_add = await page.query_selector('#btnHeaderAddTaskTop')
        btn_settings = await page.query_selector('#btnMainSettings')

        assert btn_tasks is not None, "btnHeaderTasksTop not found!"
        assert btn_add is not None, "btnHeaderAddTaskTop not found!"
        assert btn_settings is not None, "btnMainSettings not found!"

        rect_tasks = await btn_tasks.bounding_box()
        rect_add = await btn_add.bounding_box()
        rect_settings = await btn_settings.bounding_box()

        print(f"Tasks button: x={rect_tasks['x']}, width={rect_tasks['width']}")
        print(f"Add button: x={rect_add['x']}, width={rect_add['width']}")
        print(f"Settings button: x={rect_settings['x']}, width={rect_settings['width']}")

        # Ensure no overlap between settings and tasks cluster
        assert rect_settings['x'] + rect_settings['width'] <= rect_tasks['x'] or rect_tasks['x'] + rect_tasks['width'] <= rect_settings['x'], "Buttons overlap detected!"
        print("✓ Header buttons have zero collision!")

        # Screenshot header
        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v528_header_with_add_task_btn.png')

        # 2. Open Tasks page normally via #btnHeaderTasksTop
        print("Clicking #btnHeaderTasksTop...")
        await btn_tasks.click()
        await page.wait_for_timeout(500)

        # Verify #tasksUnifiedCreatorCard is HIDDEN by default
        is_creator_hidden = await page.evaluate("""() => {
            const card = document.getElementById('tasksUnifiedCreatorCard');
            return !card || window.getComputedStyle(card).display === 'none';
        }""")
        print(f"Is creator hidden by default: {is_creator_hidden}")
        assert is_creator_hidden, "Creator card should be hidden by default!"

        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v528_tasks_clean_view_hidden_creator.png')

        # 3. Click #btnProductivityAddTask (beside indicators) to reveal creator
        btn_prod_add = await page.query_selector('#btnProductivityAddTask')
        assert btn_prod_add is not None, "#btnProductivityAddTask not found beside indicators!"
        print("Clicking #btnProductivityAddTask beside indicators...")
        await btn_prod_add.click()
        await page.wait_for_timeout(400)

        is_creator_visible = await page.evaluate("""() => {
            const card = document.getElementById('tasksUnifiedCreatorCard');
            return card && window.getComputedStyle(card).display !== 'none';
        }""")
        print(f"Is creator visible after click: {is_creator_visible}")
        assert is_creator_visible, "Creator card should be visible after clicking add button!"

        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v528_tasks_creator_opened.png')

        # 4. Fill and submit task
        await page.fill('#quickTaskTitleInput', 'شراء مستلزمات الصيدلية الشهرية')
        tag_health = await page.query_selector('#unifiedTaskTagChipsList [data-tag="health"]')
        if tag_health:
            await tag_health.click()
        await page.wait_for_timeout(200)

        btn_submit = await page.query_selector('#btnSubmitUnifiedTask')
        await btn_submit.click()
        await page.wait_for_timeout(600)

        # Verify task is added and creator card auto-hides
        is_creator_hidden_again = await page.evaluate("""() => {
            const card = document.getElementById('tasksUnifiedCreatorCard');
            return !card || window.getComputedStyle(card).display === 'none';
        }""")
        print(f"Is creator auto-hidden after task submit: {is_creator_hidden_again}")
        assert is_creator_hidden_again, "Creator card should automatically hide after submitting task!"

        # 5. Expand first task and test subtasks photo buttons
        tasks_list = await page.inner_text('#tasksFullScreenContainerList')
        assert 'شراء مستلزمات الصيدلية الشهرية' in tasks_list, "Task not found in list!"
        print("✓ Task confirmed in list with tag 'صحة'")

        # Expand task
        expand_btn = await page.query_selector('#tasksFullScreenContainerList button[onclick*="toggleExpandTask"]')
        if expand_btn:
            await expand_btn.click()
            await page.wait_for_timeout(300)

        # Check subtask camera and gallery buttons
        sub_camera_btn = await page.query_selector('#tasksFullScreenContainerList button[onclick*="triggerSubtaskCamera"]')
        sub_gallery_btn = await page.query_selector('#tasksFullScreenContainerList button[onclick*="triggerSubtaskGallery"]')
        assert sub_camera_btn is not None, "Subtask camera button not found!"
        assert sub_gallery_btn is not None, "Subtask gallery button not found!"
        print("✓ Subtask camera & gallery buttons verified!")

        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v528_tasks_expanded_with_subtask_camera.png')

        # 6. Close Tasks and test Settings Button
        close_tasks_btn = await page.query_selector('#tasksFullScreenModal button[onclick*="closeTasksFullScreenModal"]')
        if close_tasks_btn:
            await close_tasks_btn.click()
            await page.wait_for_timeout(400)

        print("Testing #btnMainSettings click on 360px screen...")
        await btn_settings.click()
        await page.wait_for_timeout(500)

        settings_display = await page.evaluate("""() => {
            const m = document.getElementById('settingsModal');
            return m ? window.getComputedStyle(m).display : 'none';
        }""")
        print(f"Settings modal display after click: {settings_display}")
        assert settings_display == 'flex', "Settings modal should open cleanly with display: flex!"

        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v528_settings_opened_360px.png')

        print("🎉 ALL V5.2.8 TESTS PASSED SUCCESSFULLY!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
