import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s1 = html.find('id="panelNewExpected"')
print("=== panelNewExpected ===")
print(html[s1:s1+2500])

s2 = html.find('id="panelBillsExpected"')
print("\n=== panelBillsExpected ===")
print(html[s2:s2+2500])
