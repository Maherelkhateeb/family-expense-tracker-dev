import re

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\sw.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r"const CACHE_NAME = 'family-finance-[^']+';", "const CACHE_NAME = 'family-finance-v5.2.9-202611090940';", text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("sw.js updated to v5.2.9!")
