import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

modal_idx = text.find('id="tasksFullScreenModal"')
if modal_idx != -1:
    modal_chunk = text[modal_idx:modal_idx+10000]
    inputs = re.findall(r'<input[^>]+>', modal_chunk)
    for inp in inputs:
        print(inp)
    buttons = re.findall(r'<button[^>]+>', modal_chunk)
    for btn in buttons[:10]:
        print(btn)
