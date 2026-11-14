import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('id="tasksTabStatsView"')
if idx != -1:
    print('Found tasksTabStatsView at:', idx)
    print(content[idx:idx+2500])
else:
    print('tasksTabStatsView NOT FOUND!')
