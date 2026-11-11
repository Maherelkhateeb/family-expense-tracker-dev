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

        # Capture detailed error
        page.on("pageerror", lambda err: print(f"PAGE ERROR MESSAGE: {err}\nLOCATION: {err.stack}"))

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        await page.goto(file_url, wait_until="commit")
        await page.wait_for_timeout(1000)

        # Let's inspect script content
        scripts = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('script')).map((s, idx) => ({
                idx: idx,
                src: s.src,
                len: s.textContent.length
            }));
        }""")
        print("Scripts on page:", scripts)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
