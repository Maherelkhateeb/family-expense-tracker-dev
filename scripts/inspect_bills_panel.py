import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/view_expected_structure.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx_bills = text.find('id="panelBillsExpected"')
idx_list = text.find('id="panelListExpected"')
if idx_bills != -1 and idx_list != -1:
    print(text[idx_bills:idx_bills+2000])
