import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'مصاريف قادمة', html)]
print("مصاريف قادمة occurrences:", len(matches))
for idx in matches[:5]:
    print("--- snippet ---")
    print(html[idx-100:idx+400])
