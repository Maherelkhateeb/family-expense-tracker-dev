import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for k in range(14870, min(len(lines), 14910)):
    print(f"{k+1}: {lines[k]}", end='')
