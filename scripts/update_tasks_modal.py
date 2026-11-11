with open(r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update tasksModal markup
old_inp = '<input type="date" id="newTaskDueDateInput" title="تاريخ الاستحقاق" style="width: 105px; height: 38px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 10px; padding: 0 6px; color: #c084fc; font-size: 0.70rem; outline: none;">'

new_inp = '<input type="datetime-local" id="newTaskDateTimeInput" class="task-datetime-input" title="تحديد التاريخ والوقت في نفس الاختيار" style="width: 145px; height: 38px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 10px; padding: 0 6px; color: #c084fc; font-size: 0.70rem; outline: none;">'

assert old_inp in content, "old_inp not found in tasksModal!"
content = content.replace(old_inp, new_inp, 1)

# Update handleAddNewTask
old_handle = '''    function handleAddNewTask() {
      const titleInp = document.getElementById('newTaskTitleInput');
      const dateInp = document.getElementById('newTaskDueDateInput');
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) return;

      const tasks = getTodoTasks();
      const newTask = {
        id: 'task-' + Date.now(),
        title: title,
        dueDate: dateInp && dateInp.value ? dateInp.value : '',
        completed: false,
        starred: currentTodoSection === 'important',
        createdAt: new Date().toISOString(),
        author: state.currentUser || 'ماهر'
      };

      tasks.unshift(newTask);
      saveTodoTasks(tasks);
      if (titleInp) titleInp.value = '';
      playNotificationChime();
      renderTasksList();
      showToast('✨ تمت إضافة المهمة بنجاح!');
    }'''

new_handle = '''    function handleAddNewTask() {
      const titleInp = document.getElementById('newTaskTitleInput');
      const dtInp = document.getElementById('newTaskDateTimeInput') || document.getElementById('newTaskDueDateInput');
      const title = titleInp ? titleInp.value.trim() : '';
      if (!title) return;

      const dtVal = dtInp ? dtInp.value : '';
      let dueDate = '', dueTime = '';
      if (dtVal) {
        const parts = dtVal.split('T');
        dueDate = parts[0] || '';
        dueTime = parts[1] ? parts[1].slice(0, 5) : '';
      }

      const tasks = getTodoTasks();
      const newTask = {
        id: 'task-' + Date.now(),
        title: title,
        dueDateTime: dtVal,
        dueDate: dueDate,
        dueTime: dueTime,
        priority: 'normal',
        tag: 'general',
        completed: false,
        starred: currentTodoSection === 'important',
        createdAt: new Date().toISOString(),
        author: state.currentUser || 'ماهر'
      };

      tasks.unshift(newTask);
      saveTodoTasks(tasks);
      if (titleInp) titleInp.value = '';
      if (dtInp) dtInp.value = '';
      playNotificationChime();
      renderTasksList();
      showToast('✨ تمت إضافة المهمة والموعد بنجاح!');
    }'''

assert old_handle in content, "old_handle not found!"
content = content.replace(old_handle, new_handle, 1)

# In renderTasksList, update dueText
old_due_render = "        const dueText = t.dueDate ? `📅 استحقاق: ${t.dueDate}` : '';"
new_due_render = "        const effectiveDt = t.dueDateTime || (t.dueDate ? `${t.dueDate}${t.dueTime ? 'T' + t.dueTime : ''}` : '');\n        const dueText = effectiveDt ? `📅 موعد التنبيه: ${formatArabicDateTime(effectiveDt)}` : '';"

assert old_due_render in content, "old_due_render not found!"
content = content.replace(old_due_render, new_due_render, 1)

with open(r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated tasksModal and handleAddNewTask successfully!")
