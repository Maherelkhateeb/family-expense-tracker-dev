import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

for target in ['budgetsSubTabStrip', 'panelMonthlyBudget', 'panelBudgetHistory', 'subViewCommitments']:
    idx = content.find(f'id="{target}"')
    print(f'{target}: index {idx}')
    if idx != -1:
        # Find closing tag or parent
        print('  Snippet:', content[idx:idx+150].replace('\n', ' '))
