import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function renderTasksProList')
# Search for category or assignedMember in renderTasksProList
snippet = text[pos:pos+7000]
for line in snippet.split('\n'):
    if 'category' in line or 'assignedMember' in line or 'tag' in line or 'priority' in line:
        print(line)
