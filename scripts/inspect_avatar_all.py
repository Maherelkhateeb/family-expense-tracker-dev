import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer(r'avatar_all_family|avatarImgAllFamily', content)]
print("Occurrences of avatar_all_family/avatarImgAllFamily:", len(matches))
for idx in matches:
    start = max(0, idx - 200)
    end = min(len(content), idx + 200)
    print("--- OCCURRENCE ---")
    print(content[start:end])
    print("-------------------")
