with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\budget_engine_full.js", "r", encoding="utf-8") as f:
    c = f.read()

print("currentBudgetMonthData declaration:", "currentBudgetMonthData" in c)
import re
print("Matches:", [m.start() for m in re.finditer(r'currentBudgetMonthData', c)][:5])
