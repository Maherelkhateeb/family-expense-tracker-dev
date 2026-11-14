import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'موازنة وتدقيق كافة المحافظ' in line:
        print(f"Audit banner at line {i+1}")
        for j in range(max(0, i-5), min(len(lines), i + 80)):
            print(f"{j+1}: {lines[j]}", end='')
        break
