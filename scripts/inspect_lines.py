import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
for target in [13840, 15225, 15687]:
    print(f"\n=== AROUND LINE {target} ===")
    start = max(0, target - 6)
    end = min(len(lines), target + 6)
    for i in range(start, end):
        print(f"{i+1}: {lines[i]}", end='')
