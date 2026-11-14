import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function renderDrawerTasksView\b', html)
if m:
    print("=== renderDrawerTasksView ===")
    print(html[m.start():m.start()+3500])
else:
    print("renderDrawerTasksView NOT FOUND!")
