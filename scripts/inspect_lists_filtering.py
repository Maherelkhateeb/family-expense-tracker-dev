import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx_bills = content.find('function renderCommitmentsBillsList()')
if idx_bills != -1:
    print('=== renderCommitmentsBillsList ===')
    print(content[idx_bills:idx_bills+1500])

idx_debts = content.find('function renderCommitmentsDebtsList()')
if idx_debts != -1:
    print('=== renderCommitmentsDebtsList ===')
    print(content[idx_debts:idx_debts+1500])
