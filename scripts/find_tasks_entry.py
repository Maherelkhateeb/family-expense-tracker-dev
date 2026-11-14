with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'openTasksFullScreenModal\(', text)]
print('Matches for openTasksFullScreenModal:', len(matches))
for pos in matches:
    print('--- at pos', pos, '---')
    print(text[max(0, pos-200):min(len(text), pos+300)])
