import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/view_expected_structure.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx_new = text.find('id="panelNewExpected"')
idx_bills = text.find('id="panelBillsExpected"')
if idx_new != -1 and idx_bills != -1:
    print(text[idx_new:idx_new+2500])
