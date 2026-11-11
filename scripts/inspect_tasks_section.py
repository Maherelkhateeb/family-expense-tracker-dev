import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'id=["\']drawerTasksViewSection["\']', html)
if m:
    print("=== drawerTasksViewSection ===")
    print(html[m.start():m.start()+3000])
else:
    print("drawerTasksViewSection NOT FOUND!")
