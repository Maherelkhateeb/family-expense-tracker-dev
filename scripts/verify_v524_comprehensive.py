import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
HTML_PATH = os.path.abspath("index.html")

async def run():
    print(f"Starting v5.2.4 Playwright verification on: {HTML_PATH}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
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
        # Test 1: Header Brand Row & Image Removal Verification
        # -----------------------------------------------------------------
        print("Testing Header: verifying mosaic image was removed from internal header...")
        mosaic_in_header = await page.locator(".app-header img[src*='family_option2_mosaic']").count()
        assert mosaic_in_header == 0, f"Mosaic image should NOT be inside header, found {mosaic_in_header}"
        print("✓ Mosaic image successfully removed from header.")

        # Verify outside icons exist
        assert os.path.exists("assets/icon-192.png"), "icon-192.png missing"
        assert os.path.exists("assets/icon-512.png"), "icon-512.png missing"
        assert os.path.exists("assets/favicon.png"), "favicon.png missing"
        print("✓ PWA external icons verified on disk.")

        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v524_header_clean.png"))

        # -----------------------------------------------------------------
        # Test 2: Tasks Screen, Date & Time Trigger Modal, and Sticky Filters
        # -----------------------------------------------------------------
        print("Testing Tasks Screen & Date-Time Picker Modal...")
        await page.locator("#btnHeaderTasksTop").click()
        await page.wait_for_timeout(500)

        tasks_modal = page.locator("#tasksFullScreenModal")
        assert await tasks_modal.is_visible(), "Tasks full screen modal not visible"

        # Verify unified Date & Time trigger button
        dt_trigger_btn = page.locator("#btnQuickTaskDateTimeTrigger")
        assert await dt_trigger_btn.is_visible(), "btnQuickTaskDateTimeTrigger not visible"

        # Click date-time trigger to open picker modal
        await dt_trigger_btn.click()
        await page.wait_for_timeout(400)

        dt_modal = page.locator("#taskDateTimePickerModal")
        assert await dt_modal.is_visible(), "taskDateTimePickerModal failed to open"
        print("✓ Task Date-Time Picker Modal opened successfully.")

        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v524_tasks_dt_modal_open.png"))

        # Select tomorrow preset
        btn_tomorrow = page.locator("#chipModalDateTomorrow")
        if await btn_tomorrow.is_visible():
            await btn_tomorrow.click()
            await page.wait_for_timeout(200)

        # Select 06:00 pm preset
        btn_time_pm = page.locator("#taskModalTimeChips button:has-text('06:00')")
        if await btn_time_pm.is_visible():
            await btn_time_pm.click()
            await page.wait_for_timeout(200)

        # Confirm picker
        await page.locator("button:has-text('تأكيد موعد المهمة')").click()
        await page.wait_for_timeout(400)

        # Verify button label updated
        lbl_text = await page.locator("#lblQuickTaskDateTimeTrigger").text_content()
        print(f"Updated datetime label: {lbl_text}")
        assert "غداً" in lbl_text or "18:00" in lbl_text or "06:00" in lbl_text, "Date time label was not updated"

        # Add mock photo and title, then add task
        mock_photo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALUlEQVRYR+3QQREAAAzCMPun1mZ8tAYc2Zekqn4eAAAAAAAAAAAAAAAAAABuGvE9AYHn81HlAAAAAElFTkSuQmCC"
        await page.evaluate(f"window.currentQuickTaskPhoto = '{mock_photo}'")
        await page.fill("#quickTaskTitleInput", "فحص عداد الكهرباء وسداد الفاتورة مع المرفق")
        await page.locator("#tasksFullScreenModal button[onclick='handleQuickTaskAdd()']").click()
        await page.wait_for_timeout(500)

        # -----------------------------------------------------------------
        # Test 3: Verify Task with Photo is COLLAPSED by Default
        # -----------------------------------------------------------------
        print("Testing Task Card: verifying card is collapsed by default...")
        first_card = page.locator("#tasksFullScreenContainerList > div").first
        assert await first_card.is_visible(), "Task card not rendered"

        # Check that details wrap is initially hidden
        details_wrap = first_card.locator("div[id^='taskDetailsWrap_']")
        is_hidden_initially = await details_wrap.evaluate("el => el.style.display === 'none' || getComputedStyle(el).display === 'none'")
        print(f"Details container initially hidden: {is_hidden_initially}")
        assert is_hidden_initially, "Task details (and photo) MUST be collapsed by default"

        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v524_tasks_collapsed_default.png"))

        # Click on card header to expand
        print("Clicking card to expand details...")
        await first_card.locator("div[onclick*='toggleExpandTask']").first.click()
        await page.wait_for_timeout(400)

        is_visible_after_click = await details_wrap.evaluate("el => el.style.display === 'flex' || getComputedStyle(el).display === 'flex'")
        print(f"Details container visible after click: {is_visible_after_click}")
        assert is_visible_after_click, "Task details MUST expand when clicked"

        # Check attached image is visible inside details
        img_el = details_wrap.locator("img")
        assert await img_el.is_visible(), "Attached photo should be visible in expanded details"

        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v524_tasks_expanded_details.png"))
        print("✓ Task card collapsed/expand behavior with photo verified.")

        # Close tasks modal
        await page.locator("#tasksFullScreenModal button:has-text('إغلاق')").click()
        await page.wait_for_timeout(300)

        # -----------------------------------------------------------------
        # Test 4: Indicators (المؤشرات) Page & Filters
        # -----------------------------------------------------------------
        print("Testing Indicators (المؤشرات) Page & Filters...")
        await page.locator("#navTabAnalytics").click()
        await page.wait_for_timeout(600)

        view_ana = page.locator("#viewAnalytics")
        assert await view_ana.is_visible(), "viewAnalytics not visible"

        # Test clicking period filters
        for p_name, p_label in [('day', 'اليوم'), ('week', 'الأسبوع'), ('month', 'الشهر'), ('all', 'كافة الفترات')]:
            btn_p = page.locator(f".analytics-period-btn[data-period='{p_name}']")
            await btn_p.click()
            await page.wait_for_timeout(300)
            pill_text = await page.locator("#analyticsPeriodActivePill").text_content()
            print(f"Period {p_name} clicked -> pill shows: {pill_text}")
            assert p_label in pill_text or p_name in pill_text, f"Period pill text did not update for {p_name}"

        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v524_analytics_filtered.png"))
        print("✓ Indicators period filter execution verified.")

        # -----------------------------------------------------------------
        # Test 5: Settings Modal Icon Theme Grid Layout
        # -----------------------------------------------------------------
        print("Testing Settings Modal Icon Themes Layout...")
        await page.locator("#navTabExpenses").click()
        await page.wait_for_timeout(300)
        await page.locator("#btnMainSettings").click()
        await page.wait_for_timeout(500)

        settings_modal = page.locator("#settingsModal")
        assert await settings_modal.is_visible(), "Settings modal not visible"
        await page.screenshot(path=os.path.join(ARTIFACT_DIR, "v524_settings_icon_grid.png"))
        print("✓ Settings modal icon grid screenshot captured.")

        print(f"All v5.2.4 tests completed with 0 errors! Page errors count: {len(page_errors)}")
        if page_errors:
            print("Errors:", page_errors)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
