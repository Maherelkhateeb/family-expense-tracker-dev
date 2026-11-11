# scripts/inspect_header_full.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('<header class="app-header">')
print(text[pos:pos+3000])
