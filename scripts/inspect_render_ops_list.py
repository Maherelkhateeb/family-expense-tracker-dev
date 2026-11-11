import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = list(re.finditer(r'renderOperationsList', content))
print(f'renderOperationsList occurrences: {len(matches)}')
for m in matches:
    idx = m.start()
    print('---')
    print(content[idx:idx+800])
