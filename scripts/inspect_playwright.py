import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915}) # Mobile viewport
        
        url = "file:///" + os.path.abspath(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html").replace("\\", "/")
        await page.goto(url)
        await page.wait_for_timeout(2000)
        
        # Take screenshot of the cockpit
        cockpit = page.locator("#topKpiThreeStrip")
        if await cockpit.count() > 0:
            await cockpit.screenshot(path="scripts/cockpit_current.png")
            print("Cockpit screenshot taken: scripts/cockpit_current.png")
        
        # Inspect computed style of .flow-icon-badge and its i
        badge_info = await page.evaluate('''() => {
            const badge = document.querySelector('.flow-icon-badge');
            const icon = badge ? badge.querySelector('i') : null;
            if (!badge || !icon) return { error: 'Not found' };
            const bStyle = window.getComputedStyle(badge);
            const iStyle = window.getComputedStyle(icon);
            return {
                badge: {
                    width: bStyle.width,
                    height: bStyle.height,
                    background: bStyle.background,
                    border: bStyle.border,
                    display: bStyle.display
                },
                icon: {
                    fontFamily: iStyle.fontFamily,
                    fontSize: iStyle.fontSize,
                    color: iStyle.color,
                    display: iStyle.display,
                    visibility: iStyle.visibility,
                    opacity: iStyle.opacity,
                    content: window.getComputedStyle(icon, '::before').content,
                    className: icon.className
                }
            };
        }''')
        print("Badge info:", badge_info)
        
        # Also check commitment cards
        commitments = page.locator("#commitmentsExecutiveCardsStrip, .commitments-4cards-grid")
        if await commitments.count() > 0:
            await commitments.first.screenshot(path="scripts/commitments_current.png")
            print("Commitments screenshot taken: scripts/commitments_current.png")

        await browser.close()

asyncio.run(main())
