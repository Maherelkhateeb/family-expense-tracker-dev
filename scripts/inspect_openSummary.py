import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'function (openSummaryLeftDrawer|openSummaryDrawer|switchLeftDrawerTab)\b', html)]
print("openSummaryDrawer functions:", len(matches))
for idx in matches:
    print("=== snippet ===")
    print(html[idx:idx+1200])
