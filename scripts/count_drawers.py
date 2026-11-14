import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('summaryLeftDrawer')
count = 0
while idx != -1:
    count += 1
    print(f"Match {count} at {idx}: {text[idx-30:idx+60]}")
    idx = text.find('summaryLeftDrawer', idx + 1)
