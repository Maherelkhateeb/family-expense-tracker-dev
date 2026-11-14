import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function setAppPeriod')
if pos != -1:
    print(text[pos:pos+1200])
else:
    print("setAppPeriod not found")
