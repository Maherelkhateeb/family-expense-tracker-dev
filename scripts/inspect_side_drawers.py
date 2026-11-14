import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('class="side-drawer-panel"')
while idx != -1:
    print(f'Match at {idx}: {text[idx-50:idx+350]}')
    print('---')
    idx = text.find('class="side-drawer-panel"', idx + 1)
