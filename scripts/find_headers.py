import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('<header')
while idx != -1:
    print(f'Header at {idx}: {text[idx:idx+200]}')
    idx = text.find('<header', idx + 1)
