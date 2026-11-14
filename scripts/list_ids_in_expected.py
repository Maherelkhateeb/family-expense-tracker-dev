import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = 559376
e = 608079
block = html[s:e]

# Find all id="..." in this block
ids = list(re.finditer(r'id="([^"]+)"', block))
for i in ids:
    print(f"ID in block: {i.group(1)} (at offset {i.start()})")
