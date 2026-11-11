with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'id=["\']btnHeaderTasksTop["\'][^>]*>', text)
if m:
    print('btnHeaderTasksTop tag:', m.group(0))

for m2 in re.finditer(r'openTasksFullScreenModal', text):
    start = max(0, m2.start() - 50)
    end = min(len(text), m2.end() + 150)
    print("--- occurrence of openTasksFullScreenModal ---")
    print(text[start:end])

m3 = re.search(r'id=["\']tasksFullScreenModal["\'][^>]*>', text)
if m3:
    print('tasksFullScreenModal tag:', m3.group(0))
    start3 = m3.start()
    print('context around tasksFullScreenModal:', text[start3:start3+300])
