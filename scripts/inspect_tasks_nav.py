import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer(r'المهام', content)]
print("Total occurrences of المهام:", len(matches))

# Let's search for المهام near nav or header or button
for idx in matches:
    snippet = content[max(0, idx-100):min(len(content), idx+150)]
    if 'nav' in snippet.lower() or 'tab' in snippet.lower() or 'header' in snippet.lower() or 'badge' in snippet.lower() or 'avatar' in snippet.lower():
        print("--- MATCH ---")
        print(snippet)
