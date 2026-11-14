import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    
    # Inject a 15 million transaction in food
    page.evaluate('''() => {
      state.transactions.unshift({
        id: 'tx-million-test',
        type: 'expense',
        amount: 15750000.00,
        category: 'food',
        member: 'ماهر',
        date: new Date().toISOString().split('T')[0],
        label: 'شراء عقار استثماري بالملايين'
      });
      state.period = 'all';
      renderUI();
    }''')
    page.wait_for_timeout(500)
    
    first_card = page.locator('.cat-card').first
    amt_val = first_card.locator('.cat-amount-val')
    print('Million text content:', amt_val.text_content())
    card_box = first_card.bounding_box()
    amt_box = amt_val.bounding_box()
    print('Card box:', card_box)
    print('Amount box:', amt_box)
    
    is_contained = (amt_box['x'] >= card_box['x'] - 1) and (amt_box['x'] + amt_box['width'] <= card_box['x'] + card_box['width'] + 2)
    print('Amount is strictly contained within card:', is_contained)
    
    shot_path = r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v497_million_amount_contained.png'
    first_card.screenshot(path=shot_path)
    print('Card screenshot saved to:', shot_path)
    
    browser.close()
