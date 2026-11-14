import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("=== CARD STYLES CSS ===")
for m in re.finditer(r'\[data-card-style="[^"]+"\]', html):
    start = max(0, m.start() - 50)
    end = min(len(html), m.start() + 300)
    print(f"[{m.start()}]: {html[start:end]}\n---")

print("\n=== ICON THEMES CSS ===")
for m in re.finditer(r'\[data-icon-theme="[^"]+"\]', html):
    start = max(0, m.start() - 50)
    end = min(len(html), m.start() + 300)
    print(f"[{m.start()}]: {html[start:end]}\n---")

print("\n=== FONT SIZES CSS ===")
for m in re.finditer(r'\[data-font-size="[^"]+"\]', html):
    start = max(0, m.start() - 50)
    end = min(len(html), m.start() + 300)
    print(f"[{m.start()}]: {html[start:end]}\n---")
