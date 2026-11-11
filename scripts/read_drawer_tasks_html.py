import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = 31400
end = min(31660, len(lines))
for i in range(start, end):
    print(f'{i+1}: {lines[i].rstrip()[:120]}')
