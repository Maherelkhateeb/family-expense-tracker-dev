with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
scripts = list(re.finditer(r'<script\b[^>]*>(.*?)</script>', text, re.DOTALL))
print("Script #3:")
print(scripts[3].group(1))
