import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(2000)
        
        # open tx modal without manual init
        await page.evaluate("openTxModal('expense')")
        await page.wait_for_timeout(1000)
        
        picker_info = await page.evaluate("""() => {
            const el = document.getElementById('txMemberPhotoPicker');
            const chips = Array.from(el.querySelectorAll('.member-photo-chip')).map(c => ({
                id: c.getAttribute('data-member-id'),
                text: c.textContent.trim(),
                active: c.classList.contains('active')
            }));
            const badge = document.getElementById('txActiveMemberNameBadge');
            return {
                chipCount: chips.length,
                chips: chips,
                badgeText: badge ? badge.textContent : null
            };
        }""")
        
        print("Automatic Verification of txModal Member Section:")
        print(f"Total chips: {picker_info['chipCount']}")
        print(f"Badge Text: {picker_info['badgeText']}")
        for c in picker_info['chips']:
            print(f" - {c['id']}: active={c['active']}")
            
        # Test clicking on a member, e.g. ماهر
        await page.evaluate("selectTxMemberPicker('ماهر')")
        await page.wait_for_timeout(500)
        
        new_badge = await page.evaluate("() => document.getElementById('txActiveMemberNameBadge')?.textContent")
        new_inp = await page.evaluate("() => document.getElementById('inpTxMember')?.value")
        print(f"After selecting ماهر: badge='{new_badge}', inp='{new_inp}'")
        
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/v501_tx_member_fixed.png")
        print("Saved v501_tx_member_fixed.png")
        
        await browser.close()

asyncio.run(run())
