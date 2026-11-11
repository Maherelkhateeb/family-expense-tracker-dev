import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    
    # Open Left Drawer Tasks tab
    page.evaluate("openSummaryDrawer('tasks')")
    page.wait_for_timeout(500)
    
    # Screenshot drawer tasks with the separate button
    shot1 = r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v499_separate_task_button.png'
    page.screenshot(path=shot1)
    print("Screenshot saved to:", shot1)
    
    # Click the separate button to open modal
    page.evaluate("openNewTaskDrawerModal()")
    page.wait_for_timeout(500)
    
    modal_display = page.evaluate("window.getComputedStyle(document.getElementById('newTaskDrawerModal')).display")
    print("newTaskDrawerModal display:", modal_display)
    
    # Fill in task inside the dedicated modal
    page.evaluate('''() => {
      document.getElementById('drawerNewTaskTitleInput').value = 'فحص صيانة السيارة الدورية 🚗';
      setTaskDateTimePreset('tomorrow_morning');
      document.getElementById('drawerNewTaskPriority').value = 'high';
      document.getElementById('drawerNewTaskTag').value = 'home';
    }''')
    page.wait_for_timeout(300)
    
    shot2 = r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v499_separate_task_modal.png'
    page.screenshot(path=shot2)
    print("Screenshot saved to:", shot2)
    
    # Submit task
    page.evaluate("handleDrawerAddNewTask()")
    page.wait_for_timeout(500)
    
    modal_after = page.evaluate("window.getComputedStyle(document.getElementById('newTaskDrawerModal')).display")
    print("Modal after save:", modal_after)
    
    browser.close()
