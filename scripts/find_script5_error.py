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

        script5_text = await page.evaluate("() => document.querySelectorAll('script')[5].textContent")
        lines = script5_text.split('\n')
        print(f"Script 5 has {len(lines)} lines.")

        # Test evaluating line ranges
        # Binary search for failing line
        low = 1
        high = len(lines)
        failing_line = -1

        while low <= high:
            mid = (low + high) // 2
            code = '\n'.join(lines[:mid])
            err = await page.evaluate("""(c) => {
                try {
                    new Function(c);
                    return null;
                } catch(e) {
                    return e.message;
                }
            }""", code)
            
            if err and "Unexpected token ')'" in err:
                failing_line = mid
                high = mid - 1
            else:
                low = mid + 1

        print(f"Failing line in script 5: {failing_line}")
        if failing_line != -1:
            for l_idx in range(max(0, failing_line-5), min(len(lines), failing_line+5)):
                print(f"{l_idx+1}: {lines[l_idx]}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
