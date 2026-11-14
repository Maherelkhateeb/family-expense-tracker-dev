import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

print("--- Searching currency toggle button ---")
for m in re.finditer(r'<button[^>]*id=["\'](?:btnToggleCurrency|currencySwitchBtn|btnCurrencyToggle|btnCycleCurrency|btnChangeCurrency)["\'][\s\S]*?</button>', c):
    print(m.group(0))

print("\n--- Searching currency functions ---")
for m in re.finditer(r'function\s+([a-zA-Z0-9_]*currency[a-zA-Z0-9_]*)\s*\(', c, re.IGNORECASE):
    print(m.group(0))

print("\n--- Search state.currency occurrences ---")
for m in re.finditer(r'state\.currency\s*=\s*[\'"][^\'"]+[\'"]', c):
    print(m.group(0))

idx = c.find('btnToggleCurrency')
if idx == -1:
    idx = c.find('currency')
    # search around 'EGP'
    for m in re.finditer(r'<button[^>]*onclick=["\'][^"\']*currency[^"\']*["\']', c, re.IGNORECASE):
        print('Button with currency in onclick:', m.group(0))
