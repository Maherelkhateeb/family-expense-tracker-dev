import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx_open = content.find('function openModal(')
if idx_open != -1:
    print('=== openModal ===')
    print(content[idx_open:idx_open+800])

idx_settings = content.find('function openSettingsModal(')
if idx_settings != -1:
    print('=== openSettingsModal ===')
    print(content[idx_settings:idx_settings+800])

idx_update = content.find('function updateSettingsModalDisplay(')
if idx_update != -1:
    print('=== updateSettingsModalDisplay ===')
    print(content[idx_update:idx_update+1800])
