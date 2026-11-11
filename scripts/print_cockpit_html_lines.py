import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(12220, 12300):
    if i < len(lines):
        print(f'{i+1}: {lines[i]}', end='')
