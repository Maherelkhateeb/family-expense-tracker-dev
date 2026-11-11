import re

with open('sw.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'const CACHE_NAME = [\'"][^\'"]+[\'"];', 'const CACHE_NAME = "family-expense-tracker-v5.2.4-202611081620";', text)

with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated sw.js cache name to v5.2.4-202611081620")
