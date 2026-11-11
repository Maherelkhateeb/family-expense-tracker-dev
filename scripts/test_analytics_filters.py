import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')
HTML_PATH = os.path.abspath("index.html")

async def test_analytics():
    print(f"Testing Analytics Page & Filters on: {HTML_PATH}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 390, "height": 844})

        page_errors = []
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on("console", lambda msg: print(f"[{msg.type}] {msg.text}") if msg.type in ['error', 'warn'] else None)

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        await page.goto(file_url, wait_until="load")
        await page.wait_for_timeout(800)

        # 1. Click navTabAnalytics
        print("Clicking navTabAnalytics...")
        btn_ana = page.locator("#navTabAnalytics")
        await btn_ana.click()
        await page.wait_for_timeout(600)

        # Check if viewAnalytics is visible
        view_ana = page.locator("#viewAnalytics")
        print("viewAnalytics visible:", await view_ana.is_visible())

        # Test period buttons
        for period in ['day', 'week', 'month', 'all']:
            print(f"Testing period button: {period}...")
            btn_p = page.locator(f".analytics-period-btn[data-period='{period}']")
            if await btn_p.is_visible():
                await btn_p.click()
                await page.wait_for_timeout(300)
            else:
                print(f"Period button {period} not visible!")

        # Test section buttons (categories, members, timeline, monthly, wallets)
        for sec in ['categories', 'members', 'timeline', 'monthly', 'wallets']:
            print(f"Testing section button: {sec}...")
            btn_s = page.locator(f".analytics-sec-btn[data-sec='{sec}']")
            if await btn_s.is_visible():
                await btn_s.click()
                await page.wait_for_timeout(300)
            else:
                print(f"Section button {sec} not visible!")

        # Test member selector if in members pane
        print("Testing member selector strip...")
        mem_chips = page.locator("#memberAnalyticsSelectorStrip button")
        count_mem = await mem_chips.count()
        print(f"Found {count_mem} member selector buttons.")
        if count_mem > 0:
            await mem_chips.first.click()
            await page.wait_for_timeout(300)

        # Take screenshot of Analytics page
        artifact_dir = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
        await page.screenshot(path=os.path.join(artifact_dir, "v523_analytics_test.png"))
        print(f"Page errors: {len(page_errors)}")
        for err in page_errors:
            print("ERROR:", err)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_analytics())
