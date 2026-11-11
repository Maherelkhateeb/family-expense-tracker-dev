import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for fn in ['function initMonthlyBudgetUI', 'function loadActiveBudgetPlan', 'function loadMonthlyBudget']:
    idx = text.find(fn)
    print(fn, 'at:', idx)
    if idx != -1:
        print(text[idx:idx+1500])
        print('='*50)
