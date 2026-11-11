import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'navTabOperations', html)]
print("navTabOperations occurrences:", len(matches))
for idx in matches:
    print("--- snippet ---")
    print(html[idx-50:idx+250])
