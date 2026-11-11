with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'onclick="([^"]*(?:Tasks|Task|todo|Todo)[^"]*)"', text)
print('Tasks onclicks:', set(matches))

# Find the full screen tasks modal
idx_tasks = text.find('id="tasksFullScreenModal"')
print('tasksFullScreenModal idx:', idx_tasks)
if idx_tasks != -1:
    with open('scripts/tasks_fullscreen_snippet.html', 'w', encoding='utf-8') as f_out:
        f_out.write(text[idx_tasks:idx_tasks+5000])
    print('wrote tasks_fullscreen_snippet.html')
