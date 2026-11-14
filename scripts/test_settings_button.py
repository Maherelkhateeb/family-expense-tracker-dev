# scripts/test_settings_button.py
import sys
import os
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()

        page.on("console", lambda msg: print(f"Console [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        file_url = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # Check if #btnMainSettings is visible and clickable
        btn = await page.query_selector('#btnMainSettings')
        print(f"#btnMainSettings found: {btn is not None}")
        
        # Test clicking #btnMainSettings
        print("Clicking #btnMainSettings...")
        await btn.click()
        await page.wait_for_timeout(1000)

        # Check if #settingsModal is displayed
        is_visible = await page.evaluate("""() => {
            const m = document.getElementById('settingsModal');
            if (!m) return 'not found';
            const style = window.getComputedStyle(m);
            return {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                zIndex: style.zIndex,
                classList: Array.from(m.classList)
            };
        }""")
        print(f"#settingsModal state after click: {is_visible}")

        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\test_settings_click.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
