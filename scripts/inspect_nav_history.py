import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = [m.start() for m in re.finditer(r'popstate|switchView|goBack|history\.back|history\.pushState', html)]
print(f"Navigation matches: {len(m)}")
for idx in m[:10]:
    start = max(0, idx - 100)
    end = min(len(html), idx + 250)
    print(f"[{idx}]:\n{html[start:end]}\n---")
