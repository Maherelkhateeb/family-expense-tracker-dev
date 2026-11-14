import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find("safeEvent('btnToggleCurrency'")
if pos != -1:
    print("Found at pos:", pos)
    print(repr(text[pos-40:pos+100]))
else:
    print("Not found")
