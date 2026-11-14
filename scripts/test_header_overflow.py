# scripts/test_header_overflow.py
import sys
import os
import asyncio
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Test narrow screen: 360x780 (standard Android phone)
        context = await browser.new_context(viewport={'width': 360, 'height': 780})
        page = await context.new_page()

        file_url = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        await page.goto(file_url, wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # Inspect positions of header buttons
        buttons_info = await page.evaluate("""() => {
            const btns = ['btnHeaderTasksTop', 'btnNotificationsBell', 'btnHeaderMasterSync', 'btnMainSettings'];
            return btns.map(id => {
                const el = document.getElementById(id);
                if (!el) return { id, found: false };
                const rect = el.getBoundingClientRect();
                return {
                    id,
                    found: true,
                    top: rect.top,
                    left: rect.left,
                    right: rect.right,
                    width: rect.width,
                    height: rect.height,
                    visible: rect.width > 0 && rect.height > 0 && rect.right <= window.innerWidth
                };
            });
        }""")
        print("Buttons info at 360px width:")
        for b in buttons_info:
            print(b)

        # Check if clicking #btnMainSettings works at 360px
        settings_btn = await page.query_selector('#btnMainSettings')
        await settings_btn.click()
        await page.wait_for_timeout(500)

        modal_style = await page.evaluate("""() => {
            const m = document.getElementById('settingsModal');
            return m ? window.getComputedStyle(m).display : 'none';
        }""")
        print("Settings modal display after click at 360px:", modal_style)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
