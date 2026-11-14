import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

head = content[:5000]
matches = list(re.finditer(r'<link[^>]*fonts\.googleapis\.com[^>]*>', head))
for m in matches:
    print(m.group(0))
