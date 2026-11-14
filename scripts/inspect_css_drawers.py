import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines[:12000]):
    if any(k in line for k in ['summary-left-drawer', 'goldDrawerPanel', 'side-drawer-panel']):
        print(f"Line {i+1}:")
        for j in range(max(0, i-2), min(len(lines), i+25)):
            print(f"  {lines[j]}", end='')
            if '}' in lines[j] and j > i:
                break
        print('---')
