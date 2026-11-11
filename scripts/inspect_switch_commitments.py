import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = list(re.finditer(r'switchCommitmentSubSection', content))
print(f'switchCommitmentSubSection matches: {len(matches)}')
for m in matches:
    idx = m.start()
    print('---')
    print(content[idx:idx+800])
