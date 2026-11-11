import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

classes = ['ops-tx-card-lux', 'ops-tx-label-text', 'ops-tx-amount-text', 'ops-tx-meta-chips', 'ops-date-group-header', 'ops-tx-icon-bubble']
for cls in classes:
    m = re.search(r'\.' + cls + r'\s*\{[^}]*\}', c)
    if m:
        print(f"CSS for .{cls}:")
        print(m.group(0))
        print('-'*40)
    else:
        print(f".{cls} not found in style tags")
