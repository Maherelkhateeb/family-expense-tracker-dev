import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'<nav[^>]*class=["\'][^"\']*app-bottom-nav', html)
if m:
    start = m.start()
    print("=== app-bottom-nav HTML ===")
    print("Preceding 400 chars:")
    print(html[start-400:start])
    print("Nav element and following 600 chars:")
    print(html[start:start+600])
