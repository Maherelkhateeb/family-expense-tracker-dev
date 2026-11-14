import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer(r'\.icon-theme-pill', content)]
print("Matches for .icon-theme-pill:", len(matches))
for idx in matches:
    print(content[idx:idx+400])
    print("-----")
