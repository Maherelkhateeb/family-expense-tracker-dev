import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/view_expected_structure.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's locate panelListExpected
idx_list = text.find('id="panelListExpected"')
if idx_list != -1:
    print("=== panelListExpected HTML ===")
    print(text[idx_list:idx_list+3500])
