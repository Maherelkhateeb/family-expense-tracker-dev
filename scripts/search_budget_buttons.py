import sys, io, re

sys.stdout.reconfigure(encoding='utf-8')
HTML_FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    c = f.read()

matches = [m.start() for m in re.finditer(r'الميزاني[ا|ة]', c)]
print(f"Total matches for الميزانية/الميزانيات: {len(matches)}")

for m in matches:
    # check if in button or a or header
    snippet = c[max(0, m-80):min(len(c), m+120)]
    if any(k in snippet for k in ['button', 'btn', 'tab', 'nav', 'onclick', 'switch', 'class=']):
        print(f"At pos {m}:")
        print(snippet)
        print("-" * 40)
