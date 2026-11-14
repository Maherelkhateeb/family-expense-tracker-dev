import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('color: #c084fc; flex-shrink: 0;')
print("Found at:", idx)
print(content[idx-600:idx+600])
