import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for m in re.finditer(r'openTasksModal|openNewTaskDrawerModal|btn.*task', text, re.IGNORECASE):
    line_no = text[:m.start()].count('\n') + 1
    print(f'Line {line_no}: {m.group()}')
