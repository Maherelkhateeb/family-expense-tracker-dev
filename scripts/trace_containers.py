import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if any(tag in l for tag in ['<body', '<main', '</main', 'id="appFrame"', 'class="app-frame"', 'id="appBottomNav"', '</nav', '</body>']):
        print(f"Line {i+1}: {l.strip()}")
