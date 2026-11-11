import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('id="topCardBalance"')
if idx != -1:
    print('=== HTML topCardBalance ===')
    print(text[max(0, idx-400):min(len(text), idx+1800)])
