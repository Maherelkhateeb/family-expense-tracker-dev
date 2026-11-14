import re

with open('sw.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'const CACHE_NAME = .*?;', "const CACHE_NAME = 'family-expense-tracker-v5.2.3-202611081550';", text)

with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated sw.js CACHE_NAME successfully.')
