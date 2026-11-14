import sys, io, re

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

budget_fns = [
    'initMonthlyBudgetUI',
    'loadActiveBudgetPlan',
    'renderMonthlyBudgetPlan',
    'renderBudgetHistoryList',
    'openNewBudgetPlanModal',
    'closeNewBudgetPlanModal',
    'saveNewBudgetPlan',
    'cloneCurrentBudgetPlan',
    'deleteCurrentBudgetPlan',
    'addNewBudgetItemRow',
    'removeBudgetItemRow',
    'toggleBudgetItemMember',
    'switchBudgetSubTab'
]

print("=== Checking Budget Functions ===")
for fn in budget_fns:
    matches = list(re.finditer(r'function\s+' + fn, c))
    print(f"Function {fn}: {len(matches)} definitions found")
