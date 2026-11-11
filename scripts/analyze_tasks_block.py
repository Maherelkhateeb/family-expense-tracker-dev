with open('scripts/tasks_engine_block.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
fns = re.findall(r'function\s+([a-zA-Z0-9_]+)', text)
print(f"Total functions in tasks_engine_block.js: {len(fns)}")
for name in sorted(set(fns)):
    print(f"  {name}")

vars_found = re.findall(r'(?:let|const|var)\s+([a-zA-Z0-9_]+)', text)
print(f"\nVariables declared: {sorted(set(vars_found))}")
