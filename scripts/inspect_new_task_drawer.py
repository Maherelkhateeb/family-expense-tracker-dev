import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="newTaskDrawerModal"')
print(text[pos-100:pos+3500])
