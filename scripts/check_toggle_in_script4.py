with open('scripts/bad_script_4.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('function toggleCurrency')
if idx != -1:
    print(c[max(0, idx-200):min(len(c), idx+1000)])
else:
    print('toggleCurrency not in bad_script_4.js')
