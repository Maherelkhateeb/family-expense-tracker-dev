import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function checkAndApplyAppUpdates')
print(text[idx:idx+1500])
print('='*50)
print(text[idx+1500:idx+3500])
