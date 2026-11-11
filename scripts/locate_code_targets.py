import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('Total lines:', len(lines))

# 1. Check style end
for i in range(11780, 11815):
    if '</style>' in lines[i]:
        print(f'Style ends at line: {i+1}')

# 2. Check top bar quick tools
for i in range(12070, 12095):
    if 'btnOpenSummaryDrawer' in lines[i]:
        print(f'btnOpenSummaryDrawer at line: {i+1}')

# 3. Check formatMoney
for i in range(18005, 18040):
    if 'function formatMoney(' in lines[i]:
        print(f'formatMoney at line: {i+1}')

# 4. Check ops render
for i in range(19875, 19905):
    if 'ops-tx-amount-text' in lines[i]:
        print(f'ops-tx-amount-text at line: {i+1}')

# 5. Check renderDrawerTasksList
for i in range(29700, 29720):
    if 'function renderDrawerTasksList(' in lines[i]:
        print(f'renderDrawerTasksList at line: {i+1}')
