with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_modal = text.find('id="tasksFullScreenModal"')
pos_header_end = text.find('</header>', pos_modal)
print(text[pos_modal:pos_header_end+9])
