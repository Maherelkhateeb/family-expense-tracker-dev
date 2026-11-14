with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

target = '</div></div> <!-- إغلاق subViewCommitments -->'
if target in text:
    text = text.replace(target, '</div></div></div> <!-- إغلاق subViewCommitments النهائي المؤكد -->', 1)
    print('Replaced target with 3 closing divs!')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(text)
else:
    print('Target not found, searching...')
    p = text.find('subViewCommitments -->')
    print(repr(text[p-50:p+50]))
