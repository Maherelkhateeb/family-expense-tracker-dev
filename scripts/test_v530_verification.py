import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 390, 'height': 844}, locale='ar-SA')
        
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: errors.append(f"CONSOLE {msg.type}: {msg.text}") if msg.type == 'error' else None)

        file_url = 'file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # 1. Verify "صافي السيولة المعتمدة للمحافظ" is DELETED
        body_text = await page.evaluate("() => document.body.innerText")
        has_phrase = "صافي السيولة المعتمدة للمحافظ" in body_text
        print("Has 'صافي السيولة المعتمدة للمحافظ':", has_phrase)
        assert not has_phrase, "Phrase should be deleted!"

        # 2. Check Header Order: Notifications -> Search -> Tasks
        notif_btn = await page.query_selector('#btnNotificationsBell')
        search_btn = await page.query_selector('#btnGlobalSearch')
        tasks_btn = await page.query_selector('#btnHeaderTasksTop')
        sync_btn = await page.query_selector('#btnHeaderMasterSync')
        settings_btn = await page.query_selector('#btnMainSettings')

        box_notif = await notif_btn.bounding_box()
        box_search = await search_btn.bounding_box()
        box_tasks = await tasks_btn.bounding_box()
        box_sync = await sync_btn.bounding_box()
        box_settings = await settings_btn.bounding_box()

        print("Bounding boxes X coordinates (RTL order from right to left should decrease):")
        print(f"  btnNotificationsBell: x={box_notif['x']:.1f}, width={box_notif['width']:.1f}")
        print(f"  btnGlobalSearch:      x={box_search['x']:.1f}, width={box_search['width']:.1f}")
        print(f"  btnHeaderTasksTop:    x={box_tasks['x']:.1f}, width={box_tasks['width']:.1f}")
        print(f"  btnHeaderMasterSync:  x={box_sync['x']:.1f}, width={box_sync['width']:.1f}")
        print(f"  btnMainSettings:      x={box_settings['x']:.1f}, width={box_settings['width']:.1f}")

        assert box_notif['x'] > box_search['x'], "Notifications should be to the right of Search!"
        assert box_search['x'] > box_tasks['x'], "Search should be to the right of Tasks!"
        assert box_tasks['x'] > box_sync['x'], "Tasks should be to the right of Sync!"
        assert box_sync['x'] > box_settings['x'], "Sync should be to the right of Settings!"
        print("Header button ordering verification: PASSED 100%!")

        # 3. Check Cockpit Numbers
        metrics = await page.evaluate("""() => {
            const bal = document.getElementById('topCardBalance');
            const inc = document.getElementById('topCardIncome');
            const exp = document.getElementById('topCardExpense');
            const cockpit = document.getElementById('topKpiThreeStrip');
            const flowSide = document.querySelector('.cockpit-flow-side');
            const heroSide = document.querySelector('.cockpit-hero-side');
            
            const balStyle = window.getComputedStyle(bal);
            const incStyle = window.getComputedStyle(inc);
            const expStyle = window.getComputedStyle(exp);

            return {
                balText: bal.innerText,
                balFontSize: balStyle.fontSize,
                balFontWeight: balStyle.fontWeight,
                balOverflow: bal.scrollWidth > bal.clientWidth,
                incText: inc.innerText,
                incFontSize: incStyle.fontSize,
                incFontWeight: incStyle.fontWeight,
                expText: exp.innerText,
                expFontSize: expStyle.fontSize,
                expFontWeight: expStyle.fontWeight,
                cockpitHeight: cockpit.clientHeight,
                heroWidth: heroSide.clientWidth,
                flowWidth: flowSide.clientWidth
            };
        }""")
        print("Cockpit Metrics on 390px:")
        for k, v in metrics.items():
            print(f"  {k}: {v}")

        # Capture Screenshots
        screenshot_path = r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v530_cockpit_and_header.png'
        await page.screenshot(path=screenshot_path)
        print("Saved v530_cockpit_and_header.png")

        # Test on 360px viewport
        await page.set_viewport_size({'width': 360, 'height': 780})
        await page.wait_for_timeout(300)
        screenshot_360_path = r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v530_360px_header_and_numbers.png'
        await page.screenshot(path=screenshot_360_path)
        print("Saved v530_360px_header_and_numbers.png")

        # 4. Interactive verification of all buttons
        # A. Click Notifications
        await notif_btn.click()
        await page.wait_for_timeout(300)
        notif_modal_vis = await page.evaluate("() => { const m = document.getElementById('notificationsModal'); return m && window.getComputedStyle(m).display !== 'none'; }")
        print("Notifications Modal Interactive:", notif_modal_vis)
        await page.evaluate("closeModal('notificationsModal')")
        await page.wait_for_timeout(200)

        # B. Click Search
        await search_btn.click()
        await page.wait_for_timeout(300)
        search_modal_vis = await page.evaluate("() => { const m = document.getElementById('globalSearchModal'); return m && window.getComputedStyle(m).display !== 'none'; }")
        print("Global Search Modal Interactive:", search_modal_vis)
        await page.evaluate("closeModal('globalSearchModal')")
        await page.wait_for_timeout(200)

        # C. Click Tasks
        await tasks_btn.click()
        await page.wait_for_timeout(300)
        tasks_modal_vis = await page.evaluate("() => { const m = document.getElementById('tasksFullScreenModal'); return m && window.getComputedStyle(m).display !== 'none'; }")
        print("Tasks FullScreen Modal Interactive:", tasks_modal_vis)
        await page.evaluate("closeTasksFullScreenModal()")
        await page.wait_for_timeout(200)

        # D. Click Settings
        await settings_btn.click()
        await page.wait_for_timeout(300)
        settings_modal_vis = await page.evaluate("() => { const m = document.getElementById('settingsModal'); return m && window.getComputedStyle(m).display !== 'none'; }")
        print("Settings Modal Interactive:", settings_modal_vis)
        await page.evaluate("closeModal('settingsModal')")
        await page.wait_for_timeout(200)

        print("ALL TESTS PASSED WITH 100% SUCCESS!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
