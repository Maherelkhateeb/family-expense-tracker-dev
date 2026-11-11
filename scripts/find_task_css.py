import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'\.task[a-zA-Z0-9_\-]*|\.subtask[a-zA-Z0-9_\-]*', text)
print('Task CSS classes found:', set(matches))
