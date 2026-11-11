import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

depth = 0
for idx in range(11967, 13841):
    l = lines[idx]
    opens = l.count('<div')
    closes = l.count('</div')
    depth += (opens - closes)
    if depth < 0 or idx == 13839:
        print(f"Line {idx+1}: opens={opens}, closes={closes}, depth={depth} -> {l.strip()}")
