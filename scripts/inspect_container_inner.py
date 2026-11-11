import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('container.innerHTML = `')
# find the one inside renderSummaryDrawer
pos_drawer = text.find('function renderSummaryDrawer(')
pos_inner = text.find('container.innerHTML = `', pos_drawer)
print(text[pos_inner:pos_inner+3500])
