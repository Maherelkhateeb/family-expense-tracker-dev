import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

calls = [m.start() for m in re.finditer(r'renderOperationsList\(', html)]
print(f"renderOperationsList calls: {len(calls)}")
for idx in calls:
    start = max(0, idx - 100)
    end = min(len(html), idx + 200)
    print(f"[{idx}]:\n{html[start:end]}\n---")
