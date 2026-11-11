import asyncio
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

HTML_URL = r"file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html"

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})

        errors = []
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))

        await page.goto(HTML_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        # Call openSettingsModal directly via JS
        print("Testing openSettingsModal()...")
        try:
            res = await page.evaluate("""() => {
                try {
                    openSettingsModal();
                    return { ok: true };
                } catch(e) {
                    return { ok: false, error: e.toString(), stack: e.stack };
                }
            }""")
            print("Result of openSettingsModal():", res)
        except Exception as ex:
            print("Exception during evaluate:", ex)

        print("Total page errors:", len(errors))
        for e in errors:
            print("  ", e)

        await browser.close()

asyncio.run(run())
