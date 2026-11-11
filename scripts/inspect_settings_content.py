# scripts/inspect_settings_content.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="settingsModal"')
print(text[pos:pos+5000])
