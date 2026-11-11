# scripts/inspect_bottom_nav_full.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="appBottomNav"')
print(text[pos:pos+3500])
