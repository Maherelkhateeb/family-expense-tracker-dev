import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for target in ['summary-left-drawer', 'summaryLeftDrawer', 'goldDrawerPanel', 'side-drawer-panel']:
    for m in re.finditer(rf'[^{{;]*{target}[^{{]*\{{[^}}]*\}}', text):
        print(m.group(0))
        print('---')
