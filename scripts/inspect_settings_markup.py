import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('id="settingsModal"')
if idx != -1:
    print('Found settingsModal at:', idx)
    print(content[idx:idx+800])
else:
    print('NOT FOUND!')
