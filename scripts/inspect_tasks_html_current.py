with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'id=["\']tasksFullScreenModal["\']', text)
if m:
    pos = m.start()
    end_tag = text.find('<!--', pos + 100)
    print("Beginning of tasksFullScreenModal:")
    print(text[pos:pos+3000])
