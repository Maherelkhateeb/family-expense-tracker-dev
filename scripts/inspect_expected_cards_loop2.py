import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_loop = 1511685
print(text[pos_loop+1500:pos_loop+4000])
