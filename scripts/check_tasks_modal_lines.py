import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

tasks_start = -1
tasks_end = -1
for i, line in enumerate(lines):
    if 'id="tasksFullScreenModal"' in line or "id='tasksFullScreenModal'" in line:
        tasks_start = i
        break

if tasks_start != -1:
    depth = 0
    for j in range(tasks_start, len(lines)):
        depth += lines[j].count('<div')
        depth -= lines[j].count('</div')
        if depth <= 0 and j > tasks_start:
            tasks_end = j
            break

print(f"tasksFullScreenModal spans lines {tasks_start+1} to {tasks_end+1}")
for k in range(tasks_start, tasks_start + 45):
    print(f"{k+1}: {lines[k]}", end='')
