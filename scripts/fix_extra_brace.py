with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

target = '''    function deleteSubtask(taskId, subtaskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
        saveTodoTasks(tasks);
        renderDrawerTasksList();
        showToast('🗑️ تم حذف المهمة الفرعية');
      }
    }
    }'''

replacement = '''    function deleteSubtask(taskId, subtaskId) {
      const tasks = getTodoTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
        saveTodoTasks(tasks);
        renderDrawerTasksList();
        showToast('🗑️ تم حذف المهمة الفرعية');
      }
    }'''

if target in c:
    c = c.replace(target, replacement, 1)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(c)
    print("✓ Successfully removed extra brace!")
else:
    print("! Target not found, checking variations")
    # try with different whitespace
    import re
    target_re = r'(function deleteSubtask\([^\)]*\)\s*\{[\s\S]*?showToast\(\'🗑️ تم حذف المهمة الفرعية\'\);\s*\}\s*\}\s*)\}'
    m = re.search(target_re, c)
    if m:
        c = c[:m.start()] + m.group(1) + c[m.end():]
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(c)
        print("✓ Successfully removed extra brace via regex!")
    else:
        print("! Regex also not found")
