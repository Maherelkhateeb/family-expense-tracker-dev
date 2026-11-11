import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import re

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# Let's locate the region from let currentDrawerTab = 'summary'; up to function openTasksModal()
js_pattern = re.compile(
    r"let currentDrawerTab = 'summary';.*?function openTasksModal\(\) \{.*?\}",
    re.DOTALL
)

print("Searching for JS drawer & tasks block...")
match = js_pattern.search(html)
if match:
    print(f"Found block! Length: {len(match.group(0))} chars")
else:
    print("Could not match js_pattern verbatim, checking alternative...")
