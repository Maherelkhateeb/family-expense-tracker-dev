import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('إجماليات مصروفات كل فرد خلال الفترة')
if idx != -1:
    print(html[idx:idx+2500])
else:
    print("إجماليات مصروفات كل فرد خلال الفترة not found")
