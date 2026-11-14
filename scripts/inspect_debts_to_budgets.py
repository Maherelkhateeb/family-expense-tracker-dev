import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx_debts_list = content.find('id="viewCommitmentsDebtsList"')
idx_budgets_strip = content.find('id="budgetsSubTabStrip"')

print(f"viewCommitmentsDebtsList at {idx_debts_list}")
print(f"budgetsSubTabStrip at {idx_budgets_strip}")

print(content[idx_budgets_strip-300:idx_budgets_strip+150])
