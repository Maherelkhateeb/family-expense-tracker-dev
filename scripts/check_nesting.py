import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx_sub = content.find('id="subViewCommitments"')
idx_bud = content.find('id="panelMonthlyBudget"')

print(f"subViewCommitments at: {idx_sub}")
print(f"panelMonthlyBudget at: {idx_bud}")

# Let's count <div> and </div> between idx_sub and idx_bud
slice_between = content[idx_sub:idx_bud]
opens = slice_between.count('<div')
closes = slice_between.count('</div>')

print(f"Open divs: {opens}, Close divs: {closes}, Net: {opens - closes}")
if opens > closes:
    print("CRITICAL FINDING: panelMonthlyBudget is INSIDE subViewCommitments!")
    print(f"It is nested {opens - closes} levels deep inside subViewCommitments!")
else:
    print("panelMonthlyBudget is OUTSIDE subViewCommitments.")
