import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

print("--- Searching for btnOpenTasksDrawer ---")
for m in re.finditer(r'<button[^>]*id=["\']btnOpenTasksDrawer["\'][\s\S]*?</button>', c):
    print(m.group(0))

print("\n--- Searching for btnOpenGold ---")
for m in re.finditer(r'<button[^>]*id=["\']btnOpenGold["\'][\s\S]*?</button>', c):
    print(m.group(0))

print("\n--- Context around them ---")
m = re.search(r'<div[^>]*class=["\'][^"\']*tools-pills-cluster[\s\S]*?</div>', c)
if m:
    print(m.group(0))
else:
    # find where btnOpenTasksDrawer is inside
    idx = c.find('btnOpenTasksDrawer')
    print(c[max(0, idx-400):min(len(c), idx+1000)])
