import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("Searching for font definitions in CSS:")
for m in re.finditer(r'@import url\([^\)]+\);', text[:50000]):
    print(m.group(0))

for m in re.finditer(r'data-font-size|data-font-family|data-card-style|data-icon-theme', text):
    start = max(0, m.start() - 50)
    end = min(len(text), m.end() + 150)
    print("Match:", text[start:end].replace('\n', ' '))
    break
