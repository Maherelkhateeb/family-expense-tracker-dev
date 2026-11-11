with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('closeTaskDateTimePickerModal')
print("Context around closeTaskDateTimePickerModal:")
print(text[pos-200:pos+800])
