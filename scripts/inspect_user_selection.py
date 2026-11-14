# scripts/inspect_user_selection.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'id="userSelectionModal"|openFullUserSelectionModal', text):
    print(f"Match at {m.start()}: {text[m.start()-50:m.end()+150]}")
