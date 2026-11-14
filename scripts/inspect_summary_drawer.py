import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('closeSummaryLeftDrawer()')
print(text[pos-200:pos+2500])
