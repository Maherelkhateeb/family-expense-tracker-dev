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
    prev = depth
    depth += (opens - closes)
    # Check if depth ever drops unexpectedly
    # Line 11968 opens appFrame, so depth should be 1
    # Line 13790 closes appScrollBody, so depth should be 1 (for appFrame)
    # Line 13840 closes appFrame, so depth should be 0
    if idx in [11967, 13789, 13790, 13839]:
        print(f"Line {idx+1}: opens={opens}, closes={closes}, depth={depth} (was {prev}) -> {l.strip()[:60]}")
