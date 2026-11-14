import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for p in ['لا تنسي توثيق مصاريف', 'انقر على أي لون لتغيير خلفية التطبيق']:
    idx = text.find(p)
    if idx != -1:
        print(f"=== {p} ===")
        print(text[idx-200:idx+250])
    else:
        print(f"=== NOT FOUND: {p} ===")
