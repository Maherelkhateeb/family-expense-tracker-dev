import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

print("--- body.light-theme rules related to ops/tx/cards/text ---")
for m in re.finditer(r'body\.light-theme[^{]*\{[^}]*\}', c):
    rule = m.group(0)
    if any(k in rule for k in ['ops', 'tx', 'cat', 'amount', 'table', 'card', 'text', 'subtotal']):
        print(rule[:300])
        print('-'*30)
