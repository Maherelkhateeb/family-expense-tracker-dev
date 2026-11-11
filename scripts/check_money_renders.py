import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'formatMoney|tx-amount|isExpense|isIncome', text)]
print(f'Matches: {len(matches)}')

snippets = []
for pos in matches:
    snippet = text[max(0, pos-40):min(len(text), pos+120)].replace('\n', ' ')
    if any(sign in snippet for sign in ['+', '-', 'formatMoney', 'tx-amount']):
        line_no = text[:pos].count('\n') + 1
        snippets.append((line_no, snippet))

for l, s in snippets[:25]:
    print(f"L{l}: {s}")
