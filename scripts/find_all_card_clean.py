import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = [m.start() for m in re.finditer(r'ops-tx-card-clean', html)]
print(m)
for idx in m:
    print(f"[{idx}]:\n{html[idx:idx+800]}\n---")
