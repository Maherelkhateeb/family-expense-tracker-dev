import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = 1827054
last_script_open = c.rfind('<script', 0, idx)
next_script_close = c.find('</script>', idx)

print('Script starts at:', last_script_open, 'ends at:', next_script_close)
script_code = c[last_script_open:next_script_close]

# Let's check if there's a syntax error in this script!
# We can use python to inspect brackets/syntax or test in browser
with open('scripts/summary_script_tag.js', 'w', encoding='utf-8') as out:
    # strip tag
    code_only = script_code[script_code.find('>')+1:]
    out.write(code_only)

print('Wrote script to scripts/summary_script_tag.js, length:', len(code_only))
