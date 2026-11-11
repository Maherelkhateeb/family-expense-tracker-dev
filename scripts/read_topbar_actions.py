import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(12060, 12110):
    print(f'{i+1}: {lines[i].rstrip()[:120]}')
