import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('popstate')
while idx != -1:
    print(f"[{idx}]:\n{html[idx-100:idx+400]}\n---")
    idx = html.find('popstate', idx+1)
