# scripts/inspect_header_brand_row_css.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('.header-brand-row')
print(text[pos:pos+1000])
