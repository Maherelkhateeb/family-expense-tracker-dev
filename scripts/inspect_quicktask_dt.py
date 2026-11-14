import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('id="quickTaskPresetChips"')
if idx != -1:
    print(html[idx-300:idx+1500])
else:
    print("quickTaskPresetChips not found")
