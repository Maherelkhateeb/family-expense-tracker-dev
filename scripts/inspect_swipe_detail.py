import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('let touchStartX = 0;')
if idx != -1:
    print(c[idx:idx+1500])
