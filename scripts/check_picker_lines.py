import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Line 19005 to 19045:")
for i in range(19005, 19045):
    print(f"{i+1}: {lines[i]}", end='')
