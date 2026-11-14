import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos = text.find('.task-kpi-strip')
if pos != -1:
    line_no = text[:pos].count('\n') + 1
    print(f'Line {line_no}:\n', text[pos:pos+1500])
else:
    print('Not found')
