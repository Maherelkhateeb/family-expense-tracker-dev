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

        page.on("pageerror", lambda err: print(f"PAGE ERROR STACK:\n{err.stack if hasattr(err, 'stack') else err}"))

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        await page.goto(file_url, wait_until="load")
        await page.wait_for_timeout(1000)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
