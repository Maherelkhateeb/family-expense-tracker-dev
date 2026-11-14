with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('ألوان ونمط الأيقونات:')
if pos != -1:
    print(text[pos-100:pos+800])
else:
    print("Not found")
