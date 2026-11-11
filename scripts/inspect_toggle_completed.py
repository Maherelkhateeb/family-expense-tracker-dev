# scripts/inspect_toggle_completed.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function toggleTaskCompleted(')
print(text[pos:pos+1000])

pos_del = text.find('function deleteTaskItem(')
print("\ndeleteTaskItem:")
print(text[pos_del:pos_del+1000])
