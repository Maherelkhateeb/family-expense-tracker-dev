import asyncio
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

HTML_PATH = os.path.abspath("index.html")

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: print(f"CONSOLE {msg.type}: {msg.text}"))

        file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"
        await page.goto(file_url, wait_until="load")
        await page.wait_for_timeout(1000)

        print("Page loaded. Now clicking #btnMainSettings...")
        btn = page.locator("#btnMainSettings")
        print("Button exists:", await btn.count(), "visible:", await btn.is_visible())
        
        # Click button
        await btn.click()
        await page.wait_for_timeout(500)

        modal = page.locator("#settingsModal")
        print("Modal exists:", await modal.count(), "visible:", await modal.is_visible())
        
        # Check computed style of #settingsModal
        style = await modal.evaluate("el => ({ display: window.getComputedStyle(el).display, visibility: window.getComputedStyle(el).visibility, opacity: window.getComputedStyle(el).opacity, zIndex: window.getComputedStyle(el).zIndex, className: el.className })")
        print("Modal style:", style)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
