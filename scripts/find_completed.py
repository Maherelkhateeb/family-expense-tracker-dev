import io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
filepath = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(filepath, "r", encoding="utf-8") as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'مكتمل|تم الس|مصاريف', c)]
print("Total matches:", len(matches))

# Let's search specifically for the word "مكتمل"
matches_completed = [m.start() for m in re.finditer(r'مكتمل', c)]
print("Matches for مكتمل:", len(matches_completed))
for m in matches_completed:
    print("Match at pos:", m)
    print(c[max(0, m-100):min(len(c), m+150)])
    print("=" * 40)
