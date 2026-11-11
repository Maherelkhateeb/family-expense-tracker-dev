import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

for m in re.finditer(r"closeModal\('settingsModal'\)", content):
    idx = m.start()
    print(f"Match at {idx}:")
    print(content[idx-100:idx+200])
    print("---")
