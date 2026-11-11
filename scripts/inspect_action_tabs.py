import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/view_expected_structure.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx_tab_action = text.find('btnTabNewExpected')
if idx_tab_action != -1:
    print(text[idx_tab_action-300:idx_tab_action+1500])
