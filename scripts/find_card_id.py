import io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
filepath = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(filepath, "r", encoding="utf-8") as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'cardExpUpcoming', c)]
print("Matches for cardExpUpcoming:", len(matches))
for m in matches:
    print(c[max(0, m-100):min(len(c), m+200)])
