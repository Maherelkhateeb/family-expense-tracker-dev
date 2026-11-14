import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function saveEditedTx\b', html)
if m:
    print("=== saveEditedTx part 2 ===")
    print(html[m.start()+500:m.start()+2500])
