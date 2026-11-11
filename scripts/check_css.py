import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

for term in ['data-app-theme="slate"', 'data-icon-theme="silver"', 'data-card-style', 'data-font="alexandria"', 'data-font']:
    matches = list(re.finditer(re.escape(term), content))
    print(f'{term}: {len(matches)} matches')
    for m in matches[:3]:
        idx = m.start()
        print('   ', content[max(0, idx-40):min(len(content), idx+100)].replace('\n', ' '))
