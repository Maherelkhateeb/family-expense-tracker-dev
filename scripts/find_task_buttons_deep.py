import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for m in re.finditer(r'openNewTask|btn.*Task|btnQuickNewTask', text, re.IGNORECASE):
    line_no = text[:m.start()].count('\n') + 1
    snippet = text[max(0, m.start()-60):min(len(text), m.end()+60)].replace('\n', ' ')
    print(f'Line {line_no}: {m.group()} -> {snippet}')
