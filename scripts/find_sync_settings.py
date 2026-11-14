import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = list(re.finditer(r'المزامنة السحابية', content))
print(f'Matches for المزامنة السحابية: {len(matches)}')
for m in matches:
    idx = m.start()
    print('---')
    print(content[max(0, idx-60):min(len(content), idx+140)].replace('\n', ' '))

matches2 = list(re.finditer(r'تحديث ومزامنة فورية', content))
print(f'Matches for تحديث ومزامنة فورية: {len(matches2)}')
for m in matches2:
    idx = m.start()
    print('---')
    print(content[max(0, idx-60):min(len(content), idx+140)].replace('\n', ' '))
