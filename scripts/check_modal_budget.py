with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

print("modalNewBudgetPlan in index.html:", "modalNewBudgetPlan" in c)
print("panelMonthlyBudget in index.html:", "panelMonthlyBudget" in c)
print("panelBudgetHistory in index.html:", "panelBudgetHistory" in c)
print("budgetPlanSelector in index.html:", "budgetPlanSelector" in c)
