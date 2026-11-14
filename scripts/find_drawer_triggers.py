import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import re

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find buttons or calls opening summaryLeftDrawer
matches = re.findall(r'(\b\w*openSummaryLeftDrawer\w*|\b\w*summaryLeftDrawer\w*|\b\w*openSummaryDrawer\w*)', content)
print("Unique drawer function mentions:", set(matches))

# Find lines calling openSummaryLeftDrawer
lines = content.split('\n')
for idx, line in enumerate(lines):
    if 'openSummaryLeftDrawer' in line or 'openSummaryDrawer' in line:
        print(f"Line {idx+1}: {line.strip()[:140]}")
