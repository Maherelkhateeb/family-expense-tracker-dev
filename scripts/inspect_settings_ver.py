import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer(r'مركز الضبط الموحد والمزامنة', content)]
print("Settings header matches:", len(matches))
for idx in matches:
    start = max(0, idx - 150)
    end = min(len(content), idx + 250)
    print(content[start:end])
