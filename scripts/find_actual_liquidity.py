import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'الرصيد الفعلى|الرصيد الفعلي|actualLiquidity|actualBalance|actual-liquidity|renderActual|openActual', text)
for m in list(matches)[:25]:
    pos = m.start()
    line_no = text[:pos].count('\n') + 1
    snippet = text[max(0, pos-40):min(len(text), pos+60)].replace('\n', ' ')
    print(f'L{line_no}: {snippet}')
