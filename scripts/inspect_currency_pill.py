import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('id="btnToggleCurrency"')
if idx != -1:
    print('btnToggleCurrency HTML:')
    print(c[max(0, idx-100):min(len(c), idx+500)])

idx2 = c.find('function getCurrencySymbol(')
if idx2 != -1:
    print('\ngetCurrencySymbol function:')
    print(c[idx2:idx2+600])

idx3 = c.find('function formatMoney(')
if idx3 != -1:
    print('\nformatMoney function:')
    print(c[idx3:idx3+1000])
