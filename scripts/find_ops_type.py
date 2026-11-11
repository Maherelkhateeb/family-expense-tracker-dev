import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import re

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for idx, line in enumerate(lines):
    if 'opsTypeFilterState' in line:
        print(f"Line {idx+1}: {line.strip()[:140]}")
