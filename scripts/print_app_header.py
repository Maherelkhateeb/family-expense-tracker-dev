import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('<header class="app-header">')
idx_end = content.find('</header>', idx)

print(content[idx:idx_end+15])
