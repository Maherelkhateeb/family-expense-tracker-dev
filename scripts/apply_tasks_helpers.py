import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# -------------------------------------------------------------------------
# 2. OVERHAUL: Tasks & Subtasks Engine (Workflow & Subtasks Addition)
# -------------------------------------------------------------------------

# First, let's add toggleSubtaskForm(taskId, forceState) and toggleTasksGuideDetails() in JS
tasks_js_helpers = """
    // التحكم في إظهار وإخفاء نموذج إضافة الخطوة الفرعية
    function toggleSubtaskForm(taskId, forceOpen = null) {
      const box = document.getElementById(`subtaskAddBox_${taskId}`);
      if (!box) return;
      const isOpen = box.style.display !== 'none';
      const willOpen = (forceOpen !== null) ? forceOpen : !isOpen;
      box.style.display = willOpen ? 'block' : 'none';
      if (willOpen) {
        setTimeout(() => {
          const inp = document.getElementById(`inpSubtaskTitle_${taskId}`);
          if (inp) inp.focus();
        }, 100);
      }
    }

    // تبديل ظهور دليل وإرشادات آلية عمل المهام
    function toggleTasksGuideDetails() {
      const body = document.getElementById('tasksGuideDetailsBody');
      const chev = document.getElementById('tasksGuideChevron');
      if (!body) return;
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      if (chev) {
        chev.className = isOpen ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
      }
    }
"""

# Let's locate where to insert these helper functions in JS
marker_tasks_js = "function addSubtaskToTask(taskId) {"
if marker_tasks_js in content:
    content = content.replace(marker_tasks_js, tasks_js_helpers + "\n    " + marker_tasks_js)
    print("Inserted tasks_js_helpers before addSubtaskToTask")
else:
    print("WARNING: marker_tasks_js not found!")

# Now, update addSubtaskToTask to clean up inputs and hide the subtaskAddBox when added
old_subtask_add_fn = """        if (window.pendingSubtaskPhotos) delete window.pendingSubtaskPhotos[taskId];
        saveTodoTasks(tasks);
        renderDrawerTasksList();
        showToast('✓ تمت إضافة المهمة الفرعية بنجاح');"""

new_subtask_add_fn = """        if (window.pendingSubtaskPhotos) delete window.pendingSubtaskPhotos[taskId];
        saveTodoTasks(tasks);
        renderDrawerTasksList();
        showToast('✓ تمت إضافة الخطوة الفرعية وتحديث نسبة الإنجاز');"""

if old_subtask_add_fn in content:
    content = content.replace(old_subtask_add_fn, new_subtask_add_fn)
    print("Updated subtask success message")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved JS helpers for Tasks.")
