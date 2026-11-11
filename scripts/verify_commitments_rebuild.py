import asyncio
from playwright.async_api import async_playwright
import os, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')

ART = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
HTML = pathlib.Path(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").as_uri()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 430, "height": 932})
        page = await ctx.new_page()

        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        await page.goto(HTML, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1500)

        # Dismiss login/PIN if present
        for sel in ["#loginBtn", "#pinSubmitBtn", ".btn-login", ".skip-btn"]:
            try:
                btn = page.locator(sel)
                if await btn.count() > 0 and await btn.is_visible():
                    await btn.click()
                    await page.wait_for_timeout(500)
                    break
            except:
                pass

        # Switch to expected (commitments) view
        print("Calling switchAppPage('expected')...")
        await page.evaluate("""
            switchAppPage('expected');
            if (typeof renderExpectedList === 'function') renderExpectedList();
        """)
        await page.wait_for_timeout(1500)

        # Capture screenshot
        shot_path = os.path.join(ART, "v508_commitments_rebuilt_clean.png")
        await page.screenshot(path=shot_path, full_page=False)
        print(f"Screenshot saved: {shot_path}")

        # Check KPI counts and amounts
        val = await page.locator("#expectedNetPositionVal").inner_text()
        print(f"Net Position Val: {val}")

        cards_count = await page.locator("#expectedListContainer > div").count()
        print(f"Commitment cards count rendered: {cards_count}")

        real_errors = [e for e in errors if 'Failed to fetch' not in e and 'NetworkError' not in e]
        if real_errors:
            print("JS ERRORS:", real_errors)
        else:
            print("SUCCESS: No JS errors found!")

        await browser.close()

asyncio.run(main())
