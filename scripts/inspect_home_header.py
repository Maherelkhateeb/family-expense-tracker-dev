# scripts/inspect_home_header.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_header = text.find('<header class="app-header"')
if pos_header == -1:
    pos_header = text.find('class="app-header"')
print("Header snippet:")
print(text[pos_header-50:pos_header+2500])
