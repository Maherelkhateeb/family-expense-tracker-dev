import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos = text.find('id="actualBalanceAuditModal"')
print("Modal HTML found at:", pos)
if pos != -1:
    print(text[pos-50:pos+1500])

pos2 = text.find('function openActualBalanceAuditModal')
print("\nFunction found at:", pos2)
if pos2 != -1:
    print(text[pos2:pos2+1500])
