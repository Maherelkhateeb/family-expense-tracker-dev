with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'id=["\']([^"\']*(?:indicat|filter|analyt|stat|metric|gauge|cockpit|gauge)[^"\']*)["\']', text, re.I)
print(f"Total matching IDs: {len(matches)}")
for m in sorted(set(matches)):
    print(" -", m)

print("\nOccurrences of 'مؤشر' in HTML:")
for m in re.finditer(r'([^>\n]*مؤشر[^<\n]*)', text):
    line = m.group(1).strip()
    if len(line) < 120:
        print("  *", line)
