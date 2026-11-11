import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('tasks-mobile-single-add-card')
idx_end = text.find('</div>\n        </div>', idx)
print('tasks-mobile-single-add-card from', idx, 'to', idx_end)
print(text[idx_end-200:idx_end+100])
