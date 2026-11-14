import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

matches = [m.start() for m in re.finditer(r'localStorage\.removeItem\(\'family_monefy_v2_tx\'\)', content)]
print(f"Matches for removeItem family_monefy_v2_tx: {len(matches)}")
for idx in matches:
    print(content[idx-100:idx+300])
    print("====================")
