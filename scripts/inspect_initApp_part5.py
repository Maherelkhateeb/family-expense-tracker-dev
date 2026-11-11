import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function initApp\b', html)
if m:
    print("=== initApp part 5 ===")
    print(html[m.start()+13500:m.start()+17000])
