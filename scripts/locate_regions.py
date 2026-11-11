import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Start of viewExpected
start_view = text.find('id="viewExpected"')
print('start_view:', start_view)

# 2. Start of expected-top-hero
start_hero = text.find('class="expected-top-hero"', start_view)
print('start_hero:', start_hero)

# 3. Start of subViewCommitments
start_subview = text.find('id="subViewCommitments"', start_view)
print('start_subview:', start_subview)

# 4. Start of panelNewExpected
start_new = text.find('id="panelNewExpected"', start_subview)
print('start_new:', start_new)

# 5. Start of panelBillsExpected
start_bills = text.find('id="panelBillsExpected"', start_subview)
print('start_bills:', start_bills)

# 6. Start of panelListExpected
start_list = text.find('id="panelListExpected"', start_subview)
print('start_list:', start_list)

# 7. End of subViewCommitments (closing div before panelMonthlyBudget)
end_subview = text.find('id="panelMonthlyBudget"', start_list)
print('end_subview (panelMonthlyBudget):', end_subview)
