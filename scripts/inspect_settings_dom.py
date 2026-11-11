import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function updateSettingsModalDisplay')
print('updateSettingsModalDisplay at:', idx)
if idx != -1:
    print(text[idx:idx+1500])
