with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [(m.start(), text[max(0, m.start()-50):min(len(text), m.end()+250)]) for m in re.finditer(r'MEMBER_AVATARS\s*=', text)]
for pos, snippet in matches:
    line_no = text[:pos].count('\n') + 1
    print(f'Line {line_no}: {snippet}')
