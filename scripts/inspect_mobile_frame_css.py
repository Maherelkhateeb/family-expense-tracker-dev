import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'(\.mobile-frame|#appFrame)\s*\{[^}]*\}', html)
if m:
    print("=== mobile-frame CSS ===")
    print(m.group(0))

for m in re.finditer(r'(\.mobile-frame|#appFrame)\b', html):
    idx = m.start()
    print("Occurrence:")
    print(html[idx-20:idx+300])
    print("-" * 30)
