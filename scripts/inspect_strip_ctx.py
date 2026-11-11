import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx_strip = text.find('id="budgetsSubTabStrip"')
print('budgetsSubTabStrip at:', idx_strip)
print(text[idx_strip-300:idx_strip+100])
