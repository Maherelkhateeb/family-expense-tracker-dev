import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'id=["\']tasksModal["\']', text)]
print(f'tasksModal matches: {len(matches)}')
for pos in matches:
    line_no = text[:pos].count('\n') + 1
    print(f'Line {line_no}')
