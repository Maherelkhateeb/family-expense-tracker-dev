import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'\.app-bottom-nav\b', html)]
print(".app-bottom-nav occurrences in HTML/CSS:", len(matches))
for idx in matches:
    print(html[idx-20:idx+350])
    print("-" * 30)
