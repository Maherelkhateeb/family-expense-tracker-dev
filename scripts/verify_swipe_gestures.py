import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892}, has_touch=True)
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1500)
    
    # 1. Test Swipe from Left Edge to Right -> opens Left Drawer (Summary & Tasks)
    print('Testing swipe right from left edge (x=30 to x=160)...')
    page.evaluate('''() => {
      const touch1 = new Touch({ identifier: 1, target: window, clientX: 30, clientY: 300 });
      window.dispatchEvent(new TouchEvent('touchstart', { touches: [touch1] }));
      
      const touch2 = new Touch({ identifier: 1, target: window, clientX: 160, clientY: 305 });
      window.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch2] }));
    }''')
    page.wait_for_timeout(600)
    left_drawer = page.locator('#summaryLeftDrawer')
    is_left_open = left_drawer.evaluate('el => el.classList.contains("open") || el.classList.contains("active")')
    print('Left drawer opened via swipe right:', is_left_open)
    
    # 2. Test Swipe Left on open Left Drawer -> closes Left Drawer
    print('Testing swipe left on open left drawer (x=200 to x=60)...')
    page.evaluate('''() => {
      const touch1 = new Touch({ identifier: 2, target: window, clientX: 200, clientY: 300 });
      window.dispatchEvent(new TouchEvent('touchstart', { touches: [touch1] }));
      
      const touch2 = new Touch({ identifier: 2, target: window, clientX: 60, clientY: 305 });
      window.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch2] }));
    }''')
    page.wait_for_timeout(600)
    is_left_still_open = left_drawer.evaluate('el => el.classList.contains("open") || el.classList.contains("active")')
    print('Left drawer closed via swipe left:', not is_left_still_open)
    
    # 3. Test Swipe from Right Edge to Left -> opens Right Drawer (Gold)
    print('Testing swipe left from right edge (x=390 to x=260)...')
    page.evaluate('''() => {
      const touch1 = new Touch({ identifier: 3, target: window, clientX: 390, clientY: 300 });
      window.dispatchEvent(new TouchEvent('touchstart', { touches: [touch1] }));
      
      const touch2 = new Touch({ identifier: 3, target: window, clientX: 260, clientY: 305 });
      window.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch2] }));
    }''')
    page.wait_for_timeout(600)
    right_drawer = page.locator('#goldDrawerPanel')
    is_right_open = right_drawer.evaluate('el => el.classList.contains("open") || el.classList.contains("active")')
    print('Right drawer opened via swipe left:', is_right_open)
    
    # 4. Test Swipe Right on open Right Drawer -> closes Right Drawer
    print('Testing swipe right on open right drawer (x=260 to x=390)...')
    page.evaluate('''() => {
      const touch1 = new Touch({ identifier: 4, target: window, clientX: 260, clientY: 300 });
      window.dispatchEvent(new TouchEvent('touchstart', { touches: [touch1] }));
      
      const touch2 = new Touch({ identifier: 4, target: window, clientX: 390, clientY: 305 });
      window.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch2] }));
    }''')
    page.wait_for_timeout(600)
    is_right_still_open = right_drawer.evaluate('el => el.classList.contains("open") || el.classList.contains("active")')
    print('Right drawer closed via swipe right:', not is_right_still_open)
    
    browser.close()
