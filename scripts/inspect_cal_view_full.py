import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('id="tasksTabCalendarView"')
if idx != -1:
    end_idx = text.find('id="tasksTabStatsView"', idx)
    print(text[idx:end_idx if end_idx != -1 else idx+3000])
