with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

print('taskDateTimePickerModal present:', 'id="taskDateTimePickerModal"' in text)
pos = text.find('taskDateTimePickerModal')
if pos != -1:
    print("Found at:", pos)
    print(text[pos:pos+300])
