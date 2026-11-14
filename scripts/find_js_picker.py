with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = list(re.finditer(r'function\s+selectTaskDatePreset\b', text))
print("Occurrences of function selectTaskDatePreset:", len(matches))
for m in matches:
    pos = m.start()
    print("Found at pos:", pos)
    print(text[pos:pos+400])
