import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'EXPENSE_CATEGORIES\.forEach\(cat => \{', html)
if m:
    print("=== Card generation inside EXPENSE_CATEGORIES.forEach ===")
    print(html[m.start():m.start()+3500])
