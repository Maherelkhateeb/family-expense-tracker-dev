import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('العمليات المسجلة')
while idx != -1:
    print(f'Match at {idx}: {text[idx-100:idx+250]}')
    print('='*40)
    idx = text.find('العمليات المسجلة', idx + 1)
