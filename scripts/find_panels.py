import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Look for sidebar, side, drawer in id or class
matches = re.finditer(r'<[a-z0-9]+[^>]+(?:id|class)=["\'][^"\']*(?:side|panel|drawer|wing|flyout|sheet|dock)[^"\']*["\'][^>]*>', text, re.I)
for m in matches:
    print(m.group(0)[:120])
