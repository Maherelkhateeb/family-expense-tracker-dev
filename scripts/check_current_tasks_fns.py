with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for fn in ['switchTasksViewMode', 'getTodoTasks', 'saveTodoTasks', 'renderTasksCalendar', 'renderTasksProList', 'handleQuickTaskAdd']:
    m = re.findall(rf'function\s+{fn}\b', text)
    print(f"function {fn}: {len(m)} occurrences")
