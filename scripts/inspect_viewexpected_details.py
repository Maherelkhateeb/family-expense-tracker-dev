import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('id="viewExpected"')
e = html.find('</div> <!-- إغلاق viewExpected الرسمي -->')
print(f"viewExpected is from {s} to {e} (length {e-s})")

# Let's inspect the sections inside
sections = ['expected-top-hero', 'expected-main-tabs-strip', 'subViewCommitments', 'monthly_budget', 'budget_history']
for sec in sections:
    p = html.find(sec, s)
    print(f"Section {sec} at {p}")
