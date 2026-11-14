import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

drawer_start = -1
drawer_end = -1
for i, line in enumerate(lines):
    if 'id="summaryLeftDrawer"' in line or "id='summaryLeftDrawer'" in line:
        drawer_start = i
        break

if drawer_start != -1:
    depth = 0
    for j in range(drawer_start, len(lines)):
        depth += lines[j].count('<div')
        depth -= lines[j].count('</div')
        if depth <= 0 and j > drawer_start:
            drawer_end = j
            break

print(f"drawer_start: {drawer_start+1}, drawer_end: {drawer_end+1}")
for k in range(drawer_start, drawer_start + 40):
    print(f"{k+1}: {lines[k]}", end='')
