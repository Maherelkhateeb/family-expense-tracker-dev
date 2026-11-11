import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('id="btnHeaderMasterSync"')
print(html[idx-100:idx+800])
