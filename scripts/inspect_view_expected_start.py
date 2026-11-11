import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('id="viewExpected"')
print(html[s:s+2500])
