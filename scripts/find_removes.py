import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

matches = [m.start() for m in re.finditer(r'localStorage\.(removeItem|clear)', content)]
print(f"Total localStorage remove/clear calls: {len(matches)}")
for idx in matches:
    print(content[idx:idx+120])
    print("---")
