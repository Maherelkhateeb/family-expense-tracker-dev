import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: errors.append(f"CONSOLE {msg.type}: {msg.text}") if msg.type == 'error' else None)

        file_url = 'file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # Check Header
        has_add_task_in_header = await page.query_selector('#btnHeaderAddTaskTop')
        btn_search = await page.query_selector('#btnGlobalSearch')
        btn_tasks = await page.query_selector('#btnHeaderTasksTop')
        btn_settings = await page.query_selector('#btnMainSettings')

        print("btnHeaderAddTaskTop in header:", has_add_task_in_header is not None)
        print("btnGlobalSearch in header:", btn_search is not None)
        print("btnHeaderTasksTop in header:", btn_tasks is not None)
        print("btnMainSettings in header:", btn_settings is not None)

        # Test clicking btnGlobalSearch -> open search modal
        if btn_search:
            await btn_search.click()
            await page.wait_for_timeout(400)
            search_modal_visible = await page.evaluate("() => { const m = document.getElementById('globalSearchModal'); return m && window.getComputedStyle(m).display !== 'none'; }")
            print("globalSearchModal visible after search click:", search_modal_visible)
            # Close search modal
            await page.evaluate("closeModal('globalSearchModal')")
            await page.wait_for_timeout(300)

        # Test Tasks Modal
        await page.evaluate("openTasksFullScreenModal()")
        await page.wait_for_timeout(400)
        tasks_modal_visible = await page.evaluate("() => { const m = document.getElementById('tasksFullScreenModal'); return m && window.getComputedStyle(m).display !== 'none'; }")
        print("tasksFullScreenModal visible:", tasks_modal_visible)

        # Click Calendar Tab
        print("Clicking #btnTaskTabCalendar...")
        await page.click('#btnTaskTabCalendar')
        await page.wait_for_timeout(400)

        cal_view_visible = await page.evaluate("() => { const v = document.getElementById('tasksTabCalendarView'); return v && window.getComputedStyle(v).display !== 'none'; }")
        print("tasksTabCalendarView visible:", cal_view_visible)

        # Inspect Month Title and Cells Count
        month_title = await page.evaluate("() => document.getElementById('calendarMonthTitle').innerText")
        cells_count = await page.evaluate("() => document.querySelectorAll('#tasksCalendarGrid > div').length")
        day_title = await page.evaluate("() => document.getElementById('calendarSelectedDayTitle').innerText")
        day_badge = await page.evaluate("() => document.getElementById('calendarSelectedDayCountBadge').innerText")
        day_items = await page.evaluate("() => document.querySelectorAll('#tasksCalendarDayList > div').length")

        print(f"Calendar Month Title: {month_title}")
        print(f"Calendar Cells Count: {cells_count}")
        print(f"Selected Day Title: {day_title}")
        print(f"Selected Day Badge: {day_badge}")
        print(f"Selected Day Task Items: {day_items}")

        # Capture screenshot of calendar tab
        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v529_calendar_tab_with_tasks_by_day.png')

        # Test clicking another day in the calendar (e.g. Day 18)
        clicked_18 = await page.evaluate("""() => {
            const cells = document.querySelectorAll('#tasksCalendarGrid > [data-calendar-date]');
            for (let c of cells) {
                const span = c.querySelector('span');
                if (span && span.innerText.trim() === '18') {
                    c.click();
                    return true;
                }
            }
            return false;
        }""")
        print("Clicked Day 18:", clicked_18)
        await page.wait_for_timeout(300)

        day_title_18 = await page.evaluate("() => document.getElementById('calendarSelectedDayTitle').innerText")
        day_badge_18 = await page.evaluate("() => document.getElementById('calendarSelectedDayCountBadge').innerText")
        day_text_18 = await page.evaluate("() => document.getElementById('tasksCalendarDayList').innerText")
        print(f"Day 18 Title: {day_title_18}")
        print(f"Day 18 Badge: {day_badge_18}")
        print(f"Day 18 Content:\n{day_text_18}")

        # Test Quick Add button from Calendar: openAddTaskForSelectedDate
        print("Testing openAddTaskForSelectedDate from Day 18...")
        await page.evaluate("openAddTaskForSelectedDate(window.calendarSelectedDate)")
        await page.wait_for_timeout(300)

        creator_visible = await page.evaluate("() => { const c = document.getElementById('tasksUnifiedCreatorCard'); return c && window.getComputedStyle(c).display !== 'none'; }")
        inp_date_val = await page.evaluate("() => document.getElementById('inlineTaskDueDate').value")
        print("tasksUnifiedCreatorCard visible after Add Task for Day 18:", creator_visible)
        print("inlineTaskDueDate value:", inp_date_val)

        # Close tasks modal
        await page.evaluate("closeTasksFullScreenModal()")
        await page.wait_for_timeout(300)

        # Screenshot header with search glass
        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\v529_header_with_search_glass.png')

        print("Total Page Errors:", len(errors))
        for e in errors:
            print("  ", e)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
