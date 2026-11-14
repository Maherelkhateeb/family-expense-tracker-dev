import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('function openSummaryDrawer(')
print('Index:', idx)
if idx != -1:
    print(c[max(0, idx-200):min(len(c), idx+600)])
