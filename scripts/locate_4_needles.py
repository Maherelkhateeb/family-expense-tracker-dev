import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

needles = [
    'مهام عيلة ماهر',
    'قائمة المهام والمسؤوليات',
    'شريط الإضافة السريعة',
    'لكشف حركاته'
]

for n in needles:
    idx = text.find(n)
    if idx != -1:
        print(f"=== Found '{n}' at pos {idx} ===")
        print(text[max(0, idx-80):min(len(text), idx+120)])
    else:
        print(f"=== NOT FOUND: '{n}' ===")
