import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(19440, min(len(lines), 19560)):
    if 'catTotals' in lines[i] or 'cat-card' in lines[i] or 'formatMoney' in lines[i]:
        print(f"{i+1}: {lines[i]}", end='')
