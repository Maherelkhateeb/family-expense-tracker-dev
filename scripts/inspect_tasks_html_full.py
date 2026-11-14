with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos = text.find('id="tasksFullScreenModal"')
end_pos = text.find('<!-- نهاية مودال المهام بالكامل -->', pos)
if end_pos == -1:
    end_pos = text.find('</div>\n  </div>\n\n  <!--', pos)

print("tasksFullScreenModal HTML length:", end_pos - pos)
print("Preview of tasksFullScreenModal content (first 2500 chars):")
print(text[pos:pos+2500])
