import sys, time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    
    t0 = time.time()
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    load_time = time.time() - t0
    print(f'DOM Content Loaded in: {load_time:.3f}s')
    
    page.wait_for_timeout(1500)
    
    # Measure renderUI speed
    t_start = time.time()
    page.evaluate('renderUI()')
    render_time = time.time() - t_start
    print(f'renderUI execution time: {render_time*1000:.2f}ms')
    
    # Check category cards
    cards = page.locator('.cat-card')
    count = cards.count()
    print(f'Category cards count: {count}')
    
    # Check text inside first card
    if count > 0:
        first_card_html = cards.nth(0).inner_html()
        print('Has "كشف العمليات":', 'كشف العمليات' in first_card_html)
        
    # Check Currency Switcher cycle
    btn_curr = page.locator('#btnToggleCurrency')
    print('Initial currency text:', page.locator('#activeCurrencyText').text_content())
    page.evaluate('toggleCurrency()')
    print('After 1 toggle:', page.locator('#activeCurrencyText').text_content())
    page.evaluate('toggleCurrency()')
    print('After 2 toggles:', page.locator('#activeCurrencyText').text_content())
    page.evaluate('toggleCurrency()')
    print('After 3 toggles (Gold 21):', page.locator('#activeCurrencyText').text_content())
    page.evaluate('toggleCurrency()')
    print('After 4 toggles (Back to initial):', page.locator('#activeCurrencyText').text_content())
    
    # Screenshot
    shot_path = r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v497_speed_and_contrast_check.png'
    page.screenshot(path=shot_path)
    print('Screenshot saved to:', shot_path)
    
    browser.close()
