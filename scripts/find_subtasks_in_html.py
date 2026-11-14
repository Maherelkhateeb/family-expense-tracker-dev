# scripts/find_subtasks_in_html.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'subtasks|subtaskPhoto', text):
    snippet = text[max(0, m.start()-50):min(len(text), m.end()+150)]
    print(f"Match at {m.start()}: {snippet.strip()}")
    print("-" * 40)
