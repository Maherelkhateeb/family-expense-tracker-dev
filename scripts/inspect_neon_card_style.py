import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('[data-card-style="neon"]')
if s != -1:
    print(html[s:s+2000])
