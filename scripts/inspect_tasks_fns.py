with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'function\s+([a-zA-Z0-9_]*task[a-zA-Z0-9_]*)', text, re.I)
print("Tasks functions found:")
for m in set(matches):
    print(" -", m)

matches_drawer = re.findall(r'function\s+([a-zA-Z0-9_]*drawer[a-zA-Z0-9_]*)', text, re.I)
print("Drawer functions found:")
for m in set(matches_drawer):
    print(" -", m)
