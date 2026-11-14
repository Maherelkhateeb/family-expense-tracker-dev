import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'\[data-font-size=[\'\"]\w+[\'\"]\]', text):
    start = max(0, m.start() - 20)
    end = min(len(text), m.end() + 300)
    print(text[start:end])
    print('---')
