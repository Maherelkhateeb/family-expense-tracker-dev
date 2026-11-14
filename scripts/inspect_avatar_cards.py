import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'avatar-card', html)]
print("avatar-card occurrences:", len(matches))
for idx in matches[:5]:
    print("--- snippet ---")
    print(html[idx-50:idx+350])
