with open('scripts/index_8e95c9b.html', 'r', encoding='utf-16', errors='ignore') as f:
    text = f.read()

import re
m = re.search(r'function\s+openTasksFullScreenModal\b', text)
if m:
    pos = m.start()
    print("Found openTasksFullScreenModal at pos:", pos)
    print(text[pos:pos+1500])
