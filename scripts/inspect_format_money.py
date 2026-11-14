import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('function formatMoneyVal(')
if idx != -1:
    print(content[idx:idx+500])
else:
    # let's search for formatMoney
    matches = list(re.finditer(r'function formatMoney', content))
    for m in matches:
        idx = m.start()
        print('---')
        print(content[idx:idx+300])
