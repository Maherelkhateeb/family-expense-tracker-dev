import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for m in re.finditer(r'id=["\']drawerTasksViewSection["\']', text):
    line_no = text[:m.start()].count('\n') + 1
    print(f'drawerTasksViewSection defined at line: {line_no}')

for m in re.finditer(r'id=["\']tasksModal["\']', text):
    line_no = text[:m.start()].count('\n') + 1
    print(f'tasksModal defined at line: {line_no}')

for m in re.finditer(r'id=["\']newTaskDrawerModal["\']', text):
    line_no = text[:m.start()].count('\n') + 1
    print(f'newTaskDrawerModal defined at line: {line_no}')
