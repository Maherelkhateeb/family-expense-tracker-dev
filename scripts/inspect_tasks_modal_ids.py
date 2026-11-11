with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos_m = text.find('id="tasksFullScreenModal"')
pos_m_end = text.find('</script>', pos_m)
tasks_html = text[pos_m:pos_m_end]

ids = re.findall(r'id=["\']([^"\']+)["\']', tasks_html)
print(f"Total IDs in tasks modal: {len(ids)}")
for i in sorted(set(ids)):
    print(f"  {i}")

onclicks = re.findall(r'onclick=["\']([^"\']+)["\']', tasks_html)
print(f"\nTotal onclick handlers: {len(onclicks)}")
for c in sorted(set(onclicks)):
    print(f"  {c}")
