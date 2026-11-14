import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    
    # 1. Home screen with vibrant cards
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v497_home_vibrant_cards.png')
    print('1. Home screenshot captured')
    
    # 2. Switch to Operations page (Dark mode)
    page.evaluate("switchAppPage('operations')")
    page.wait_for_timeout(500)
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v497_operations_dark_contrast.png')
    print('2. Operations dark mode screenshot captured')
    
    # 3. Switch to Light mode on Operations page
    page.evaluate("document.body.classList.add('light-theme'); renderUI();")
    page.wait_for_timeout(500)
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v497_operations_light_contrast.png')
    print('3. Operations light mode screenshot captured')
    
    # Switch back to dark mode
    page.evaluate("document.body.classList.remove('light-theme'); switchAppPage('expenses'); renderUI();")
    page.wait_for_timeout(500)
    
    # 4. Open Left Drawer (Summary & Tasks)
    page.evaluate("openSummaryDrawer('tasks')")
    page.wait_for_timeout(500)
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v497_left_drawer_tasks.png')
    print('4. Left drawer tasks screenshot captured')
    
    page.evaluate("closeSummaryLeftDrawer()")
    page.wait_for_timeout(400)
    
    # 5. Open Right Drawer (Gold & Markets)
    page.evaluate("openGoldDrawer()")
    page.wait_for_timeout(500)
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v497_right_drawer_gold.png')
    print('5. Right drawer gold screenshot captured')
    
    browser.close()
