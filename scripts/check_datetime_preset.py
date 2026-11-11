with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
print("setTaskDateTimePreset occurrences:", len(re.findall(r'setTaskDateTimePreset', text)))
if 'function setTaskDateTimePreset' in text:
    print("function setTaskDateTimePreset exists!")
else:
    print("function setTaskDateTimePreset DOES NOT EXIST!")
