import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos = text.find('#taskDateTimePickerModal')
print(text[pos-200:pos+400])
