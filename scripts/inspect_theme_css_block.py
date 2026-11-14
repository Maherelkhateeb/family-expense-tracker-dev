import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = 175728
e = html.find('/* =========================================================================\n       أنماط وتصاميم عرض الكروت', s)
print(f"Theme CSS block from {s} to {e}")
print(html[s:s+1000])
print("... [tail] ...")
print(html[e-500:e])
