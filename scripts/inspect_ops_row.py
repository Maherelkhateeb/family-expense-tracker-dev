import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function renderOperationsList\b', html)
if m:
    print("=== renderOperationsList part 3 ===")
    print(html[m.start()+2500:m.start()+5500])
