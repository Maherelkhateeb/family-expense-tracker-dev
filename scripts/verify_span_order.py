import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    
    page.evaluate("state.period = 'all'; renderUI();")
    page.wait_for_timeout(500)
    
    cards = page.locator('.cat-card')
    for c_idx in range(cards.count()):
        c = cards.nth(c_idx)
        spans = c.locator('.cat-amount-val span')
        if spans.count() == 3:
            s0 = spans.nth(0)
            s1 = spans.nth(1)
            s2 = spans.nth(2)
            b0 = s0.bounding_box()
            b1 = s1.bounding_box()
            b2 = s2.bounding_box()
            print(f'Card {c_idx}:')
            print(f'  Span 0 ({s0.text_content()}): x={b0["x"]}')
            print(f'  Span 1 ({s1.text_content()}): x={b1["x"]}')
            print(f'  Span 2 ({s2.text_content()}): x={b2["x"]}')
            if b0['x'] > b1['x'] and b1['x'] > b2['x']:
                print('  ORDER CONFIRMED: Span 0 (sign) is furthest RIGHT, Span 1 is MIDDLE, Span 2 (currency) is furthest LEFT!')
            break
            
    browser.close()
