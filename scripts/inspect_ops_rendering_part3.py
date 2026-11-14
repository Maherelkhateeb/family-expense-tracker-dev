import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('function renderOperationsList')
if idx != -1:
    print(c[idx+3800:idx+6500])
