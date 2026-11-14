import sys, io
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'class=["\'][^"\']*exp-kpi-card', c)]
print("Matches for exp-kpi-card:", len(matches))
for m in matches:
    print("Match at pos:", m)
    print(c[m-50:m+200])
    print("=" * 40)
