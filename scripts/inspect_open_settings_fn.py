# scripts/inspect_open_settings_fn.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function openSettingsModal(')
print(text[pos:pos+1500])
