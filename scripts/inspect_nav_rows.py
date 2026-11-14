import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for header-tools-row or bottom-nav
import re
for row in ['header-tools-row', 'bottom-nav', 'bottom-bar', 'nav-tab']:
    m = [x.start() for x in re.finditer(re.escape(row), content)]
    print(f"Row {row}: {len(m)} matches")
    for idx in m[:2]:
        print(content[idx-100:idx+300])
        print("====")
