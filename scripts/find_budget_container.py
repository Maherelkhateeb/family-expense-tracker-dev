import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s_budget = html.find('id="subViewMonthlyBudget"')
if s_budget == -1:
    s_budget = html.find('الميزانية التقديرية الحالية', 559000)
    if s_budget != -1:
        s_budget = html.rfind('<div', 0, s_budget)

print("Monthly budget container at:", s_budget)
if s_budget != -1:
    print(html[s_budget-200:s_budget+300])
