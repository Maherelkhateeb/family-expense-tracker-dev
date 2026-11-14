import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('id="quickTaskTitleInput"')
print(text[idx-200:idx+1800])
