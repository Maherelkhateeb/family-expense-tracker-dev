import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('function toggleCurrency(')
if idx != -1:
    print('toggleCurrency function:')
    print(c[idx:idx+1200])

for m in re.finditer(r'toggleCurrency', c):
    p = m.start()
    print('Found toggleCurrency at:', p)
    print(c[max(0, p-100):min(len(c), p+150)])
    print('---')
