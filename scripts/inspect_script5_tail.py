with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
scripts = list(re.finditer(r'<script\b[^>]*>(.*?)</script>', text, re.DOTALL))
s5 = scripts[5]
print("Script #5 span:", s5.start(), s5.end())
print("End of Script #5 content (last 600 chars):")
print(repr(s5.group(1)[-600:]))
