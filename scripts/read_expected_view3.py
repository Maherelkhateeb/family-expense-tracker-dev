import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(13490, min(13570, len(lines))):
    print(f'{i+1}: {lines[i].rstrip()[:120]}')
