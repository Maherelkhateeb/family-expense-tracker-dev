import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = [m.start() for m in re.finditer(r'function switch|function showPage|function setPage|function nav', html)]
print(f"Navigation function matches: {len(m)}")
for idx in m:
    start = max(0, idx)
    end = min(len(html), idx + 250)
    print(f"[{idx}]:\n{html[start:end]}\n---")
