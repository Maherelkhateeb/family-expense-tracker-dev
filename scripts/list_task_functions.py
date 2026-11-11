import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Tasks functions in index.html:")
for i in range(29725, min(len(lines), 30425)):
    if 'function ' in lines[i]:
        print(f"Line {i+1}: {lines[i].strip()[:100]}")
