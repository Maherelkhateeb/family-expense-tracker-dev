import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 892})
    file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
    page.goto(f'file:///{file_path}', wait_until='domcontentloaded')
    page.wait_for_timeout(1000)
    
    # 1. Check layout geometry on home screen
    body_width = page.evaluate('document.body.scrollWidth')
    app_rect = page.evaluate('document.getElementById("appFrame").getBoundingClientRect()')
    print(f"Home Page - body.scrollWidth: {body_width}, appFrame.rect.x: {app_rect['x']}")
    
    # Screenshot Home
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v498_perfect_home.png')
    print("Screenshot saved: v498_perfect_home.png")
    
    # 2. Open Left Drawer directly on Tasks
    page.evaluate("openSummaryDrawer('tasks')")
    page.wait_for_timeout(500)
    
    # 3. Test quick datetime preset
    page.evaluate("setTaskDateTimePreset('today_evening')")
    dt_val = page.evaluate("document.getElementById('drawerNewTaskDateTimeInput').value")
    print(f"Preset 'today_evening' set value: {dt_val}")
    
    # 4. Fill and submit new task
    page.evaluate('''() => {
      document.getElementById('drawerNewTaskTitleInput').value = 'سداد فاتورة الكهرباء والغاز ⚡';
      document.getElementById('drawerNewTaskPriority').value = 'high';
      document.getElementById('drawerNewTaskTag').value = 'bills';
      handleDrawerAddNewTask();
    }''')
    page.wait_for_timeout(500)
    
    # Check KPIs
    kpi_info = page.evaluate('''() => ({
      total: document.getElementById('kpiTasksTotal').textContent,
      active: document.getElementById('kpiTasksActive').textContent,
      overdue: document.getElementById('kpiTasksOverdue').textContent,
      done: document.getElementById('kpiTasksDone').textContent,
      pct: document.getElementById('tasksOverallProgressPct').textContent
    })''')
    print(f"KPIs after adding task: {kpi_info}")
    
    # 5. Add subtask to this new task
    first_task_id = page.evaluate('''() => {
      const tasks = getTodoTasks();
      return tasks.length > 0 ? tasks[0].id : null;
    }''')
    print(f"First Task ID: {first_task_id}")
    
    if first_task_id:
        page.evaluate(f'''() => {{
          const titleInp = document.getElementById('inpSubtaskTitle_{first_task_id}');
          const dtInp = document.getElementById('inpSubtaskDateTime_{first_task_id}');
          if (titleInp) titleInp.value = 'مراجعة قراءة العداد وتصوير الفاتورة';
          if (dtInp) dtInp.value = '2026-11-08T18:00';
          // Attach mock photo
          window.pendingSubtaskPhotos['{first_task_id}'] = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%2338bdf8"/><text x="10" y="55" fill="white" font-size="14">Receipt</text></svg>';
          addSubtaskToTask('{first_task_id}');
        }}''')
        page.wait_for_timeout(500)
        
        # Toggle subtask completed
        page.evaluate(f'''() => {{
          const tasks = getTodoTasks();
          const t = tasks.find(x => x.id === '{first_task_id}');
          if (t && t.subtasks && t.subtasks.length > 0) {{
            toggleSubtaskCompleted('{first_task_id}', t.subtasks[0].id);
          }}
        }}''')
        page.wait_for_timeout(500)
    
    # Screenshot Tasks View
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v498_tasks_pro_unified_datetime.png')
    print("Screenshot saved: v498_tasks_pro_unified_datetime.png")
    
    # 6. Verify conversion to expense
    if first_task_id:
        page.evaluate(f"convertTaskToExpense('{first_task_id}')")
        page.wait_for_timeout(800)
        desc_val = page.evaluate("() => { const el = document.getElementById('inpTxLabel'); return el ? el.value : ''; }")
        print(f"Expense Modal opened with pre-filled description: '{desc_val}'")
        
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670\v498_tasks_converted_to_expense.png')
        print("Screenshot saved: v498_tasks_converted_to_expense.png")
        
    browser.close()
