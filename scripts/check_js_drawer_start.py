import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'currentDrawerTab =' in line or 'function openSummaryDrawer' in line:
        print(f"Drawer JS start at line {i+1}")
        for j in range(i, min(len(lines), i + 30)):
            print(f"{j+1}: {lines[j]}", end='')
        break
