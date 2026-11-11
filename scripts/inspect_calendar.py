import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('function renderTasksCalendar')
if idx != -1:
    print('Found function renderTasksCalendar at:', idx)
    print(content[idx:idx+2500])
else:
    print('function renderTasksCalendar NOT FOUND!')

# Also search for tasksTabCalendarView in HTML
idx_view = content.find('id="tasksTabCalendarView"')
if idx_view != -1:
    print('Found tasksTabCalendarView at:', idx_view)
    print(content[idx_view:idx_view+1500])
