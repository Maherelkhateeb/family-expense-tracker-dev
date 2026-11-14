import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

fns = ['renderExpectedList', 'switchExpectedMainTab', 'submitExpectedExpense', 'payExpectedCommitment', 'deleteExpected', 'editExpected', 'saveNewBill']
for fn in fns:
    idx = html.find(f'function {fn}(')
    print(f"Function {fn}: {idx}")
