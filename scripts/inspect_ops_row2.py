import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function renderOperationsList\b', html)
if m:
    print("=== renderOperationsList part 4 ===")
    print(html[m.start()+4500:m.start()+7500])
