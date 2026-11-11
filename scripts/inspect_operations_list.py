import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. filterOperationsList
m = re.search(r'function filterOperationsList\b', html)
if m:
    print("=== filterOperationsList ===")
    print(html[m.start():m.start()+1500])

# 2. renderOperationsList
m2 = re.search(r'function renderOperationsList\b', html)
if m2:
    print("=== renderOperationsList ===")
    print(html[m2.start():m2.start()+1500])
