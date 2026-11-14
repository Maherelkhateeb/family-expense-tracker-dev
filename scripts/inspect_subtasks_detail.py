# scripts/inspect_subtasks_detail.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('task.subtasks.push({')
print("addSubtask section:")
print(text[pos-200:pos+1200])

pos2 = text.find('الخطوات الفرعية:</div>')
print("\nSubtasks rendering section:")
print(text[pos2-50:pos2+2000])
