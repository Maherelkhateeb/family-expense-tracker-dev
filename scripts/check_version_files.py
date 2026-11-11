import json

with open(r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\version.json', 'r', encoding='utf-8') as f:
    v = json.load(f)
    print('version.json:', v)

with open(r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\sw.js', 'r', encoding='utf-8') as f:
    text = f.read()
    print('sw.js first 300 chars:', text[:300])
