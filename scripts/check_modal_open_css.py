import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = list(re.finditer(r'\.modal-overlay\.open', content))
print(f'Matches for .modal-overlay.open: {len(matches)}')

matches2 = list(re.finditer(r'\.modal-overlay-custom\.open', content))
print(f'Matches for .modal-overlay-custom.open: {len(matches2)}')
for m in matches2:
    idx = m.start()
    print(content[idx-20:idx+80])
