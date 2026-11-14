import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'function setEl(' in line:
        for j in range(i, min(i+15, len(lines))):
            print(f'{j+1}: {lines[j].rstrip()[:120]}')
