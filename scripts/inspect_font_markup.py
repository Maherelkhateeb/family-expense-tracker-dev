import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer(r'خط الكلمات والأرقام', content)]
print("Font header matches:", len(matches))
for idx in matches:
    print(content[idx-100:idx+800])
