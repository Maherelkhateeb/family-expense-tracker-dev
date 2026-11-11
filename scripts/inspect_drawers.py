import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

print('goldDrawerPanel in HTML:', 'id="goldDrawerPanel"' in text)
print('goldDrawerBackdrop in HTML:', 'id="goldDrawerBackdrop"' in text)
print('summaryLeftDrawer in HTML:', 'id="summaryLeftDrawer"' in text)
print('summaryDrawerBackdrop in HTML:', 'id="summaryDrawerBackdrop"' in text)

# Check functions
for fn in ['openGoldDrawer', 'closeGoldDrawer', 'openSummaryDrawer', 'closeSummaryLeftDrawer', 'renderSummaryDrawer']:
    print(f'Function {fn}:', f'function {fn}' in text or f'window.{fn} =' in text)
