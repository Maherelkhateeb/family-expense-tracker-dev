import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'id=["\']panelNewExpected["\']', html)
if m:
    start = m.start()
    print("=== panelNewExpected buttons ===")
    print(html[start+2500:start+4000])
