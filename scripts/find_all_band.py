import io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
filepath = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(filepath, "r", encoding="utf-8") as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'بند', c)]
for i, m in enumerate(matches):
    print(f"[{i}] at pos {m}: {repr(c[max(0, m-40):min(len(c), m+60)])}")
