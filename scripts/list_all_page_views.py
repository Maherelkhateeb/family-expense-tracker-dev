import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pages = list(re.finditer(r'<div class="page-view"[^>]*id="([^"]+)"', html))
for p in pages:
    print(f"Page view: {p.group(1)} at index {p.start()}")
