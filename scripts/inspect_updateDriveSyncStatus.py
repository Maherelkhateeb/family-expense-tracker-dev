import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function updateDriveSyncStatusDisplay\b', html)
if m:
    print("=== updateDriveSyncStatusDisplay ===")
    print(html[m.start():m.start()+1500])
else:
    print("updateDriveSyncStatusDisplay NOT FOUND")
