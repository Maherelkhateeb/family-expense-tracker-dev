import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'<div[^>]*class=["\'][^"\']*avatar-card', html)]
print("HTML avatar-card elements:", len(matches))
for idx in matches:
    print("--- HTML element ---")
    print(html[idx:idx+250])
