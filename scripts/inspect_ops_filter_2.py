import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('function renderOperationsList(')
if idx != -1:
    print(html[idx+2500:idx+6000])
