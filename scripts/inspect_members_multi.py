import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\budget_engine_full.js", "r", encoding="utf-8") as f:
    c = f.read()

pos = c.find('selectedBudgetItemMembers')
print("selectedBudgetItemMembers pos:", pos)
if pos != -1:
    print(c[pos-100:pos+1500])
