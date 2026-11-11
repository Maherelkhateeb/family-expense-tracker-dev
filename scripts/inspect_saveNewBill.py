import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'onsubmit=["\']event\.preventDefault\(\);\s*saveNewBill\(\);["\']', html)
if m:
    start = m.start()
    print("=== saveNewBill form ===")
    print(html[start:start+1800])
