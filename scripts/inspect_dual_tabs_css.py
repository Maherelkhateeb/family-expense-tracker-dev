import sys, io, re

sys.stdout.reconfigure(encoding='utf-8')
HTML_FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    c = f.read()

for term in ['commitmentsTopTwoTabsStrip', 'exp-dual-top-btn', 'tabExpectedBudgets']:
    matches = [m.start() for m in re.finditer(re.escape(term), c)]
    print(f"=== Term {term}: {len(matches)} matches ===")
    for m in matches:
        print(c[max(0, m-80):min(len(c), m+180)])
        print("-" * 30)
