import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'onsubmit=["\']event\.preventDefault\(\);\s*saveNewBill\(\);["\']', html)
if m:
    start = m.start()
    print("=== saveNewBill submit ===")
    print(html[start+3600:start+4800])
