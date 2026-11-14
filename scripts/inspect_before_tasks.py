with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('btnHeaderTasksTop')
print(repr(text[pos-400:pos+100]))
