import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for the period buttons in the Operations page
idx = html.find('id="opsPeriodFilterPills"')
if idx == -1:
    idx = html.find('opsFilterCategory')

print(html[idx-500:idx+1500])
