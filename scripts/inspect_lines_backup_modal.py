import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(14605, 14680):
    if i < len(lines):
        print(f'{i+1}: {lines[i]}', end='')
