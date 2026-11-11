import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('for (const [dateStr,')
if idx != -1:
    print(content[idx:idx+2500])
