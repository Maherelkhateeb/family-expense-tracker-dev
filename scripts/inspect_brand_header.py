import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('عيلة ماهر')
if pos == -1:
    pos = text.find('عائلة ماهر')

print("Found brand text at:", pos)
if pos != -1:
    print(text[pos-300:pos+500])
