with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos_m = text.find('id="tasksFullScreenModal"')
pos_end = text.find('id="tasksFullScreenContainerList"', pos_m)

with open('scripts/tasks_dom_preview.html', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos_m:pos_end+300])

print("Written preview to scripts/tasks_dom_preview.html")
