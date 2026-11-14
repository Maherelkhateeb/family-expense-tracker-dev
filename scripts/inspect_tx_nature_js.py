import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.finditer(r'txNatureBanner', text)
for m in matches:
    idx = m.start()
    print(text[max(0, idx-50):min(len(text), idx+100)])
    print('---')
