import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for member filter click functions
m = [m.start() for m in re.finditer(r'currentMemberFilter|filterByMember|setMemberFilter|selectMember', html)]
print(f"Member filter matches: {len(m)}")
for idx in m[:10]:
    start = max(0, idx - 80)
    end = min(len(html), idx + 200)
    print(f"[{idx}]:\n{html[start:end]}\n---")
