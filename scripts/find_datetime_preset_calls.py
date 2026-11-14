import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'<button[^>]*onclick=[\"\'][^\"\']*setTaskDateTimePreset[^\"\']*[\"\'][^>]*>', text):
    print(m.group(0))
