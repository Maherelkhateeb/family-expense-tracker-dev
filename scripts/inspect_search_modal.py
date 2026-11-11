import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function openGlobalSearchModal')
if idx != -1:
    print('Found openGlobalSearchModal:')
    print(text[idx:idx+800])
else:
    print('openGlobalSearchModal NOT found')

idx_m = text.find('id="globalSearchModal"')
if idx_m != -1:
    print('Found globalSearchModal HTML:')
    print(text[idx_m-50:idx_m+400])
else:
    print('globalSearchModal NOT found')
