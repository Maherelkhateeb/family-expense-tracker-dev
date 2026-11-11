with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'activeBudgetSubTab', c)]
print("activeBudgetSubTab matches:", len(matches))
for m in matches:
    print(c[m-50:m+80])
    print("-" * 30)
