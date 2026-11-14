import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'تيتانيوم رمادي|موكا وبرونزي|بلاتيني|الإسكندرية', html)]
print(f"Matches count: {len(matches)}")
for idx in matches:
    start = max(0, idx - 150)
    end = min(len(html), idx + 250)
    print(f"[{idx}]:\n{html[start:end]}\n---")
