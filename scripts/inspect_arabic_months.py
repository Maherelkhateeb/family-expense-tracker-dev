import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'arabicMonths', text)]
print('arabicMonths count:', len(matches))
for pos in matches:
    print('--- MATCH ---')
    print(text[max(0, pos-50):min(len(text), pos+100)])
