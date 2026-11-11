import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: subViewCommitments
content = content.replace('\nid="subViewCommitments">', '\n<div id="subViewCommitments">', 1)

# Fix 2: panelMonthlyBudget
content = content.replace('\nid="panelMonthlyBudget"', '\n<div id="panelMonthlyBudget"', 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed missing <div tags!")
