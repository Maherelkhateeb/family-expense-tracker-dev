import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx1 = html.find('function saveNewBill(')
print("=== saveNewBill ===")
print(html[idx1:idx1+1500])

idx2 = html.find('function saveExpected(')
print("\n=== saveExpected ===")
print(html[idx2:idx2+1500])
