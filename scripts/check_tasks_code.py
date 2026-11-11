import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'subtasks|subTasks|subTask|renderDrawerTasksList|drawerTasks', text, re.IGNORECASE)]
print(f'Total matches: {len(matches)}')

for pos in matches:
    line_no = text[:pos].count('\n') + 1
    snippet = text[max(0, pos-40):min(len(text), pos+120)].replace('\n', ' ')
    print(f'L{line_no}: {snippet}')
