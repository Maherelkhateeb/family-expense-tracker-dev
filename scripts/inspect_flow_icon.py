import io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
filepath = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(filepath, "r", encoding="utf-8") as f:
    c = f.read()

import re
for term in ['topCardIncome', 'flow-icon-badge', 'inflow-badge', 'circle-arrow-down']:
    matches = [m.start() for m in re.finditer(re.escape(term), c)]
    print(f"=== Term: {term} (count {len(matches)}) ===")
    for m in matches[:5]:
        print(c[max(0, m-100):min(len(c), m+150)])
        print("-" * 40)
