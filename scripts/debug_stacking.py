import asyncio
from playwright.async_api import async_playwright

async def debug_stacking():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto("file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html")
        await page.locator("#btnHeaderTasksTop").click()
        await page.locator("#btnQuickTaskDateTimeTrigger").click()
        await page.wait_for_timeout(300)

        info = await page.evaluate('''() => {
            const modal = document.getElementById('taskDateTimePickerModal');
            const tasks = document.getElementById('tasksFullScreenModal');
            const cam = document.querySelector('button[onclick="triggerTaskCameraOnly()"]');
            
            function getStack(el) {
                const arr = [];
                while (el && el !== document.body) {
                    const cs = window.getComputedStyle(el);
                    arr.push({ tag: el.tagName, id: el.id, class: el.className, zIndex: cs.zIndex, position: cs.position, opacity: cs.opacity, transform: cs.transform });
                    el = el.parentElement;
                }
                return arr;
            }

            return {
                modalStack: getStack(modal),
                camStack: getStack(cam)
            };
        }''')
        import pprint
        print("MODAL STACK:")
        for s in info['modalStack']:
            print(" ", s)
        print("\nCAM STACK:")
        for s in info['camStack']:
            print(" ", s)

        await browser.close()

asyncio.run(debug_stacking())
