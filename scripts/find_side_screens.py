import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

FILE_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    text = f.read()

# Look for desktop wings or side screens
keywords = ['side', 'جانب', 'يمين', 'يسار', 'desktop', 'wings', 'left', 'right', 'quick', 'dock']

lines = text.split('\n')
for i, line in enumerate(lines):
    if any(k in line.lower() for k in ['desktop-sidebar', 'desktop-wing', 'side-screen', 'side-panel', 'desktop-panel', 'جانبية', 'الشاشات الجانبية', 'side_panel', 'sidebars']):
        print(f"{i+1}: {line.strip()[:100]}")
