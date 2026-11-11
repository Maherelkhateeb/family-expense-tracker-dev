import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'function\s+([a-zA-Z0-9_]*Task[a-zA-Z0-9_]*)\s*\(', text)
for m in matches:
    print(f"Function {m.group(1)} at {m.start()}")
