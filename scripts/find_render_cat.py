import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'renderCategories', html)]
print("Occurrences of renderCategories:", len(matches))
for idx in matches[:5]:
    print("Snippet:")
    print(html[idx-50:idx+600])
    print("="*40)
