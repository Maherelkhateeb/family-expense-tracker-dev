import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 390, 'height': 844})

        file_url = 'file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(500)

        # Open Tasks modal
        await page.evaluate("openTasksFullScreenModal()")
        await page.wait_for_timeout(300)

        # Switch to Calendar
        await page.click('#btnTaskTabCalendar')
        await page.wait_for_timeout(300)

        html_cal = await page.evaluate("""() => {
            const calView = document.getElementById('tasksTabCalendarView');
            return calView ? calView.innerHTML : 'NOT FOUND';
        }""")
        print("tasksTabCalendarView innerHTML length:", len(html_cal))
        print("tasksTabCalendarView text:", await page.locator('#tasksTabCalendarView').inner_text())

        # Now let's see what happens if we add a task for another day (e.g. 2026-11-15)
        await page.evaluate("""() => {
            const tasks = getTodoTasks();
            tasks.push({
                id: 'custom_test_task_1',
                title: 'مهمة يوم 15 نوفمبر التجريبية',
                dueDate: '2026-11-15',
                dueTime: '15:30',
                tag: 'general',
                category: 'general',
                assignedMember: 'ماهر',
                priority: 'medium',
                completed: false
            });
            saveTodoTasks(tasks);
            renderTasksCalendar();
        }""")
        await page.wait_for_timeout(300)

        # Click on day 15 cell
        print("Clicking day 15 cell...")
        clicked = await page.evaluate("""() => {
            const cells = document.querySelectorAll('#tasksCalendarGrid > div');
            for (let c of cells) {
                if (c.innerText.trim() === '15') {
                    c.click();
                    return true;
                }
            }
            return false;
        }""")
        print("Day 15 cell clicked:", clicked)
        await page.wait_for_timeout(300)

        day_text = await page.locator('#tasksCalendarDayList').inner_text()
        print("tasksCalendarDayList text after clicking 15:")
        print(day_text)
        print("Day Title:", await page.locator('#calendarSelectedDayTitle').inner_text())
        print("Day Badge:", await page.locator('#calendarSelectedDayCountBadge').inner_text())

        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\debug_day_15.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
