import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function renderCategoriesGrid\b', html)
if m:
    start = m.start()
    print("=== renderCategoriesGrid part 4 ===")
    print(html[start+10500:start+13500])
