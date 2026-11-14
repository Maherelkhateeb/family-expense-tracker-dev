with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_fn = text.find('function renderExpectedList(')
pos_loop = text.find('list.forEach(item => {', pos_fn)
if pos_loop == -1:
    pos_loop = text.find('filtered.forEach(item => {', pos_fn)
print("pos_loop:", pos_loop)
if pos_loop != -1:
    print(text[pos_loop:pos_loop+3000])
