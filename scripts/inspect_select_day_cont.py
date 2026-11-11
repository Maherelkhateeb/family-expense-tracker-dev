import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function selectTasksCalendarDay(')
if idx != -1:
    print(text[idx+1500:idx+3500])

print("--- HTML around tasksCalendarDayList ---")
idx_h = text.find('id="tasksCalendarDayList"')
if idx_h != -1:
    print(text[idx_h-300:idx_h+600])
