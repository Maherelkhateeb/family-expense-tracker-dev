import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

pos = c.find('function switchBudgetSubTab')
print(c[pos:pos+1000])
