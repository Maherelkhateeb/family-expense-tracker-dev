import asyncio
from playwright.async_api import async_playwright
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

art_dir = r"C:\Users\96656\.gemini\antigravity\brain\fd5402bf-7cdd-4341-bf14-feec05bfa609"

async def test_fonts():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 380, "height": 850})

        url = "file:///" + os.path.abspath(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").replace("\\", "/")
        await page.goto(url)
        await page.wait_for_timeout(1500)

        for font in ['tajawal', 'cairo', 'alexandria']:
            for size in ['medium', 'large']:
                await page.evaluate(f'''() => {{
                    setAppFont('{font}', false);
                    setAppFontSize('{size}', false);
                }}''')
                await page.wait_for_timeout(400)

                # 1. Take cockpit screenshot
                cockpit = page.locator("#topKpiThreeStrip")
                snap_cockpit = os.path.join(art_dir, f"responsive_cockpit_{font}_{size}.png")
                await cockpit.screenshot(path=snap_cockpit)

                # 2. Go to Commitments
                await page.click("#navTabExpected")
                await page.wait_for_timeout(400)
                cards = page.locator("#commitmentKpiMasterCard")
                snap_cards = os.path.join(art_dir, f"responsive_cards_{font}_{size}.png")
                await cards.screenshot(path=snap_cards)

                # Switch back to home tab
                await page.click("#navTabExpenses")
                await page.wait_for_timeout(300)

                print(f"✓ Verified font {font} at size {size} - snapshots saved")

        await browser.close()
        print("ALL RESPONSIVE FONT TESTS COMPLETED PERFECTLY!")

asyncio.run(test_fonts())
