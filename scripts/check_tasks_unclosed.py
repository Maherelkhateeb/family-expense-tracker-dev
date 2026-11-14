with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_tasks = text.find('id="tasksFullScreenModal"')
pos_modal = text.find('id="taskDateTimePickerModal"')

print("tasksFullScreenModal start:", pos_tasks)
print("taskDateTimePickerModal start:", pos_modal)

# Check all </main> and </div> between pos_tasks and pos_modal
sub = text[pos_tasks:pos_modal]
div_open = sub.count('<div')
div_close = sub.count('</div')
print(f"Between tasks modal and date picker: div_open={div_open}, div_close={div_close}")
