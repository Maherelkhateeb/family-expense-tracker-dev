# scripts/inspect_cal_view_html.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="tasksTabCalendarView"')
if pos != -1:
    print(text[pos:pos+3500])
else:
    print("tasksTabCalendarView not found in index.html!")
