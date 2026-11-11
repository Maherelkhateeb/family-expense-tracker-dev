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

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        await page.goto(file_url, wait_until="load")
        await page.wait_for_timeout(1000)

        count = await page.evaluate("() => document.querySelectorAll('script').length")
        print(f"Total scripts found: {count}")

        for idx in range(count):
            err = await page.evaluate("""(i) => {
                const s = document.querySelectorAll('script')[i];
                if (!s || s.src) return 'external or not found';
                try {
                    new Function(s.textContent);
                    return 'OK';
                } catch(e) {
                    return e.message;
                }
            }""", idx)
            print(f"Script #{idx} syntax test: {err}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
