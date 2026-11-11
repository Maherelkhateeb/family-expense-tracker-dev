import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'(\.cat-card|#catGrid)\b', html)]
print("cat-card / #catGrid matches in HTML/CSS:", len(matches))
for idx in matches[:8]:
    print(html[idx-20:idx+250])
    print("-" * 30)
