import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'\.flow-amount\s*\{', c)]
for m in matches:
    print(c[m:m+300])
    print("-" * 30)
