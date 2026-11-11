import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('function executeMasterUnifiedSyncAndRefresh(')
if idx != -1:
    print(html[idx:idx+3000])
else:
    print("executeMasterUnifiedSyncAndRefresh not found")
