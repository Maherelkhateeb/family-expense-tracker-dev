import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

m = re.search(r'function renderCategoriesGrid\b[\s\S]*?(?=\n\s*(?:function|window\.)[a-zA-Z0-9_]+\s*\(|\Z)', c)
if m:
    with open('scripts/renderCategoriesGrid_dump.js', 'w', encoding='utf-8') as out:
        out.write(m.group(0))
    print('Wrote renderCategoriesGrid to scripts/renderCategoriesGrid_dump.js, chars:', len(m.group(0)))
else:
    print('Not found')
