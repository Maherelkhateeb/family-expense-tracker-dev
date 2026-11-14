import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('function renderSummaryDrawer')
print(html[idx+2000:idx+4000])
