import sys
filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        if 'id="goldDrawerPanel"' in line or 'id="summaryLeftDrawer"' in line or 'goldDrawerPanel' in line:
            print(f'{idx+1}: {line.strip()[:100]}')
