import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('لا توجد مهام')
while idx != -1:
    print(f"=== Match at {idx} ===")
    print(text[max(0, idx-100):min(len(text), idx+200)])
    idx = text.find('لا توجد مهام', idx + 1)
