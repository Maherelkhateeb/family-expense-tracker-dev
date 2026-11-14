import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('function openSettingsModal(')
if idx != -1:
    print('=== openSettingsModal ===')
    print(content[idx:idx+2000])

idx2 = content.find('function updateSettingsModalDisplay(')
if idx2 != -1:
    print('=== updateSettingsModalDisplay ===')
    print(content[idx2:idx2+2000])
