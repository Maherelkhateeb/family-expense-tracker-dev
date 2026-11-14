import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('id="subViewCommitments"')
# Let's see what is after subViewCommitments
p2 = html.find('id="panelBudget', s)
if p2 == -1:
    p2 = html.find('id="monthly', s)
if p2 == -1:
    p2 = html.find('<!-- ==========================================================\n             قسم الميزانية', s)
if p2 == -1:
    p2 = html.find('MonthlyBudget', s)

print("subViewCommitments start:", s)
print("Next section:", p2)
if p2 != -1:
    print(html[p2-200:p2+200])
