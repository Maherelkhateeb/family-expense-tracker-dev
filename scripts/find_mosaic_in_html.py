with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = list(re.finditer(r'family_option2_mosaic', text))
print(f"Total occurrences of family_option2_mosaic: {len(matches)}")
for m in matches:
    pos = m.start()
    print("--- occurrence ---")
    print(repr(text[pos-100:pos+150]))
