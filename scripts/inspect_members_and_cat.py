import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for selectMember
for m in re.finditer(r'function selectMember\b', html):
    start = m.start()
    print("=== selectMember ===")
    print(html[start:start+1200])

# Search for member filter in renderCategories
for m in re.finditer(r'function renderCategories\b', html):
    start = m.start()
    print("=== renderCategories ===")
    print(html[start:start+1500])
