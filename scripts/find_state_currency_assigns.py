import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'state\.currency\s*=', text)
for m in matches:
    pos = m.start()
    line_no = text[:pos].count('\n') + 1
    print(f'Line {line_no}: {text[pos-20:pos+80].strip()}')

print("\n--- btnToggleCurrency matches ---")
matches2 = re.finditer(r'btnToggleCurrency', text)
for m in matches2:
    pos = m.start()
    line_no = text[:pos].count('\n') + 1
    print(f'Line {line_no}: {text[pos-20:pos+80].strip()}')
