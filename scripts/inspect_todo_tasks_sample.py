# scripts/inspect_todo_tasks_sample.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function getTodoTasks()')
print(text[pos:pos+2000])
