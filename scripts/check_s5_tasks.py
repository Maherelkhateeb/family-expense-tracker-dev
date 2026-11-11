with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
scripts = list(re.finditer(r'<script\b[^>]*>(.*?)</script>', text, re.DOTALL))
s5 = scripts[5]
print("Script #5 length:", len(s5.group(1)))
pos = s5.group(1).find('TASKS & CALENDAR ENGINE PRO')
print("TASKS & CALENDAR ENGINE PRO in Script #5 at offset:", pos)
