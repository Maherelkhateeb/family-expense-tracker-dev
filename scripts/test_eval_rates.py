import asyncio
from playwright.async_api import async_playwright
import pathlib

HTML = pathlib.Path(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").as_uri()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)
        t = await page.evaluate("typeof fetchTradingViewRates")
        print("typeof fetchTradingViewRates:", t)
        if errors:
            print("Errors:", errors)
        await browser.close()

asyncio.run(main())
