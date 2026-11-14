import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('صافي السيولة المعتمدة للمحافظ')
if idx != -1:
    print('=== SURROUNDING COCKPIT ===')
    print(text[max(0, idx-600):min(len(text), idx+1200)])
