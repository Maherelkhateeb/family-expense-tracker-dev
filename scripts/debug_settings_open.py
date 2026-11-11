# scripts/debug_settings_open.py
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

        errors = []
        page.on("console", lambda msg: print(f"Console [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        file_url = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # Call openSettingsModal()
        print("Calling openSettingsModal()...")
        res = await page.evaluate("""() => {
            try {
                openSettingsModal();
                return { success: true };
            } catch(e) {
                return { success: false, error: e.toString(), stack: e.stack };
            }
        }""")
        print("Result:", res)

        # Let's inspect active tabs in settings modal
        tabs_state = await page.evaluate("""() => {
            const tabs = Array.from(document.querySelectorAll('#settingsModal .settings-tab-btn, #settingsModal [onclick*="switchSettings"]')).map(t => ({
                text: t.innerText.trim(),
                onclick: t.getAttribute('onclick'),
                classes: Array.from(t.classList)
            }));
            const sections = Array.from(document.querySelectorAll('#settingsModal [id*="settingsTab"], #settingsModal [id*="settingsSec"]')).map(s => ({
                id: s.id,
                display: window.getComputedStyle(s).display
            }));
            return { tabs, sections };
        }""")
        print("Tabs state:", tabs_state)

        # Screenshot
        await page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b\settings_modal_debug.png')
        print("Saved settings_modal_debug.png")
        print("Page errors:", errors)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
