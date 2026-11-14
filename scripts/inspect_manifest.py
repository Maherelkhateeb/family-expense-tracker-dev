import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/manifest.json'
with open(filepath, 'r', encoding='utf-8') as f:
    print(f.read())
