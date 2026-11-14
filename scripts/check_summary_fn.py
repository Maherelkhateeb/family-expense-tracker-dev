import re

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

m = re.search(r'id=["\']btnOpenSummaryDrawer["\'][^>]*>', c)
if m:
    print('Button HTML:', m.group(0))

for f in re.finditer(r'function\s+([a-zA-Z0-9_]*summary[a-zA-Z0-9_]*|[a-zA-Z0-9_]*drawer[a-zA-Z0-9_]*)\s*\(', c, re.IGNORECASE):
    print('Found function:', f.group(0))
