# scripts/update_build_id.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('202611081730', '202611081740')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("✓ Updated build id in index.html to 202611081740")
