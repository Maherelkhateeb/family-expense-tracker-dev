import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('id="viewExpected"')
e = html.find('id="subViewMonthlyBudget"')
print(f"viewExpected start at: {s}")
print(f"subViewMonthlyBudget start at: {e}")
print(html[s:s+1500])
