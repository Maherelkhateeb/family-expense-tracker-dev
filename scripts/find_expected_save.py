import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = list(re.finditer(r'inpExpTitle|btnSaveExpected|submitExpected', html))
for x in m:
    print(f"[{x.start()}]: {html[x.start()-50:x.start()+150]}\n---")
