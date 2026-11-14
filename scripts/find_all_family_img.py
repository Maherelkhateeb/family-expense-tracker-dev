import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
for search_str in ['avatar_all_family', 'family_portrait', 'avatarImgAllFamily', 'settingsFamilyPortraitImg']:
    matches = [m.start() for m in re.finditer(re.escape(search_str), content)]
    print(f"\nSearch for '{search_str}': {len(matches)} matches")
    for idx in matches:
        start = max(0, idx - 150)
        end = min(len(content), idx + 200)
        print(f"[{idx}]: {content[start:end]}")
