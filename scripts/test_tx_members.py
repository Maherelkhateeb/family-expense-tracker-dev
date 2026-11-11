import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(1500)
        
        await page.evaluate("""() => {
            if (typeof initMemberPhotoPickers === 'function') {
                initMemberPhotoPickers();
            }
            openTxModal('expense');
        }""")
        await page.wait_for_timeout(1000)
        
        picker_info = await page.evaluate("""() => {
            const el = document.getElementById('txMemberPhotoPicker');
            const chips = Array.from(el.querySelectorAll('.member-photo-chip')).map(c => ({
                id: c.getAttribute('data-member-id'),
                text: c.textContent.trim(),
                active: c.classList.contains('active'),
                hasImg: Boolean(c.querySelector('img')),
                rect: c.getBoundingClientRect()
            }));
            return {
                chipCount: chips.length,
                chips: chips
            };
        }""")
        
        print("Chips rendered in txModal:")
        print(f"Total chips: {picker_info['chipCount']}")
        for c in picker_info['chips']:
            print(f" - {c['id']}: active={c['active']}, hasImg={c['hasImg']}, w={c['rect']['width']}, h={c['rect']['height']}")
            
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/tx_modal_with_members.png")
        print("Screenshot saved to tx_modal_with_members.png")
        
        await browser.close()

asyncio.run(run())
