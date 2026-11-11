import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function selectThemeAndApply(')
print("function selectThemeAndApply at:", pos)
if pos != -1:
    print(text[pos:pos+4000])
