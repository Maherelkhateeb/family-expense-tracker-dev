with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_modal = text.find('id="taskDateTimePickerModal"')
pos_tasks = text.find('id="tasksFullScreenModal"')
pos_tasks_end = text.find('</div>', text.rfind('<main', 0, pos_modal))

print("taskDateTimePickerModal pos:", pos_modal)
print("tasksFullScreenModal pos:", pos_tasks)
print("Is taskDateTimePickerModal inside tasksFullScreenModal?:", pos_modal > pos_tasks and pos_modal < text.find('<script', pos_tasks))
print("\nStyle of taskDateTimePickerModal:")
print(text[pos_modal-30:pos_modal+200])
