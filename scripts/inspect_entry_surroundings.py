import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = 482714
print(text[pos-400:pos+500])
