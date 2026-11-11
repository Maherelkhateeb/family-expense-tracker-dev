import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('id="quickTaskPresetChips"')
print(html[s-100:s+1400])
