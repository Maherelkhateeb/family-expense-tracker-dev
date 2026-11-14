import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

drawer_start = -1
for i, line in enumerate(lines):
    if 'id="summaryLeftDrawer"' in line or "id='summaryLeftDrawer'" in line:
        drawer_start = i
        break

if drawer_start != -1:
    print(f"--- summaryLeftDrawer starts at {drawer_start+1} ---")
    # print up to 250 lines
    for j in range(drawer_start, min(len(lines), drawer_start + 250)):
        print(f"{j+1}: {lines[j]}", end='')
