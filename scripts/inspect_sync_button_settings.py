import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('تحديث ومزامنة فورية')
if idx != -1:
    print(html[idx-300:idx+800])
else:
    print("تحديث ومزامنة فورية not found")
