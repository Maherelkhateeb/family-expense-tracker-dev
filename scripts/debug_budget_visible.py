import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

HTML_PATH = os.path.abspath("index.html")

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: print(f"CONSOLE {msg.type}: {msg.text}"))

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        await page.goto(file_url, wait_until="load")
        await page.wait_for_timeout(500)

        await page.locator("#navTabExpected").click()
        await page.wait_for_timeout(300)

        print("Clicking #tabExpectedBudgets...")
        await page.locator("#tabExpectedBudgets").click()
        await page.wait_for_timeout(500)

        res = await page.evaluate("""() => {
            const el = document.getElementById('panelMonthlyBudget');
            if (!el) return 'el not found';
            return {
                styleDisplay: el.style.display,
                computedDisplay: window.getComputedStyle(el).display,
                parentTag: el.parentElement.tagName,
                parentId: el.parentElement.id,
                parentDisplay: window.getComputedStyle(el.parentElement).display
            };
        }""")
        print("panelMonthlyBudget state:", res)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
