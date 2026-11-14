import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect CSS for icon themes
matches = list(re.finditer(r'\[data-icon-theme', content))
print(f'Total [data-icon-theme] occurrences in CSS: {len(matches)}')
for m in matches[:10]:
    idx = m.start()
    print('---')
    print(content[idx:idx+250])

# Let's inspect CSS for fonts
matches_font = list(re.finditer(r'data-font', content))
print(f'Total data-font occurrences: {len(matches_font)}')
for m in matches_font[:10]:
    idx = m.start()
    print('--- font ---')
    print(content[idx-30:idx+200])
