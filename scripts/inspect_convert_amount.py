import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('function convertAmount(')
if idx != -1:
    print('convertAmount function:')
    print(c[idx:idx+800])
else:
    print('convertAmount not found')
