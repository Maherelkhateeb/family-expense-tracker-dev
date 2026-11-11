import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    
    # Open tasksModal
    page.evaluate('''() => {
      openModal('tasksModal');
      renderTasksList();
    }''')
    page.wait_for_timeout(500)
    
    # Check if input exists and is datetime-local
    inp_type = page.evaluate('''() => {
      const el = document.getElementById('newTaskDateTimeInput');
      return el ? el.type : null;
    }''')
    print(f"tasksModal input type: {inp_type}")
    
    # Add a task via tasksModal
    page.evaluate('''() => {
      document.getElementById('newTaskTitleInput').value = 'تجديد باقة الإنترنت المنزلي 🌐';
      document.getElementById('newTaskDateTimeInput').value = '2026-11-09T14:30';
      handleAddNewTask();
    }''')
    page.wait_for_timeout(500)
    
    tasks_count = page.evaluate('getTodoTasks().length')
    print(f"Total tasks in localStorage: {tasks_count}")
    
    shot_path = r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v498_standalone_tasks_modal.png'
    page.screenshot(path=shot_path)
    print("Screenshot saved to:", shot_path)
    
    browser.close()
