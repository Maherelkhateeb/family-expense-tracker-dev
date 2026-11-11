import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('scripts/current_renderOperationsList.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = list(re.finditer(r'\n    function \w+\(', text))
for m in matches[:10]:
    print(m.group(0).strip(), "at offset:", m.start())
