import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

for m in re.finditer(r'APP_BUILD_ID\s*=\s*[\d]+', html):
    idx = m.start()
    print("Occurrence of APP_BUILD_ID:")
    print(html[idx-30:idx+100])

for m in re.finditer(r'APP_VERSION\s*=\s*[\'"][^\'"]+[\'"]', html):
    idx = m.start()
    print("Occurrence of APP_VERSION:")
    print(html[idx-30:idx+100])
