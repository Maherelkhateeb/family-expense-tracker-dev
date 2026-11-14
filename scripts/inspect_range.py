import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Lines between 13835 and 14910:")
for i in range(13835, 14915):
    line = lines[i]
    if any(k in line for k in ['<div class="side-drawer', '<div class="modal', 'id="', '<main']):
        print(f"Line {i+1}: {line.strip()[:100]}")
