import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'setEl\s*=', text)]
if not matches:
    matches = [m.start() for m in re.finditer(r'function setEl', text)]
for pos in matches[:5]:
    line_no = text[:pos].count('\n') + 1
    print(f'Line {line_no}:\n', text[pos:pos+200])
