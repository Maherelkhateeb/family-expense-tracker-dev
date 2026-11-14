import re

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('id="tasksTabCalendarView"')
if idx != -1:
    print('=== HTML tasksTabCalendarView ===')
    print(text[idx-50:idx+2500])

idx2 = text.find('function renderTasksCalendar()')
if idx2 != -1:
    print('=== JS renderTasksCalendar ===')
    print(text[idx2:idx2+4000])
