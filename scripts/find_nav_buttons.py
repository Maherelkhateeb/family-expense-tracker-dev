import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'id=[\"\'][^\"\']*nav[^\"\']*[\"\']|switchPageView\([^)]*\)', text, re.IGNORECASE)
print('Nav matches:', set(matches))
