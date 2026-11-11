import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function renderActualBalanceAuditLedger')
print(text[pos+5500:pos+8500])
