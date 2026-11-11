import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'id=["\']panelNewExpected["\']', html)
if m:
    start = m.start()
    print("=== panelNewExpected submit btn 5 ===")
    print(html[start+8500:start+10000])
