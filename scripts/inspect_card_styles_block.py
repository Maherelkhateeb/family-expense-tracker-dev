import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('/* =========================================================================\n       أنماط وتصاميم عرض الكروت')
if s != -1:
    print(html[s:s+2500])
else:
    print("Card styles block not found")
