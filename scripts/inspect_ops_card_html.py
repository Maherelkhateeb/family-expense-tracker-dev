import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('function renderOperationsList(')
if idx != -1:
    print(content[idx+1000:idx+3500])
