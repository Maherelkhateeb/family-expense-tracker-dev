# scripts/inspect_sections_tasks.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/tasks_modal_content.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all major headings, divs with id, comments
for line in text.split('\n'):
    if 'id="' in line or '<!--' in line or '<header' in line or '<main' in line:
        print(line.strip()[:100])
