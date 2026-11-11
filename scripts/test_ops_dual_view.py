import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

HTML_PATH = os.path.abspath("index.html")
ARTIFACT_DIR = r"C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport standard iPhone 14 Pro
        page = await browser.new_page(viewport={"width": 390, "height": 844})

        # Capture console errors
        errors = []
        page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == 'error' else None)
        page.on("pageerror", lambda exc: errors.append(f"[pageerror] {exc}"))

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        print(f"Navigating to {file_url}...")
        await page.goto(file_url, wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 1. Switch to operations page
        print("Switching to Operations page...")
        await page.evaluate("() => { if (typeof switchAppPage === 'function') switchAppPage('operations'); }")
        await page.wait_for_timeout(800)

        # 2. Check position of the buttons
        btn_daily = await page.query_selector("#btnOpsModeDaily")
        btn_flat = await page.query_selector("#btnOpsModeFlat")
        print(f"btnOpsModeDaily found: {bool(btn_daily)}, btnOpsModeFlat found: {bool(btn_flat)}")

        # Check order in DOM: opsViewModeToggleBar before segmented-tabs-bar
        is_above = await page.evaluate("() => { \
            const toggleBar = document.getElementById('opsViewModeToggleBar'); \
            const tabsBar = document.querySelector('#viewOperations .segmented-tabs-bar'); \
            if (!toggleBar || !tabsBar) return false; \
            return (toggleBar.compareDocumentPosition(tabsBar) & Node.DOCUMENT_POSITION_FOLLOWING) > 0; \
        }")
        print(f"Toggle bar is strictly above segmented-tabs-bar: {is_above}")

        # 3. Screenshot in default mode ('daily' - تجميع باليوم)
        daily_active = await page.evaluate("() => document.getElementById('btnOpsModeDaily').classList.contains('active')")
        daily_headers_count = await page.evaluate("() => document.querySelectorAll('#txOperationsList .ops-date-group-header').length")
        print(f"Daily mode active: {daily_active}, Date group headers count: {daily_headers_count}")

        shot_daily = os.path.join(ARTIFACT_DIR, "v524_ops_daily_mode.png")
        await page.screenshot(path=shot_daily, full_page=False)
        print(f"Screenshot saved: {shot_daily}")

        # 4. Switch to 'flat' (مجمع)
        print("Clicking 'مجمع' button...")
        await page.click("#btnOpsModeFlat")
        await page.wait_for_timeout(600)

        flat_active = await page.evaluate("() => document.getElementById('btnOpsModeFlat').classList.contains('active')")
        flat_headers_count = await page.evaluate("() => document.querySelectorAll('#txOperationsList .ops-date-group-header').length")
        inline_dates_count = await page.evaluate("() => document.querySelectorAll('#txOperationsList .ops-tx-date-inline').length")
        print(f"Flat mode active: {flat_active}, Date group headers count: {flat_headers_count}, Inline dates count: {inline_dates_count}")

        shot_flat = os.path.join(ARTIFACT_DIR, "v524_ops_flat_mode.png")
        await page.screenshot(path=shot_flat, full_page=False)
        print(f"Screenshot saved: {shot_flat}")

        # 5. Test clicking a card to open actions drawer in 'flat' mode
        first_card = await page.query_selector("#txOperationsList .ops-tx-card-clean")
        if first_card:
            print("Clicking first card in flat mode to test action drawer...")
            await first_card.click()
            await page.wait_for_timeout(500)
            drawer_visible = await page.evaluate("() => { \
                const d = document.querySelector('#txOperationsList .ops-row-actions-drawer[style*=\"flex\"]'); \
                return bool = !!d; \
            }")
            print(f"Action drawer opened: {drawer_visible}")
            shot_drawer = os.path.join(ARTIFACT_DIR, "v524_ops_flat_drawer.png")
            await page.screenshot(path=shot_drawer, full_page=False)
            print(f"Screenshot saved: {shot_drawer}")

        # 6. Verify persistence in localStorage
        saved_mode = await page.evaluate("() => localStorage.getItem('family_monefy_ops_view_mode')")
        print(f"Saved mode in localStorage: {saved_mode}")

        # Check console errors
        if errors:
            print(f"Console errors detected ({len(errors)}):")
            for e in errors[:5]:
                print("  ", e)
        else:
            print("✓ No console errors encountered during full test flow!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
