import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/view_expected_structure.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Find major divs and IDs
for m in re.finditer(r'<div[^>]+id="([^"]+)"[^>]*>|<form[^>]+id="([^"]+)"[^>]*>', text):
    id_val = m.group(1) or m.group(2)
    print(f'Tag ID: {id_val}')
