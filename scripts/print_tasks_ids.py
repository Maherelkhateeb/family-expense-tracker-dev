import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/tasks_modal_full.html', 'r', encoding='utf-8') as f:
    text = f.read()

tags = re.findall(r'id="([^"]+)"', text)
print('IDs inside tasksFullScreenModal:')
for t in tags:
    print(' -', t)
