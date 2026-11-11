import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function renderOperationsList\b', html)
if m:
    print("=== renderOperationsList part 2 ===")
    print(html[m.start()+1400:m.start()+3500])
