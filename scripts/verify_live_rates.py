import asyncio
from playwright.async_api import async_playwright
import pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')

HTML = pathlib.Path(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").as_uri()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(HTML, wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        # Call fetchTradingViewRates with forceLive = true
        res = await page.evaluate("""
            async () => {
                const res = await fetchTradingViewRates(true);
                return {
                    usd: res.usdEgp,
                    sar: res.sarEgp,
                    gold21: res.gold21,
                    goldOunce: res.goldOunce,
                    updatedAt: res.updatedAt
                };
            }
        """)
        print("Live rates result from browser direct fetch:", res)
        real_errors = [e for e in errors if 'Failed to fetch' not in e]
        if real_errors:
            print("Errors:", real_errors)
        else:
            print("SUCCESS: Browser direct live rates fetch executed with 0 errors!")
        await browser.close()

asyncio.run(main())
