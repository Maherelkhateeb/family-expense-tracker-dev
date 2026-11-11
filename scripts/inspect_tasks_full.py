import re

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in index.html: {len(lines)}")

for i, line in enumerate(lines):
    if 'id="tasksModal"' in line or 'summaryTasks' in line or 'function renderTasks' in line or 'function openTasks' in line or 'function saveTask' in line:
        print(f"Line {i+1}: {line.strip()[:100]}")
