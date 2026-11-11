import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('function renderMonthlyBudgetPlan(')
if idx != -1:
    print('=== renderMonthlyBudgetPlan ===')
    print(content[idx:idx+2500])

idx_kpi = content.find('function updateBudgetKpis(')
if idx_kpi != -1:
    print('=== updateBudgetKpis ===')
    print(content[idx_kpi:idx_kpi+2000])
