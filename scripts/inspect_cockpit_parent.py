import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'id=["\']topCardBalance["\']', html)
if m:
    print("=== topCardBalance parent ===")
    print(html[m.start()-400:m.start()+200])
