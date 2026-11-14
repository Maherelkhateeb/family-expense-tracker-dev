import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'function setAppFont\(', content)
if m:
    idx = m.start()
    print(content[idx:idx+1500])
