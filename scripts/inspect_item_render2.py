import sys, io

sys.stdout.reconfigure(encoding='utf-8')
HTML_FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\budget_engine_full.js"

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('items.map((it, idx)')
print(c[pos+1800:pos+3800])
