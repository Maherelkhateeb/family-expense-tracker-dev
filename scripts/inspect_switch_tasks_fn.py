import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('function switchTasksViewMode(')
if idx != -1:
    print('Found function switchTasksViewMode at:', idx)
    print(content[idx:idx+1500])
else:
    print('function switchTasksViewMode NOT FOUND!')
