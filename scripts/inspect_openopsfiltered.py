import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('function openOperationsFiltered')
if idx != -1:
    print(html[idx:idx+2000])
else:
    print("openOperationsFiltered not found")
