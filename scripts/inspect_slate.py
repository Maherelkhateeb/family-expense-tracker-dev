import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = list(re.finditer(r'\[data-app-theme="slate"\]', content))
print(f'Slate theme occurrences: {len(matches)}')
for m in matches:
    idx = m.start()
    print('--- slate block ---')
    print(content[idx:idx+400])
