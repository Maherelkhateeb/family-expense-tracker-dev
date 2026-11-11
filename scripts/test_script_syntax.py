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
        await page.goto(file_url, wait_until="commit")

        scripts_content = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('script')).map(s => s.src ? '' : s.textContent);
        }""")

        for i, sc in enumerate(scripts_content):
            if not sc:
                continue
            print(f"Testing script #{i} (len: {len(sc)})...")
            res = await page.evaluate("""(code) => {
                try {
                    new Function(code);
                    return { ok: true };
                } catch(e) {
                    return { ok: false, error: e.message };
                }
            }""", sc)
            print(f"Script #{i} result: {res}")
            if not res['ok']:
                lines = sc.split('\n')
                print(f"Total lines: {len(lines)}")
                # Find failing line with binary search
                # We can check which line introduces the error
                for idx, line in enumerate(lines):
                    if 'async' in line:
                        print(f"Async on line {idx+1}: {line.strip()[:80]}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
