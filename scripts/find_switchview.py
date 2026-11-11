import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = [m.start() for m in re.finditer(r'switchView', html)]
print(f"switchView matches: {len(m)}")
for idx in m[:5]:
    start = max(0, idx - 50)
    end = min(len(html), idx + 150)
    print(f"[{idx}]:\n{html[start:end]}\n---")
