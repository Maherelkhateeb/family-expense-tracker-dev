import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('id="viewExpected"')
e = html.find('<div class="page-view"', s + 30)
print(f"viewExpected is from {s} to {e} (length {e - s})")

# Let's inspect the sections inside viewExpected
sub_views = []
for sub in ['subViewCommitments', 'panelNewExpected', 'panelBillsExpected', 'expectedListContainer', 'subViewMonthlyBudget', 'subViewBudgetHistory']:
    pos = html.find(f'id="{sub}"', s)
    if pos != -1 and pos < e:
        sub_views.append((pos, sub))

sub_views.sort()
print("Sub sections found:")
for pos, name in sub_views:
    print(f"  - {name} at index {pos}")
