with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos = text.find('id="tasksFullScreenModal"')
pos_script = text.find('<script', pos)
print("Distance from tasksFullScreenModal to next script:", pos_script - pos)
print("Text before next script:")
print(text[pos_script-500:pos_script+200])
