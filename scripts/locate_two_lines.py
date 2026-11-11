import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'لا تنسي توثيق مصاريف' in line or 'انقر على أي لون لتغيير خلفية التطبيق' in line:
        print(f"=== FOUND AT LINE {i+1} ===")
        start = max(0, i - 10)
        end = min(len(lines), i + 10)
        for j in range(start, end):
            print(f"{j+1}: {lines[j]}", end='')
        print("-" * 50)
