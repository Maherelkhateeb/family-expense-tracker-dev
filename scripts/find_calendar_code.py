import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = list(re.finditer(r'navigateTasksCalendar|goToTasksCalendarToday|tasksTabCalendarView', content))
print(f'Matches: {len(matches)}')
for m in matches:
    idx = m.start()
    print('---')
    print(content[max(0, idx-40):min(len(content), idx+140)].replace('\n', ' '))
