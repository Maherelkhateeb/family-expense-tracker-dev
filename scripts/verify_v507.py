"""Verify v5.0.7 - confirm banner removal and take screenshot"""
import asyncio
from playwright.async_api import async_playwright
import os, pathlib

ART = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
HTML = pathlib.Path(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").as_uri()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 480, "height": 900})
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

        # Open Settings modal
        await page.evaluate("""
            if (typeof openSettings === 'function') openSettings();
            else {
                const btn = document.querySelector('[onclick*=\"openSettings\"], [onclick*=\"Settings\"]');
                if (btn) btn.click();
            }
        """)
        await page.wait_for_timeout(1500)

        # Screenshot of settings
        await page.screenshot(path=os.path.join(ART, "v507_settings_no_banner.png"), full_page=False)
        print("✓ Screenshot saved: v507_settings_no_banner.png")

        # Verify banner is not in DOM
        banner_count = await page.locator("text=موازنة وتدقيق الأرصدة والمحافظ").count()
        print(f"Banner button count: {banner_count} (expected 0)")

        # Check for version badge
        badge = await page.locator("text=v5.0.7").count()
        print(f"v5.0.7 badge count: {badge}")

        real_errors = [e for e in errors if 'Failed to fetch' not in e and 'NetworkError' not in e]
        if real_errors:
            print("JS ERRORS:", real_errors)
        else:
            print("✓ No JS errors")

        await browser.close()

asyncio.run(main())
