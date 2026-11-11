import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function renderTasksProList')
pos2 = text.find('taskExpandIcon_', pos)
print(text[pos2:pos2+2000])
