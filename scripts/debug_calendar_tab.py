# scripts/debug_calendar_tab.py
import sys
import os
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 390, 'height': 844}, locale='ar-SA')
        page = await context.new_page()

        file_url = 'file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # Open Tasks modal
        await page.evaluate("openTasksFullScreenModal()")
        await page.wait_for_timeout(500)

        # Click calendar tab
        print("Clicking calendar tab #btnTaskTabCalendar...")
        btn_cal = await page.query_selector('#btnTaskTabCalendar')
        await btn_cal.click()
        await page.wait_for_timeout(500)

        # Inspect calendar state
        cal_state = await page.evaluate("""() => {
            const viewCal = document.getElementById('tasksTabCalendarView');
            const grid = document.getElementById('tasksCalendarGrid');
            const dayList = document.getElementById('tasksCalendarDayList');
            const title = document.getElementById('calendarMonthTitle');
            const dayTitle = document.getElementById('calendarSelectedDayTitle');
            const badge = document.getElementById('calendarSelectedDayCountBadge');
            return {
                viewCalDisplay: viewCal ? window.getComputedStyle(viewCal).display : null,
                gridCellsCount: grid ? grid.children.length : 0,
                monthTitleText: title ? title.innerText : null,
                dayListChildrenCount: dayList ? dayList.children.length : 0,
                dayListText: dayList ? dayList.innerText : null,
                selectedDayTitle: dayTitle ? dayTitle.innerText : null,
                selectedDayBadge: badge ? badge.innerText : null,
                calendarSelectedDate: window.calendarSelectedDate,
                calendarCurrentYear: window.calendarCurrentYear,
                calendarCurrentMonth: window.calendarCurrentMonth
            };
        }""")
        print("Calendar state after clicking tab:")
        for k, v in cal_state.items():
            print(f"  {k}: {v}")

        # Screenshot calendar view
        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\debug_calendar_tab.png')
        print("Saved debug_calendar_tab.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
