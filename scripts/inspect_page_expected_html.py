import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('id="pageExpected"')
e = html.find('id="subViewMonthlyBudget"', s)
print(f"Commitments page HTML from {s} to {e}")
print(html[s:s+3000])
