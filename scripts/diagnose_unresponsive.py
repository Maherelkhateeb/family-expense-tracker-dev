import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    
    # 1. Check what element is at the center of the screen
    center_el = page.evaluate('''() => {
      const el = document.elementFromPoint(206, 446);
      return el ? { tagName: el.tagName, id: el.id, className: el.className } : null;
    }''')
    print('Element at center (206, 446):', center_el)
    
    # 2. Check all modal overlays to see if any is visible or blocking
    blocking_modals = page.evaluate('''() => {
      const overlays = document.querySelectorAll('.modal-overlay, .modal-overlay-custom, .drawer-backdrop, .loading-overlay');
      const blocking = [];
      overlays.forEach(o => {
        const style = window.getComputedStyle(o);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && style.pointerEvents !== 'none') {
          blocking.push({ id: o.id, className: o.className, zIndex: style.zIndex, display: style.display });
        }
      });
      return blocking;
    }''')
    print('Blocking overlays found:', blocking_modals)
    
    # 3. Test clicking bottom nav tabs
    print('\n--- Testing bottom nav clicks ---')
    for tab_id in ['navTabOperations', 'navTabAnalytics', 'navTabRequests', 'navTabExpected', 'navTabExpenses']:
        try:
            page.click(f'#{tab_id}', timeout=2000)
            page.wait_for_timeout(300)
            active_view = page.evaluate('() => state.activePage')
            print(f'Clicked #{tab_id} -> state.activePage: {active_view}')
        except Exception as e:
            print(f'Failed to click #{tab_id}: {e}')
            
    # 4. Test clicking category card
    print('\n--- Testing category card click ---')
    try:
        first_card = page.locator('.cat-card').first
        first_card.locator('.cat-card-top-half').click(timeout=2000)
        page.wait_for_timeout(500)
        tx_modal_open = page.evaluate('() => document.getElementById("txModal")?.classList.contains("open")')
        print('Clicked category icon -> txModal open:', tx_modal_open)
    except Exception as e:
        print('Failed to click category icon:', e)
        
    # 5. Check if any uncaught errors happened during interactions
    browser.close()
