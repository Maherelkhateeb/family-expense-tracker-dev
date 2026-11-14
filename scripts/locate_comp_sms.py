import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'كشف محاسبي دقيق على الانحرافات' in line or 'الصق رسالة البنك' in line:
        for j in range(max(0, i - 4), min(len(lines), i + 6)):
            print(f"{j+1}: {lines[j]}", end='')
        print("-" * 50)
