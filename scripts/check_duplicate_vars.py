with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

import re
for varname in ['currentBudgetMonthData', 'selectedBudgetItemMembers', 'activeExpectedTopSection']:
    matches = [m.start() for m in re.finditer(re.escape(varname), c)]
    print(f"{varname} matches: {len(matches)}")
    for m in matches:
        print(" ", repr(c[m-40:m+60]))
