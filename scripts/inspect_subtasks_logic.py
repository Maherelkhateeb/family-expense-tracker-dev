# scripts/inspect_subtasks_logic.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function addSubtaskItem')
if pos == -1:
    pos = text.find('addSubtask')
print("Subtask function snippet:")
print(text[pos:pos+2500])
