import re

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

for m in re.finditer(r'(APP_BUILD_ID|APP_VERSION)\s*[:=]\s*[\'"]?([0-9a-zA-Z._-]+)[\'"]?', c):
    print(m.group(0))

with open('version.json', 'r', encoding='utf-8') as f:
    print('version.json:', f.read().strip())

with open('sw.js', 'r', encoding='utf-8') as f:
    sw = f.read()
for m in re.finditer(r'CACHE_NAME\s*=\s*[\'"][^\'"]+[\'"]', sw):
    print('sw.js:', m.group(0))
