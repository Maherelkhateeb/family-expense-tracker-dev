import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos = text.find('function saveTransaction')
if pos == -1:
    pos = text.find('function submitTx')
if pos == -1:
    pos = text.find('function handleSaveTx')
if pos == -1:
    pos = text.find('function saveTx')

print("Found at pos:", pos)
if pos != -1:
    print(text[pos:pos+1500])
