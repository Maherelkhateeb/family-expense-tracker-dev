import json

with open('version.json', 'r', encoding='utf-8') as f:
    ver_data = json.load(f)

print("Current version.json:", ver_data)

with open('sw.js', 'r', encoding='utf-8') as f:
    sw_code = f.read()

import re
m = re.search(r'CACHE_NAME\s*=\s*[\'"]([^\'"]+)[\'"]', sw_code)
if m:
    print("Current CACHE_NAME in sw.js:", m.group(1))
