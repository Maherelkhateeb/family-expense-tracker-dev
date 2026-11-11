import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'id=["\']editTxModal["\']', html)
if m:
    print("=== editTxModal HTML part 2 ===")
    print(html[m.start()+2500:m.start()+5500])
