# scripts/inspect_full_settings_markup.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="settingsModal"')
pos_end = text.find('<!-- =============================================\n       مودال', pos)
if pos_end == -1:
    pos_end = text.find('<!--', pos + 100)

snippet = text[pos:pos+15000]
print(snippet[:3000])
print("\n... middle ...\n")
print(snippet[3000:6000])
print("\n... tail ...\n")
print(snippet[6000:9000])
