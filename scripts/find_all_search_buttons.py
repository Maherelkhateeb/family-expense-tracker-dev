# scripts/find_all_search_buttons.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'fa-magnifying-glass|fa-search|searchModal|openSearch', text):
    snippet = text[max(0, m.start()-100):min(len(text), m.end()+100)]
    print(f"Match at {m.start()}: {snippet.strip()}")
    print("-" * 50)
