import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function handleQuickTaskAdd')
print(text[pos-1000:pos+1200])
