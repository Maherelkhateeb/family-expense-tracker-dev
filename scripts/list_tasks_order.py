with open('scripts/tasks_engine_block.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = list(re.finditer(r'function\s+([a-zA-Z0-9_]+)', text))
for m in matches:
    print(f"{m.group(1):35} at pos {m.start()}")
