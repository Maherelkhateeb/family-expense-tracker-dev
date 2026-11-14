import io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
filepath = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(filepath, "r", encoding="utf-8") as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'بند', c)]
print("Matches for بند:", len(matches))
for m in matches:
    snippet = c[max(0, m-80):min(len(c), m+120)]
    if any(k in snippet for k in ['ديون', 'السداد', 'سداد', 'مصاريف', 'مكتمل']):
        print(f"Match at pos {m}:")
        print(snippet)
        print("=" * 40)
