import sys, io

sys.stdout.reconfigure(encoding='utf-8')
HTML_FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r"switchExpectedTopSection\s*\(\s*['\"]budgets['\"]", c)]
print("References to switchExpectedTopSection('budgets'):", len(matches))
for m in matches:
    print(c[m-50:m+150])
    print("-" * 30)
