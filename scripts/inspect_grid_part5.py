import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function renderCategoriesGrid\b', html)
if m:
    start = m.start()
    print("=== renderCategoriesGrid part 5 ===")
    print(html[start+13500:start+16000])
