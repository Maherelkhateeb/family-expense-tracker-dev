import os

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'header-brand-row' in l and '<div' in l:
        print(f'HTML Line {i+1}: {l}')
        for j in range(max(0, i-2), min(len(lines), i+35)):
            print(f'{j+1}: {lines[j]}', end='')
        break
