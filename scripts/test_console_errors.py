import sys
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})

        errors = []
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type in ['error', 'warning'] else None)

        url = "file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html"
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)

        print("=== Initial Page Load Errors ===")
        print(f"Total Page Errors: {len(errors)}")
        for e in errors:
            print("  ", e)

        # Test opening Settings Modal
        print("\n=== Testing Settings Modal ===")
        try:
            await page.click("#btnMainSettings")
            await page.wait_for_timeout(1000)
            is_open = await page.eval_on_selector("#settingsModal", "el => el.classList.contains('open') || el.style.display !== 'none'")
            print(f"Settings Modal opened successfully? {is_open}")
        except Exception as ex:
            print(f"Error opening settings: {ex}")

        # Test opening Commitments View
        print("\n=== Testing Commitments View ===")
        try:
            await page.click("#navTabExpected")
            await page.wait_for_timeout(1000)
            is_commitments = await page.eval_on_selector("#viewExpected", "el => el.style.display !== 'none'")
            print(f"Commitments View visible? {is_commitments}")
        except Exception as ex:
            print(f"Error navigating to commitments: {ex}")

        # Test opening Tasks Modal
        print("\n=== Testing Tasks Modal ===")
        try:
            await page.click("#btnHeaderTasksTop")
            await page.wait_for_timeout(1000)
            is_tasks = await page.eval_on_selector("#tasksFullScreenModal", "el => el.classList.contains('open') || el.style.display !== 'none'")
            print(f"Tasks Modal opened? {is_tasks}")
        except Exception as ex:
            print(f"Error opening tasks: {ex}")

        print(f"\nFinal Total Page Errors: {len(errors)}")
        for e in errors:
            print("  ", e)

        await browser.close()

asyncio.run(main())
