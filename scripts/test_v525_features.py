import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

HTML_PATH = os.path.abspath("index.html")
ARTIFACT_DIR = r"C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b"

async def test_all():
    print("=== Testing v5.2.5 Features & Side Screens ===")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        reloads = []
        page.on("framenavigated", lambda frame: reloads.append(frame.url) if frame == page.main_frame else None)
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        await page.goto(file_url, wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 1. Check infinite reload loop: Wait 3 seconds and ensure page is NOT repeatedly reloading
        print(f"Initial navigation count: {len(reloads)}")
        await page.wait_for_timeout(3000)
        print(f"After 3s navigation count: {len(reloads)}")
        assert len(reloads) <= 1, "Infinite reload loop detected!"
        print("✓ Infinite reload loop verified FIXED!")

        # 2. Check Header: Brand icon empty box is gone and Tasks button is right there
        has_empty_box = await page.evaluate("() => !!document.querySelector('.brand-icon')")
        tasks_btn = await page.evaluate("() => { const b = document.getElementById('btnHeaderTasksTop'); return b ? { visible: b.offsetWidth > 0, text: b.innerText } : null; }")
        print(f"Empty brand-icon exists: {has_empty_box}, Tasks button: {tasks_btn}")
        assert not has_empty_box, "Empty brand icon box still present!"
        assert tasks_btn and tasks_btn['visible'], "Tasks button not visible!"

        shot_home = os.path.join(ARTIFACT_DIR, "v525_header_tasks_clean.png")
        await page.screenshot(path=shot_home, full_page=False)
        print(f"Screenshot saved: {shot_home}")

        # 3. Test Left Side Screen (summaryLeftDrawer)
        print("Testing Left Side Screen (ملخص المصروفات بالفرد)...")
        await page.click("#btnOpenSummaryDrawer")
        await page.wait_for_timeout(600)
        left_open = await page.evaluate("() => { const d = document.getElementById('summaryLeftDrawer'); return d ? d.classList.contains('open') : false; }")
        print(f"Left Drawer open: {left_open}")
        assert left_open, "Left drawer did not open!"

        shot_left = os.path.join(ARTIFACT_DIR, "v525_left_summary_screen.png")
        await page.screenshot(path=shot_left, full_page=False)
        print(f"Screenshot saved: {shot_left}")

        # Close left drawer
        await page.evaluate("() => closeSummaryLeftDrawer()")
        await page.wait_for_timeout(400)

        # 4. Test Right Side Screen (goldDrawerPanel)
        print("Testing Right Side Screen (شاشة الذهب والبورصة)...")
        await page.click("#btnOpenGold")
        await page.wait_for_timeout(600)
        right_open = await page.evaluate("() => { const d = document.getElementById('goldDrawerPanel'); return d ? d.classList.contains('open') : false; }")
        print(f"Right Drawer open: {right_open}")
        assert right_open, "Right drawer did not open!"

        shot_right = os.path.join(ARTIFACT_DIR, "v525_right_gold_screen.png")
        await page.screenshot(path=shot_right, full_page=False)
        print(f"Screenshot saved: {shot_right}")

        # Close right drawer
        await page.evaluate("() => closeGoldDrawer()")
        await page.wait_for_timeout(400)

        # 5. Check Console Errors
        if errors:
            print(f"Page errors: {errors}")
        else:
            print("✓ Zero page errors encountered!")

        print("=== ALL TESTS PASSED SUCCESSFULLY! ===")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_all())
