import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function renderSummaryDrawer(')
print(text[pos+2500:pos+6500])
