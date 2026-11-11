import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="newTaskDrawerModal"')
print(text[pos+4500:pos+8000])
