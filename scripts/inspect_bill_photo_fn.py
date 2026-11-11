import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'function handleBillPhotoSelected' in line or 'handleBillPhotoSelected =' in line:
        for j in range(idx, min(idx + 40, len(lines))):
            print(f'{j+1}: {lines[j]}', end='')
        break
