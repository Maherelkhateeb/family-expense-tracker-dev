import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'id=["\']panelNewExpected["\']', html)
if m:
    start = m.start()
    print("=== panelNewExpected submit btn ===")
    print(html[start+7000:start+8500])
