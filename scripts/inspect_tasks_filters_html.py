with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="tasksCategoryPillsStrip"')
print("tasksCategoryPillsStrip pos:", pos)
print(text[pos-100:pos+800])
