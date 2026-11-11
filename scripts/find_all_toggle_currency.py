import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'function toggleCurrency', text)
for m in matches:
    pos = m.start()
    line_no = text[:pos].count('\n') + 1
    print(f'toggleCurrency defined at line {line_no}:')
    print(text[pos:pos+400])
    print('='*50)
