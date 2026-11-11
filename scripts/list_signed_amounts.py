import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

import re
pattern = re.compile(r'([\+\-]\s*\$\{formatMoney\([^)]+\)\})')
for i, line in enumerate(lines):
    m = pattern.search(line)
    if m:
        print(f'L{i+1}: {line.strip()[:110]}')
