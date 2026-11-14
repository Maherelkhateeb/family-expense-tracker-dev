import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'async function executeMasterUnifiedSyncAndRefresh\b', html)
if m:
    print("=== executeMasterUnifiedSyncAndRefresh ===")
    print(html[m.start():m.start()+3500])
